use crate::{desktop_error::DesktopError, workspace};
use rand::{distributions::Alphanumeric, Rng};
use serde::{Deserialize, Serialize};
use std::{
    fs::{self, OpenOptions},
    io::Write,
    path::{Component, Path, PathBuf},
    sync::{
        atomic::{AtomicBool, Ordering},
        Arc, Mutex,
    },
    time::Duration,
};
use tauri::{async_runtime::Receiver, AppHandle, Emitter, Manager};
use tauri_plugin_shell::{
    process::{CommandChild, CommandEvent},
    ShellExt,
};

pub const RUNTIME_PROTOCOL_VERSION: u32 = 1;
const RUNTIME_MANIFEST_VERSION: u32 = 2;
const DIAGNOSTIC_TAIL_BYTES: usize = 16 * 1024;
#[cfg(unix)]
const UNIX_RUNTIME_SUPERVISOR_ARG: &str = "--ahtml-runtime-supervisor";

pub struct ActiveRuntime {
    pub child: CommandChild,
    pub exited: Arc<AtomicBool>,
    pub _process_tree: ProcessTree,
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

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeManifest {
    schema_version: u32,
    runtime_protocol_version: u32,
    cli_entry: String,
    workspace_template: String,
    fingerprint: String,
    node_entry: String,
}

#[derive(Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
struct RuntimeSelection {
    schema_version: u32,
    fingerprint: String,
    #[serde(default)]
    previous_fingerprint: Option<String>,
}

struct RuntimeBundle {
    cli_entry: PathBuf,
    fingerprint: String,
    manifest_path: PathBuf,
    node_entry: PathBuf,
}

impl RuntimeBundle {
    fn resolve(app: &AppHandle, phase: &'static str) -> Result<Self, DesktopError> {
        if let Some(bundle) = Self::resolve_selected(app, phase)? {
            return Ok(bundle);
        }

        let resource_root = app.path().resource_dir().map_err(|error| {
            DesktopError::new(
                "runtime-bundle-invalid",
                phase,
                format!("Unable to locate Desktop resources: {error}"),
                false,
            )
        })?;
        Self::resolve_root(&resource_root.join("runtime"), None, phase)
    }

    fn resolve_selected(
        app: &AppHandle,
        phase: &'static str,
    ) -> Result<Option<Self>, DesktopError> {
        let runtime_home = std::env::var_os("AHTML_RUNTIME_HOME")
            .map(PathBuf::from)
            .map(Ok)
            .unwrap_or_else(|| {
                app.path()
                    .app_local_data_dir()
                    .map(|path| path.join("runtime"))
            })
            .map_err(|error| {
                DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    format!("Unable to locate the Desktop runtime store: {error}"),
                    false,
                )
            })?;
        Self::resolve_selection(&runtime_home, phase)
    }

    fn resolve_selection(
        runtime_home: &Path,
        phase: &'static str,
    ) -> Result<Option<Self>, DesktopError> {
        let selection_path = runtime_home.join("current.json");
        let selection_source = match fs::read_to_string(&selection_path) {
            Ok(source) => source,
            Err(error) if error.kind() == std::io::ErrorKind::NotFound => return Ok(None),
            Err(error) => {
                return Err(DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    format!("Unable to read the selected runtime: {error}"),
                    true,
                ))
            }
        };
        let selection: RuntimeSelection =
            serde_json::from_str(&selection_source).map_err(|error| {
                DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    format!("Selected runtime metadata is invalid: {error}"),
                    true,
                )
            })?;
        if selection.schema_version != 1 || !is_runtime_fingerprint(&selection.fingerprint) {
            return Err(DesktopError::new(
                "runtime-bundle-invalid",
                phase,
                "Selected runtime metadata is incompatible",
                true,
            ));
        }
        let runtime_root = runtime_home.join("runtimes").join(&selection.fingerprint);
        match Self::resolve_root(&runtime_root, Some(&selection.fingerprint), phase) {
            Ok(bundle) => Ok(Some(bundle)),
            Err(current_error) => {
                let Some(previous_fingerprint) = selection
                    .previous_fingerprint
                    .filter(|fingerprint| is_runtime_fingerprint(fingerprint))
                else {
                    return Err(current_error);
                };
                let previous_root = runtime_home.join("runtimes").join(&previous_fingerprint);
                Self::resolve_root(&previous_root, Some(&previous_fingerprint), phase)
                    .map(Some)
                    .map_err(|_| current_error)
            }
        }
    }

    fn resolve_root(
        runtime_root: &Path,
        selected_fingerprint: Option<&str>,
        phase: &'static str,
    ) -> Result<Self, DesktopError> {
        let manifest_path = runtime_root.join("runtime-manifest.json");
        let manifest: RuntimeManifest =
            serde_json::from_str(&fs::read_to_string(&manifest_path).map_err(|error| {
                DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    format!("Unable to read runtime manifest: {error}"),
                    false,
                )
            })?)
            .map_err(|error| {
                DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    format!("Runtime manifest is invalid: {error}"),
                    false,
                )
            })?;

        if manifest.schema_version != RUNTIME_MANIFEST_VERSION {
            return Err(DesktopError::new(
                "runtime-bundle-invalid",
                phase,
                format!(
                    "Runtime manifest version {} is not supported",
                    manifest.schema_version
                ),
                false,
            ));
        }
        if manifest.runtime_protocol_version != RUNTIME_PROTOCOL_VERSION {
            return Err(DesktopError::new(
                "incompatible-runtime",
                phase,
                format!(
                    "Runtime protocol {} is incompatible with Desktop protocol {}",
                    manifest.runtime_protocol_version, RUNTIME_PROTOCOL_VERSION
                ),
                false,
            ));
        }
        if let Some(expected) = selected_fingerprint {
            if manifest.fingerprint != expected {
                return Err(DesktopError::new(
                    "runtime-bundle-invalid",
                    phase,
                    "Selected runtime fingerprint does not match its manifest",
                    true,
                ));
            }
        }

        let cli_entry = resolve_bundle_member(&runtime_root, &manifest.cli_entry, phase)?;
        resolve_bundle_member(&runtime_root, &manifest.workspace_template, phase)?;
        let node_entry = resolve_bundle_member(runtime_root, &manifest.node_entry, phase)?;
        Ok(Self {
            cli_entry,
            fingerprint: manifest.fingerprint,
            manifest_path,
            node_entry,
        })
    }
}

fn is_runtime_fingerprint(value: &str) -> bool {
    value.len() == 64 && value.bytes().all(|byte| byte.is_ascii_hexdigit())
}

#[cfg(windows)]
pub struct ProcessTree {
    job: windows_sys::Win32::Foundation::HANDLE,
}

#[cfg(windows)]
unsafe impl Send for ProcessTree {}

#[cfg(windows)]
impl ProcessTree {
    fn attach(pid: u32, phase: &'static str) -> Result<Self, DesktopError> {
        use std::{ffi::c_void, mem::size_of, ptr};
        use windows_sys::Win32::{
            Foundation::{CloseHandle, INVALID_HANDLE_VALUE},
            System::{
                JobObjects::{
                    AssignProcessToJobObject, CreateJobObjectW, JobObjectExtendedLimitInformation,
                    SetInformationJobObject, JOBOBJECT_EXTENDED_LIMIT_INFORMATION,
                    JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE,
                },
                Threading::{OpenProcess, PROCESS_SET_QUOTA, PROCESS_TERMINATE},
            },
        };

        unsafe {
            let job = CreateJobObjectW(ptr::null(), ptr::null());
            if job.is_null() || job == INVALID_HANDLE_VALUE {
                return Err(DesktopError::new(
                    "runtime-start-failed",
                    phase,
                    "Unable to create the runtime process job",
                    true,
                ));
            }
            let mut limits: JOBOBJECT_EXTENDED_LIMIT_INFORMATION = std::mem::zeroed();
            limits.BasicLimitInformation.LimitFlags = JOB_OBJECT_LIMIT_KILL_ON_JOB_CLOSE;
            if SetInformationJobObject(
                job,
                JobObjectExtendedLimitInformation,
                &limits as *const _ as *const c_void,
                size_of::<JOBOBJECT_EXTENDED_LIMIT_INFORMATION>() as u32,
            ) == 0
            {
                CloseHandle(job);
                return Err(DesktopError::new(
                    "runtime-start-failed",
                    phase,
                    "Unable to configure the runtime process job",
                    true,
                ));
            }
            let process = OpenProcess(PROCESS_SET_QUOTA | PROCESS_TERMINATE, 0, pid);
            if process.is_null()
                || process == INVALID_HANDLE_VALUE
                || AssignProcessToJobObject(job, process) == 0
            {
                if !process.is_null() && process != INVALID_HANDLE_VALUE {
                    CloseHandle(process);
                }
                CloseHandle(job);
                return Err(DesktopError::new(
                    "runtime-start-failed",
                    phase,
                    "Unable to attach the runtime to its process job",
                    true,
                ));
            }
            CloseHandle(process);
            Ok(Self { job })
        }
    }
}

#[cfg(windows)]
impl Drop for ProcessTree {
    fn drop(&mut self) {
        unsafe {
            windows_sys::Win32::Foundation::CloseHandle(self.job);
        }
    }
}

#[cfg(not(windows))]
pub struct ProcessTree {
    process_group: u32,
}

#[cfg(not(windows))]
impl ProcessTree {
    fn attach(pid: u32, _phase: &'static str) -> Result<Self, DesktopError> {
        Ok(Self { process_group: pid })
    }
}

#[cfg(unix)]
impl Drop for ProcessTree {
    fn drop(&mut self) {
        unsafe {
            libc::kill(-(self.process_group as i32), libc::SIGKILL);
        }
    }
}

#[cfg(unix)]
pub fn run_runtime_supervisor_if_requested() -> Option<i32> {
    use std::{
        io::Read,
        process::{Command, Stdio},
    };

    let mut args = std::env::args_os().skip(1);
    if args.next().as_deref() != Some(std::ffi::OsStr::new(UNIX_RUNTIME_SUPERVISOR_ARG)) {
        return None;
    }
    let Some(program) = args.next() else {
        return Some(2);
    };
    if unsafe { libc::setsid() } == -1 {
        return Some(1);
    }
    let mut child = match Command::new(program)
        .args(args)
        .stdin(Stdio::null())
        .stdout(Stdio::inherit())
        .stderr(Stdio::inherit())
        .spawn()
    {
        Ok(child) => child,
        Err(_) => return Some(1),
    };
    std::thread::spawn(|| {
        let mut input = std::io::stdin();
        let mut buffer = [0_u8; 1];
        while input.read(&mut buffer).is_ok_and(|read| read > 0) {}
        unsafe {
            libc::kill(0, libc::SIGKILL);
        }
    });
    let exit_code = child
        .wait()
        .ok()
        .and_then(|status| status.code())
        .unwrap_or(1);
    unsafe {
        libc::signal(libc::SIGTERM, libc::SIG_IGN);
        libc::kill(0, libc::SIGTERM);
    }
    Some(exit_code)
}

fn resolve_bundle_member(
    root: &Path,
    relative: &str,
    phase: &'static str,
) -> Result<PathBuf, DesktopError> {
    let relative_path = Path::new(relative);
    if relative_path.is_absolute()
        || relative_path.components().any(|component| {
            matches!(
                component,
                Component::ParentDir | Component::RootDir | Component::Prefix(_)
            )
        })
    {
        return Err(DesktopError::new(
            "runtime-bundle-invalid",
            phase,
            "Runtime manifest contains an unsafe resource path",
            false,
        ));
    }

    let canonical_root = fs::canonicalize(root).map_err(|error| {
        DesktopError::new(
            "runtime-bundle-invalid",
            phase,
            format!("Runtime resource directory is inaccessible: {error}"),
            false,
        )
    })?;
    let member = fs::canonicalize(root.join(relative_path)).map_err(|error| {
        DesktopError::new(
            "runtime-bundle-invalid",
            phase,
            format!("Runtime resource {relative} is unavailable: {error}"),
            false,
        )
    })?;
    if !member.starts_with(&canonical_root) {
        return Err(DesktopError::new(
            "runtime-bundle-invalid",
            phase,
            "Runtime manifest resource escapes the bundle",
            false,
        ));
    }
    Ok(member)
}

fn child_path_argument(path: &Path, phase: &'static str) -> Result<String, DesktopError> {
    let value = path.to_str().ok_or_else(|| {
        DesktopError::new(
            "invalid-selection",
            phase,
            "The selected path is not valid Unicode",
            false,
        )
    })?;
    Ok(workspace::simplify_windows_verbatim_path(value))
}

fn runtime_log_path(app: &AppHandle, phase: &'static str) -> Result<PathBuf, DesktopError> {
    app.path()
        .app_log_dir()
        .map(|path| path.join("canvas-runtime.log"))
        .map_err(|error| {
            DesktopError::new(
                "internal",
                phase,
                format!("Unable to locate the runtime log: {error}"),
                true,
            )
        })
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

#[derive(Default)]
struct DiagnosticTail(Vec<u8>);

impl DiagnosticTail {
    fn push(&mut self, bytes: &[u8]) {
        self.0.extend_from_slice(bytes);
        if self.0.len() > DIAGNOSTIC_TAIL_BYTES {
            self.0.drain(..self.0.len() - DIAGNOSTIC_TAIL_BYTES);
        }
    }

    fn summary(&self, fallback: &str) -> String {
        let text = String::from_utf8_lossy(&self.0);
        let line = text.lines().rev().find(|line| !line.trim().is_empty());
        let summary = line.unwrap_or(fallback).trim();
        summary.chars().take(1024).collect()
    }
}

struct SidecarSupervisor {
    bundle: RuntimeBundle,
    log_path: PathBuf,
}

impl SidecarSupervisor {
    fn resolve(app: &AppHandle, phase: &'static str) -> Result<Self, DesktopError> {
        Ok(Self {
            bundle: RuntimeBundle::resolve(app, phase)?,
            log_path: runtime_log_path(app, phase)?,
        })
    }

    fn spawn(
        &self,
        app: &AppHandle,
        phase: &'static str,
        command_args: Vec<String>,
        token: Option<&str>,
    ) -> Result<(Receiver<CommandEvent>, CommandChild, ProcessTree), DesktopError> {
        let error_code = if phase == "workspace-initialization" {
            "initialization-failed"
        } else {
            "runtime-start-failed"
        };
        let mut args = Vec::with_capacity(command_args.len() + 1);
        args.push(child_path_argument(&self.bundle.cli_entry, phase)?);
        args.extend(command_args);

        let shell = app.shell();
        #[cfg(windows)]
        let mut command = shell.command(&self.bundle.node_entry).args(args);
        #[cfg(unix)]
        let mut command = {
            let executable = std::env::current_exe().map_err(|error| {
                DesktopError::new(
                    error_code,
                    phase,
                    format!("Unable to locate the runtime supervisor: {error}"),
                    true,
                )
                .with_log(&self.log_path)
            })?;
            let mut supervisor_args = vec![
                UNIX_RUNTIME_SUPERVISOR_ARG.to_string(),
                child_path_argument(&self.bundle.node_entry, phase)?,
            ];
            supervisor_args.extend(args);
            shell.command(executable).args(supervisor_args)
        };
        command = command.env("AGENT_HTML_RUNTIME_FINGERPRINT", &self.bundle.fingerprint);
        command = command.env("AGENT_HTML_RUNTIME_MANIFEST", &self.bundle.manifest_path);
        if let Some(token) = token {
            command = command.env("AGENT_HTML_RUNTIME_TOKEN", token);
        }
        let (events, child) = command.spawn().map_err(|error| {
            DesktopError::new(
                error_code,
                phase,
                format!("Unable to start the bundled runtime: {error}"),
                true,
            )
            .with_log(&self.log_path)
        })?;
        let process_tree = match ProcessTree::attach(child.pid(), phase) {
            Ok(process_tree) => process_tree,
            Err(error) => {
                let _ = child.kill();
                return Err(error.with_log(&self.log_path));
            }
        };
        Ok((events, child, process_tree))
    }
}

pub async fn initialize_workspace(app: &AppHandle, root: &Path) -> Result<(), DesktopError> {
    let supervisor = SidecarSupervisor::resolve(app, "workspace-initialization")?;
    let root_arg = child_path_argument(root, "workspace-initialization")?;
    let (mut events, child, _process_tree) = supervisor.spawn(
        app,
        "workspace-initialization",
        vec!["init".into(), "--root".into(), root_arg],
        None,
    )?;
    let mut stderr = DiagnosticTail::default();

    while let Some(event) = events.recv().await {
        match event {
            CommandEvent::Stdout(line) => append_log(&supervisor.log_path, &line),
            CommandEvent::Stderr(line) => {
                append_log(&supervisor.log_path, &line);
                stderr.push(&line);
            }
            CommandEvent::Error(error) => {
                let _ = child.kill();
                return Err(DesktopError::new(
                    "initialization-failed",
                    "workspace-initialization",
                    error,
                    true,
                )
                .with_log(&supervisor.log_path));
            }
            CommandEvent::Terminated(payload) => {
                return match payload.code {
                    Some(0) => Ok(()),
                    code => Err(DesktopError::new(
                        "initialization-failed",
                        "workspace-initialization",
                        stderr.summary("Workspace initialization failed"),
                        true,
                    )
                    .with_log(&supervisor.log_path)
                    .with_exit_code(code)),
                };
            }
            _ => {}
        }
    }
    let _ = child.kill();
    Err(DesktopError::new(
        "initialization-failed",
        "workspace-initialization",
        "Workspace initializer stopped without a result",
        true,
    )
    .with_log(&supervisor.log_path))
}

pub async fn start_runtime(
    app: &AppHandle,
    state: &RuntimeState,
    root: &Path,
    pipeline: &str,
) -> Result<RuntimeReady, DesktopError> {
    stop_runtime(state).await;

    if pipeline != "codex" && pipeline != "example" {
        return Err(DesktopError::new(
            "runtime-start-failed",
            "runtime-start",
            "Unsupported agent pipeline",
            true,
        ));
    }

    let token: String = rand::thread_rng()
        .sample_iter(&Alphanumeric)
        .take(48)
        .map(char::from)
        .collect();
    let supervisor = SidecarSupervisor::resolve(app, "runtime-start")?;
    let root_arg = child_path_argument(root, "runtime-start")?;
    let (mut events, child, process_tree) = supervisor.spawn(
        app,
        "runtime-start",
        vec![
            "runtime".into(),
            "--root".into(),
            root_arg,
            "--pipeline".into(),
            pipeline.into(),
        ],
        Some(&token),
    )?;
    let mut stderr = DiagnosticTail::default();

    let ready_result = tokio::time::timeout(Duration::from_secs(45), async {
        while let Some(event) = events.recv().await {
            match event {
                CommandEvent::Stdout(line) => {
                    append_log(&supervisor.log_path, &line);
                    if let Ok(value) = serde_json::from_slice::<serde_json::Value>(&line) {
                        if value.get("type").and_then(|value| value.as_str())
                            == Some("runtime-ready")
                        {
                            return serde_json::from_value::<RuntimeReady>(value).map_err(
                                |error| {
                                    DesktopError::new(
                                        "runtime-start-failed",
                                        "runtime-readiness",
                                        format!("Runtime readiness event is invalid: {error}"),
                                        true,
                                    )
                                    .with_log(&supervisor.log_path)
                                },
                            );
                        }
                    }
                }
                CommandEvent::Stderr(line) => {
                    append_log(&supervisor.log_path, &line);
                    stderr.push(&line);
                }
                CommandEvent::Error(error) => {
                    return Err(DesktopError::new(
                        "runtime-exited",
                        "runtime-readiness",
                        error,
                        true,
                    )
                    .with_log(&supervisor.log_path));
                }
                CommandEvent::Terminated(payload) => {
                    return Err(DesktopError::new(
                        "runtime-exited",
                        "runtime-readiness",
                        stderr.summary("Canvas runtime exited before readiness"),
                        true,
                    )
                    .with_log(&supervisor.log_path)
                    .with_exit_code(payload.code));
                }
                _ => {}
            }
        }
        Err(DesktopError::new(
            "runtime-exited",
            "runtime-readiness",
            "Canvas runtime output closed before readiness",
            true,
        )
        .with_log(&supervisor.log_path))
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
            return Err(DesktopError::new(
                "runtime-timeout",
                "runtime-readiness",
                "Canvas runtime did not become ready in 45 seconds",
                true,
            )
            .with_log(&supervisor.log_path));
        }
    };

    if ready.protocol_version != RUNTIME_PROTOCOL_VERSION {
        let _ = child.kill();
        return Err(DesktopError::new(
            "incompatible-runtime",
            "runtime-readiness",
            format!(
                "Runtime protocol {} is incompatible with Desktop protocol {}",
                ready.protocol_version, RUNTIME_PROTOCOL_VERSION
            ),
            false,
        )
        .with_log(&supervisor.log_path));
    }

    let exited = Arc::new(AtomicBool::new(false));
    *state.0.lock().map_err(|_| {
        DesktopError::new(
            "internal",
            "runtime-start",
            "Runtime state is unavailable",
            true,
        )
    })? = Some(ActiveRuntime {
        child,
        exited: exited.clone(),
        _process_tree: process_tree,
        token: token.clone(),
        url: ready.runtime_url.clone(),
    });

    let app_handle = app.clone();
    let runtime_token = token;
    let log_path = supervisor.log_path;
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
                        let error = DesktopError::new(
                            "runtime-exited",
                            "runtime-start",
                            "Canvas runtime exited unexpectedly",
                            true,
                        )
                        .with_log(&log_path)
                        .with_exit_code(payload.code);
                        let _ = app_handle.emit("desktop://runtime-crashed", error);
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

#[cfg(test)]
mod tests {
    use super::*;
    use std::time::{SystemTime, UNIX_EPOCH};

    fn temporary_runtime_root() -> PathBuf {
        std::env::temp_dir().join(format!(
            "ahtml-runtime-rust-test-{}-{}",
            std::process::id(),
            SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap()
                .as_nanos()
        ))
    }

    #[test]
    fn diagnostic_tail_is_bounded_and_returns_the_last_line() {
        let mut tail = DiagnosticTail::default();
        tail.push(&vec![b'x'; DIAGNOSTIC_TAIL_BYTES + 32]);
        tail.push(b"\nuseful failure\n");
        assert!(tail.0.len() <= DIAGNOSTIC_TAIL_BYTES);
        assert_eq!(tail.summary("fallback"), "useful failure");
    }

    #[test]
    fn validates_content_addressed_runtime_fingerprints() {
        assert!(is_runtime_fingerprint(&"a".repeat(64)));
        assert!(!is_runtime_fingerprint(&"a".repeat(63)));
        assert!(!is_runtime_fingerprint(&format!("{}z", "a".repeat(63))));
        assert!(!is_runtime_fingerprint(&"/".repeat(64)));
    }

    #[test]
    fn resolves_a_complete_immutable_runtime_manifest() {
        let root = temporary_runtime_root();
        let fingerprint = "a".repeat(64);
        let node_entry = if cfg!(windows) {
            "bin/node.exe"
        } else {
            "bin/node"
        };
        for entry in [
            node_entry,
            "node_modules/agent-html/bin/agent-html.mjs",
            "node_modules/agent-html/template/agent-html/AGENTS.md",
        ] {
            let entry_path = root.join(entry);
            fs::create_dir_all(entry_path.parent().unwrap()).unwrap();
            fs::write(entry_path, b"").unwrap();
        }
        fs::write(
            root.join("runtime-manifest.json"),
            serde_json::json!({
                "schemaVersion": 2,
                "runtimeProtocolVersion": 1,
                "fingerprint": fingerprint,
                "nodeEntry": node_entry,
                "cliEntry": "node_modules/agent-html/bin/agent-html.mjs",
                "workspaceTemplate": "node_modules/agent-html/template/agent-html"
            })
            .to_string(),
        )
        .unwrap();

        let bundle = RuntimeBundle::resolve_root(&root, Some(&fingerprint), "test").unwrap();
        assert_eq!(bundle.fingerprint, fingerprint);
        assert!(bundle.node_entry.is_file());
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn rejects_runtime_manifest_schema_one() {
        let root = temporary_runtime_root();
        fs::create_dir_all(&root).unwrap();
        fs::write(
            root.join("runtime-manifest.json"),
            serde_json::json!({
                "schemaVersion": 1,
                "runtimeProtocolVersion": 1,
                "cliEntry": "node_modules/agent-html/bin/agent-html.mjs",
                "workspaceTemplate": "node_modules/agent-html/template/agent-html"
            })
            .to_string(),
        )
        .unwrap();

        let error = RuntimeBundle::resolve_root(&root, None, "test")
            .err()
            .expect("schema one must be rejected");
        assert_eq!(error.code, "runtime-bundle-invalid");
        fs::remove_dir_all(root).unwrap();
    }

    #[test]
    fn falls_back_to_the_previous_immutable_runtime() {
        let root = temporary_runtime_root();
        let current_fingerprint = "b".repeat(64);
        let previous_fingerprint = "a".repeat(64);
        let previous_root = root.join("runtimes").join(&previous_fingerprint);
        let node_entry = if cfg!(windows) {
            "bin/node.exe"
        } else {
            "bin/node"
        };
        for entry in [
            node_entry,
            "node_modules/agent-html/bin/agent-html.mjs",
            "node_modules/agent-html/template/agent-html/AGENTS.md",
        ] {
            let entry_path = previous_root.join(entry);
            fs::create_dir_all(entry_path.parent().unwrap()).unwrap();
            fs::write(entry_path, b"").unwrap();
        }
        fs::write(
            previous_root.join("runtime-manifest.json"),
            serde_json::json!({
                "schemaVersion": 2,
                "runtimeProtocolVersion": 1,
                "fingerprint": previous_fingerprint,
                "nodeEntry": node_entry,
                "cliEntry": "node_modules/agent-html/bin/agent-html.mjs",
                "workspaceTemplate": "node_modules/agent-html/template/agent-html"
            })
            .to_string(),
        )
        .unwrap();
        fs::write(
            root.join("current.json"),
            serde_json::json!({
                "schemaVersion": 1,
                "fingerprint": current_fingerprint,
                "previousFingerprint": previous_fingerprint
            })
            .to_string(),
        )
        .unwrap();

        let bundle = RuntimeBundle::resolve_selection(&root, "test")
            .unwrap()
            .unwrap();
        assert_eq!(bundle.fingerprint, previous_fingerprint);
        fs::remove_dir_all(root).unwrap();
    }

    #[cfg(windows)]
    #[test]
    fn process_job_terminates_its_child_when_released() {
        use std::process::{Command, Stdio};

        let mut child = Command::new("cmd.exe")
            .args(["/D", "/S", "/C", "ping 127.0.0.1 -n 30 > nul"])
            .stdin(Stdio::null())
            .stdout(Stdio::null())
            .stderr(Stdio::null())
            .spawn()
            .unwrap();
        let process_tree = ProcessTree::attach(child.id(), "test").unwrap();
        drop(process_tree);

        for _ in 0..20 {
            if child.try_wait().unwrap().is_some() {
                return;
            }
            std::thread::sleep(Duration::from_millis(50));
        }
        let _ = child.kill();
        panic!("Windows runtime job did not terminate its child");
    }
}
