use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};
use tauri::{AppHandle, Emitter, Manager};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

pub const RUNTIME_PROTOCOL_VERSION: u32 = 1;

pub struct ActiveRuntime {
    pub child: CommandChild,
    pub exited: Arc<AtomicBool>,
    pub token: String,
    pub url: String,
}

#[derive(Default)]
pub struct RuntimeState(pub Mutex<Option<ActiveRuntime>>);

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OpenWorkspaceRequest {
    pub path: String,
    pub initialize: bool,
    pub pipeline: String,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RuntimeReady {
    pub root: String,
    #[serde(rename = "url")]
    pub runtime_url: String,
    pub bootstrap_url: String,
    pub protocol_version: u32,
}

fn runtime_log_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_log_dir()
        .map(|path| path.join("canvas-runtime.log"))
        .map_err(|error| error.to_string())
}

fn cli_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .resource_dir()
        .map(|path| path.join("runtime/node_modules/agent-html/bin/agent-html.mjs"))
        .map_err(|error| error.to_string())
}

fn append_log(path: &Path, bytes: &[u8]) {
    if let Some(parent) = path.parent() {
        let _ = fs::create_dir_all(parent);
    }
    if let Ok(mut file) = OpenOptions::new().create(true).append(true).open(path) {
        let _ = file.write_all(bytes);
        let _ = file.write_all(b"\n");
    }
}

pub async fn initialize_workspace(app: &AppHandle, root: &Path) -> Result<(), String> {
    let cli = cli_path(app)?;
    let (mut events, _child) = app
        .shell()
        .sidecar("agent-html-runtime")
        .map_err(|error| error.to_string())?
        .args([
            cli.to_string_lossy().as_ref(),
            "init",
            "--root",
            root.to_string_lossy().as_ref(),
        ])
        .spawn()
        .map_err(|error| format!("Unable to start workspace initializer: {error}"))?;

    while let Some(event) = events.recv().await {
        if let CommandEvent::Terminated(payload) = event {
            return match payload.code {
                Some(0) => Ok(()),
                code => Err(format!("Workspace initializer exited with {code:?}")),
            };
        }
    }
    Err("Workspace initializer stopped without a result".into())
}

pub async fn start_runtime(
    app: &AppHandle,
    state: &RuntimeState,
    root: &Path,
    pipeline: &str,
) -> Result<RuntimeReady, String> {
    stop_runtime(state).await;

    if pipeline != "codex" && pipeline != "example" {
        return Err("Unsupported agent pipeline".into());
    }

    let token: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(48)
        .map(char::from)
        .collect();
    let cli = cli_path(app)?;
    let log_path = runtime_log_path(app)?;
    let (mut events, child) = app
        .shell()
        .sidecar("agent-html-runtime")
        .map_err(|error| error.to_string())?
        .args([
            cli.to_string_lossy().as_ref(),
            "runtime",
            "--root",
            root.to_string_lossy().as_ref(),
            "--pipeline",
            pipeline,
        ])
        .env("AGENT_HTML_RUNTIME_TOKEN", &token)
        .spawn()
        .map_err(|error| format!("Unable to start Canvas runtime: {error}"))?;

    let ready_result = tokio::time::timeout(Duration::from_secs(45), async {
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    append_log(&log_path, &line);
                    if let Ok(value) = serde_json::from_slice::<serde_json::Value>(&line) {
                        if value.get("type").and_then(|value| value.as_str())
                            == Some("runtime-ready")
                        {
                            return serde_json::from_value::<RuntimeReady>(value)
                                .map_err(|error| error.to_string());
                        }
                    }
                }
                CommandEvent::Stderr(line) => append_log(&log_path, &line),
                CommandEvent::Terminated(payload) => {
                    return Err(format!("Canvas runtime exited early: {:?}", payload.code));
                }
                _ => {}
            }
        }
        Err("Canvas runtime output closed before readiness".into())
    })
    .await;
    let ready = match ready_result {
        Ok(Ok(ready)) => ready,
        Ok(Err(error)) => {
            let _ = child.kill();
            return Err(error);
        }
        Err(_) => {
            let _ = child.kill();
            return Err("Canvas runtime did not become ready in 45 seconds".into());
        }
    };

    if ready.protocol_version != RUNTIME_PROTOCOL_VERSION {
        let _ = child.kill();
        return Err(format!(
            "Runtime protocol {} is incompatible with Desktop protocol {}",
            ready.protocol_version, RUNTIME_PROTOCOL_VERSION
        ));
    }

    let exited = Arc::new(AtomicBool::new(false));
    *state.0.lock().map_err(|_| "Runtime state is unavailable")? = Some(ActiveRuntime {
        child,
        exited: exited.clone(),
        token: token.clone(),
        url: ready.runtime_url.clone(),
    });

    let app_handle = app.clone();
    let runtime_token = token;
    tauri::async_runtime::spawn(async move {
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) | CommandEvent::Stderr(line) => {
                    append_log(&log_path, &line)
                }
                CommandEvent::Terminated(payload) => {
                    exited.store(true, Ordering::Release);
                    let state = app_handle.state::<RuntimeState>();
                    let owns_active_runtime = state
                        .0
                        .lock()
                        .map(|mut active| {
                            let matches = active
                                .as_ref()
                                .is_some_and(|runtime| runtime.token == runtime_token);
                            if matches {
                                active.take();
                            }
                            matches
                        })
                        .unwrap_or(false);
                    if owns_active_runtime {
                        let _ = app_handle.emit(
                            "desktop://runtime-crashed",
                            format!("Canvas runtime exited: {:?}", payload.code),
                        );
                    }
                    break;
                }
                _ => {}
            }
        }
    });

    Ok(ready)
}

pub async fn stop_runtime(state: &RuntimeState) {
    let runtime = state.0.lock().ok().and_then(|mut active| active.take());
    if let Some(runtime) = runtime {
        let endpoint = format!("{}/__agent-html/runtime/shutdown", runtime.url);
        let _ = reqwest::Client::new()
            .post(endpoint)
            .bearer_auth(&runtime.token)
            .timeout(Duration::from_secs(3))
            .send()
            .await;
        for _ in 0..30 {
            if runtime.exited.load(Ordering::Acquire) {
                return;
            }
            tokio::time::sleep(Duration::from_millis(100)).await;
        }
        if !runtime.exited.load(Ordering::Acquire) {
            let _ = runtime.child.kill();
        }
    }
}

pub fn log_path(app: &AppHandle) -> String {
    runtime_log_path(app)
        .map(|path| path.to_string_lossy().to_string())
        .unwrap_or_default()
}
