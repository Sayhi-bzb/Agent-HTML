use std::fs;
use std::io::Write;
use std::path::PathBuf;
use std::sync::atomic::{AtomicBool, Ordering};
use std::sync::OnceLock;

use serde_json::{json, Value};

use super::error::CodexHostResult;
use crate::workspace::WorkspaceStore;

static CONNECTION_TRACE_ENABLED: AtomicBool = AtomicBool::new(false);
static CONNECTION_TRACE_PATH: OnceLock<PathBuf> = OnceLock::new();

pub(crate) fn bind_connection_trace_path(store: &WorkspaceStore) -> CodexHostResult<()> {
    let path = store
        .root()
        .join(".agent-world")
        .join("logs")
        .join("agent-html-codex-connection-trace.jsonl");
    let _ = CONNECTION_TRACE_PATH.set(path);
    Ok(())
}

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
    let _ = append_json_line(&line);
}

pub(crate) fn append_frontend_connection_trace(
    store: &WorkspaceStore,
    event: &str,
    payload: Value,
) -> CodexHostResult<()> {
    bind_connection_trace_path(store)?;
    CONNECTION_TRACE_ENABLED.store(true, Ordering::Relaxed);
    let line = json!({
        "ts": chrono_like_timestamp(),
        "side": "frontend",
        "event": event,
        "payload": payload,
    });
    append_json_line(&line)
}

fn append_json_line(payload: &Value) -> CodexHostResult<()> {
    let Some(path) = CONNECTION_TRACE_PATH.get() else {
        return Ok(());
    };

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
