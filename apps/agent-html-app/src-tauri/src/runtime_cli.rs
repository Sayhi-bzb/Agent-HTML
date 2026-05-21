use camino::Utf8Path;
use fs_err as fs;
use std::env;
use std::process::Command;
use tracing::{info, info_span};

use crate::{
    error::BackendError,
    models::{AppError, CliExecution},
};

pub(crate) fn run_ahtml_json(
    ahtml_home: &Utf8Path,
    logs_dir: &Utf8Path,
    run_id: &str,
    args: &[String],
) -> Result<CliExecution, AppError> {
    let _span = info_span!("run_ahtml_json", run_id = %run_id, args = ?args).entered();
    let mut command = configured_ahtml_command(ahtml_home);
    command.args(args);

    let output = command.output().map_err(|error| {
        AppError::from(BackendError::cli_launch(
            "Unable to start the ahtml CLI.",
            error,
        ))
    })?;

    let stdout_raw = String::from_utf8_lossy(&output.stdout).to_string();
    let stderr_raw = String::from_utf8_lossy(&output.stderr).to_string();
    let stdout_path = logs_dir.join(format!("{run_id}.stdout.log"));
    let stderr_path = logs_dir.join(format!("{run_id}.stderr.log"));

    fs::write(&stdout_path, &stdout_raw).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write stdout log.",
            error,
        ))
    })?;
    fs::write(&stderr_path, &stderr_raw).map_err(|error| {
        AppError::from(BackendError::session_io(
            "Unable to write stderr log.",
            error,
        ))
    })?;

    info!(
        run_id = %run_id,
        exit_code = ?output.status.code(),
        stdout_path = %stdout_path,
        stderr_path = %stderr_path,
        "ahtml CLI completed"
    );
    Ok(CliExecution {
        stdout_path,
        stderr_path,
        json: serde_json::from_str(&stdout_raw).ok(),
        exit_code: output.status.code(),
    })
}

pub(crate) fn run_validation_command(
    ahtml_home: &Utf8Path,
    logs_dir: &Utf8Path,
    run_id: &str,
    input_path: &Utf8Path,
) -> Result<CliExecution, AppError> {
    run_ahtml_json(
        ahtml_home,
        logs_dir,
        run_id,
        &[
            "validate".into(),
            "--input".into(),
            input_path.to_string(),
            "--format".into(),
            "json".into(),
        ],
    )
}

fn configured_ahtml_command(ahtml_home: &Utf8Path) -> Command {
    let executable = env::var("AHTML_CLI").unwrap_or_else(|_| "ahtml".into());
    let mut command = Command::new(executable);

    if let Ok(script_path) = env::var("AHTML_CLI_SCRIPT") {
        if !script_path.trim().is_empty() {
            command.arg(script_path);
        }
    }

    command.env("AHTML_HOME", ahtml_home);
    command
}
