use std::collections::HashMap;
use std::io::Write;
use std::process::ChildStdin;
use std::sync::{mpsc, Arc, Mutex};
use std::time::Duration;

use serde_json::{json, Value};
use tauri::Emitter;

use super::error::{CodexHostError, CodexHostResult};
use super::state::{CodexHostState, PendingRequest};
use super::trace::append_connection_trace;

pub(crate) const CODEX_NOTIFICATION_EVENT: &str = "codex://notification";

pub(crate) fn reject_all_pending(
    pending_requests: &Arc<Mutex<HashMap<u64, PendingRequest>>>,
    message: String,
) {
    if let Ok(mut pending) = pending_requests.lock() {
        for (_, sender) in pending.drain() {
            let _ = sender.send(Err(CodexHostError::Process(message.clone())));
        }
    }
}

pub(crate) fn handle_codex_stdout_line(
    app: &tauri::AppHandle,
    pending_requests: &Arc<Mutex<HashMap<u64, PendingRequest>>>,
    last_error: &Arc<Mutex<Option<String>>>,
    line: &str,
) {
    let message: Value = match serde_json::from_str(line) {
        Ok(message) => message,
        Err(error) => {
            if let Ok(mut current_error) = last_error.lock() {
                *current_error = Some(format!("invalid Codex JSON-RPC message: {error}"));
            }
            append_connection_trace(
                "host:stdout-invalid-json",
                json!({
                    "error": error.to_string(),
                    "line": line,
                }),
            );
            return;
        }
    };

    if let Some(id) = message.get("id").and_then(Value::as_u64) {
        let sender = pending_requests
            .lock()
            .ok()
            .and_then(|mut pending| pending.remove(&id));

        if let Some(sender) = sender {
            if let Some(error) = message.get("error") {
                let message = error
                    .get("message")
                    .and_then(Value::as_str)
                    .unwrap_or("Codex JSON-RPC request failed")
                    .to_string();
                let _ = sender.send(Err(CodexHostError::Process(message)));
            } else {
                let _ = sender.send(Ok(message.get("result").cloned().unwrap_or(Value::Null)));
            }
        }
        return;
    }

    let _ = app.emit(CODEX_NOTIFICATION_EVENT, message);
}

fn send_codex_message(stdin: &Arc<Mutex<ChildStdin>>, message: &Value) -> CodexHostResult<()> {
    let mut line = serde_json::to_string(message)?;
    line.push('\n');
    let mut stdin = stdin
        .lock()
        .map_err(|_| CodexHostError::Process("Codex stdin lock poisoned".to_string()))?;
    stdin.write_all(line.as_bytes())?;
    stdin.flush()?;
    Ok(())
}

pub(crate) fn send_codex_notification(
    state: &CodexHostState,
    method: &str,
    params: Value,
) -> CodexHostResult<()> {
    let process = state
        .process
        .lock()
        .map_err(|_| CodexHostError::Process("Codex process lock poisoned".to_string()))?;
    let process = process
        .as_ref()
        .ok_or_else(|| CodexHostError::Process("Codex app-server is not running.".to_string()))?;
    send_codex_message(&process.stdin, &json!({ "method": method, "params": params }))
}

pub(crate) fn send_codex_request(
    state: &CodexHostState,
    method: &str,
    params: Value,
) -> CodexHostResult<Value> {
    let id = {
        let mut next_request_id = state
            .next_request_id
            .lock()
            .map_err(|_| CodexHostError::Process("Codex request id lock poisoned".to_string()))?;
        let id = *next_request_id;
        *next_request_id += 1;
        id
    };
    let (sender, receiver) = mpsc::channel();
    state
        .pending_requests
        .lock()
        .map_err(|_| CodexHostError::Process("Codex pending request lock poisoned".to_string()))?
        .insert(id, sender);

    let send_result = {
        let process = state
            .process
            .lock()
            .map_err(|_| CodexHostError::Process("Codex process lock poisoned".to_string()))?;
        let process = process
            .as_ref()
            .ok_or_else(|| CodexHostError::Process("Codex app-server is not running.".to_string()))?;
        send_codex_message(
            &process.stdin,
            &json!({ "id": id, "method": method, "params": params }),
        )
    };

    if let Err(error) = send_result {
        if let Ok(mut pending) = state.pending_requests.lock() {
            pending.remove(&id);
        }
        return Err(error);
    }

    match receiver.recv_timeout(Duration::from_secs(120)) {
        Ok(result) => result,
        Err(mpsc::RecvTimeoutError::Timeout) => {
            if let Ok(mut pending) = state.pending_requests.lock() {
                pending.remove(&id);
            }
            Err(CodexHostError::Process(format!(
                "Codex request '{method}' timed out."
            )))
        }
        Err(mpsc::RecvTimeoutError::Disconnected) => Err(CodexHostError::Process(format!(
            "Codex request '{method}' was disconnected."
        ))),
    }
}

pub(crate) fn ensure_initialized(state: &CodexHostState) -> CodexHostResult<()> {
    if *state
        .initialized
        .lock()
        .map_err(|_| CodexHostError::Process("Codex initialized lock poisoned".to_string()))?
    {
        append_connection_trace("host:ensure-initialized:skip", json!({ "initialized": true }));
        return Ok(());
    }

    append_connection_trace("host:ensure-initialized:start", json!({ "initialized": false }));
    send_codex_request(
        state,
        "initialize",
        json!({
            "capabilities": {
                "experimentalApi": true,
                "requestAttestation": false
            },
            "clientInfo": {
                "name": "agent_html",
                "title": "Agent-HTML",
                "version": env!("CARGO_PKG_VERSION")
            }
        }),
    )?;
    send_codex_notification(state, "initialized", json!({}))?;

    let mut initialized = state
        .initialized
        .lock()
        .map_err(|_| CodexHostError::Process("Codex initialized lock poisoned".to_string()))?;
    *initialized = true;
    append_connection_trace("host:ensure-initialized:ok", json!({ "initialized": true }));
    Ok(())
}
