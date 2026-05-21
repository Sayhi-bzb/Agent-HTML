use fs_err as fs;
use tauri::AppHandle;
use tracing::{info, info_span};

use crate::{
    chat_store::{default_chat_messages, write_chat_messages},
    error::BackendError,
    models::{
        AppError, SessionCreateInput, SessionDetail, SessionPinInput, SessionRecord,
        SessionRenameInput, SessionSummary, SessionViewInput,
    },
    paths::{ensure_sessions_root, session_dir, BUILD_DIR_NAME, LOGS_DIR_NAME, SOURCE_FILE_NAME},
    session_store::{
        load_session_detail_from_dir, read_session_record, rename_session_record,
        update_session_pin_record, update_session_view_record, write_session_record,
    },
    support::{default_source, now_epoch_millis, now_iso_stub, slugify},
};

#[tauri::command]
pub(crate) fn list_sessions(app: AppHandle) -> Result<Vec<SessionSummary>, AppError> {
    let _span = info_span!("list_sessions").entered();
    let root = ensure_sessions_root(&app)?;
    let mut sessions = Vec::new();

    let entries = fs::read_dir(root).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to read sessions directory.",
            error,
        ))
    })?;

    for entry in entries.flatten() {
        let Ok(path) = camino::Utf8PathBuf::from_path_buf(entry.path()) else {
            continue;
        };
        if !path.is_dir() {
            continue;
        }

        if let Ok(session) = load_session_detail_from_dir(path.as_path()) {
            sessions.push(session.summary);
        }
    }

    sessions.sort_by(|left, right| {
        right
            .pinned
            .cmp(&left.pinned)
            .then_with(|| right.updated_at.cmp(&left.updated_at))
            .then_with(|| left.name.cmp(&right.name))
    });

    info!(count = sessions.len(), "loaded session summaries");
    Ok(sessions)
}

#[tauri::command]
pub(crate) fn create_session(
    app: AppHandle,
    input: SessionCreateInput,
) -> Result<SessionDetail, AppError> {
    let _span = info_span!("create_session", requested_name = %input.name).entered();
    let name = if input.name.trim().is_empty() {
        "Untitled Session".to_string()
    } else {
        input.name.trim().to_string()
    };
    let session_id = format!("session-{}-{}", slugify(&name), now_epoch_millis());
    let session_dir = ensure_sessions_root(&app)?.join(&session_id);

    fs::create_dir_all(session_dir.join(BUILD_DIR_NAME)).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to create build directory.",
            error,
        ))
        .with_session(session_id.clone())
    })?;
    fs::create_dir_all(session_dir.join(LOGS_DIR_NAME)).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to create logs directory.",
            error,
        ))
        .with_session(session_id.clone())
    })?;

    let record = SessionRecord {
        id: session_id.clone(),
        name: name.clone(),
        status: "draft".into(),
        pinned: false,
        updated_at: now_iso_stub(),
        last_build_at: None,
        last_build_status: None,
        last_build_exit_code: None,
        last_build_stdout_path: None,
        last_build_stderr_path: None,
        has_preview: false,
        current_view: "source".into(),
    };

    write_session_record(&session_dir, &record)?;
    fs::write(session_dir.join(SOURCE_FILE_NAME), default_source(&name)).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write initial source file.",
            error,
        ))
        .with_session(session_id.clone())
    })?;
    write_chat_messages(&session_dir, &default_chat_messages())?;

    info!(session_id = %session_id, "created session");
    load_session_detail_from_dir(&session_dir)
}

#[tauri::command]
pub(crate) fn open_session(app: AppHandle, session_id: String) -> Result<SessionDetail, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    load_session_detail_from_dir(&session_dir)
}

#[tauri::command]
pub(crate) fn delete_session(app: AppHandle, session_id: String) -> Result<(), AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    fs::remove_dir_all(&session_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to delete the session directory.",
            error,
        ))
        .with_session(session_id)
    })
}

#[tauri::command]
pub(crate) fn set_session_view(
    app: AppHandle,
    session_id: String,
    input: SessionViewInput,
) -> Result<SessionDetail, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    update_session_view_record(&session_dir, &input.view, Some(session_id.clone()))?;
    load_session_detail_from_dir(&session_dir)
}

#[tauri::command]
pub(crate) fn rename_session(
    app: AppHandle,
    session_id: String,
    input: SessionRenameInput,
) -> Result<SessionDetail, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    rename_session_record(&session_dir, &input.name, Some(session_id.clone()))?;
    load_session_detail_from_dir(&session_dir)
}

#[tauri::command]
pub(crate) fn set_session_pinned(
    app: AppHandle,
    session_id: String,
    input: SessionPinInput,
) -> Result<SessionDetail, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    update_session_pin_record(&session_dir, input.pinned)?;
    load_session_detail_from_dir(&session_dir)
}

#[tauri::command]
pub(crate) fn save_source(
    app: AppHandle,
    session_id: String,
    source: String,
) -> Result<SessionDetail, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    let mut record = read_session_record(&session_dir)?;

    fs::write(session_dir.join(SOURCE_FILE_NAME), source).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write source file.",
            error,
        ))
        .with_session(session_id.clone())
    })?;

    record.status = "dirty".into();
    record.updated_at = now_iso_stub();
    record.current_view = "source".into();
    write_session_record(&session_dir, &record)?;
    load_session_detail_from_dir(&session_dir)
}
