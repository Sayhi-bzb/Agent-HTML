mod commands;
mod company_agent;
mod db;
mod documents;
mod projects;
mod resources;
mod sections;
mod seed;
mod threads;
mod types;
mod util;

#[cfg(test)]
mod tests;

use std::path::{Path, PathBuf};
use std::sync::Mutex;

use documents::DocumentStore;
use rusqlite::Connection;
use serde_json::json;

pub(crate) use commands::*;
pub(crate) use types::{
    CompanyAgentState, ProjectCodexThreadLink, ProjectSectionDocument, WorkspaceProject,
    WorkspaceProjectView, WorkspaceResult, WorkspaceSection,
};

pub(crate) struct WorkspaceStore {
    connection: Mutex<Connection>,
    documents: DocumentStore,
}

impl WorkspaceStore {
    pub(crate) fn open(root: PathBuf) -> WorkspaceResult<Self> {
        std::fs::create_dir_all(root.join(".agent-world"))?;

        let path = root.join(".agent-world").join("workspace.sqlite3");
        let connection = Connection::open(&path)?;
        let store = Self {
            connection: Mutex::new(connection),
            documents: DocumentStore::new(root),
        };
        store.initialize()?;

        Ok(store)
    }

    fn initialize(&self) -> WorkspaceResult<()> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        db::create_schema(&connection)?;
        seed::seed_if_empty(&mut connection)?;
        seed::seed_introduce_examples(&mut connection)?;
        drop(connection);
        self.write_root_instructions()?;
        self.ensure_agent_html_skill()?;
        self.remove_old_managed_world_instructions()?;
        self.sync_world_files()?;
        Ok(())
    }

    fn write_root_instructions(&self) -> WorkspaceResult<()> {
        let path = self.documents.root().join("AGENTS.md");
        let content = resources::root_instructions_content();
        if path.exists() {
            let existing = std::fs::read_to_string(&path)?;
            if !resources::is_agenthtml_managed_root_instructions(&existing) || existing == content
            {
                return Ok(());
            }
        }

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, content)?;
        Ok(())
    }

    pub(crate) fn ensure_agent_html_skill(&self) -> WorkspaceResult<()> {
        let skill_path = self
            .documents
            .root()
            .join(".agents")
            .join("skills")
            .join("agent-html");
        for resource in resources::agent_html_skill_resources() {
            resources::write_managed_text(
                &skill_path.join(resource.relative_path),
                resource.content,
                resource.is_managed,
            )?;
        }

        let skill_file_path = skill_path.join("SKILL.md");
        let content = resources::agent_html_skill_content();
        if skill_file_path.exists() {
            let existing = std::fs::read_to_string(&skill_file_path)?;
            if !resources::is_agenthtml_managed_skill(&existing) || existing == content {
                return Ok(());
            }
        }

        std::fs::write(skill_file_path, content)?;
        Ok(())
    }

    fn remove_old_managed_world_instructions(&self) -> WorkspaceResult<()> {
        let path = self.documents.root().join(".agent-world").join("AGENTS.md");
        if !path.exists() {
            return Ok(());
        }

        let existing = std::fs::read_to_string(&path)?;
        if resources::is_agenthtml_managed_root_instructions(&existing) {
            std::fs::remove_file(path)?;
        }

        Ok(())
    }

    fn sync_world_files(&self) -> WorkspaceResult<()> {
        let projects = self.list_projects()?;
        for project in projects {
            let sections = self.list_project_sections(&project.id)?;
            self.documents.write_project_metadata(
                &project.id,
                &serde_json::to_string_pretty(&json!({
                    "id": project.id,
                    "name": project.name,
                    "slug": project.slug,
                }))?,
            )?;

            for section in sections {
                self.documents.write_section_metadata(
                    &section.project_id,
                    &section.id,
                    &serde_json::to_string_pretty(&json!({
                        "groupTitle": section.group_title,
                        "id": section.id,
                        "projectId": section.project_id,
                        "sortOrder": section.sort_order,
                        "title": section.title,
                    }))?,
                )?;
                if !self
                    .documents
                    .document_path(&section.project_id, &section.id)
                    .exists()
                {
                    let source = seed::create_initial_document_source(&project, &section);
                    self.documents
                        .write_document(&section.project_id, &section.id, &source)?;
                }
            }
        }

        Ok(())
    }

    #[cfg(test)]
    fn document_root(&self) -> &Path {
        self.documents.root()
    }

    pub(crate) fn root(&self) -> &Path {
        self.documents.root()
    }

    #[cfg(test)]
    fn database_path(root: &Path) -> PathBuf {
        root.join(".agent-world").join("workspace.sqlite3")
    }

    fn list_projects(&self) -> WorkspaceResult<Vec<WorkspaceProject>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        projects::list_projects(&connection)
    }

    fn get_company_agent_state(&self) -> WorkspaceResult<CompanyAgentState> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        company_agent::get_company_agent_state(&connection)
    }

    fn update_company_agent_state(
        &self,
        active_thread_id: Option<&str>,
    ) -> WorkspaceResult<CompanyAgentState> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        company_agent::update_company_agent_state(&connection, active_thread_id)
    }

    fn list_project_sections(&self, project_id: &str) -> WorkspaceResult<Vec<WorkspaceSection>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::list_project_sections(&connection, project_id)
    }

    fn get_project_section_document(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<ProjectSectionDocument> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::get_project_section_document(&connection, &self.documents, project_id, section_id)
    }

    fn create_project(&self, name: &str) -> WorkspaceResult<WorkspaceProjectView> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        projects::create_project(&mut connection, &self.documents, name)
    }

    fn rename_project(
        &self,
        project_id: &str,
        name: &str,
    ) -> WorkspaceResult<WorkspaceProjectView> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        projects::rename_project(&mut connection, &self.documents, project_id, name)
    }

    fn delete_project(&self, project_id: &str) -> WorkspaceResult<String> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        projects::delete_project(&connection, &self.documents, project_id)
    }

    fn create_project_section(
        &self,
        project_id: &str,
        title: &str,
    ) -> WorkspaceResult<WorkspaceSection> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::create_project_section(&mut connection, &self.documents, project_id, title)
    }

    fn rename_project_section(
        &self,
        project_id: &str,
        section_id: &str,
        title: &str,
    ) -> WorkspaceResult<WorkspaceSection> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::rename_project_section(
            &connection,
            &self.documents,
            project_id,
            section_id,
            title,
        )
    }

    fn delete_project_section(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<String> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::delete_project_section(&connection, &self.documents, project_id, section_id)
    }

    fn duplicate_project_section(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<WorkspaceSection> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::duplicate_project_section(
            &mut connection,
            &self.documents,
            project_id,
            section_id,
        )
    }

    fn update_project_section_document(
        &self,
        project_id: &str,
        section_id: &str,
        source: &str,
    ) -> WorkspaceResult<ProjectSectionDocument> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::update_project_section_document(
            &connection,
            &self.documents,
            project_id,
            section_id,
            source,
        )
    }

    fn list_project_codex_threads(
        &self,
        project_id: &str,
    ) -> WorkspaceResult<Vec<ProjectCodexThreadLink>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        threads::list_project_codex_threads(&connection, project_id)
    }

    fn upsert_project_codex_thread_link(
        &self,
        project_id: &str,
        thread_id: &str,
        section_id: Option<&str>,
        block_path: Option<&str>,
        document_path: Option<&str>,
    ) -> WorkspaceResult<ProjectCodexThreadLink> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        threads::upsert_project_codex_thread_link(
            &connection,
            project_id,
            thread_id,
            section_id,
            block_path,
            document_path,
        )
    }

    fn touch_project_codex_thread_link(
        &self,
        project_id: &str,
        thread_id: &str,
        section_id: Option<&str>,
        block_path: Option<&str>,
        document_path: Option<&str>,
    ) -> WorkspaceResult<ProjectCodexThreadLink> {
        self.upsert_project_codex_thread_link(
            project_id,
            thread_id,
            section_id,
            block_path,
            document_path,
        )
    }

    fn delete_project_codex_thread_link(
        &self,
        project_id: &str,
        thread_id: &str,
    ) -> WorkspaceResult<String> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        threads::delete_project_codex_thread_link(&connection, project_id, thread_id)
    }

    fn get_root_agents_instructions(&self) -> WorkspaceResult<String> {
        Ok(std::fs::read_to_string(
            self.documents.root().join("AGENTS.md"),
        )?)
    }

    fn update_root_agents_instructions(&self, source: &str) -> WorkspaceResult<String> {
        let path = self.documents.root().join("AGENTS.md");
        std::fs::write(&path, source)?;
        Ok(std::fs::read_to_string(path)?)
    }
}
