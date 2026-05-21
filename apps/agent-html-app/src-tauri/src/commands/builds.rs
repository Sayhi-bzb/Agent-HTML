use fs_err as fs;
use serde_json::Value;
use tauri::AppHandle;
use tracing::info_span;

use crate::{
    error::BackendError,
    inspect_payload::{
        diagnostics_from_inspect_payload, diagnostics_from_validation_payload,
        structure_summary_from_inspection_value, structure_summary_from_validation_payload,
    },
    models::{AppError, BuildRunSummary, InspectSnapshot, LogSnapshot, SourceValidationSnapshot},
    paths::{
        ensure_ahtml_home, ensure_support_root, path_to_string, preview_path, session_dir,
        BUILD_DIR_NAME, LOGS_DIR_NAME, SOURCE_FILE_NAME,
    },
    proposal::build_run_summary_from_record,
    runtime_cli::{run_ahtml_json, run_validation_command},
    session_store::{read_session_record, write_session_record},
    support::{now_epoch_millis, now_iso_stub, read_latest_log},
};

#[tauri::command]
pub(crate) fn run_build(app: AppHandle, session_id: String) -> Result<BuildRunSummary, AppError> {
    run_build_internal(&app, &session_id)
}

#[tauri::command]
pub(crate) fn run_inspect(app: AppHandle, session_id: String) -> Result<InspectSnapshot, AppError> {
    let _span = info_span!("run_inspect", session_id = %session_id).entered();
    let session_dir = session_dir(&app, &session_id)?;
    let mut record = read_session_record(&session_dir)?;
    let ahtml_home = ensure_ahtml_home(&app)?;
    let logs_dir = session_dir.join(LOGS_DIR_NAME);
    let source_path = session_dir.join(SOURCE_FILE_NAME);
    let run_id = format!("inspect-{}", now_epoch_millis());

    fs::create_dir_all(&logs_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to prepare session logs directory.",
            error,
        ))
        .with_session(session_id.clone())
    })?;

    let validation = run_validation_command(
        &ahtml_home,
        &logs_dir,
        &format!("{run_id}-validate"),
        &source_path,
    )?;
    let validation_payload = validation.json.unwrap_or(Value::Null);
    let validation_diagnostics =
        diagnostics_from_validation_payload(&validation_payload, validation.exit_code);

    record.updated_at = now_iso_stub();
    record.current_view = "inspect".into();
    if !validation_diagnostics.is_empty() {
        record.status = "error".into();
    }
    write_session_record(&session_dir, &record)?;

    if !validation_diagnostics.is_empty() {
        return Ok(InspectSnapshot {
            session_id,
            generated_at: now_iso_stub(),
            diagnostics: validation_diagnostics,
            structure_summary: structure_summary_from_validation_payload(&validation_payload),
            last_build: build_run_summary_from_record(&record, &session_dir),
        });
    }

    let execution = run_ahtml_json(
        &ahtml_home,
        &logs_dir,
        &run_id,
        &[
            "inspect".into(),
            "--input".into(),
            source_path.to_string(),
            "--format".into(),
            "json".into(),
        ],
    )?;

    let payload = execution.json.unwrap_or(Value::Null);
    let diagnostics = diagnostics_from_inspect_payload(&payload, execution.exit_code);
    let structure_summary = structure_summary_from_inspection_value(&payload);

    Ok(InspectSnapshot {
        session_id,
        generated_at: now_iso_stub(),
        diagnostics,
        structure_summary,
        last_build: build_run_summary_from_record(&record, &session_dir),
    })
}

#[tauri::command]
pub(crate) fn validate_source(
    app: AppHandle,
    session_id: String,
    source: String,
) -> Result<SourceValidationSnapshot, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    let ahtml_home = ensure_ahtml_home(&app)?;
    let logs_dir = session_dir.join(LOGS_DIR_NAME);
    let run_id = format!("validate-{}", now_epoch_millis());
    let input_path = logs_dir.join(format!("{run_id}.draft.agent.html"));

    fs::create_dir_all(&logs_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to prepare session logs directory.",
            error,
        ))
        .with_session(session_id.clone())
    })?;
    fs::write(&input_path, source).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write validation draft input.",
            error,
        ))
        .with_session(session_id.clone())
    })?;

    let execution = run_ahtml_json(
        &ahtml_home,
        &logs_dir,
        &run_id,
        &[
            "validate".into(),
            "--input".into(),
            input_path.to_string(),
            "--format".into(),
            "json".into(),
        ],
    )?;

    let _ = fs::remove_file(&input_path);
    let payload = execution.json.unwrap_or(Value::Null);
    let diagnostics = diagnostics_from_validation_payload(&payload, execution.exit_code);
    let status = if diagnostics.is_empty() && execution.exit_code == Some(0) {
        "valid"
    } else {
        "invalid"
    };

    Ok(SourceValidationSnapshot {
        session_id,
        validated_at: now_iso_stub(),
        status: status.into(),
        diagnostics,
        structure_summary: structure_summary_from_validation_payload(&payload),
    })
}

#[tauri::command]
pub(crate) fn check_runtime(app: AppHandle) -> Result<Value, AppError> {
    let _span = info_span!("check_runtime").entered();
    let logs_dir = ensure_support_root(&app)?.join(LOGS_DIR_NAME);
    let ahtml_home = ensure_ahtml_home(&app)?;
    fs::create_dir_all(&logs_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to prepare runtime log directory.",
            error,
        ))
    })?;

    let execution = run_ahtml_json(
        &ahtml_home,
        &logs_dir,
        &format!("doctor-{}", now_epoch_millis()),
        &["doctor".into(), "--format".into(), "json".into()],
    )?;

    execution.json.ok_or_else(|| {
        AppError::from(BackendError::message(
            "cli-launch",
            "ahtml doctor did not return valid JSON.",
        ))
        .with_details(format!(
            "stdout log: {}; stderr log: {}",
            execution.stdout_path, execution.stderr_path
        ))
    })
}

#[tauri::command]
pub(crate) fn read_preview_html(app: AppHandle, session_id: String) -> Result<String, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    let Some(preview_path) = preview_path(&session_dir) else {
        return Err(AppError::from(BackendError::message(
            "preview-missing",
            "No built preview is available for this session.",
        ))
        .with_session(session_id));
    };

    fs::read_to_string(preview_path).map_err(|error| {
        AppError::from(BackendError::preview_missing(
            "Unable to read the built preview HTML.",
            error,
        ))
    })
}

#[tauri::command]
pub(crate) fn read_logs(app: AppHandle, session_id: String) -> Result<LogSnapshot, AppError> {
    let session_dir = session_dir(&app, &session_id)?;
    let logs_dir = session_dir.join(LOGS_DIR_NAME);

    Ok(LogSnapshot {
        stdout: read_latest_log(&logs_dir, ".stdout.log"),
        stderr: read_latest_log(&logs_dir, ".stderr.log"),
    })
}

fn run_build_internal(app: &AppHandle, session_id: &str) -> Result<BuildRunSummary, AppError> {
    let _span = info_span!("run_build_internal", session_id = %session_id).entered();
    let session_dir = session_dir(app, session_id)?;
    let mut record = read_session_record(&session_dir)?;
    let ahtml_home = ensure_ahtml_home(app)?;
    let logs_dir = session_dir.join(LOGS_DIR_NAME);
    let build_dir = session_dir.join(BUILD_DIR_NAME);
    let source_path = session_dir.join(SOURCE_FILE_NAME);
    let run_id = format!("build-{}", now_epoch_millis());
    let started_at = now_iso_stub();

    fs::create_dir_all(&logs_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to prepare session logs directory.",
            error,
        ))
        .with_session(session_id.to_string())
    })?;
    fs::create_dir_all(&build_dir).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to prepare build directory.",
            error,
        ))
        .with_session(session_id.to_string())
    })?;

    let execution = run_ahtml_json(
        &ahtml_home,
        &logs_dir,
        &run_id,
        &[
            "build".into(),
            source_path.to_string(),
            "--out".into(),
            build_dir.to_string(),
            "--format".into(),
            "json".into(),
        ],
    )?;

    let preview_path = preview_path(&session_dir)
        .filter(|path| path.exists())
        .map(path_to_string);
    let stdout_path = path_to_string(execution.stdout_path.clone());
    let stderr_path = path_to_string(execution.stderr_path.clone());
    let succeeded = execution
        .json
        .as_ref()
        .and_then(|value| value.get("ok"))
        .and_then(Value::as_bool)
        .unwrap_or(false)
        && execution.exit_code == Some(0)
        && preview_path.is_some();

    record.status = if succeeded { "ready" } else { "error" }.into();
    record.updated_at = now_iso_stub();
    record.last_build_at = Some(now_iso_stub());
    record.last_build_status = Some(if succeeded { "succeeded" } else { "failed" }.into());
    record.last_build_exit_code = execution.exit_code;
    record.last_build_stdout_path = Some(stdout_path.clone());
    record.last_build_stderr_path = Some(stderr_path.clone());
    record.has_preview = preview_path.is_some();
    record.current_view = if succeeded { "preview" } else { "inspect" }.into();
    write_session_record(&session_dir, &record)?;

    Ok(BuildRunSummary {
        run_id,
        session_id: session_id.to_string(),
        started_at,
        finished_at: Some(now_iso_stub()),
        status: if succeeded {
            "succeeded".into()
        } else {
            "failed".into()
        },
        exit_code: execution.exit_code,
        stdout_path: Some(stdout_path),
        stderr_path: Some(stderr_path),
        preview_path,
    })
}
