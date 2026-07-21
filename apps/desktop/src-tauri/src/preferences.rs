use crate::workspace;
use serde::{Deserialize, Serialize};
use std::{
    collections::{BTreeMap, HashSet},
    fs,
    path::{Path, PathBuf},
    time::{SystemTime, UNIX_EPOCH},
};
use tauri::{AppHandle, Manager};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
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
pub struct CanvasThemeSnapshot {
    pub dark_css_variables: BTreeMap<String, String>,
    pub draft_css_variables: BTreeMap<String, String>,
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

#[derive(Clone, Debug, Default, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct StoredDesktopState {
    #[serde(default)]
    pub canvas_theme: Option<CanvasThemeSnapshot>,
    #[serde(default)]
    pub preferences: Preferences,
    #[serde(default)]
    pub recents: Vec<RecentWorkspace>,
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
    fn reads_legacy_preferences_without_requiring_desktop_theme() {
        let stored: StoredDesktopState = serde_json::from_str(
            r#"{"preferences":{"language":"en","theme":"dark","pipeline":"codex","externalEditor":"","automaticUpdates":false},"recents":[]}"#,
        )
        .expect("legacy desktop state should remain readable");

        assert_eq!(stored.preferences.language, "en");
        assert!(stored.canvas_theme.is_none());
    }

    #[test]
    fn round_trips_canvas_theme_snapshot() {
        let stored: StoredDesktopState = serde_json::from_str(
            r##"{"canvasTheme":{"version":1,"mode":"system","presetId":"claude-plus","lightCssVariables":{"--background":"#fff"},"darkCssVariables":{"--background":"#111"},"draftCssVariables":{}},"preferences":{"language":"en","pipeline":"codex","externalEditor":"","automaticUpdates":false},"recents":[]}"##,
        )
        .expect("canvas theme snapshot should deserialize");

        let theme = stored.canvas_theme.expect("canvas theme should exist");
        assert_eq!(theme.preset_id, "claude-plus");
        assert_eq!(theme.dark_css_variables["--background"], "#111");
    }

    #[test]
    fn migrates_and_deduplicates_windows_verbatim_recents() {
        let mut state = StoredDesktopState {
            recents: vec![
                recent(r"\\?\D:\new\tmp", 30),
                recent(r"D:\new\tmp", 20),
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

pub fn refresh_availability(state: &mut StoredDesktopState) {
    normalize_recents(state);
    for recent in &mut state.recents {
        recent.available = Path::new(&recent.path).join("agent-html").is_dir();
    }
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

    for mut recent in std::mem::take(&mut state.recents) {
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
