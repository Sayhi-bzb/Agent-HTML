use crate::{
    error::BackendError,
    models::{AppError, BuildRunSummary, SessionDetail, SessionRecord},
    paths::{path_to_string, preview_path, LOGS_DIR_NAME, SESSION_FILE_NAME, SOURCE_FILE_NAME},
};
use camino::Utf8Path;
use fs_err as fs;

pub(super) fn load_session_detail_from_dir(
    session_dir: &Utf8Path,
) -> Result<SessionDetail, AppError> {
    let record = read_session_record(session_dir)?;
    let source_path = session_dir.join(SOURCE_FILE_NAME);
    let log_directory = session_dir.join(LOGS_DIR_NAME);
    let source = fs::read_to_string(&source_path).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to read source file.",
            error,
        ))
        .with_session(record.id.clone())
    })?;

    Ok(SessionDetail {
        id: record.id.clone(),
        name: record.name.clone(),
        directory: path_to_string(session_dir.to_path_buf()),
        status: record.status.clone(),
        updated_at: record.updated_at.clone(),
        last_build_at: record.last_build_at.clone(),
        has_preview: record.has_preview,
        source_path: path_to_string(source_path),
        preview_path: preview_path(session_dir)
            .filter(|path| path.exists())
            .map(path_to_string),
        last_build: build_run_summary_from_record(&record, session_dir),
        log_directory: path_to_string(log_directory),
        current_view: record.current_view,
        source,
    })
}

pub(super) fn read_session_record(session_dir: &Utf8Path) -> Result<SessionRecord, AppError> {
    let record_path = session_dir.join(SESSION_FILE_NAME);
    let raw = fs::read_to_string(&record_path).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to read session metadata.",
            error,
        ))
    })?;

    serde_json::from_str(&raw).map_err(|error| {
        AppError::from(BackendError::json(
            "session-io",
            "Session metadata is invalid JSON.",
            error,
        ))
    })
}

pub(super) fn write_session_record(
    session_dir: &Utf8Path,
    record: &SessionRecord,
) -> Result<(), AppError> {
    let record_path = session_dir.join(SESSION_FILE_NAME);
    let serialized = serde_json::to_string_pretty(record).map_err(|error| {
        AppError::from(BackendError::json(
            "session-io",
            "Unable to serialize session metadata.",
            error,
        ))
    })?;

    fs::write(record_path, serialized).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write session metadata.",
            error,
        ))
    })
}

pub(super) fn update_session_view_record(
    session_dir: &Utf8Path,
    view: &str,
    session_id: Option<String>,
) -> Result<(), AppError> {
    if !matches!(view, "preview" | "source" | "inspect") {
        let error = AppError::from(BackendError::ui_validation(
            "Session view must be preview, source, or inspect.",
        ));

        return Err(match session_id {
            Some(id) => error.with_session(id),
            None => error,
        });
    }

    let mut record = read_session_record(session_dir)?;
    record.current_view = view.to_string();
    write_session_record(session_dir, &record)
}

pub(super) fn rename_session_record(
    session_dir: &Utf8Path,
    name: &str,
    session_id: Option<String>,
) -> Result<(), AppError> {
    let trimmed = name.trim();
    if trimmed.is_empty() {
        let error = AppError::from(BackendError::ui_validation(
            "Session name cannot be empty.",
        ));

        return Err(match session_id {
            Some(id) => error.with_session(id),
            None => error,
        });
    }

    let mut record = read_session_record(session_dir)?;
    record.name = trimmed.to_string();
    record.updated_at = crate::support::now_iso_stub();
    write_session_record(session_dir, &record)
}

pub(super) fn build_run_summary_from_record(
    record: &SessionRecord,
    session_dir: &Utf8Path,
) -> Option<BuildRunSummary> {
    let status = record
        .last_build_status
        .as_deref()
        .and_then(parse_build_status)
        .or_else(|| {
            if record.has_preview {
                Some("succeeded")
            } else if record.status == "error" {
                Some("failed")
            } else if record.status == "building" {
                Some("running")
            } else {
                None
            }
        });

    let started_at = record
        .last_build_at
        .clone()
        .unwrap_or_else(|| record.updated_at.clone());
    let preview_path = preview_path(session_dir)
        .filter(|path| path.exists())
        .map(path_to_string);

    if preview_path.is_none() && record.last_build_at.is_none() && status.is_none() {
        return None;
    }

    Some(BuildRunSummary {
        run_id: format!("{}-last-build", record.id),
        session_id: record.id.clone(),
        started_at: started_at.clone(),
        finished_at: record.last_build_at.clone(),
        status: status.unwrap_or("idle").into(),
        exit_code: record
            .last_build_exit_code
            .or_else(|| if preview_path.is_some() { Some(0) } else { None }),
        stdout_path: record.last_build_stdout_path.clone(),
        stderr_path: record.last_build_stderr_path.clone(),
        preview_path,
    })
}

fn parse_build_status(status: &str) -> Option<&'static str> {
    match status {
        "idle" => Some("idle"),
        "running" => Some("running"),
        "failed" => Some("failed"),
        "succeeded" => Some("succeeded"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::build_run_summary_from_record;
    use crate::models::SessionRecord;
    use camino::Utf8PathBuf;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn build_run_summary_from_record_keeps_failed_status_with_stale_preview() {
        let session_dir = test_session_dir("restore-failed-build");
        fs::create_dir_all(session_dir.join("build")).expect("create build dir");
        fs::write(session_dir.join("build").join("index.html"), "<html />")
            .expect("write preview");

        let summary = build_run_summary_from_record(
            &SessionRecord {
                id: "session-test".into(),
                name: "Session Test".into(),
                status: "error".into(),
                updated_at: "epoch-1".into(),
                last_build_at: Some("2026-05-16T09:00:00Z".into()),
                last_build_status: Some("failed".into()),
                last_build_exit_code: Some(1),
                last_build_stdout_path: Some("D:/tmp/build.stdout.log".into()),
                last_build_stderr_path: Some("D:/tmp/build.stderr.log".into()),
                has_preview: true,
                current_view: "inspect".into(),
            },
            &session_dir,
        )
        .expect("summary");

        assert_eq!(summary.status, "failed");
        assert_eq!(summary.exit_code, Some(1));
        assert_eq!(
            summary.stdout_path.as_deref(),
            Some("D:/tmp/build.stdout.log")
        );
        assert_eq!(
            summary.stderr_path.as_deref(),
            Some("D:/tmp/build.stderr.log")
        );
        assert_eq!(
            summary.preview_path,
            Some(session_dir.join("build").join("index.html").into_string())
        );

        let _ = fs::remove_dir_all(&session_dir);
    }

    fn test_session_dir(suffix: &str) -> Utf8PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        Utf8PathBuf::from_path_buf(
            std::env::temp_dir().join(format!("agent-html-app-{suffix}-{nonce}")),
        )
        .expect("temp dir should be valid UTF-8")
    }
}
