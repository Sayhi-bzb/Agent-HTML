use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;

use super::error::{CodexHostError, CodexHostResult};

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(default)]
#[serde(rename_all = "camelCase")]
pub(crate) struct CodexHostSettings {
    pub(crate) codex_command: String,
}

impl Default for CodexHostSettings {
    fn default() -> Self {
        default_settings()
    }
}

pub(crate) fn normalize_codex_settings(settings: &CodexHostSettings) -> CodexHostSettings {
    let default_command = if cfg!(windows) { "codex.cmd" } else { "codex" };

    CodexHostSettings {
        codex_command: if settings.codex_command.trim().is_empty() {
            default_command.to_string()
        } else {
            settings.codex_command.trim().to_string()
        },
    }
}

fn default_settings_path(app: &tauri::AppHandle) -> CodexHostResult<PathBuf> {
    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|_| CodexHostError::Process("unable to resolve app data directory".to_string()))?;
    Ok(app_data_dir.join("codex-connection-settings.json"))
}

fn default_settings() -> CodexHostSettings {
    CodexHostSettings {
        codex_command: if cfg!(windows) {
            "codex.cmd".to_string()
        } else {
            "codex".to_string()
        },
    }
}

fn settings_with_runtime_defaults(settings: CodexHostSettings) -> CodexHostSettings {
    normalize_codex_settings(&settings)
}

pub(crate) fn load_settings_from_disk(
    app: &tauri::AppHandle,
) -> CodexHostResult<CodexHostSettings> {
    let path = default_settings_path(app)?;
    if !path.exists() {
        return Ok(default_settings());
    }

    let content = fs::read_to_string(path)?;
    let parsed: CodexHostSettings = serde_json::from_str(&content)?;
    Ok(settings_with_runtime_defaults(parsed))
}

pub(crate) fn save_settings_to_disk(
    app: &tauri::AppHandle,
    settings: &CodexHostSettings,
) -> CodexHostResult<CodexHostSettings> {
    let path = default_settings_path(app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let normalized = settings_with_runtime_defaults(settings.clone());
    let content = serde_json::to_string_pretty(&normalized)?;
    fs::write(path, content)?;
    Ok(normalized)
}
