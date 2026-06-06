mod codex_host;
mod component_market;
mod workspace;
mod workspace_root;

use tauri::Manager;

use crate::codex_host::{
    codex_connection_trace, codex_host_health, codex_host_restart, codex_host_settings_load,
    codex_host_settings_save, codex_host_start, codex_host_stop, codex_rpc_notify,
    codex_rpc_request, codex_rpc_respond, CodexHostState,
};
use crate::component_market::{
    load_component_market_settings, save_component_market_settings,
    write_agent_html_prompt_schema_artifact,
};
use crate::workspace::{
    create_project, create_project_section, delete_project, delete_project_codex_thread_link,
    delete_project_section, duplicate_project_section, get_company_agent_state,
    get_project_section_document, get_root_agents_instructions, list_project_codex_threads,
    list_project_sections, list_projects, rename_project, rename_project_section,
    touch_project_codex_thread_link, update_company_agent_state, update_project_section_document,
    update_root_agents_instructions, upsert_project_codex_thread_link, WorkspaceStore,
};
use crate::workspace_root::{
    resolve_workspace_root, workspace_root_settings_load, workspace_root_settings_save,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let workspace_root =
                resolve_workspace_root(&app.handle()).map_err(|error| error.to_string())?;
            let store = WorkspaceStore::open(workspace_root).map_err(|error| error.to_string())?;
            app.manage(store);
            app.manage(CodexHostState::new());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            list_project_sections,
            get_project_section_document,
            create_project,
            rename_project,
            delete_project,
            create_project_section,
            rename_project_section,
            delete_project_section,
            duplicate_project_section,
            update_project_section_document,
            list_project_codex_threads,
            upsert_project_codex_thread_link,
            touch_project_codex_thread_link,
            delete_project_codex_thread_link,
            get_root_agents_instructions,
            update_root_agents_instructions,
            load_component_market_settings,
            save_component_market_settings,
            write_agent_html_prompt_schema_artifact,
            codex_host_settings_load,
            codex_host_settings_save,
            codex_host_start,
            codex_host_stop,
            codex_host_restart,
            codex_host_health,
            codex_connection_trace,
            codex_rpc_request,
            codex_rpc_notify,
            codex_rpc_respond,
            get_company_agent_state,
            update_company_agent_state,
            workspace_root_settings_load,
            workspace_root_settings_save
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
