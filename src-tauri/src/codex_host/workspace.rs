use std::path::{Path, PathBuf};

use tauri::Manager;

use super::error::{CodexHostError, CodexHostResult};

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

pub(crate) fn resolve_workspace_cwd(app: &tauri::AppHandle) -> CodexHostResult<PathBuf> {
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

    Err(CodexHostError::Process(
        "unable to resolve Agent-HTML project root for Codex cwd".to_string(),
    ))
}
