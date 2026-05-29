use std::collections::HashMap;
use std::io::{BufRead, BufReader};
use std::path::Path;
use std::process::{Child, Command, Stdio};
use std::sync::{Arc, Mutex};
use std::thread;

use serde_json::json;

use super::error::{CodexHostError, CodexHostResult};
use super::rpc::handle_codex_stdout_line;
use super::settings::CodexHostSettings;
use super::state::{set_last_stderr, ManagedCodexProcess, PendingRequest};
use super::trace::append_connection_trace;

pub(crate) fn check_codex_process(process: &mut Child) -> Option<u32> {
    match process.try_wait() {
        Ok(Some(_)) => None,
        Ok(None) => Some(process.id()),
        Err(_) => None,
    }
}

pub(crate) fn stop_codex_process(process: &mut Child) {
    let _ = process.kill();
    let _ = process.wait();
}

pub(crate) fn spawn_codex_process(
    app: &tauri::AppHandle,
    settings: &CodexHostSettings,
    workspace_cwd: &Path,
    pending_requests: Arc<Mutex<HashMap<u64, PendingRequest>>>,
    last_error: Arc<Mutex<Option<String>>>,
    last_stderr: Arc<Mutex<Option<String>>>,
) -> CodexHostResult<ManagedCodexProcess> {
    let mut command = if cfg!(windows) && !settings.codex_command.ends_with(".exe") {
        let quoted_command = if settings.codex_command.contains(' ') {
            format!("\"{}\"", settings.codex_command)
        } else {
            settings.codex_command.clone()
        };
        let windows_command = format!("{quoted_command} app-server --listen stdio://");
        let mut command =
            Command::new(std::env::var("ComSpec").unwrap_or_else(|_| "cmd.exe".to_string()));
        command.args(["/d", "/s", "/c", &windows_command]);
        command
    } else {
        let mut command = Command::new(&settings.codex_command);
        command.args(["app-server", "--listen", "stdio://"]);
        command
    };

    command
        .current_dir(workspace_cwd)
        .envs(std::env::vars())
        .stdin(Stdio::piped())
        .stdout(Stdio::piped())
        .stderr(Stdio::piped());

    let mut child = command.spawn()?;
    let stdin = child
        .stdin
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stdin".to_string()))?;
    let stdout = child
        .stdout
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stdout".to_string()))?;
    let stderr = child
        .stderr
        .take()
        .ok_or_else(|| CodexHostError::Process("unable to open Codex stderr".to_string()))?;

    let app_for_stdout = app.clone();
    let pending_for_stdout = pending_requests.clone();
    let last_error_for_stdout = last_error.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stdout);
        for line in reader.lines() {
            match line {
                Ok(line) if !line.trim().is_empty() => handle_codex_stdout_line(
                    &app_for_stdout,
                    &pending_for_stdout,
                    &last_error_for_stdout,
                    &line,
                ),
                Ok(_) => {}
                Err(error) => {
                    if let Ok(mut current_error) = last_error_for_stdout.lock() {
                        *current_error = Some(error.to_string());
                    }
                    append_connection_trace(
                        "host:stdout-read-error",
                        json!({
                            "error": error.to_string(),
                        }),
                    );
                    break;
                }
            }
        }
    });

    let last_stderr_for_thread = last_stderr.clone();
    thread::spawn(move || {
        let reader = BufReader::new(stderr);
        for line in reader.lines() {
            match line {
                Ok(line) if !line.trim().is_empty() => {
                    append_connection_trace("host:stderr", json!({ "line": line }));
                    set_last_stderr(&last_stderr_for_thread, line);
                }
                Ok(_) => {}
                Err(error) => {
                    set_last_stderr(&last_stderr_for_thread, error.to_string());
                    append_connection_trace(
                        "host:stderr-read-error",
                        json!({
                            "error": error.to_string(),
                        }),
                    );
                    break;
                }
            }
        }
    });

    Ok(ManagedCodexProcess {
        child,
        stdin: Arc::new(Mutex::new(stdin)),
    })
}
