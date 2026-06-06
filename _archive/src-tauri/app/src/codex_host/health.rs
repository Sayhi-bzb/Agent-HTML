use std::path::Path;

use serde::Serialize;
use serde_json::json;

use super::settings::CodexHostSettings;
use super::state::{get_last_error, get_last_stderr, CodexHostState};
use super::trace::append_connection_trace;

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

fn health_from_state(
    state: &CodexHostState,
    settings: &CodexHostSettings,
    workspace_cwd: Option<&Path>,
    pid: Option<u32>,
) -> CodexHostHealth {
    let initialized = state
        .initialized
        .lock()
        .map(|value| *value)
        .unwrap_or(false);
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

pub(crate) fn process_status_from_state(
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
