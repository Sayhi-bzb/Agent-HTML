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
pub(crate) struct CodexConnectionTraceInput {
    event: String,
    payload: Value,
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
    append_frontend_connection_trace(&input.event, input.payload)
}

#[tauri::command]
pub(crate) fn codex_host_start(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::start(app, state, settings)
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
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::restart(app, state, settings)
}

#[tauri::command]
pub(crate) fn codex_host_health(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
) -> CodexHostResult<CodexHostProcessStatus> {
    service::health(app, state, settings)
}

#[tauri::command]
pub(crate) fn codex_rpc_request(
    app: tauri::AppHandle,
    state: State<'_, CodexHostState>,
    settings: CodexHostSettings,
    input: CodexRpcRequestInput,
) -> CodexHostResult<CodexRpcRequestResult> {
    let settings = normalize_codex_settings(&settings);
    let result = service::rpc_request(app, state, &settings, input.method, input.params)?;
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
    service::rpc_notify(app, state, &settings, input.method, input.params)
}

#[cfg(test)]
mod tests {
    const FACADE_SOURCE: &str = include_str!("mod.rs");

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
}
