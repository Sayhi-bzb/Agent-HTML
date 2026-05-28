use std::collections::HashMap;
use std::fs;
use std::io::{BufRead, BufReader, Write};
use std::path::{Path, PathBuf};
use std::process::{Child, ChildStdin, Command, Stdio};
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::{mpsc, Arc, Mutex};
use std::thread;
use std::time::Duration;

use serde::{Deserialize, Serialize};
use serde_json::{json, Value};
use tauri::{Emitter, Manager, State};
use thiserror::Error;

const CODEX_NOTIFICATION_EVENT: &str = "codex://notification";
const CONNECTION_TRACE_PATH: &str = ".tmp\\agent-html-codex-connection-trace.jsonl";
static CONNECTION_TRACE_ENABLED: AtomicBool = AtomicBool::new(false);

#[derive(Debug, Error)]
pub(crate) enum CodexHostError {
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("process error: {0}")]
    Process(String),
}

impl Serialize for CodexHostError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type CodexHostResult<T> = Result<T, CodexHostError>;

type PendingRequest = mpsc::Sender<Result<Value, CodexHostError>>;

struct ManagedCodexProcess {
    child: Child,
    stdin: Arc<Mutex<ChildStdin>>,
}

pub(crate) struct CodexHostState {
    initialized: Mutex<bool>,
    next_request_id: Mutex<u64>,
    pending_requests: Arc<Mutex<HashMap<u64, PendingRequest>>>,
    process: Mutex<Option<ManagedCodexProcess>>,
    last_error: Arc<Mutex<Option<String>>>,
    last_stderr: Arc<Mutex<Option<String>>>,
}

impl CodexHostState {
    pub(crate) fn new() -> Self {
        Self {
            initialized: Mutex::new(false),
            next_request_id: Mutex::new(1),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
            process: Mutex::new(None),
            last_error: Arc::new(Mutex::new(None)),
            last_stderr: Arc::new(Mutex::new(None)),
        }
    }
}

impl Drop for CodexHostState {
    fn drop(&mut self) {
        if let Ok(mut current_process) = self.process.lock() {
            if let Some(mut process) = current_process.take() {
                stop_codex_process(&mut process.child);
            }
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(default)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexHostSettings {
    codex_command: String,
}

impl Default for CodexHostSettings {
    fn default() -> Self {
        default_settings()
    }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CodexHostHealth {
    app_server_running: bool,
    codex_command: Option<String>,
    connected: bool,
    cwd: Option<String>,
    error: Option<String>,
    ok: bool,
    stderr: Option<String>,
    status: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexHostProcessStatus {
    health: CodexHostHealth,
    pid: Option<u32>,
    status: String,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexRpcRequestInput {
    method: String,
    params: Value,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexRpcRequestResult {
    result: Value,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexRpcNotifyInput {
    method: String,
    params: Value,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexConnectionTraceInput {
    event: String,
    payload: Value,
}

fn append_connection_trace(event: &str, payload: Value) {
    if !CONNECTION_TRACE_ENABLED.load(Ordering::Relaxed) {
        return;
    }

    let line = json!({
        "ts": chrono_like_timestamp(),
        "side": "tauri",
        "event": event,
        "payload": payload,
    });
    let _ = append_json_line(CONNECTION_TRACE_PATH, &line);
}

fn set_last_error(state: &CodexHostState, error: Option<String>) {
    if let Ok(mut last_error) = state.last_error.lock() {
        *last_error = error;
    }
}

fn set_last_stderr(last_stderr: &Arc<Mutex<Option<String>>>, stderr: String) {
    if let Ok(mut current_stderr) = last_stderr.lock() {
        *current_stderr = Some(stderr);
    }
}

fn get_last_error(state: &CodexHostState) -> Option<String> {
    state
        .last_error
        .lock()
        .ok()
        .and_then(|last_error| last_error.clone())
}

fn get_last_stderr(state: &CodexHostState) -> Option<String> {
    state
        .last_stderr
        .lock()
        .ok()
        .and_then(|last_stderr| last_stderr.clone())
}

fn normalize_codex_settings(settings: &CodexHostSettings) -> CodexHostSettings {
    let default_command = if cfg!(windows) { "codex.cmd" } else { "codex" };

    CodexHostSettings {
        codex_command: if settings.codex_command.trim().is_empty() {
            default_command.to_string()
        } else {
            settings.codex_command.trim().to_string()
        },
    }
}

fn default_settings_path(app: &tauri::AppHandle) -> CodexHostResult<PathBuf> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| CodexHostError::Process("unable to resolve app data directory".to_string()))?;
    Ok(app_data_dir.join("codex-connection-settings.json"))
}

fn default_settings() -> CodexHostSettings {
    CodexHostSettings {
        codex_command: if cfg!(windows) {
            "codex.cmd".to_string()
        } else {
            "codex".to_string()
        },
    }
}

fn settings_with_runtime_defaults(settings: CodexHostSettings) -> CodexHostSettings {
    normalize_codex_settings(&settings)
}

fn append_json_line(path: &str, payload: &Value) -> CodexHostResult<()> {
    if path.trim().is_empty() {
        return Ok(());
    }

    let path = PathBuf::from(path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let mut line = serde_json::to_string(payload)?;
    line.push('\n');
    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?
        .write_all(line.as_bytes())?;
    Ok(())
}

fn load_settings_from_disk(app: &tauri::AppHandle) -> CodexHostResult<CodexHostSettings> {
    let path = default_settings_path(app)?;
    if !path.exists() {
        return Ok(default_settings());
    }

    let content = fs::read_to_string(path)?;
    let parsed: CodexHostSettings = serde_json::from_str(&content)?;
    Ok(settings_with_runtime_defaults(parsed))
}

fn save_settings_to_disk(
    app: &tauri::AppHandle,
    settings: &CodexHostSettings,
) -> CodexHostResult<CodexHostSettings> {
    let path = default_settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let normalized = settings_with_runtime_defaults(settings.clone());
    let content = serde_json::to_string_pretty(&normalized)?;
    fs::write(path, content)?;
    Ok(normalized)
}

fn has_project_root_marker(path: &Path) -> bool {
    path.join("package.json").exists() && path.join("src-tauri").exists()
}

fn find_project_root_from(start: &Path) -> Option<PathBuf> {
    for candidate in start.ancestors() {
        if has_project_root_marker(candidate) {
            return Some(candidate.to_path_buf());
        }
    }

    None
}

fn resolve_workspace_cwd(app: &tauri::AppHandle) -> CodexHostResult<PathBuf> {
    if let Ok(current_dir) = std::env::current_dir() {
        if let Some(project_root) = find_project_root_from(&current_dir) {
            return Ok(project_root);
        }
    }

    if let Ok(resource_dir) = app.path().resource_dir() {
        if let Some(project_root) = find_project_root_from(&resource_dir) {
            return Ok(project_root);
        }
    }

    Err(CodexHostError::Process(
        "unable to resolve Agent-HTML project root for Codex cwd".to_string(),
    ))
}

fn check_codex_process(process: &mut Child) -> Option<u32> {
    match process.try_wait() {
        Ok(Some(_)) => None,
        Ok(None) => Some(process.id()),
        Err(_) => None,
    }
}

fn stop_codex_process(process: &mut Child) {
    let _ = process.kill();
    let _ = process.wait();
}

fn reject_all_pending(
    pending_requests: &Arc<Mutex<HashMap<u64, PendingRequest>>>,
    message: String,
) {
    if let Ok(mut pending) = pending_requests.lock() {
        for (_, sender) in pending.drain() {
            let _ = sender.send(Err(CodexHostError::Process(message.clone())));
        }
    }
}

fn handle_codex_stdout_line(
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

fn spawn_codex_process(
    app: &tauri::AppHandle,
    settings: &CodexHostSettings,
    workspace_cwd: &Path,
    pending_requests: Arc<Mutex<HashMap<u64, PendingRequest>>>,
    last_error: Arc<Mutex<Option<String>>>,
    last_stderr: Arc<Mutex<Option<String>>>,
) -> CodexHostResult<ManagedCodexProcess> {
    let mut command = if cfg!(windows) && !settings.codex_command.ends_with(".exe") {
        let quoted_command = if settings.codex_command.contains(' ') {
            format!("\"{}\"", settings.codex_command)
        } else {
            settings.codex_command.clone()
        };
        let windows_command = format!("{quoted_command} app-server --listen stdio://");
        let mut command = Command::new(std::env::var("ComSpec").unwrap_or_else(|_| "cmd.exe".to_string()));
        command.args(["/d", "/s", "/c", &windows_command]);
        command
    } else {
        let mut command = Command::new(&settings.codex_command);
        command.args(["app-server", "--listen", "stdio://"]);
        command
    };

    command
        .current_dir(workspace_cwd)
        .envs(std::env::vars())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = command.spawn()?;
    let stdin = child
        .stdin
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stdin".to_string()))?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stdout".to_string()))?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stderr".to_string()))?;

    let app_for_stdout = app.clone();
    let pending_for_stdout = pending_requests.clone();
    let last_error_for_stdout = last_error.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(line) if !line.trim().is_empty() => handle_codex_stdout_line(
                    &app_for_stdout,
                    &pending_for_stdout,
                    &last_error_for_stdout,
                    &line,
                ),
                Ok(_) => {}
                Err(error) => {
                    if let Ok(mut current_error) = last_error_for_stdout.lock() {
                        *current_error = Some(error.to_string());
                    }
                    append_connection_trace(
                        "host:stdout-read-error",
                        json!({
                            "error": error.to_string(),
                        }),
                    );
                    break;
                }
            }
        }
    });

    let last_stderr_for_thread = last_stderr.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            match line {
                Ok(line) if !line.trim().is_empty() => {
                    append_connection_trace("host:stderr", json!({ "line": line }));
                    set_last_stderr(&last_stderr_for_thread, line);
                }
                Ok(_) => {}
                Err(error) => {
                    set_last_stderr(&last_stderr_for_thread, error.to_string());
                    append_connection_trace(
                        "host:stderr-read-error",
                        json!({
                            "error": error.to_string(),
                        }),
                    );
                    break;
                }
            }
        }
    });

    Ok(ManagedCodexProcess {
        child,
        stdin: Arc::new(Mutex::new(stdin)),
    })
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

fn send_codex_notification(
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

fn send_codex_request(
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

fn ensure_initialized(state: &CodexHostState) -> CodexHostResult<()> {
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

fn health_from_state(
    state: &CodexHostState,
    settings: &CodexHostSettings,
    workspace_cwd: Option<&Path>,
    pid: Option<u32>,
) -> CodexHostHealth {
    let initialized = state.initialized.lock().map(|value| *value).unwrap_or(false);
    let app_server_running = pid.is_some();
    let connected = initialized && app_server_running;
    let error = get_last_error(state);

    CodexHostHealth {
        app_server_running,
        codex_command: Some(settings.codex_command.clone()),
        connected,
        cwd: workspace_cwd.map(|path| path.to_string_lossy().to_string()),
        error: error.clone(),
        ok: connected || (app_server_running && error.is_none()),
        stderr: get_last_stderr(state),
        status: if connected {
            "connected".to_string()
        } else if error.is_some() {
            "error".to_string()
        } else if app_server_running {
            "starting".to_string()
        } else {
            "disconnected".to_string()
        },
    }
}

fn process_status_from_state(
    state: &CodexHostState,
    settings: &CodexHostSettings,
    workspace_cwd: Option<&Path>,
    pid: Option<u32>,
) -> CodexHostProcessStatus {
    let health = health_from_state(state, settings, workspace_cwd, pid);
    append_connection_trace(
        "host:process-status",
        json!({
            "status": health.status,
            "pid": pid,
            "connected": health.connected,
            "appServerRunning": health.app_server_running,
            "error": health.error,
            "stderr": health.stderr,
        }),
    );
    CodexHostProcessStatus {
        status: health.status.clone(),
        health,
        pid,
    }
}

#[tauri::command]
pub(crate) fn codex_host_settings_load(app: tauri::AppHandle) -> CodexHostResult<CodexHostSettings> {
    load_settings_from_disk(&app)
}

#[tauri::command]
pub(crate) fn codex_host_settings_save(
    app: tauri::AppHandle,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostSettings> {
    save_settings_to_disk(&app, &settings)
}

#[tauri::command]
pub(crate) fn codex_connection_trace(input: CodexConnectionTraceInput) -> CodexHostResult<()> {
    CONNECTION_TRACE_ENABLED.store(true, Ordering::Relaxed);
    let line = json!({
        "ts": chrono_like_timestamp(),
        "side": "frontend",
        "event": input.event,
        "payload": input.payload,
    });
    append_json_line(CONNECTION_TRACE_PATH, &line)
}

#[tauri::command]
pub(crate) fn codex_host_start(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    let workspace_cwd = resolve_workspace_cwd(&app)?;
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

#[tauri::command]
pub(crate) fn codex_host_stop(
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

#[tauri::command]
pub(crate) fn codex_host_restart(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
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
    codex_host_start(app, state, normalized)
}

#[tauri::command]
pub(crate) fn codex_host_health(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    let workspace_cwd = resolve_workspace_cwd(&app).ok();
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
    settings: &CodexHostSettings,
) -> CodexHostResult<()> {
    resolve_workspace_cwd(app)?;

    if state
        .process
        .lock()
        .expect("codex process lock poisoned")
        .is_none()
    {
        drop(codex_host_start(app.clone(), state.clone(), settings.clone())?);
    }

    Ok(())
}

#[tauri::command]
pub(crate) fn codex_rpc_request(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
    input: CodexRpcRequestInput,
) -> CodexHostResult<CodexRpcRequestResult> {
    let settings = normalize_codex_settings(&settings);
    append_connection_trace(
        "host:rpc-request",
        json!({
            "method": input.method,
        }),
    );
    ensure_host_ready(&app, state.clone(), &settings)?;
    ensure_initialized(&state)?;

    let result = send_codex_request(&state, &input.method, input.params)?;
    Ok(CodexRpcRequestResult { result })
}

#[tauri::command]
pub(crate) fn codex_rpc_notify(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
    input: CodexRpcNotifyInput,
) -> CodexHostResult<()> {
    let settings = normalize_codex_settings(&settings);
    ensure_host_ready(&app, state.clone(), &settings)?;
    ensure_initialized(&state)?;
    send_codex_notification(&state, &input.method, input.params)
}

fn chrono_like_timestamp() -> String {
    match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
        Ok(duration) => format!("{}", duration.as_secs()),
        Err(_) => "0".to_string(),
    }
}
