mod error;
mod health;
mod process;
mod rpc;
mod service;
mod settings;
mod state;
mod trace;
mod workspace;

use serde::{Deserialize, Serialize};
use serde_json::Value;
use tauri::State;

use crate::workspace::WorkspaceStore;

pub(crate) use error::CodexHostResult;
use health::CodexHostProcessStatus;
pub(crate) use settings::CodexHostSettings;
use settings::{load_settings_from_disk, normalize_codex_settings, save_settings_to_disk};
pub(crate) use state::CodexHostState;
use trace::append_frontend_connection_trace;

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
pub(crate) struct CodexRpcRespondInput {
    request_id: u64,
    result: Value,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexConnectionTraceInput {
    event: String,
    payload: Value,
}

#[tauri::command]
pub(crate) fn codex_host_settings_load(
    app: tauri::AppHandle,
) -> CodexHostResult<CodexHostSettings> {
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
pub(crate) fn codex_connection_trace(
    store: State<'_, WorkspaceStore>,
    input: CodexConnectionTraceInput,
) -> CodexHostResult<()> {
    append_frontend_connection_trace(&store, &input.event, input.payload)
}

#[tauri::command]
pub(crate) fn codex_host_start(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::start(app, state, store, settings)
}

#[tauri::command]
pub(crate) fn codex_host_stop(
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::stop(state, settings)
}

#[tauri::command]
pub(crate) fn codex_host_restart(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::restart(app, state, store, settings)
}

#[tauri::command]
pub(crate) fn codex_host_health(
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::health(state, store, settings)
}

#[tauri::command]
pub(crate) fn codex_rpc_request(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
    input: CodexRpcRequestInput,
) -> CodexHostResult<CodexRpcRequestResult> {
    let settings = normalize_codex_settings(&settings);
    let result = service::rpc_request(app, state, store, &settings, input.method, input.params)?;
    Ok(CodexRpcRequestResult { result })
}

#[tauri::command]
pub(crate) fn codex_rpc_notify(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
    input: CodexRpcNotifyInput,
) -> CodexHostResult<()> {
    let settings = normalize_codex_settings(&settings);
    service::rpc_notify(app, state, store, &settings, input.method, input.params)
}

#[tauri::command]
pub(crate) fn codex_rpc_respond(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    store: State<'_, WorkspaceStore>,
    settings: CodexHostSettings,
    input: CodexRpcRespondInput,
) -> CodexHostResult<()> {
    let settings = normalize_codex_settings(&settings);
    service::rpc_respond(app, state, store, &settings, input.request_id, input.result)
}

#[cfg(test)]
mod tests {
    const FACADE_SOURCE: &str = include_str!("mod.rs");
    const SERVICE_SOURCE: &str = include_str!("service.rs");
    const TRACE_SOURCE: &str = include_str!("trace.rs");
    const WORKSPACE_SOURCE: &str = include_str!("workspace.rs");

    #[test]
    fn codex_host_facade_keeps_process_and_transport_details_in_submodules() {
        assert!(FACADE_SOURCE.contains("service::start"));
        for forbidden in [
            ["Command", "::new"].concat(),
            ["Buf", "Reader"].concat(),
            ["thread", "::spawn"].concat(),
            ["recv", "_timeout"].concat(),
            ["Open", "Options"].concat(),
        ] {
            assert!(!FACADE_SOURCE.contains(&forbidden));
        }
    }

    #[test]
    fn connection_trace_writes_under_agent_world_logs() {
        assert!(TRACE_SOURCE.contains(".agent-world"));
        assert!(TRACE_SOURCE.contains("logs"));
        assert!(TRACE_SOURCE.contains("agent-html-codex-connection-trace.jsonl"));
        assert!(!TRACE_SOURCE.contains(".tmp"));
    }

    #[test]
    fn codex_host_uses_open_workspace_store_for_cwd_and_trace() {
        assert!(SERVICE_SOURCE.contains("State<'_, WorkspaceStore>"));
        assert!(WORKSPACE_SOURCE.contains("store.root().to_path_buf()"));
        assert!(!SERVICE_SOURCE.contains("resolve_workspace_root"));
        assert!(!TRACE_SOURCE.contains("resolve_workspace_root"));
        assert!(!WORKSPACE_SOURCE.contains("resolve_workspace_root"));
    }

    #[test]
    fn codex_host_start_syncs_managed_agent_html_skill() {
        let sync_index = SERVICE_SOURCE
            .find(".ensure_agent_html_skill()")
            .expect("start syncs AgentHTML skill");
        let spawn_index = SERVICE_SOURCE
            .find("spawn_codex_process(")
            .expect("start spawns Codex process");

        assert!(sync_index < spawn_index);
    }
}
