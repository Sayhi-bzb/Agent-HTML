use fs_err as fs;
use tauri::AppHandle;
use tracing::info_span;

use crate::{
    chat_store::{append_chat_message_to_file, read_chat_messages},
    error::BackendError,
    models::{AgentShellMessage, AppendChatMessageInput, AppError, LogSnapshot, ProposalSnapshot},
    paths::{session_dir, LOGS_DIR_NAME, SOURCE_FILE_NAME},
    proposal::{build_run_summary_from_record, build_session_proposal_text},
    session_store::{read_session_record, write_session_record},
    support::{now_epoch_millis, now_iso_stub, read_latest_log},
};

#[tauri::command]
pub(crate) fn read_chat(app: AppHandle, session_id: String) -> Result<Vec<AgentShellMessage>, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    read_chat_messages(&session_dir)
}

#[tauri::command]
pub(crate) fn append_chat_message(
    app: AppHandle,
    session_id: String,
    input: AppendChatMessageInput,
) -> Result<Vec<AgentShellMessage>, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    let mut record = read_session_record(&session_dir)?;
    let text = input.text.trim();

    if text.is_empty() {
        return Err(AppError::from(BackendError::ui_validation(
            "Chat messages cannot be empty.",
        ))
        .with_session(session_id));
    }

    let message = AgentShellMessage {
        id: format!("chat-{}", now_epoch_millis()),
        role: input.role,
        created_at: now_iso_stub(),
        text: text.to_string(),
        kind: input.kind,
        proposal_snapshot: None,
    };

    append_chat_message_to_file(&session_dir, &message)?;
    record.updated_at = now_iso_stub();
    write_session_record(&session_dir, &record)?;
    read_chat_messages(&session_dir)
}

#[tauri::command]
pub(crate) fn generate_session_proposal(
    app: AppHandle,
    session_id: String,
) -> Result<Vec<AgentShellMessage>, AppError> {
    let _span = info_span!("generate_session_proposal", session_id = %session_id).entered();
    let session_dir = session_dir(&app, &session_id)?;
    let mut record = read_session_record(&session_dir)?;
    let source = fs::read_to_string(session_dir.join(SOURCE_FILE_NAME)).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to read source file for proposal generation.",
            error,
        ))
        .with_session(session_id.clone())
    })?;
    let logs_dir = session_dir.join(LOGS_DIR_NAME);
    let logs = LogSnapshot {
        stdout: read_latest_log(&logs_dir, ".stdout.log"),
        stderr: read_latest_log(&logs_dir, ".stderr.log"),
    };
    let build = build_run_summary_from_record(&record, &session_dir);
    let text = build_session_proposal_text(&record, &source, build.as_ref(), &logs);

    let message = AgentShellMessage {
        id: format!("chat-{}", now_epoch_millis()),
        role: "placeholder".into(),
        created_at: now_iso_stub(),
        text,
        kind: "proposal-placeholder".into(),
        proposal_snapshot: Some(ProposalSnapshot {
            line_count: source.lines().count(),
            source,
        }),
    };

    append_chat_message_to_file(&session_dir, &message)?;
    record.updated_at = now_iso_stub();
    write_session_record(&session_dir, &record)?;
    read_chat_messages(&session_dir)
}
