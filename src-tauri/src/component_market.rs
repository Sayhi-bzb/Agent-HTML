use std::fs;
use std::path::{Path, PathBuf};

use serde::{Deserialize, Serialize};
use tauri::Manager;
use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum ComponentMarketError {
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("path error: {0}")]
    Path(String),
}

impl Serialize for ComponentMarketError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type ComponentMarketResult<T> = Result<T, ComponentMarketError>;

#[derive(Clone, Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ComponentMarketSettings {
    enabled_component_tags: Vec<String>,
}

#[derive(Clone, Debug, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AgentHtmlPromptSchemaArtifactInput {
    content: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AgentHtmlPromptSchemaArtifact {
    path: String,
}

fn default_settings_path(app: &tauri::AppHandle) -> ComponentMarketResult<PathBuf> {
    let app_data_dir = app.path().app_data_dir().map_err(|_| {
        ComponentMarketError::Path("unable to resolve app data directory".to_string())
    })?;
    Ok(app_data_dir.join("component-market-settings.json"))
}

fn has_project_root_marker(path: &Path) -> bool {
    path.join("package.json").exists() && path.join("src-tauri").exists()
}

fn find_project_root_from(start: &Path) -> Option<PathBuf> {
    for candidate in start.ancestors() {
        if has_project_root_marker(candidate) {
            return Some(candidate.to_path_buf());
        }
    }

    None
}

fn resolve_project_root(app: &tauri::AppHandle) -> ComponentMarketResult<PathBuf> {
    if let Ok(current_dir) = std::env::current_dir() {
        if let Some(project_root) = find_project_root_from(&current_dir) {
            return Ok(project_root);
        }
    }

    if let Ok(resource_dir) = app.path().resource_dir() {
        if let Some(project_root) = find_project_root_from(&resource_dir) {
            return Ok(project_root);
        }
    }

    Err(ComponentMarketError::Path(
        "unable to resolve Agent-HTML project root".to_string(),
    ))
}

fn prompt_schema_artifact_path(app: &tauri::AppHandle) -> ComponentMarketResult<PathBuf> {
    Ok(resolve_project_root(app)?.join(".tmp").join("agent-html-prompt-schema.md"))
}

#[tauri::command]
pub(crate) fn load_component_market_settings(
    app: tauri::AppHandle,
) -> ComponentMarketResult<Option<ComponentMarketSettings>> {
    let path = default_settings_path(&app)?;
    if !path.exists() {
        return Ok(None);
    }

    let content = fs::read_to_string(path)?;
    Ok(Some(serde_json::from_str(&content)?))
}

#[tauri::command]
pub(crate) fn save_component_market_settings(
    app: tauri::AppHandle,
    settings: ComponentMarketSettings,
) -> ComponentMarketResult<ComponentMarketSettings> {
    let path = default_settings_path(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let content = serde_json::to_string_pretty(&settings)?;
    fs::write(path, content)?;
    Ok(settings)
}

#[tauri::command]
pub(crate) fn write_agent_html_prompt_schema_artifact(
    app: tauri::AppHandle,
    input: AgentHtmlPromptSchemaArtifactInput,
) -> ComponentMarketResult<AgentHtmlPromptSchemaArtifact> {
    let path = prompt_schema_artifact_path(&app)?;
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(&path, input.content)?;
    Ok(AgentHtmlPromptSchemaArtifact {
        path: path.to_string_lossy().to_string(),
    })
}
