mod db;
mod documents;
mod projects;
mod sections;
mod seed;
mod threads;
mod types;
mod util;

#[cfg(test)]
use std::path::Path;
use std::path::PathBuf;
use std::sync::Mutex;

use documents::DocumentStore;
use rusqlite::Connection;
use tauri::State;

pub(crate) use types::{
    ProjectCodexThreadLink, ProjectSectionDocument, WorkspaceProject, WorkspaceProjectView,
    WorkspaceResult, WorkspaceSection,
};

pub(crate) struct WorkspaceStore {
    connection: Mutex<Connection>,
    documents: DocumentStore,
}

impl WorkspaceStore {
    pub(crate) fn open(path: PathBuf) -> WorkspaceResult<Self> {
        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }

        let connection = Connection::open(&path)?;
        let document_root = path
            .parent()
            .map(|parent| parent.join("documents"))
            .unwrap_or_else(|| PathBuf::from("documents"));
        let store = Self {
            connection: Mutex::new(connection),
            documents: DocumentStore::new(document_root),
        };
        store.initialize()?;

        Ok(store)
    }

    fn initialize(&self) -> WorkspaceResult<()> {
        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        db::create_schema(&connection)?;
        seed::seed_if_empty(&mut connection)?;
        seed::seed_introduce_examples(&mut connection)?;
        Ok(())
    }

    #[cfg(test)]
    fn document_root(&self) -> &Path {
        self.documents.root()
    }

    fn list_projects(&self) -> WorkspaceResult<Vec<WorkspaceProject>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        projects::list_projects(&connection)
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
        sections::rename_project_section(&connection, project_id, section_id, title)
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
        ahtml_source: &str,
    ) -> WorkspaceResult<ProjectSectionDocument> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        sections::update_project_section_document(
            &connection,
            &self.documents,
            project_id,
            section_id,
            ahtml_source,
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
        ahtml_path: Option<&str>,
        document_path: Option<&str>,
    ) -> WorkspaceResult<ProjectCodexThreadLink> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        threads::upsert_project_codex_thread_link(
            &connection,
            project_id,
            thread_id,
            section_id,
            ahtml_path,
            document_path,
        )
    }

    fn touch_project_codex_thread_link(
        &self,
        project_id: &str,
        thread_id: &str,
        section_id: Option<&str>,
        ahtml_path: Option<&str>,
        document_path: Option<&str>,
    ) -> WorkspaceResult<ProjectCodexThreadLink> {
        self.upsert_project_codex_thread_link(
            project_id,
            thread_id,
            section_id,
            ahtml_path,
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
}

#[tauri::command]
pub(crate) fn list_projects(
    store: State<'_, WorkspaceStore>,
) -> WorkspaceResult<Vec<WorkspaceProject>> {
    store.list_projects()
}

#[tauri::command]
pub(crate) fn list_project_sections(
    store: State<'_, WorkspaceStore>,
    project_id: String,
) -> WorkspaceResult<Vec<WorkspaceSection>> {
    store.list_project_sections(&project_id)
}

#[tauri::command]
pub(crate) fn get_project_section_document(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
) -> WorkspaceResult<ProjectSectionDocument> {
    store.get_project_section_document(&project_id, &section_id)
}

#[tauri::command]
pub(crate) fn create_project(
    store: State<'_, WorkspaceStore>,
    name: String,
) -> WorkspaceResult<WorkspaceProjectView> {
    store.create_project(&name)
}

#[tauri::command]
pub(crate) fn rename_project(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    name: String,
) -> WorkspaceResult<WorkspaceProjectView> {
    store.rename_project(&project_id, &name)
}

#[tauri::command]
pub(crate) fn delete_project(
    store: State<'_, WorkspaceStore>,
    project_id: String,
) -> WorkspaceResult<String> {
    store.delete_project(&project_id)
}

#[tauri::command]
pub(crate) fn create_project_section(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    title: String,
) -> WorkspaceResult<WorkspaceSection> {
    store.create_project_section(&project_id, &title)
}

#[tauri::command]
pub(crate) fn rename_project_section(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
    title: String,
) -> WorkspaceResult<WorkspaceSection> {
    store.rename_project_section(&project_id, &section_id, &title)
}

#[tauri::command]
pub(crate) fn delete_project_section(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
) -> WorkspaceResult<String> {
    store.delete_project_section(&project_id, &section_id)
}

#[tauri::command]
pub(crate) fn duplicate_project_section(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
) -> WorkspaceResult<WorkspaceSection> {
    store.duplicate_project_section(&project_id, &section_id)
}

#[tauri::command]
pub(crate) fn update_project_section_document(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
    ahtml_source: String,
) -> WorkspaceResult<ProjectSectionDocument> {
    store.update_project_section_document(&project_id, &section_id, &ahtml_source)
}

#[tauri::command]
pub(crate) fn list_project_codex_threads(
    store: State<'_, WorkspaceStore>,
    project_id: String,
) -> WorkspaceResult<Vec<ProjectCodexThreadLink>> {
    store.list_project_codex_threads(&project_id)
}

#[tauri::command]
pub(crate) fn upsert_project_codex_thread_link(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    thread_id: String,
    section_id: Option<String>,
    ahtml_path: Option<String>,
    document_path: Option<String>,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    store.upsert_project_codex_thread_link(
        &project_id,
        &thread_id,
        section_id.as_deref(),
        ahtml_path.as_deref(),
        document_path.as_deref(),
    )
}

#[tauri::command]
pub(crate) fn touch_project_codex_thread_link(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    thread_id: String,
    section_id: Option<String>,
    ahtml_path: Option<String>,
    document_path: Option<String>,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    store.touch_project_codex_thread_link(
        &project_id,
        &thread_id,
        section_id.as_deref(),
        ahtml_path.as_deref(),
        document_path.as_deref(),
    )
}

#[tauri::command]
pub(crate) fn delete_project_codex_thread_link(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    thread_id: String,
) -> WorkspaceResult<String> {
    store.delete_project_codex_thread_link(&project_id, &thread_id)
}

#[cfg(test)]
mod tests {
    use super::*;
    use crate::workspace::types::WorkspaceError;
    use tempfile::TempDir;

    struct TestWorkspace {
        _temp_dir: TempDir,
        store: WorkspaceStore,
    }

    fn test_store() -> TestWorkspace {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let store = WorkspaceStore {
            connection: Mutex::new(Connection::open_in_memory().expect("open in-memory db")),
            documents: DocumentStore::new(temp_dir.path().join("documents")),
        };
        store.initialize().expect("initialize workspace store");
        TestWorkspace {
            _temp_dir: temp_dir,
            store,
        }
    }

    #[test]
    fn seeds_projects_on_empty_database() {
        let workspace = test_store();
        let store = &workspace.store;

        let projects = store.list_projects().expect("list projects");

        assert_eq!(projects.len(), 4);
        assert!(projects
            .iter()
            .any(|project| project.id == "agent-html-example"));
        assert!(projects
            .iter()
            .any(|project| project.id == "design-engineering"));
    }

    #[test]
    fn lists_project_owned_sections() {
        let workspace = test_store();
        let store = &workspace.store;

        let sections = store
            .list_project_sections("design-engineering")
            .expect("list sections");

        assert_eq!(sections.len(), 6);
        assert!(sections
            .iter()
            .all(|section| section.project_id == "design-engineering"));
        assert_eq!(sections[0].id, "installation");
    }

    #[test]
    fn reads_project_section_document_source() {
        let workspace = test_store();
        let store = &workspace.store;

        let document = store
            .get_project_section_document("design-engineering", "installation")
            .expect("read document");

        assert_eq!(document.project_id, "design-engineering");
        assert_eq!(document.section_id, "installation");
        assert!(document.ahtml_source.contains("<Page"));
        assert!(
            document
                .file_path
                .ends_with("design-engineering\\installation.agent-html")
                || document
                    .file_path
                    .ends_with("design-engineering/installation.agent-html")
        );
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read migrated document file"),
            document.ahtml_source
        );
    }

    #[test]
    fn reads_existing_file_as_document_source() {
        let workspace = test_store();
        let store = &workspace.store;
        let document_path = store
            .document_root()
            .join("design-engineering")
            .join("installation.agent-html");
        std::fs::create_dir_all(document_path.parent().expect("document parent"))
            .expect("create document parent");
        std::fs::write(&document_path, "<Page title=\"File Source\" />")
            .expect("write file source");

        let document = store
            .get_project_section_document("design-engineering", "installation")
            .expect("read document");

        assert_eq!(document.ahtml_source, "<Page title=\"File Source\" />");
    }

    #[test]
    fn seeds_introduce_agent_html_examples() {
        let workspace = test_store();
        let store = &workspace.store;

        let sections = store
            .list_project_sections("agent-html-example")
            .expect("list example sections");

        assert_eq!(sections.len(), 2);
        assert_eq!(sections[0].id, "introduce-agent-html");
        assert_eq!(sections[1].id, "introduce-agent-html-zh");

        let document = store
            .get_project_section_document("agent-html-example", "introduce-agent-html")
            .expect("read introduce document");
        assert!(document.ahtml_source.contains("agent-html"));
    }

    #[test]
    fn returns_error_for_missing_document() {
        let workspace = test_store();
        let store = &workspace.store;

        let error = store
            .get_project_section_document("design-engineering", "missing")
            .expect_err("missing document should fail");

        assert!(matches!(error, WorkspaceError::DocumentNotFound { .. }));
    }

    #[test]
    fn creates_blank_project_with_overview_document() {
        let workspace = test_store();
        let store = &workspace.store;

        let project = store
            .create_project("Research Notes")
            .expect("create project");

        assert_eq!(project.id, "research-notes");
        assert_eq!(project.slug, "research-notes");
        assert_eq!(project.sections.len(), 1);
        assert_eq!(project.sections[0].id, "overview");

        let document = store
            .get_project_section_document("research-notes", "overview")
            .expect("read overview document");
        assert!(document.ahtml_source.contains("Research Notes"));
        assert!(document.ahtml_source.contains("Blank project"));
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read created document file"),
            document.ahtml_source
        );
    }

    #[test]
    fn creates_unique_slug_for_duplicate_project_names() {
        let workspace = test_store();
        let store = &workspace.store;

        let first = store
            .create_project("Research Notes")
            .expect("create first project");
        let second = store
            .create_project("Research Notes")
            .expect("create second project");

        assert_eq!(first.id, "research-notes");
        assert_eq!(second.id, "research-notes-2");
    }

    #[test]
    fn renames_project_and_moves_owned_sections_and_documents() {
        let workspace = test_store();
        let store = &workspace.store;

        let renamed = store
            .rename_project("design-engineering", "Design Systems")
            .expect("rename project");

        assert_eq!(renamed.id, "design-systems");
        assert_eq!(renamed.slug, "design-systems");
        assert_eq!(renamed.name, "Design Systems");
        assert_eq!(renamed.sections.len(), 6);
        assert!(renamed
            .sections
            .iter()
            .all(|section| section.project_id == "design-systems"));

        let document = store
            .get_project_section_document("design-systems", "installation")
            .expect("read moved document");
        assert_eq!(document.project_id, "design-systems");
        assert!(document.file_path.contains("design-systems"));

        let old_document = store
            .get_project_section_document("design-engineering", "installation")
            .expect_err("old project document should be gone");
        assert!(matches!(
            old_document,
            WorkspaceError::DocumentNotFound { .. }
        ));
    }

    #[test]
    fn deletes_project_and_owned_documents() {
        let workspace = test_store();
        let store = &workspace.store;

        let deleted_id = store
            .delete_project("design-engineering")
            .expect("delete project");

        assert_eq!(deleted_id, "design-engineering");
        assert!(store
            .list_project_sections("design-engineering")
            .expect("list deleted project sections")
            .is_empty());
        assert!(matches!(
            store
                .get_project_section_document("design-engineering", "installation")
                .expect_err("deleted document should be gone"),
            WorkspaceError::DocumentNotFound { .. }
        ));
        assert!(!store.document_root().join("design-engineering").exists());
    }

    #[test]
    fn creates_project_section_with_blank_document() {
        let workspace = test_store();
        let store = &workspace.store;

        let section = store
            .create_project_section("design-engineering", "Release Notes")
            .expect("create section");

        assert_eq!(section.id, "release-notes");
        assert_eq!(section.project_id, "design-engineering");
        assert_eq!(section.sort_order, 6);

        let document = store
            .get_project_section_document("design-engineering", "release-notes")
            .expect("read new section document");
        assert!(document.ahtml_source.contains("Release Notes"));
        assert!(document.ahtml_source.contains("Blank section"));
        assert!(store
            .document_root()
            .join("design-engineering")
            .join("release-notes.agent-html")
            .exists());
    }

    #[test]
    fn renames_project_section_without_changing_id() {
        let workspace = test_store();
        let store = &workspace.store;

        let section = store
            .rename_project_section("design-engineering", "installation", "Setup")
            .expect("rename section");

        assert_eq!(section.id, "installation");
        assert_eq!(section.title, "Setup");
    }

    #[test]
    fn deletes_last_project_section() {
        let workspace = test_store();
        let store = &workspace.store;
        let project = store
            .create_project("One Section")
            .expect("create one-section project");

        let deleted_id = store
            .delete_project_section(&project.id, "overview")
            .expect("delete only section");

        assert_eq!(deleted_id, "overview");
        assert!(!store
            .document_root()
            .join(&project.id)
            .join("overview.agent-html")
            .exists());
        assert!(store
            .list_project_sections(&project.id)
            .expect("list empty project sections")
            .is_empty());
    }

    #[test]
    fn duplicates_project_section_from_saved_document() {
        let workspace = test_store();
        let store = &workspace.store;
        let source = "<Page title=\"Saved Copy\" />";
        store
            .update_project_section_document("design-engineering", "installation", source)
            .expect("save source");

        let section = store
            .duplicate_project_section("design-engineering", "installation")
            .expect("duplicate section");

        assert_eq!(section.id, "installation-copy");
        assert_eq!(section.title, "Installation Copy");
        assert_eq!(section.sort_order, 6);

        let document = store
            .get_project_section_document("design-engineering", "installation-copy")
            .expect("read duplicate document");
        assert_eq!(document.ahtml_source, source);
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read duplicated document file"),
            source
        );
    }

    #[test]
    fn updates_project_section_document_source() {
        let workspace = test_store();
        let store = &workspace.store;
        let source = r#"<Page title="Updated">
  <Section width="content">
    <Text variant="h1">Updated</Text>
  </Section>
</Page>"#;

        let document = store
            .update_project_section_document("design-engineering", "installation", source)
            .expect("update document");

        assert_eq!(document.ahtml_source, source);
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read updated document file"),
            source
        );
        assert_eq!(document.updated_at, "2026-05-27T00:00:00.000Z");
    }

    #[test]
    fn returns_error_when_updating_missing_document() {
        let workspace = test_store();
        let store = &workspace.store;

        let error = store
            .update_project_section_document("design-engineering", "missing", "<Page />")
            .expect_err("missing update should fail");

        assert!(matches!(error, WorkspaceError::DocumentNotFound { .. }));
    }

    #[test]
    fn links_codex_threads_to_projects() {
        let workspace = test_store();
        let store = &workspace.store;

        let link = store
            .upsert_project_codex_thread_link(
                "design-engineering",
                "thr_project",
                Some("installation"),
                Some("/Page/Section[0]"),
                Some("D:\\workspace\\installation.agent-html"),
            )
            .expect("link thread");

        assert_eq!(link.thread_id, "thr_project");
        assert_eq!(link.project_id, "design-engineering");
        assert_eq!(link.last_section_id.as_deref(), Some("installation"));
        assert_eq!(link.last_ahtml_path.as_deref(), Some("/Page/Section[0]"));
        assert_eq!(link.origin, "agent-html");

        let links = store
            .list_project_codex_threads("design-engineering")
            .expect("list links");

        assert_eq!(links.len(), 1);
        assert_eq!(links[0].thread_id, "thr_project");
    }

    #[test]
    fn rejects_codex_thread_links_for_missing_projects() {
        let workspace = test_store();
        let store = &workspace.store;

        let error = store
            .upsert_project_codex_thread_link("missing", "thr_project", None, None, None)
            .expect_err("missing project should fail");

        assert!(matches!(error, WorkspaceError::ProjectNotFound { .. }));
    }

    #[test]
    fn deletes_project_codex_thread_links_with_project() {
        let workspace = test_store();
        let store = &workspace.store;

        store
            .upsert_project_codex_thread_link("design-engineering", "thr_project", None, None, None)
            .expect("link thread");
        store
            .delete_project("design-engineering")
            .expect("delete project");

        let links = store
            .list_project_codex_threads("design-engineering")
            .expect("list deleted project links");

        assert!(links.is_empty());
    }

    #[test]
    fn deletes_single_project_codex_thread_link() {
        let workspace = test_store();
        let store = &workspace.store;

        store
            .upsert_project_codex_thread_link("design-engineering", "thr_one", None, None, None)
            .expect("link first thread");
        store
            .upsert_project_codex_thread_link("design-engineering", "thr_two", None, None, None)
            .expect("link second thread");

        let deleted = store
            .delete_project_codex_thread_link("design-engineering", "thr_one")
            .expect("delete thread link");
        let links = store
            .list_project_codex_threads("design-engineering")
            .expect("list remaining links");

        assert_eq!(deleted, "thr_one");
        assert_eq!(links.len(), 1);
        assert_eq!(links[0].thread_id, "thr_two");
    }
}
