use std::{
    fs,
    path::{Path, PathBuf},
};

pub fn normalize_project_root(selected: &Path) -> Result<PathBuf, String> {
    let selected = fs::canonicalize(selected)
        .map_err(|error| format!("Selected folder is inaccessible: {error}"))?;
    let root = if selected.file_name().and_then(|name| name.to_str()) == Some("agent-html") {
        selected
            .parent()
            .ok_or_else(|| "agent-html/ must have a project parent".to_string())?
            .to_path_buf()
    } else {
        selected
    };
    Ok(root)
}

pub fn validate_workspace(root: &Path) -> Result<(), String> {
    let workspace = root.join("agent-html");
    if !workspace.is_dir() {
        return Err("agent-html/ is missing from the selected project".into());
    }
    let canonical_workspace = fs::canonicalize(&workspace)
        .map_err(|error| format!("Workspace is inaccessible: {error}"))?;
    let canonical_root = fs::canonicalize(root)
        .map_err(|error| format!("Selected folder is inaccessible: {error}"))?;
    if !canonical_workspace.starts_with(&canonical_root) {
        return Err("agent-html/ must stay inside the selected project".into());
    }
    Ok(())
}

#[cfg(test)]
mod tests {
    use super::*;

    #[test]
    fn rejects_a_project_without_agent_html() {
        let root =
            std::env::temp_dir().join(format!("ahtml-workspace-test-{}", std::process::id()));
        fs::create_dir_all(&root).unwrap();
        assert!(validate_workspace(&root).unwrap_err().contains("missing"));
        let _ = fs::remove_dir_all(root);
    }

    #[test]
    fn normalizes_project_and_agent_html_selections_to_one_root() {
        let root = std::env::temp_dir().join(format!(
            "ahtml-workspace-normalize-test-{}",
            std::process::id()
        ));
        let workspace = root.join("agent-html");
        fs::create_dir_all(&workspace).unwrap();

        assert_eq!(
            normalize_project_root(&root).unwrap(),
            fs::canonicalize(&root).unwrap()
        );
        assert_eq!(
            normalize_project_root(&workspace).unwrap(),
            fs::canonicalize(&root).unwrap()
        );
        assert!(validate_workspace(&root).is_ok());
        let _ = fs::remove_dir_all(root);
    }
}
