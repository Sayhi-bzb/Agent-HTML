use std::io::{Read, Write};
use std::net::TcpStream;
use std::path::PathBuf;
use std::process::{Child, Command, Stdio};
use std::sync::Mutex;
use std::time::Duration;
use std::fs;

use serde::{Deserialize, Serialize};
use tauri::{Manager, State};
use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum CodexBridgeError {
    #[error("invalid bridge host")]
    InvalidHost,
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("process error: {0}")]
    Process(String),
}

impl Serialize for CodexBridgeError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type CodexBridgeResult<T> = Result<T, CodexBridgeError>;

pub(crate) struct CodexBridgeState {
    connected_external: Mutex<bool>,
    process: Mutex<Option<Child>>,
}

impl CodexBridgeState {
    pub(crate) fn new() -> Self {
        Self {
            connected_external: Mutex::new(false),
            process: Mutex::new(None),
        }
    }
}

impl Drop for CodexBridgeState {
    fn drop(&mut self) {
        if let Ok(mut current_process) = self.process.lock() {
            if let Some(mut process) = current_process.take() {
                stop_bridge_process(&mut process);
            }
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexBridgeSettings {
    auto_start: bool,
    bridge_host: String,
    bridge_port: u16,
    codex_command: String,
    codex_event_log_path: String,
    event_log_enabled: bool,
    event_log_path: String,
    workspace_cwd: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct CodexBridgeHealth {
    app_server_running: bool,
    codex_command: Option<String>,
    connected: bool,
    cwd: Option<String>,
    error: Option<String>,
    ok: bool,
    provider: Option<String>,
    stderr: Option<String>,
    status: String,
    thread_id: Option<String>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexBridgeLogPaths {
    codex_event_log_path: String,
    event_log_path: String,
    resolved_from_defaults: bool,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexBridgeProcessStatus {
    bridge_url: String,
    health: CodexBridgeHealth,
    ownership: String,
    pid: Option<u32>,
    status: String,
}

fn codex_bridge_url(host: &str, port: u16) -> String {
    format!("http://{host}:{port}/agent-html/events")
}

fn json_bool_field(body: &str, field: &str) -> bool {
    let pattern = format!("\"{field}\":");
    let Some(index) = body.find(&pattern) else {
        return false;
    };
    body[index + pattern.len()..].trim_start().starts_with("true")
}

fn json_string_field(body: &str, field: &str) -> Option<String> {
    let pattern = format!("\"{field}\":");
    let index = body.find(&pattern)?;
    let value = body[index + pattern.len()..].trim_start();
    if value.starts_with("null") {
        return None;
    }

    let value = value.strip_prefix('"')?;
    let mut result = String::new();
    let mut escaped = false;

    for character in value.chars() {
        if escaped {
            match character {
                '"' => result.push('"'),
                '\\' => result.push('\\'),
                'n' => result.push('\n'),
                'r' => result.push('\r'),
                't' => result.push('\t'),
                _ => result.push(character),
            }
            escaped = false;
            continue;
        }

        if character == '\\' {
            escaped = true;
            continue;
        }

        if character == '"' {
            return Some(result);
        }

        result.push(character);
    }

    None
}

fn normalize_codex_settings(settings: &CodexBridgeSettings) -> CodexBridgeSettings {
    let default_command = if cfg!(windows) { "codex.cmd" } else { "codex" };
    let default_event_log_path = default_event_log_path();
    let default_codex_event_log_path = default_codex_event_log_path();

    CodexBridgeSettings {
        auto_start: settings.auto_start,
        bridge_host: if settings.bridge_host.trim().is_empty() {
            "127.0.0.1".to_string()
        } else {
            settings.bridge_host.trim().to_string()
        },
        bridge_port: settings.bridge_port,
        codex_command: if settings.codex_command.trim().is_empty() {
            default_command.to_string()
        } else {
            settings.codex_command.trim().to_string()
        },
        codex_event_log_path: if settings.codex_event_log_path.trim().is_empty() {
            default_codex_event_log_path
        } else {
            settings.codex_event_log_path.trim().to_string()
        },
        event_log_enabled: settings.event_log_enabled,
        event_log_path: if settings.event_log_path.trim().is_empty() {
            default_event_log_path
        } else {
            settings.event_log_path.trim().to_string()
        },
        workspace_cwd: settings.workspace_cwd.trim().to_string(),
    }
}

fn default_settings_path(app: &tauri::AppHandle) -> CodexBridgeResult<PathBuf> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| CodexBridgeError::Process("unable to resolve app data directory".to_string()))?;
    Ok(app_data_dir.join("codex-connection-settings.json"))
}

fn default_event_log_path() -> String {
    ".tmp\\agent-html-codex-events.jsonl".to_string()
}

fn default_codex_event_log_path() -> String {
    ".tmp\\agent-html-codex-app-server-events.jsonl".to_string()
}

fn default_settings() -> CodexBridgeSettings {
    CodexBridgeSettings {
        auto_start: false,
        bridge_host: "127.0.0.1".to_string(),
        bridge_port: 51279,
        codex_command: if cfg!(windows) {
            "codex.cmd".to_string()
        } else {
            "codex".to_string()
        },
        codex_event_log_path: default_codex_event_log_path(),
        event_log_enabled: false,
        event_log_path: default_event_log_path(),
        workspace_cwd: String::new(),
    }
}

fn settings_with_runtime_defaults(settings: CodexBridgeSettings) -> CodexBridgeSettings {
    normalize_codex_settings(&settings)
}

fn resolve_log_paths(settings: &CodexBridgeSettings) -> CodexBridgeLogPaths {
    let normalized = normalize_codex_settings(settings);
    CodexBridgeLogPaths {
        codex_event_log_path: normalized.codex_event_log_path.clone(),
        event_log_path: normalized.event_log_path.clone(),
        resolved_from_defaults: settings.event_log_path.trim().is_empty()
            || settings.codex_event_log_path.trim().is_empty(),
    }
}

fn enrich_codex_bridge_health(
    mut health: CodexBridgeHealth,
    settings: &CodexBridgeSettings,
) -> CodexBridgeHealth {
    health.codex_command = Some(settings.codex_command.clone());
    health.cwd = if settings.workspace_cwd.is_empty() {
        None
    } else {
        Some(settings.workspace_cwd.clone())
    };
    health
}

fn read_codex_bridge_health(settings: &CodexBridgeSettings) -> CodexBridgeHealth {
    enrich_codex_bridge_health(
        read_codex_bridge_endpoint(&settings.bridge_host, settings.bridge_port, "GET", "/health"),
        settings,
    )
}

fn is_reusable_codex_bridge(health: &CodexBridgeHealth) -> bool {
    matches!(health.provider.as_deref(), Some("codex_app_server"))
        && (health.connected || health.app_server_running || health.ok)
}

fn process_status_from_health(
    settings: &CodexBridgeSettings,
    health: CodexBridgeHealth,
    ownership: &str,
    pid: Option<u32>,
) -> CodexBridgeProcessStatus {
    let status = if health.connected {
        "connected"
    } else if health.app_server_running || pid.is_some() {
        "starting"
    } else if health.error.is_some() {
        "error"
    } else {
        "disconnected"
    };

    CodexBridgeProcessStatus {
        bridge_url: codex_bridge_url(&settings.bridge_host, settings.bridge_port),
        health,
        ownership: ownership.to_string(),
        pid,
        status: status.to_string(),
    }
}

fn connect_codex_bridge(settings: &CodexBridgeSettings) -> CodexBridgeHealth {
    enrich_codex_bridge_health(
        read_codex_bridge_endpoint(
            &settings.bridge_host,
            settings.bridge_port,
            "POST",
            "/connect",
        ),
        settings,
    )
}

fn read_codex_bridge_endpoint(host: &str, port: u16, method: &str, path: &str) -> CodexBridgeHealth {
    let mut stream = match TcpStream::connect((host, port)) {
        Ok(stream) => stream,
        Err(error) => {
            return CodexBridgeHealth {
                app_server_running: false,
                codex_command: None,
                connected: false,
                cwd: None,
                error: Some(error.to_string()),
                ok: false,
                provider: None,
                stderr: None,
                status: "disconnected".to_string(),
                thread_id: None,
            };
        }
    };

    let _ = stream.set_read_timeout(Some(Duration::from_secs(30)));
    let _ = stream.set_write_timeout(Some(Duration::from_secs(5)));
    let request = format!("{method} {path} HTTP/1.1\r\nHost: {host}:{port}\r\nContent-Length: 0\r\nConnection: close\r\n\r\n");

    if let Err(error) = stream.write_all(request.as_bytes()) {
        return CodexBridgeHealth {
            app_server_running: false,
            codex_command: None,
            connected: false,
            cwd: None,
            error: Some(error.to_string()),
            ok: false,
            provider: None,
            stderr: None,
            status: "error".to_string(),
            thread_id: None,
        };
    }

    let mut response = String::new();
    if let Err(error) = stream.read_to_string(&mut response) {
        return CodexBridgeHealth {
            app_server_running: false,
            codex_command: None,
            connected: false,
            cwd: None,
            error: Some(error.to_string()),
            ok: false,
            provider: None,
            stderr: None,
            status: "error".to_string(),
            thread_id: None,
        };
    }

    let body = response.split("\r\n\r\n").nth(1).unwrap_or("");
    let connected = json_bool_field(body, "connected");
    let app_server_running = json_bool_field(body, "appServerRunning");

    CodexBridgeHealth {
        app_server_running,
        codex_command: json_string_field(body, "codexCommand"),
        connected,
        cwd: json_string_field(body, "cwd"),
        error: json_string_field(body, "error"),
        ok: json_bool_field(body, "ok"),
        provider: json_string_field(body, "provider"),
        stderr: json_string_field(body, "stderr"),
        status: if connected {
            "connected".to_string()
        } else if app_server_running {
            "starting".to_string()
        } else {
            "disconnected".to_string()
        },
        thread_id: json_string_field(body, "threadId"),
    }
}

fn bridge_script_path(app: &tauri::AppHandle, workspace_cwd: &str) -> CodexBridgeResult<PathBuf> {
    if let Ok(resource_dir) = app.path().resource_dir() {
        let resource_candidate = resource_dir
            .join("tools")
            .join("agent-html-codex-app-server-bridge.mjs");

        if resource_candidate.exists() {
            return Ok(resource_candidate);
        }
    }

    let script_relative_path = PathBuf::from("tools").join("agent-html-codex-app-server-bridge.mjs");
    let workspace_candidate = PathBuf::from(workspace_cwd).join(&script_relative_path);
    if workspace_candidate.exists() {
        return Ok(workspace_candidate);
    }

    let current_dir = std::env::current_dir()?;
    let current_candidate = current_dir.join(&script_relative_path);
    if current_candidate.exists() {
        return Ok(current_candidate);
    }

    let parent_candidate = current_dir.join("..").join(&script_relative_path);
    if parent_candidate.exists() {
        return Ok(parent_candidate);
    }

    Ok(workspace_candidate)
}

fn validate_workspace_cwd(settings: &CodexBridgeSettings) -> CodexBridgeResult<()> {
    let workspace_cwd = settings.workspace_cwd.trim();
    if workspace_cwd.is_empty() {
        return Err(CodexBridgeError::Process(
            "workspace cwd is required".to_string(),
        ));
    }

    let path = PathBuf::from(workspace_cwd);
    if !path.exists() {
        return Err(CodexBridgeError::Process(format!(
            "workspace cwd does not exist: {}",
            path.display()
        )));
    }

    if !path.is_dir() {
        return Err(CodexBridgeError::Process(format!(
            "workspace cwd is not a directory: {}",
            path.display()
        )));
    }

    Ok(())
}

fn bridge_port_status(settings: &CodexBridgeSettings) -> CodexBridgeHealth {
    read_codex_bridge_health(settings)
}

fn load_settings_from_disk(app: &tauri::AppHandle) -> CodexBridgeResult<CodexBridgeSettings> {
    let path = default_settings_path(app)?;
    if !path.exists() {
        return Ok(default_settings());
    }

    let content = fs::read_to_string(path)?;
    let parsed: CodexBridgeSettings =
        serde_json::from_str(&content).map_err(|error| CodexBridgeError::Process(error.to_string()))?;
    Ok(settings_with_runtime_defaults(parsed))
}

fn save_settings_to_disk(
    app: &tauri::AppHandle,
    settings: &CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeSettings> {
    let path = default_settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let normalized = settings_with_runtime_defaults(settings.clone());
    let content =
        serde_json::to_string_pretty(&normalized).map_err(|error| CodexBridgeError::Process(error.to_string()))?;
    fs::write(path, content)?;
    Ok(normalized)
}

fn check_bridge_process(process: &mut Child) -> Option<u32> {
    match process.try_wait() {
        Ok(Some(_)) => None,
        Ok(None) => Some(process.id()),
        Err(_) => None,
    }
}

fn stop_bridge_process(process: &mut Child) {
    let _ = process.kill();
    let _ = process.wait();
}

#[tauri::command]
pub(crate) fn codex_settings_load(app: tauri::AppHandle) -> CodexBridgeResult<CodexBridgeSettings> {
    load_settings_from_disk(&app)
}

#[tauri::command]
pub(crate) fn codex_settings_save(
    app: tauri::AppHandle,
    settings: CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeSettings> {
    save_settings_to_disk(&app, &settings)
}

#[tauri::command]
pub(crate) fn codex_bridge_logs(
    app: tauri::AppHandle,
    settings: Option<CodexBridgeSettings>,
) -> CodexBridgeResult<CodexBridgeLogPaths> {
    let settings = match settings {
        Some(settings) => settings_with_runtime_defaults(settings),
        None => load_settings_from_disk(&app)?,
    };
    Ok(resolve_log_paths(&settings))
}

#[tauri::command]
pub(crate) fn codex_bridge_start(
    app: tauri::AppHandle,
    state: State<'_, CodexBridgeState>,
    settings: CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    if settings.bridge_host != "127.0.0.1" && settings.bridge_host != "localhost" {
        return Err(CodexBridgeError::InvalidHost);
    }
    validate_workspace_cwd(&settings)?;
    let mut connected_external = state
        .connected_external
        .lock()
        .expect("codex bridge external lock poisoned");

    let mut current_process = state.process.lock().expect("codex bridge lock poisoned");
    if let Some(process) = current_process.as_mut() {
        if let Some(pid) = check_bridge_process(process) {
            *connected_external = false;
            return Ok(process_status_from_health(
                &settings,
                read_codex_bridge_health(&settings),
                "managed",
                Some(pid),
            ));
        }

        *current_process = None;
    }
    drop(current_process);

    let port_health = bridge_port_status(&settings);
    if is_reusable_codex_bridge(&port_health) {
        *connected_external = true;
        return Ok(process_status_from_health(
            &settings,
            port_health,
            "external",
            None,
        ));
    }

    if port_health.error.is_none() {
        return Err(CodexBridgeError::Process(format!(
            "bridge port {} is already in use by another service",
            settings.bridge_port
        )));
    }

    *connected_external = false;

    let script_path = bridge_script_path(&app, &settings.workspace_cwd)?;
    if !script_path.exists() {
        return Err(CodexBridgeError::Process(format!(
            "bridge script not found at {}",
            script_path.display()
        )));
    }

    let mut command = Command::new("node");
    command
        .arg(script_path)
        .current_dir(&settings.workspace_cwd)
        .env("AGENT_HTML_BRIDGE_HOST", &settings.bridge_host)
        .env("AGENT_HTML_BRIDGE_PORT", settings.bridge_port.to_string())
        .env("AGENT_HTML_CODEX_COMMAND", &settings.codex_command)
        .env("AGENT_HTML_CODEX_CWD", &settings.workspace_cwd)
        .stdin(Stdio::null())
        .stdout(Stdio::null())
        .stderr(Stdio::null());

    if settings.event_log_enabled && !settings.event_log_path.is_empty() {
        command.env("AGENT_HTML_EVENT_LOG", &settings.event_log_path);
    }

    if settings.event_log_enabled && !settings.codex_event_log_path.is_empty() {
        command.env("AGENT_HTML_CODEX_EVENT_LOG", &settings.codex_event_log_path);
    }

    let mut child = command.spawn()?;
    let pid = child.id();

    std::thread::sleep(Duration::from_millis(800));
    if let Ok(Some(status)) = child.try_wait() {
        return Err(CodexBridgeError::Process(format!(
            "bridge process exited immediately with status {status}"
        )));
    }

    let mut current_process = state.process.lock().expect("codex bridge lock poisoned");
    *current_process = Some(child);
    drop(current_process);

    Ok(process_status_from_health(
        &settings,
        connect_codex_bridge(&settings),
        "managed",
        Some(pid),
    ))
}

#[tauri::command]
pub(crate) fn codex_bridge_stop(
    state: State<'_, CodexBridgeState>,
    settings: CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    let mut connected_external = state
        .connected_external
        .lock()
        .expect("codex bridge external lock poisoned");
    let mut current_process = state.process.lock().expect("codex bridge lock poisoned");
    let ownership = if *connected_external {
        "external"
    } else {
        "managed"
    };

    if let Some(mut process) = current_process.take() {
        stop_bridge_process(&mut process);
    }
    *connected_external = false;

    let status_message = if ownership == "external" {
        Some("Disconnected from the existing bridge.".to_string())
    } else {
        None
    };

    Ok(process_status_from_health(
        &settings,
        CodexBridgeHealth {
            app_server_running: false,
            codex_command: Some(settings.codex_command.clone()),
            connected: false,
            cwd: if settings.workspace_cwd.is_empty() {
                None
            } else {
                Some(settings.workspace_cwd.clone())
            },
            error: status_message,
            ok: true,
            provider: Some("codex_app_server".to_string()),
            stderr: None,
            status: "stopped".to_string(),
            thread_id: None,
        },
        ownership,
        None,
    ))
}

#[tauri::command]
pub(crate) fn codex_bridge_restart(
    app: tauri::AppHandle,
    state: State<'_, CodexBridgeState>,
    settings: CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeProcessStatus> {
    {
        let mut connected_external = state
            .connected_external
            .lock()
            .expect("codex bridge external lock poisoned");
        let mut current_process = state.process.lock().expect("codex bridge lock poisoned");
        if let Some(mut process) = current_process.take() {
            stop_bridge_process(&mut process);
        }
        *connected_external = false;
    }

    codex_bridge_start(app, state, settings)
}

#[tauri::command]
pub(crate) fn codex_bridge_health(
    state: State<'_, CodexBridgeState>,
    settings: CodexBridgeSettings,
) -> CodexBridgeResult<CodexBridgeProcessStatus> {
    let settings = normalize_codex_settings(&settings);
    validate_workspace_cwd(&settings)?;
    let mut connected_external = state
        .connected_external
        .lock()
        .expect("codex bridge external lock poisoned");
    let mut current_process = state.process.lock().expect("codex bridge lock poisoned");
    let pid = current_process
        .as_mut()
        .and_then(check_bridge_process);

    if current_process.is_some() && pid.is_none() {
        *current_process = None;
    }
    drop(current_process);

    let health = read_codex_bridge_health(&settings);
    let ownership = if pid.is_some() {
        *connected_external = false;
        "managed"
    } else if is_reusable_codex_bridge(&health) {
        *connected_external = true;
        "external"
    } else {
        *connected_external = false;
        "managed"
    };

    Ok(process_status_from_health(&settings, health, ownership, pid))
}
