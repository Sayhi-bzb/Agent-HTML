use std::fs;
use std::path::PathBuf;

use serde::{Deserialize, Serialize};
use tauri::Manager;
use tauri::State;
use thiserror::Error;

use crate::workspace::WorkspaceStore;

const PROMPT_SCHEMA_ARTIFACT_RELATIVE_PATH: &str =
    ".agents/skills/agent-html/references/prompt-schema.md";

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

fn prompt_schema_artifact_path(store: &WorkspaceStore) -> PathBuf {
    store.root().join(PROMPT_SCHEMA_ARTIFACT_RELATIVE_PATH)
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
    store: State<'_, WorkspaceStore>,
    input: AgentHtmlPromptSchemaArtifactInput,
) -> ComponentMarketResult<AgentHtmlPromptSchemaArtifact> {
    let path = prompt_schema_artifact_path(&store);
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    fs::write(&path, input.content)?;
    Ok(AgentHtmlPromptSchemaArtifact {
        path: PROMPT_SCHEMA_ARTIFACT_RELATIVE_PATH.to_string(),
    })
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn prompt_schema_artifact_path_is_workspace_root_relative() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");

        assert_eq!(
            prompt_schema_artifact_path(&store),
            root.join(".agents")
                .join("skills")
                .join("agent-html")
                .join("references")
                .join("prompt-schema.md")
        );
    }
}
