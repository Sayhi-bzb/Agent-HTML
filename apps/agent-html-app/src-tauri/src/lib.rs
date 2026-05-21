mod chat_store;
mod commands;
mod error;
mod inspect_payload;
mod models;
mod paths;
mod proposal;
mod runtime_cli;
mod session_store;
mod support;

use tauri::Manager;
use tracing::{info, info_span};

use crate::{
    commands::{
        builds::{
            check_runtime, read_logs, read_preview_html, run_build, run_inspect,
            validate_source,
        },
        chat::{append_chat_message, generate_session_proposal, read_chat},
        sessions::{
            create_session, delete_session, list_sessions, open_session, rename_session,
            save_source, set_session_view,
        },
    },
    paths::ensure_sessions_root,
};

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    let _ = tracing_subscriber::fmt()
        .with_target(false)
        .compact()
        .try_init();

    tauri::Builder::default()
        .setup(|app| {
            let _span = info_span!("tauri_setup").entered();
            let main_window = app.get_webview_window("main").expect("main window");
            main_window.set_title("agent-html-app").ok();
            ensure_sessions_root(app.handle()).expect("sessions root");
            info!("tauri app setup completed");
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_sessions,
            create_session,
            open_session,
            delete_session,
            set_session_view,
            rename_session,
            save_source,
            run_build,
            run_inspect,
            validate_source,
            check_runtime,
            read_preview_html,
            read_logs,
            read_chat,
            append_chat_message,
            generate_session_proposal,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
