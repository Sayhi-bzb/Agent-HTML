use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};

use serde_json::{json, Value};

use super::error::CodexHostResult;

const CONNECTION_TRACE_PATH: &str = ".tmp\\agent-html-codex-connection-trace.jsonl";
static CONNECTION_TRACE_ENABLED: AtomicBool = AtomicBool::new(false);

pub(crate) fn append_connection_trace(event: &str, payload: Value) {
    if !CONNECTION_TRACE_ENABLED.load(Ordering::Relaxed) {
        return;
    }

    let line = json!({
        "ts": chrono_like_timestamp(),
        "side": "tauri",
        "event": event,
        "payload": payload,
    });
    let _ = append_json_line(CONNECTION_TRACE_PATH, &line);
}

pub(crate) fn append_frontend_connection_trace(
    event: &str,
    payload: Value,
) -> CodexHostResult<()> {
    CONNECTION_TRACE_ENABLED.store(true, Ordering::Relaxed);
    let line = json!({
        "ts": chrono_like_timestamp(),
        "side": "frontend",
        "event": event,
        "payload": payload,
    });
    append_json_line(CONNECTION_TRACE_PATH, &line)
}

fn append_json_line(path: &str, payload: &Value) -> CodexHostResult<()> {
    if path.trim().is_empty() {
        return Ok(());
    }

    let path = PathBuf::from(path);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let mut line = serde_json::to_string(payload)?;
    line.push('\n');
    fs::OpenOptions::new()
        .create(true)
        .append(true)
        .open(path)?
        .write_all(line.as_bytes())?;
    Ok(())
}

fn chrono_like_timestamp() -> String {
    match std::time::SystemTime::now().duration_since(std::time::UNIX_EPOCH) {
        Ok(duration) => format!("{}", duration.as_secs()),
        Err(_) => "0".to_string(),
    }
}
