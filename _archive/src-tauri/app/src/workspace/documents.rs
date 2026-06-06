use std::fs;
use std::path::{Path, PathBuf};
use std::time::{SystemTime, UNIX_EPOCH};

use crate::workspace::types::{WorkspaceError, WorkspaceResult};

const ARTIFACT_FILE_NAME: &str = "artifact.agent-html";
const PROJECT_METADATA_FILE_NAME: &str = "project.json";
const SECTION_METADATA_FILE_NAME: &str = "section.json";

#[derive(Clone, Debug)]
pub(crate) struct DocumentStore {
    root: PathBuf,
}

impl DocumentStore {
    pub(crate) fn new(root: PathBuf) -> Self {
        Self { root }
    }

    pub(crate) fn root(&self) -> &Path {
        &self.root
    }

    pub(crate) fn project_path(&self, project_id: &str) -> PathBuf {
        self.root.join("projects").join(project_id)
    }

    pub(crate) fn section_path(&self, project_id: &str, section_id: &str) -> PathBuf {
        self.project_path(project_id).join(section_id)
    }

    pub(crate) fn document_path(&self, project_id: &str, section_id: &str) -> PathBuf {
        self.section_path(project_id, section_id)
            .join(ARTIFACT_FILE_NAME)
    }

    pub(crate) fn write_project_metadata(
        &self,
        project_id: &str,
        content: &str,
    ) -> WorkspaceResult<PathBuf> {
        let path = self
            .project_path(project_id)
            .join(PROJECT_METADATA_FILE_NAME);
        write_atomic(&self.root, &path, content)?;
        Ok(path)
    }

    pub(crate) fn write_section_metadata(
        &self,
        project_id: &str,
        section_id: &str,
        content: &str,
    ) -> WorkspaceResult<PathBuf> {
        let path = self
            .section_path(project_id, section_id)
            .join(SECTION_METADATA_FILE_NAME);
        write_atomic(&self.root, &path, content)?;
        Ok(path)
    }

    pub(crate) fn write_document(
        &self,
        project_id: &str,
        section_id: &str,
        source: &str,
    ) -> WorkspaceResult<PathBuf> {
        let path = self.document_path(project_id, section_id);
        write_atomic(&self.root, &path, source)?;
        Ok(path)
    }

    pub(crate) fn read_document(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<(String, String)> {
        let path = self.document_path(project_id, section_id);
        if !path.exists() {
            return Err(WorkspaceError::DocumentNotFound {
                project_id: project_id.to_string(),
                section_id: section_id.to_string(),
            });
        }

        Ok((
            fs::read_to_string(&path)?,
            path.to_string_lossy().to_string(),
        ))
    }

    pub(crate) fn remove_document(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<()> {
        let path = self.document_path(project_id, section_id);
        if path.exists() {
            fs::remove_file(path)?;
        }

        Ok(())
    }

    pub(crate) fn remove_project_documents(&self, project_id: &str) -> WorkspaceResult<()> {
        let path = self.project_path(project_id);
        if path.exists() {
            fs::remove_dir_all(path)?;
        }

        Ok(())
    }

    pub(crate) fn rename_project_documents(
        &self,
        old_project_id: &str,
        new_project_id: &str,
    ) -> WorkspaceResult<()> {
        let old_path = self.project_path(old_project_id);
        if !old_path.exists() {
            return Ok(());
        }

        let new_path = self.project_path(new_project_id);
        if let Some(parent) = new_path.parent() {
            fs::create_dir_all(parent)?;
        }
        if new_path.exists() {
            fs::remove_dir_all(&new_path)?;
        }
        fs::rename(old_path, new_path)?;

        Ok(())
    }

    pub(crate) fn duplicate_document(
        &self,
        source_project_id: &str,
        source_section_id: &str,
        next_project_id: &str,
        next_section_id: &str,
    ) -> WorkspaceResult<String> {
        let (source, _) = self.read_document(source_project_id, source_section_id)?;
        self.write_document(next_project_id, next_section_id, &source)?;
        Ok(source)
    }
}

fn write_atomic(workspace_root: &Path, path: &Path, source: &str) -> WorkspaceResult<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_dir = workspace_root.join(".agent-world").join("tmp");
    fs::create_dir_all(&temp_dir)?;
    let timestamp = SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .map(|duration| duration.as_nanos())
        .unwrap_or_default();
    let file_name = path
        .file_name()
        .and_then(|value| value.to_str())
        .unwrap_or("workspace-file");
    let temp_path = temp_dir.join(format!(
        "{}.{}.{}.tmp",
        std::process::id(),
        timestamp,
        file_name
    ));
    fs::write(&temp_path, source)?;
    if path.exists() {
        fs::remove_file(path)?;
    }
    fs::rename(temp_path, path)?;

    Ok(())
}
