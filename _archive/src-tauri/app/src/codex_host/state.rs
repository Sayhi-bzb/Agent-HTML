use std::collections::HashMap;
use std::process::{Child, ChildStdin};
use std::sync::{mpsc, Arc, Mutex};

use serde_json::Value;

use super::error::CodexHostError;
use super::process::stop_codex_process;

pub(crate) type PendingRequest = mpsc::Sender<Result<Value, CodexHostError>>;

pub(crate) struct ManagedCodexProcess {
    pub(crate) child: Child,
    pub(crate) stdin: Arc<Mutex<ChildStdin>>,
}

pub(crate) struct CodexHostState {
    pub(crate) initialized: Mutex<bool>,
    pub(crate) next_request_id: Mutex<u64>,
    pub(crate) pending_requests: Arc<Mutex<HashMap<u64, PendingRequest>>>,
    pub(crate) process: Mutex<Option<ManagedCodexProcess>>,
    pub(crate) last_error: Arc<Mutex<Option<String>>>,
    pub(crate) last_stderr: Arc<Mutex<Option<String>>>,
}

impl CodexHostState {
    pub(crate) fn new() -> Self {
        Self {
            initialized: Mutex::new(false),
            next_request_id: Mutex::new(1),
            pending_requests: Arc::new(Mutex::new(HashMap::new())),
            process: Mutex::new(None),
            last_error: Arc::new(Mutex::new(None)),
            last_stderr: Arc::new(Mutex::new(None)),
        }
    }
}

impl Drop for CodexHostState {
    fn drop(&mut self) {
        if let Ok(mut current_process) = self.process.lock() {
            if let Some(mut process) = current_process.take() {
                stop_codex_process(&mut process.child);
            }
        }
    }
}

pub(crate) fn set_last_error(state: &CodexHostState, error: Option<String>) {
    if let Ok(mut last_error) = state.last_error.lock() {
        *last_error = error;
    }
}

pub(crate) fn set_last_stderr(last_stderr: &Arc<Mutex<Option<String>>>, stderr: String) {
    if let Ok(mut current_stderr) = last_stderr.lock() {
        *current_stderr = Some(stderr);
    }
}

pub(crate) fn get_last_error(state: &CodexHostState) -> Option<String> {
    state
        .last_error
        .lock()
        .ok()
        .and_then(|last_error| last_error.clone())
}

pub(crate) fn get_last_stderr(state: &CodexHostState) -> Option<String> {
    state
        .last_stderr
        .lock()
        .ok()
        .and_then(|last_stderr| last_stderr.clone())
}
