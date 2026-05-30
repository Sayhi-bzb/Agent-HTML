use serde_json::{json, Value};
use tauri::State;

use crate::workspace::WorkspaceStore;

use super::error::CodexHostResult;
use super::health::{process_status_from_state, CodexHostProcessStatus};
use super::process::{check_codex_process, spawn_codex_process, stop_codex_process};
use super::rpc::{
    ensure_initialized, reject_all_pending, send_codex_notification, send_codex_request,
    send_codex_response,
};
use super::settings::{normalize_codex_settings, CodexHostSettings};
use super::state::{set_last_error, CodexHostState};
use super::trace::{append_connection_trace, bind_connection_trace_path};
use super::workspace::resolve_workspace_cwd;

pub(crate) fn start(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    let workspace_cwd = resolve_workspace_cwd(&store)?;
    bind_connection_trace_path(&store)?;
    append_connection_trace(
        "host:start:entry",
        json!({
            "command": settings.codex_command,
            "cwd": workspace_cwd.to_string_lossy().to_string(),
        }),
    );

    {
        let mut current_process = state.process.lock().expect("codex process lock poisoned");
        if let Some(process) = current_process.as_mut() {
            if let Some(pid) = check_codex_process(&mut process.child) {
                append_connection_trace("host:start:existing-process", json!({ "pid": pid }));
                ensure_initialized(&state)?;
                return Ok(process_status_from_state(
                    &state,
                    &settings,
                    Some(&workspace_cwd),
                    Some(pid),
                ));
            }

            append_connection_trace("host:start:dead-process", json!({}));
            *current_process = None;
        }
    }

    set_last_error(&state, None);
    if let Ok(mut current_stderr) = state.last_stderr.lock() {
        *current_stderr = None;
    }
    if let Ok(mut initialized) = state.initialized.lock() {
        *initialized = false;
    }

    let managed_process = spawn_codex_process(
        &app,
        &settings,
        &workspace_cwd,
        state.pending_requests.clone(),
        state.last_error.clone(),
        state.last_stderr.clone(),
    )?;
    let pid = managed_process.child.id();
    append_connection_trace("host:start:spawned", json!({ "pid": pid }));

    {
        let mut current_process = state.process.lock().expect("codex process lock poisoned");
        *current_process = Some(managed_process);
    }

    ensure_initialized(&state)?;

    Ok(process_status_from_state(
        &state,
        &settings,
        Some(&workspace_cwd),
        Some(pid),
    ))
}

pub(crate) fn stop(
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    append_connection_trace("host:stop:entry", json!({}));
    if let Some(mut process) = state
        .process
        .lock()
        .expect("codex process lock poisoned")
        .take()
    {
        stop_codex_process(&mut process.child);
    }

    reject_all_pending(
        &state.pending_requests,
        "Codex app-server stopped.".to_string(),
    );
    if let Ok(mut initialized) = state.initialized.lock() {
        *initialized = false;
    }
    set_last_error(&state, None);

    Ok(process_status_from_state(&state, &settings, None, None))
}

pub(crate) fn restart(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let normalized = normalize_codex_settings(&settings);
    append_connection_trace("host:restart:entry", json!({}));
    if let Some(mut process) = state
        .process
        .lock()
        .expect("codex process lock poisoned")
        .take()
    {
        stop_codex_process(&mut process.child);
    }
    reject_all_pending(
        &state.pending_requests,
        "Codex app-server restarted.".to_string(),
    );
    start(app, state, store, normalized)
}

pub(crate) fn health(
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    let workspace_cwd = Some(resolve_workspace_cwd(&store)?);
    bind_connection_trace_path(&store)?;
    append_connection_trace(
        "host:health:entry",
        json!({
            "command": settings.codex_command,
            "cwd": workspace_cwd
                .as_ref()
                .map(|path| path.to_string_lossy().to_string()),
        }),
    );
    let pid = {
        let mut current_process = state.process.lock().expect("codex process lock poisoned");
        let pid = current_process
            .as_mut()
            .and_then(|process| check_codex_process(&mut process.child));
        if current_process.is_some() && pid.is_none() {
            append_connection_trace("host:health:process-exited", json!({}));
            *current_process = None;
            if let Ok(mut initialized) = state.initialized.lock() {
                *initialized = false;
            }
            set_last_error(&state, Some("Codex app-server exited.".to_string()));
        }
        pid
    };

    Ok(process_status_from_state(
        &state,
        &settings,
        workspace_cwd.as_deref(),
        pid,
    ))
}

fn ensure_host_ready(
    app: &tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: &CodexHostSettings,
) -> CodexHostResult<()> {
    resolve_workspace_cwd(&store)?;
    bind_connection_trace_path(&store)?;

    if state
        .process
        .lock()
        .expect("codex process lock poisoned")
        .is_none()
    {
        drop(start(app.clone(), state.clone(), store, settings.clone())?);
    }

    Ok(())
}

pub(crate) fn rpc_request(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: &CodexHostSettings,
    method: String,
    params: Value,
) -> CodexHostResult<Value> {
    append_connection_trace(
        "host:rpc-request",
        json!({
            "method": method,
        }),
    );
    ensure_host_ready(&app, state.clone(), store, settings)?;
    ensure_initialized(&state)?;
    send_codex_request(&state, &method, params)
}

pub(crate) fn rpc_notify(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: &CodexHostSettings,
    method: String,
    params: Value,
) -> CodexHostResult<()> {
    ensure_host_ready(&app, state.clone(), store, settings)?;
    ensure_initialized(&state)?;
    send_codex_notification(&state, &method, params)
}

pub(crate) fn rpc_respond(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: &CodexHostSettings,
    request_id: u64,
    result: Value,
) -> CodexHostResult<()> {
    ensure_host_ready(&app, state.clone(), store, settings)?;
    ensure_initialized(&state)?;
    send_codex_response(&state, request_id, result)
}
