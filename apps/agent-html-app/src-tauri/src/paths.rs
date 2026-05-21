use camino::{Utf8Path, Utf8PathBuf};
use fs_err as fs;
use tauri::AppHandle;
use tauri::Manager;

use crate::{error::BackendError, models::AppError};

pub(crate) const SOURCE_FILE_NAME: &str = "source.agent.html";
pub(crate) const SESSION_FILE_NAME: &str = "session.json";
pub(crate) const CHAT_FILE_NAME: &str = "chat.jsonl";
pub(crate) const BUILD_DIR_NAME: &str = "build";
pub(crate) const LOGS_DIR_NAME: &str = "logs";

pub(crate) fn ensure_support_root(app: &AppHandle) -> Result<Utf8PathBuf, AppError> {
    let root = app.path().app_data_dir().map_err(|error| {
        AppError::from(BackendError::message(
            "session-io",
            "Unable to resolve the app data directory.",
        ))
        .with_details(error.to_string())
    })?;
    let root = Utf8PathBuf::from_path_buf(root).map_err(|path| {
        AppError::from(BackendError::message(
            "session-io",
            format!("App support path is not valid UTF-8: {}", path.display()),
        ))
    })?;
    fs::create_dir_all(&root).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to create the app support directory.",
            error,
        ))
    })?;
    Ok(root)
}

pub(crate) fn ensure_sessions_root(app: &AppHandle) -> Result<Utf8PathBuf, AppError> {
    let sessions_dir = ensure_support_root(app)?.join("sessions");
    fs::create_dir_all(&sessions_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to create the sessions directory.",
            error,
        ))
    })?;
    Ok(sessions_dir)
}

pub(crate) fn ensure_ahtml_home(app: &AppHandle) -> Result<Utf8PathBuf, AppError> {
    let ahtml_home = ensure_support_root(app)?.join("ahtml-home");
    fs::create_dir_all(&ahtml_home).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to create the isolated ahtml home.",
            error,
        ))
    })?;
    Ok(ahtml_home)
}

pub(crate) fn session_dir(app: &AppHandle, session_id: &str) -> Result<Utf8PathBuf, AppError> {
    let path = ensure_sessions_root(app)?.join(session_id);
    if !path.exists() {
        return Err(AppError::from(BackendError::message(
            "session-io",
            format!("Session {session_id} was not found."),
        ))
        .with_session(session_id.to_string()));
    }
    Ok(path)
}

pub(crate) fn preview_path(session_dir: &Utf8Path) -> Option<Utf8PathBuf> {
    let path = session_dir.join(BUILD_DIR_NAME).join("index.html");
    if path.exists() {
        Some(path)
    } else {
        None
    }
}

pub(crate) fn path_to_string(path: Utf8PathBuf) -> String {
    path.into_string()
}
