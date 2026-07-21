use crate::workspace;
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, HashSet},
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

const CANVAS_THEME_SNAPSHOT_VERSION: u8 = 2;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct Preferences {
    pub language: String,
    pub pipeline: String,
    pub external_editor: String,
    pub automatic_updates: bool,
}

impl Default for Preferences {
    fn default() -> Self {
        Self {
            language: "en".into(),
            pipeline: "codex".into(),
            external_editor: String::new(),
            automatic_updates: false,
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct CanvasThemeSnapshot {
    pub dark_css_variables: BTreeMap<String, String>,
    pub draft_css_variables: BTreeMap<String, String>,
    pub font_stylesheet_paths: Vec<String>,
    pub light_css_variables: BTreeMap<String, String>,
    pub mode: String,
    pub preset_id: String,
    pub version: u8,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct RecentWorkspace {
    pub name: String,
    pub path: String,
    pub available: bool,
    pub last_opened_at: u64,
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(
    rename_all = "camelCase",
    rename_all_fields = "camelCase",
    tag = "kind"
)]
pub enum WorkspaceTab {
    #[serde(rename = "artifact")]
    Artifact { file_path: String, id: String },
    #[serde(rename = "canvas")]
    Canvas { file_path: String, id: String },
    #[serde(rename = "thread-manager")]
    ThreadManager { id: String },
    #[serde(rename = "thread")]
    Thread { id: String, thread_id: String },
}

impl WorkspaceTab {
    fn id(&self) -> &str {
        match self {
            Self::Artifact { id, .. }
            | Self::Canvas { id, .. }
            | Self::ThreadManager { id }
            | Self::Thread { id, .. } => id,
        }
    }

    fn has_valid_id(&self) -> bool {
        match self {
            Self::Artifact { file_path, id } => id == &format!("artifact:{file_path}"),
            Self::Canvas { file_path, id } => id == &format!("canvas:{file_path}"),
            Self::ThreadManager { id } => id == "threads",
            Self::Thread { id, thread_id } => id == &format!("thread:{thread_id}"),
        }
    }
}

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase", deny_unknown_fields)]
pub struct WorkspaceTabSession {
    pub active_tab_id: Option<String>,
    pub tabs: Vec<WorkspaceTab>,
    pub version: u8,
}

impl WorkspaceTabSession {
    pub fn is_valid(&self) -> bool {
        if self.version != 1 || self.tabs.len() > 100 {
            return false;
        }
        let mut ids = HashSet::new();
        if self
            .tabs
            .iter()
            .any(|tab| !tab.has_valid_id() || !ids.insert(tab.id()))
        {
            return false;
        }
        match &self.active_tab_id {
            Some(active) => !self.tabs.is_empty() && ids.contains(active.as_str()),
            None => self.tabs.is_empty(),
        }
    }
}

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
#[serde(deny_unknown_fields)]
pub struct StoredDesktopState {
    pub canvas_theme: Option<CanvasThemeSnapshot>,
    pub preferences: Preferences,
    pub recents: Vec<RecentWorkspace>,
    #[serde(default)]
    pub workspace_tab_sessions: BTreeMap<String, WorkspaceTabSession>,
}

fn has_current_schema(state: &StoredDesktopState) -> bool {
    state
        .canvas_theme
        .as_ref()
        .map_or(true, |theme| theme.version == CANVAS_THEME_SNAPSHOT_VERSION)
}

#[cfg(test)]
mod tests {
    use super::*;

    fn recent(path: &str, last_opened_at: u64) -> RecentWorkspace {
        RecentWorkspace {
            name: "Project".into(),
            path: path.into(),
            available: true,
            last_opened_at,
        }
    }

    #[test]
    fn rejects_preferences_with_removed_fields() {
        let stored = serde_json::from_str::<StoredDesktopState>(
            r#"{"preferences":{"language":"en","theme":"dark","pipeline":"codex","externalEditor":"","automaticUpdates":false},"recents":[]}"#,
        );

        assert!(stored.is_err());
    }

    #[test]
    fn round_trips_canvas_theme_snapshot() {
        let stored: StoredDesktopState = serde_json::from_str(
            r##"{"canvasTheme":{"version":2,"mode":"system","presetId":"claude-plus","lightCssVariables":{"--background":"#fff"},"darkCssVariables":{"--background":"#111"},"draftCssVariables":{},"fontStylesheetPaths":["/__agent-html/font-stylesheet?url=https%3A%2F%2Ffonts.googleapis.com%2Fcss2%3Ffamily%3DInter"]},"preferences":{"language":"en","pipeline":"codex","externalEditor":"","automaticUpdates":false},"recents":[]}"##,
        )
        .expect("canvas theme snapshot should deserialize");

        let theme = stored.canvas_theme.expect("canvas theme should exist");
        assert_eq!(theme.preset_id, "claude-plus");
        assert_eq!(theme.dark_css_variables["--background"], "#111");
        assert_eq!(theme.font_stylesheet_paths.len(), 1);
    }

    #[test]
    fn rejects_canvas_theme_without_font_stylesheets() {
        let stored = serde_json::from_str::<StoredDesktopState>(
            r##"{"canvasTheme":{"version":1,"mode":"system","presetId":"claude-plus","lightCssVariables":{"--background":"#fff"},"darkCssVariables":{},"draftCssVariables":{}},"preferences":{"language":"en","pipeline":"codex","externalEditor":"","automaticUpdates":false},"recents":[]}"##,
        );

        assert!(stored.is_err());
    }

    #[test]
    fn migrates_and_deduplicates_windows_verbatim_recents() {
        let mut state = StoredDesktopState {
            recents: vec![
                recent(r"\\?\D:\new\tmp", 20),
                recent(r"D:\new\tmp", 30),
                recent(r"\\?\UNC\server\share\demo", 10),
            ],
            ..StoredDesktopState::default()
        };

        assert!(normalize_recents(&mut state));
        assert_eq!(state.recents.len(), 2);
        assert_eq!(state.recents[0].path, r"D:\new\tmp");
        assert_eq!(state.recents[0].last_opened_at, 30);
        assert_eq!(state.recents[1].path, r"\\server\share\demo");
        assert!(!normalize_recents(&mut state));
    }

    #[test]
    fn recent_migration_keeps_the_newest_twelve_entries() {
        let mut state = StoredDesktopState {
            recents: (0..14)
                .map(|index| recent(&format!("/projects/{index}"), 14 - index))
                .collect(),
            ..StoredDesktopState::default()
        };

        assert!(normalize_recents(&mut state));
        assert_eq!(state.recents.len(), 12);
        assert_eq!(state.recents[0].last_opened_at, 14);
        assert_eq!(state.recents[11].last_opened_at, 3);
    }

    #[test]
    fn remembers_user_facing_paths() {
        let mut state = StoredDesktopState::default();

        remember_workspace(&mut state, Path::new(r"\\?\D:\new\tmp"));

        assert_eq!(state.recents[0].path, r"D:\new\tmp");
    }

    #[test]
    fn stores_valid_workspace_tab_sessions_per_workspace() {
        let mut state = StoredDesktopState::default();
        let session = WorkspaceTabSession {
            active_tab_id: Some("canvas:agent-html/canvases/main.canvas.tsx".into()),
            tabs: vec![WorkspaceTab::Canvas {
                file_path: "agent-html/canvases/main.canvas.tsx".into(),
                id: "canvas:agent-html/canvases/main.canvas.tsx".into(),
            }],
            version: 1,
        };

        save_workspace_tab_session(&mut state, Path::new(r"D:\projects\demo"), session.clone())
            .expect("valid session should save");

        assert_eq!(
            load_workspace_tab_session(&state, Path::new(r"D:\projects\demo"))
                .expect("session should load")
                .active_tab_id,
            session.active_tab_id
        );
    }

    #[test]
    fn rejects_workspace_tab_sessions_with_unstable_ids() {
        let mut state = StoredDesktopState::default();
        let session = WorkspaceTabSession {
            active_tab_id: Some("wrong".into()),
            tabs: vec![WorkspaceTab::ThreadManager { id: "wrong".into() }],
            version: 1,
        };

        assert!(
            save_workspace_tab_session(&mut state, Path::new(r"D:\projects\demo"), session)
                .is_err()
        );
    }

    #[cfg(windows)]
    #[test]
    fn recent_migration_deduplicates_windows_paths_case_insensitively() {
        let mut state = StoredDesktopState {
            recents: vec![
                recent(r"D:\Projects\Demo", 2),
                recent(r"d:\projects\demo", 1),
            ],
            ..StoredDesktopState::default()
        };

        assert!(normalize_recents(&mut state));
        assert_eq!(state.recents.len(), 1);
        assert_eq!(state.recents[0].last_opened_at, 2);
    }
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|path| path.join("desktop.json"))
        .map_err(|error| error.to_string())
}

pub fn load(app: &AppHandle) -> StoredDesktopState {
    let mut state = settings_path(app)
        .ok()
        .and_then(|path| fs::read_to_string(path).ok())
        .and_then(|json| serde_json::from_str(&json).ok())
        .filter(has_current_schema)
        .unwrap_or_default();
    if normalize_recents(&mut state) {
        let _ = save(app, &state);
    }
    state
}

pub fn save(app: &AppHandle, state: &StoredDesktopState) -> Result<(), String> {
    let path = settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent).map_err(|error| error.to_string())?;
    }
    let json = serde_json::to_string_pretty(state).map_err(|error| error.to_string())?;
    fs::write(path, json).map_err(|error| error.to_string())
}

pub fn remember_workspace(state: &mut StoredDesktopState, root: &Path) {
    normalize_recents(state);
    let root_string = workspace::user_facing_path(root);
    let root_identity = recent_path_identity(&root_string);
    state
        .recents
        .retain(|recent| recent_path_identity(&recent.path) != root_identity);
    state.recents.insert(
        0,
        RecentWorkspace {
            name: root
                .file_name()
                .and_then(|name| name.to_str())
                .unwrap_or("Project")
                .to_string(),
            path: root_string,
            available: true,
            last_opened_at: SystemTime::now()
                .duration_since(UNIX_EPOCH)
                .unwrap_or_default()
                .as_secs(),
        },
    );
    state.recents.truncate(12);
}

pub fn load_workspace_tab_session(
    state: &StoredDesktopState,
    root: &Path,
) -> Option<WorkspaceTabSession> {
    state
        .workspace_tab_sessions
        .get(&workspace::user_facing_path(root))
        .filter(|session| session.is_valid())
        .cloned()
}

pub fn save_workspace_tab_session(
    state: &mut StoredDesktopState,
    root: &Path,
    session: WorkspaceTabSession,
) -> Result<(), String> {
    if !session.is_valid() {
        return Err("Workspace tab session is invalid".into());
    }
    state
        .workspace_tab_sessions
        .insert(workspace::user_facing_path(root), session);
    Ok(())
}

pub fn refresh_availability(state: &mut StoredDesktopState) {
    normalize_recents(state);
}

fn recent_path_identity(path: &str) -> String {
    if cfg!(windows) {
        path.to_lowercase()
    } else {
        path.to_string()
    }
}

fn normalize_recents(state: &mut StoredDesktopState) -> bool {
    let mut changed = false;
    let mut seen = HashSet::new();
    let mut normalized = Vec::with_capacity(state.recents.len().min(12));
    let mut recents = std::mem::take(&mut state.recents);
    if recents
        .windows(2)
        .any(|pair| pair[0].last_opened_at < pair[1].last_opened_at)
    {
        recents.sort_by(|left, right| right.last_opened_at.cmp(&left.last_opened_at));
        changed = true;
    }

    for mut recent in recents {
        let path = workspace::user_facing_path(Path::new(&recent.path));
        if path != recent.path {
            recent.path = path;
            changed = true;
        }
        if let Some(name) = Path::new(&recent.path)
            .file_name()
            .and_then(|name| name.to_str())
        {
            if name != recent.name {
                recent.name = name.to_string();
                changed = true;
            }
        }
        let available = Path::new(&recent.path).join("agent-html").is_dir();
        if available != recent.available {
            recent.available = available;
            changed = true;
        }

        if !seen.insert(recent_path_identity(&recent.path)) {
            changed = true;
            continue;
        }
        if normalized.len() == 12 {
            changed = true;
            continue;
        }
        normalized.push(recent);
    }

    state.recents = normalized;
    changed
}
