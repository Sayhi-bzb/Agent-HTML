mod codex_bridge;
mod workspace;

use tauri::Manager;

use crate::codex_bridge::{
    codex_bridge_health, codex_bridge_logs, codex_bridge_open_logs, codex_bridge_restart,
    codex_bridge_start, codex_bridge_stop, codex_settings_load, codex_settings_save,
    CodexBridgeState,
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
            app.manage(CodexBridgeState::new());
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
            codex_settings_load,
            codex_settings_save,
            codex_bridge_start,
            codex_bridge_stop,
            codex_bridge_restart,
            codex_bridge_health,
            codex_bridge_logs,
            codex_bridge_open_logs
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
