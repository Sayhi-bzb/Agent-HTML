mod codex_host;
mod workspace;

use tauri::Manager;

use crate::codex_host::{
    codex_host_settings_load, codex_host_settings_save,
    codex_host_health, codex_host_logs, codex_host_open_logs, codex_host_restart,
    codex_host_start, codex_host_stop, codex_rpc_notify, codex_rpc_request,
    CodexHostState,
};
use crate::workspace::{
    create_project, create_project_section, delete_project, delete_project_section,
    duplicate_project_section, get_project_section_document, list_project_sections, list_projects,
    rename_project, rename_project_section, update_project_section_document, WorkspaceStore,
};

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|_| "unable to resolve app data directory")?;
            let store = WorkspaceStore::open(app_data_dir.join("workspace.sqlite3"))
                .map_err(|error| error.to_string())?;
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
            codex_host_settings_load,
            codex_host_settings_save,
            codex_host_start,
            codex_host_stop,
            codex_host_restart,
            codex_host_health,
            codex_host_logs,
            codex_host_open_logs,
            codex_rpc_request,
            codex_rpc_notify
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
