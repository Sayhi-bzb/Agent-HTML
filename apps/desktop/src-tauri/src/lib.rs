mod desktop_error;
mod preferences;
mod runtime;
mod workspace;

#[cfg(unix)]
pub use runtime::run_runtime_supervisor_if_requested;

use desktop_error::DesktopError;
use preferences::{CanvasThemeSnapshot, Preferences, RecentWorkspace, StoredDesktopState};
use runtime::{OpenWorkspaceRequest, RuntimeReady, RuntimeState};
use serde::Serialize;
use std::path::Path;
use std::sync::Mutex;
use tauri::{AppHandle, Emitter, Manager, State};

#[derive(Default)]
struct DesktopStore(Mutex<StoredDesktopState>);

#[derive(Serialize)]
#[serde(rename_all = "camelCase")]
struct DesktopSnapshot {
    canvas_theme: Option<CanvasThemeSnapshot>,
    preferences: Preferences,
    recents: Vec<RecentWorkspace>,
    version: String,
    log_path: String,
}

#[derive(Clone, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceProgress {
    status: &'static str,
    root: String,
}

fn emit_workspace_progress(app: &AppHandle, status: &'static str, root: &Path) {
    let _ = app.emit(
        "desktop://workspace-progress",
        WorkspaceProgress {
            status,
            root: root.to_string_lossy().to_string(),
        },
    );
}

#[tauri::command]
fn desktop_snapshot(
    app: AppHandle,
    store: State<'_, DesktopStore>,
) -> Result<DesktopSnapshot, String> {
    let mut stored = store
        .0
        .lock()
        .map_err(|_| "Desktop settings are unavailable")?;
    preferences::refresh_availability(&mut stored);
    Ok(DesktopSnapshot {
        canvas_theme: stored.canvas_theme.clone(),
        preferences: stored.preferences.clone(),
        recents: stored.recents.clone(),
        version: app.package_info().version.to_string(),
        log_path: runtime::log_path(&app),
    })
}

#[tauri::command]
fn save_canvas_theme(
    app: AppHandle,
    store: State<'_, DesktopStore>,
    canvas_theme: CanvasThemeSnapshot,
) -> Result<(), String> {
    let mut stored = store
        .0
        .lock()
        .map_err(|_| "Desktop settings are unavailable")?;
    stored.canvas_theme = Some(canvas_theme);
    preferences::save(&app, &stored)
}

#[tauri::command]
async fn open_workspace(
    app: AppHandle,
    runtime_state: State<'_, RuntimeState>,
    store: State<'_, DesktopStore>,
    request: OpenWorkspaceRequest,
) -> Result<RuntimeReady, DesktopError> {
    let root = workspace::normalize_project_root(Path::new(&request.path)).map_err(|message| {
        DesktopError::new("inaccessible", "workspace-selection", message, true)
    })?;
    emit_workspace_progress(&app, "opening", &root);
    if request.initialize && !root.join("agent-html").exists() {
        emit_workspace_progress(&app, "initializing", &root);
        runtime::initialize_workspace(&app, &root).await?;
    }
    workspace::validate_workspace(&root).map_err(|message| {
        let code = if message.contains("missing") {
            "missing-workspace"
        } else {
            "inaccessible"
        };
        DesktopError::new(code, "workspace-selection", message, true)
    })?;
    emit_workspace_progress(&app, "starting", &root);
    let ready = runtime::start_runtime(&app, &runtime_state, &root, &request.pipeline).await?;

    let mut stored = store.0.lock().map_err(|_| {
        DesktopError::new(
            "internal",
            "runtime-start",
            "Desktop settings are unavailable",
            true,
        )
    })?;
    preferences::remember_workspace(&mut stored, &root);
    preferences::save(&app, &stored)
        .map_err(|message| DesktopError::new("internal", "runtime-start", message, true))?;
    Ok(ready)
}

#[tauri::command]
async fn close_workspace(runtime_state: State<'_, RuntimeState>) -> Result<(), DesktopError> {
    runtime::stop_runtime(&runtime_state).await;
    Ok(())
}

#[tauri::command]
fn save_preferences(
    app: AppHandle,
    store: State<'_, DesktopStore>,
    preferences: Preferences,
) -> Result<(), String> {
    let mut stored = store
        .0
        .lock()
        .map_err(|_| "Desktop settings are unavailable")?;
    stored.preferences = preferences;
    preferences::save(&app, &stored)
}

#[tauri::command]
fn show_runtime_log(app: AppHandle) -> Result<(), String> {
    let path = runtime::log_path(&app);
    open::that(path).map_err(|error| error.to_string())
}

pub fn run() {
    tauri::Builder::default()
        .plugin(tauri_plugin_dialog::init())
        .plugin(tauri_plugin_shell::init())
        .setup(|app| {
            app.manage(DesktopStore(Mutex::new(preferences::load(app.handle()))));
            app.manage(RuntimeState::default());
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            close_workspace,
            desktop_snapshot,
            open_workspace,
            save_canvas_theme,
            save_preferences,
            show_runtime_log
        ])
        .build(tauri::generate_context!())
        .expect("failed to build AHTML Desktop")
        .run(|app, event| {
            if matches!(event, tauri::RunEvent::ExitRequested { .. }) {
                let state = app.state::<RuntimeState>();
                tauri::async_runtime::block_on(runtime::stop_runtime(&state));
            }
        });
}
