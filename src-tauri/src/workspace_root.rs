use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::State;
use thiserror::Error;

use crate::workspace::WorkspaceStore;

#[derive(Debug, Error)]
pub(crate) enum WorkspaceRootError {
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("path error: {0}")]
    Path(String),
}

impl Serialize for WorkspaceRootError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type WorkspaceRootResult<T> = Result<T, WorkspaceRootError>;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(default)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WorkspaceRootSettings {
    pub(crate) root_path: String,
}

impl Default for WorkspaceRootSettings {
    fn default() -> Self {
        Self {
            root_path: String::new(),
        }
    }
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WorkspaceRootStatus {
    pub(crate) default_root_path: String,
    pub(crate) pending_root_path: String,
    pub(crate) root_path: String,
    pub(crate) settings: WorkspaceRootSettings,
}

fn settings_path(app: &tauri::AppHandle) -> WorkspaceRootResult<PathBuf> {
    let app_data_dir = app.path().app_data_dir().map_err(|_| {
        WorkspaceRootError::Path("unable to resolve app data directory".to_string())
    })?;
    Ok(app_data_dir.join("workspace-root-settings.json"))
}

pub(crate) fn default_workspace_root(app: &tauri::AppHandle) -> WorkspaceRootResult<PathBuf> {
    let app_data_dir = app.path().app_data_dir().map_err(|_| {
        WorkspaceRootError::Path("unable to resolve app data directory".to_string())
    })?;
    Ok(app_data_dir.join("AgentHTML"))
}

pub(crate) fn load_workspace_root_settings(
    app: &tauri::AppHandle,
) -> WorkspaceRootResult<WorkspaceRootSettings> {
    let path = settings_path(app)?;
    if !path.exists() {
        return Ok(WorkspaceRootSettings::default());
    }

    let content = fs::read_to_string(path)?;
    Ok(serde_json::from_str(&content)?)
}

pub(crate) fn save_workspace_root_settings(
    app: &tauri::AppHandle,
    settings: &WorkspaceRootSettings,
) -> WorkspaceRootResult<WorkspaceRootSettings> {
    let path = settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let normalized = WorkspaceRootSettings {
        root_path: settings.root_path.trim().to_string(),
    };
    fs::write(path, serde_json::to_string_pretty(&normalized)?)?;
    Ok(normalized)
}

pub(crate) fn resolve_workspace_root(app: &tauri::AppHandle) -> WorkspaceRootResult<PathBuf> {
    let settings = load_workspace_root_settings(app)?;
    if settings.root_path.trim().is_empty() {
        return default_workspace_root(app);
    }

    Ok(PathBuf::from(settings.root_path))
}

fn status_from_settings(
    app: &tauri::AppHandle,
    store: &WorkspaceStore,
    settings: WorkspaceRootSettings,
) -> WorkspaceRootResult<WorkspaceRootStatus> {
    let default_root = default_workspace_root(app)?;
    let pending_root = if settings.root_path.trim().is_empty() {
        default_root.clone()
    } else {
        PathBuf::from(settings.root_path.trim())
    };

    Ok(WorkspaceRootStatus {
        default_root_path: default_root.to_string_lossy().to_string(),
        pending_root_path: pending_root.to_string_lossy().to_string(),
        root_path: store.root().to_string_lossy().to_string(),
        settings,
    })
}

#[tauri::command]
pub(crate) fn workspace_root_settings_load(
    app: tauri::AppHandle,
    store: State<'_, WorkspaceStore>,
) -> WorkspaceRootResult<WorkspaceRootStatus> {
    let settings = load_workspace_root_settings(&app)?;
    status_from_settings(&app, &store, settings)
}

#[tauri::command]
pub(crate) fn workspace_root_settings_save(
    app: tauri::AppHandle,
    store: State<'_, WorkspaceStore>,
    settings: WorkspaceRootSettings,
) -> WorkspaceRootResult<WorkspaceRootStatus> {
    let settings = save_workspace_root_settings(&app, &settings)?;
    status_from_settings(&app, &store, settings)
}

#[cfg(test)]
mod tests {
    const WORKSPACE_ROOT_SOURCE: &str = include_str!("workspace_root.rs");

    #[test]
    fn workspace_root_status_keeps_opened_root_separate_from_pending_settings() {
        assert!(WORKSPACE_ROOT_SOURCE.contains("pending_root_path"));
        assert!(WORKSPACE_ROOT_SOURCE.contains("root_path: store.root()"));
        assert!(!WORKSPACE_ROOT_SOURCE.contains("\n        root_path: pending_root"));
    }
}
