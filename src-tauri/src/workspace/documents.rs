use std::fs;
use std::path::{Path, PathBuf};

use crate::workspace::types::WorkspaceResult;

#[derive(Clone, Debug)]
pub(crate) struct DocumentStore {
    root: PathBuf,
}

impl DocumentStore {
    pub(crate) fn new(root: PathBuf) -> Self {
        Self { root }
    }

    #[cfg(test)]
    pub(crate) fn root(&self) -> &Path {
        &self.root
    }

    pub(crate) fn document_path(&self, project_id: &str, section_id: &str) -> PathBuf {
        self.root
            .join(project_id)
            .join(format!("{section_id}.agent-html"))
    }

    pub(crate) fn write_document(
        &self,
        project_id: &str,
        section_id: &str,
        source: &str,
    ) -> WorkspaceResult<PathBuf> {
        let path = self.document_path(project_id, section_id);
        write_atomic(&path, source)?;
        Ok(path)
    }

    pub(crate) fn read_or_migrate_document(
        &self,
        project_id: &str,
        section_id: &str,
        legacy_source: &str,
    ) -> WorkspaceResult<(String, String)> {
        let path = self.document_path(project_id, section_id);
        if path.exists() {
            return Ok((
                fs::read_to_string(&path)?,
                path.to_string_lossy().to_string(),
            ));
        }

        let path = self.write_document(project_id, section_id, legacy_source)?;
        Ok((
            legacy_source.to_string(),
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
        let path = self.root.join(project_id);
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
        let old_path = self.root.join(old_project_id);
        if !old_path.exists() {
            return Ok(());
        }

        let new_path = self.root.join(new_project_id);
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
        fallback_source: &str,
    ) -> WorkspaceResult<String> {
        let (source, _) =
            self.read_or_migrate_document(source_project_id, source_section_id, fallback_source)?;
        self.write_document(next_project_id, next_section_id, &source)?;
        Ok(source)
    }
}

fn write_atomic(path: &Path, source: &str) -> WorkspaceResult<()> {
    if let Some(parent) = path.parent() {
        fs::create_dir_all(parent)?;
    }

    let temp_path = path.with_extension("agent-html.tmp");
    fs::write(&temp_path, source)?;
    if path.exists() {
        fs::remove_file(path)?;
    }
    fs::rename(temp_path, path)?;

    Ok(())
}
