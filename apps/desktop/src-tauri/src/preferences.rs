use serde::{Deserialize, Serialize};
use std::{
    collections::BTreeMap,
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
}

fn settings_path(app: &AppHandle) -> Result<PathBuf, String> {
    app.path()
        .app_config_dir()
        .map(|path| path.join("desktop.json"))
        .map_err(|error| error.to_string())
}

pub fn load(app: &AppHandle) -> StoredDesktopState {
    settings_path(app)
        .ok()
        .and_then(|path| fs::read_to_string(path).ok())
        .and_then(|json| serde_json::from_str(&json).ok())
        .unwrap_or_default()
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
    let root_string = root.to_string_lossy().to_string();
    state.recents.retain(|recent| recent.path != root_string);
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
    for recent in &mut state.recents {
        recent.available = Path::new(&recent.path).join("agent-html").is_dir();
    }
}
