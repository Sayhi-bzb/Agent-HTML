mod db;
mod documents;
mod projects;
mod sections;
mod seed;
mod threads;
mod types;
mod util;

use std::path::{Path, PathBuf};
use std::sync::Mutex;

use documents::DocumentStore;
use rusqlite::Connection;
use serde_json::json;
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
        let content = root_instructions_content();
        if path.exists() {
            let existing = std::fs::read_to_string(&path)?;
            if !is_agenthtml_managed_root_instructions(&existing) || existing == content {
                return Ok(());
            }
        }

        if let Some(parent) = path.parent() {
            std::fs::create_dir_all(parent)?;
        }
        std::fs::write(path, content)?;
        Ok(())
    }

    fn ensure_agent_html_skill(&self) -> WorkspaceResult<()> {
        let skill_path = self
            .documents
            .root()
            .join(".agents")
            .join("skills")
            .join("agent-html");
        let references_path = skill_path.join("references");
        let scripts_path = skill_path.join("scripts");
        std::fs::create_dir_all(&references_path)?;
        std::fs::create_dir_all(&scripts_path)?;

        write_text_if_missing(
            &references_path.join("examples.md"),
            &agent_html_examples_reference_content(),
        )?;
        write_text_if_missing(
            &references_path.join("icons.md"),
            &agent_html_icons_reference_content(),
        )?;
        write_text_if_missing(
            &scripts_path.join("search_icons.py"),
            &agent_html_search_icons_script_content(),
        )?;

        let skill_file_path = skill_path.join("SKILL.md");
        let content = agent_html_skill_content();
        if skill_file_path.exists() {
            let existing = std::fs::read_to_string(&skill_file_path)?;
            if !is_agenthtml_managed_skill(&existing) || existing == content {
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
        if is_agenthtml_managed_root_instructions(&existing) {
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

fn root_instructions_content() -> String {
    [
        "# AgentHTML World",
        "",
        "This directory is the AgentHTML workspace root.",
        "",
        "- User projects live under `projects/`.",
        "- Each project lives at `projects/{project-id}/`.",
        "- Each section lives directly under its project directory.",
        "- The canonical artifact for a section is `artifact.agent-html`.",
        "- Projects and sections may define local `AGENTS.md` files for scoped instructions.",
        "- Edit `projects/{project-id}/{section-id}/artifact.agent-html` when changing user-facing workspace content.",
        "- Use the `$agent-html` skill for `.agent-html`, artifact, block, component, or section work.",
        "- The `agent-html` skill is the Codex bridge for the current AgentHTML runtime contract.",
        "- Do not edit `.agent-world/` unless the task explicitly asks for workspace internals.",
        "",
    ]
    .join("\n")
}

fn agent_html_skill_content() -> String {
    [
        "---",
        "name: agent-html",
        "description: Use when editing AgentHTML artifacts, .agent-html files, Gallery Preview DSL, blocks, components, sections, prompt schema, or runtime-rendered artifact content. Before editing AgentHTML content, read references/prompt-schema.md for the current DSL contract and enabled component grammar.",
        "---",
        "",
        "# AgentHTML",
        "",
        "This skill is the Codex bridge for the AgentHTML runtime contract.",
        "",
        "Before editing AgentHTML content:",
        "",
        "1. Read `references/prompt-schema.md`.",
        "2. Reuse patterns from `references/examples.md` before inventing structure.",
        "3. Use `scripts/search_icons.py \"<query>\"` before choosing Lucide icon names.",
        "4. Use only tags, attributes, and child rules listed in the prompt schema.",
        "5. Edit `projects/{project-id}/{section-id}/artifact.agent-html` for user-facing workspace content.",
        "",
        "Do not use raw HTML, JSX expressions, imports, hooks, `class`, `className`, or `style` unless the schema explicitly allows them.",
        "",
    ]
    .join("\n")
}

fn agent_html_examples_reference_content() -> String {
    [
        "# AgentHTML Examples",
        "",
        "Use these pattern names as orientation before drafting new structure.",
        "",
        "## Valid Patterns",
        "",
        "- `minimal-page`: root Page with a single Section.",
        "- `card-tabs-grid`: Cards inside Grid with nested Tabs.",
        "- `complex-dashboard`: mixed layout, cards, metrics, and charts.",
        "- `timeline-basic`: Timeline with status and optional icon attrs.",
        "- `kanban-basic`: Kanban columns and items with stable values.",
        "- `codeblock-basic`: CodeBlock with raw code text.",
        "- `image-basic`: Image with src, alt, and fit.",
        "",
        "## Invalid Patterns",
        "",
        "- Bare text directly under `Page`, `Section`, `Stack`, `Cluster`, or `Grid`.",
        "- Unknown tags or attrs.",
        "- JSX expressions, imports, hooks, `class`, `className`, or `style`.",
        "- Missing required attrs like `Page:title`, `Image:src`, or `Image:alt`.",
        "- Invalid enum attrs such as unknown variants, widths, status, or language values.",
        "- Unknown Lucide icon names.",
        "",
    ]
    .join("\n")
}

fn agent_html_icons_reference_content() -> String {
    [
        "# AgentHTML Icons",
        "",
        "`Icon:name=string -> none` uses Lucide icon names.",
        "",
        "Do not guess icon names. Search with:",
        "",
        "```bash",
        "python .agents/skills/agent-html/scripts/search_icons.py \"alert\"",
        "```",
        "",
        "Prefer exact returned names such as `alert-circle`, `check`, or `sparkles`.",
        "",
    ]
    .join("\n")
}

fn agent_html_search_icons_script_content() -> String {
    [
        "from pathlib import Path",
        "import re",
        "import sys",
        "",
        "",
        "def load_icon_names() -> list[str]:",
        "    repo_root = Path(__file__).resolve().parents[3]",
        "    dynamic_file = repo_root / \"node_modules\" / \"lucide-react\" / \"dist\" / \"esm\" / \"dynamicIconImports.mjs\"",
        "    text = dynamic_file.read_text(encoding=\"utf-8\")",
        "    return re.findall(r'\"([^\"]+)\": \\(\\) => import', text)",
        "",
        "",
        "def search_icons(query: str, limit: int = 24) -> list[str]:",
        "    names = load_icon_names()",
        "    query = query.strip().lower()",
        "    if not query:",
        "        return names[:limit]",
        "",
        "    exact = [name for name in names if name == query]",
        "    prefix = [name for name in names if name != query and name.startswith(query)]",
        "    contains = [",
        "        name",
        "        for name in names",
        "        if name != query and not name.startswith(query) and query in name",
        "    ]",
        "    return (exact + prefix + contains)[:limit]",
        "",
        "",
        "def main() -> int:",
        "    query = sys.argv[1] if len(sys.argv) > 1 else \"\"",
        "    for name in search_icons(query):",
        "        print(name)",
        "    return 0",
        "",
        "",
        "if __name__ == \"__main__\":",
        "    raise SystemExit(main())",
        "",
    ]
    .join("\n")
}

fn write_text_if_missing(path: &Path, content: &str) -> WorkspaceResult<()> {
    if path.exists() {
        return Ok(());
    }

    if let Some(parent) = path.parent() {
        std::fs::create_dir_all(parent)?;
    }
    std::fs::write(path, content)?;
    Ok(())
}

fn is_agenthtml_managed_skill(content: &str) -> bool {
    content.contains("name: agent-html")
        && (content.contains("This skill is the Codex bridge for the AgentHTML runtime contract.")
            || content.contains("Use when Codex needs to compose XML-like preview layouts"))
}

fn is_agenthtml_managed_root_instructions(content: &str) -> bool {
    content.starts_with("# AgentHTML World\n")
        && content.contains("This directory is the AgentHTML workspace root.")
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
    source: String,
) -> WorkspaceResult<ProjectSectionDocument> {
    store.update_project_section_document(&project_id, &section_id, &source)
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
    block_path: Option<String>,
    document_path: Option<String>,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    store.upsert_project_codex_thread_link(
        &project_id,
        &thread_id,
        section_id.as_deref(),
        block_path.as_deref(),
        document_path.as_deref(),
    )
}

#[tauri::command]
pub(crate) fn touch_project_codex_thread_link(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    thread_id: String,
    section_id: Option<String>,
    block_path: Option<String>,
    document_path: Option<String>,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    store.touch_project_codex_thread_link(
        &project_id,
        &thread_id,
        section_id.as_deref(),
        block_path.as_deref(),
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

#[tauri::command]
pub(crate) fn get_root_agents_instructions(
    store: State<'_, WorkspaceStore>,
) -> WorkspaceResult<String> {
    store.get_root_agents_instructions()
}

#[tauri::command]
pub(crate) fn update_root_agents_instructions(
    store: State<'_, WorkspaceStore>,
    source: String,
) -> WorkspaceResult<String> {
    store.update_root_agents_instructions(&source)
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
            documents: DocumentStore::new(temp_dir.path().to_path_buf()),
        };
        store.initialize().expect("initialize workspace store");
        TestWorkspace {
            _temp_dir: temp_dir,
            store,
        }
    }

    #[test]
    fn opens_workspace_under_agent_world_root() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        let instructions =
            std::fs::read_to_string(root.join("AGENTS.md")).expect("read root instructions");

        assert!(WorkspaceStore::database_path(&root).exists());
        assert!(root.join("AGENTS.md").exists());
        assert!(!root.join(".agent-world").join("AGENTS.md").exists());
        assert!(
            instructions.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`")
        );
        assert!(instructions.contains("Use the `$agent-html` skill"));
        assert!(instructions.contains("The `agent-html` skill is the Codex bridge"));
        assert!(!instructions.contains("agent-html-prompt-schema.md"));
        assert!(!instructions.contains(".agent-world/tmp/agent-html-prompt-schema.md"));
        assert!(!instructions.contains("Edit `.agent-html` artifacts"));
        let skill_path = root
            .join(".agents")
            .join("skills")
            .join("agent-html")
            .join("SKILL.md");
        let skill = std::fs::read_to_string(skill_path).expect("read agent-html skill");
        assert!(skill.contains("name: agent-html"));
        assert!(skill.contains("Read `references/prompt-schema.md`"));
        assert!(root
            .join(".agents")
            .join("skills")
            .join("agent-html")
            .join("references")
            .join("examples.md")
            .exists());
        assert!(root
            .join(".agents")
            .join("skills")
            .join("agent-html")
            .join("references")
            .join("icons.md")
            .exists());
        assert!(root
            .join(".agents")
            .join("skills")
            .join("agent-html")
            .join("scripts")
            .join("search_icons.py")
            .exists());
        assert!(store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .join("installation")
            .join("artifact.agent-html")
            .exists());
    }

    #[test]
    fn opening_workspace_preserves_custom_agent_html_skill() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let skill_dir = root.join(".agents").join("skills").join("agent-html");
        let references_dir = skill_dir.join("references");
        let scripts_dir = skill_dir.join("scripts");
        std::fs::create_dir_all(&skill_dir).expect("create skill dir");
        std::fs::create_dir_all(&references_dir).expect("create references dir");
        std::fs::create_dir_all(&scripts_dir).expect("create scripts dir");
        std::fs::write(skill_dir.join("SKILL.md"), "# Custom AgentHTML Skill\n")
            .expect("write custom skill");
        std::fs::write(references_dir.join("examples.md"), "# Custom Examples\n")
            .expect("write custom examples");
        std::fs::write(references_dir.join("icons.md"), "# Custom Icons\n")
            .expect("write custom icons");
        std::fs::write(scripts_dir.join("search_icons.py"), "print('custom')\n")
            .expect("write custom icon script");

        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let skill = std::fs::read_to_string(skill_dir.join("SKILL.md")).expect("read skill");

        assert_eq!(skill, "# Custom AgentHTML Skill\n");
        assert!(skill_dir.join("references").exists());
        assert_eq!(
            std::fs::read_to_string(references_dir.join("examples.md"))
                .expect("read custom examples"),
            "# Custom Examples\n"
        );
        assert_eq!(
            std::fs::read_to_string(references_dir.join("icons.md")).expect("read custom icons"),
            "# Custom Icons\n"
        );
        assert_eq!(
            std::fs::read_to_string(scripts_dir.join("search_icons.py"))
                .expect("read custom icon script"),
            "print('custom')\n"
        );
    }

    #[test]
    fn opening_workspace_updates_old_managed_agent_html_skill() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let skill_dir = root.join(".agents").join("skills").join("agent-html");
        std::fs::create_dir_all(&skill_dir).expect("create skill dir");
        std::fs::write(
            skill_dir.join("SKILL.md"),
            [
                "---",
                "name: agent-html",
                "description: Use when Codex needs to compose XML-like preview layouts.",
                "---",
                "",
                "# AgentHTML",
                "",
                "Use raw fixture files when drafting artifacts.",
                "",
            ]
            .join("\n"),
        )
        .expect("write old managed skill");

        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let skill = std::fs::read_to_string(skill_dir.join("SKILL.md")).expect("read skill");

        assert!(skill.contains("Read `references/prompt-schema.md`"));
        assert!(skill.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`"));
        assert!(!skill.contains("Use raw fixture files"));
        assert!(skill_dir.join("references").join("examples.md").exists());
        assert!(skill_dir.join("references").join("icons.md").exists());
        assert!(skill_dir.join("scripts").join("search_icons.py").exists());
    }

    #[test]
    fn reads_and_updates_root_agents_instructions() {
        let workspace = test_store();
        let store = &workspace.store;

        let initial = store
            .get_root_agents_instructions()
            .expect("read root AGENTS.md");
        assert!(initial.contains("# AgentHTML World"));

        let updated = store
            .update_root_agents_instructions("# Custom Rules\n\n- Keep it scoped.\n")
            .expect("update root AGENTS.md");

        assert_eq!(updated, "# Custom Rules\n\n- Keep it scoped.\n");
        assert_eq!(
            std::fs::read_to_string(store.document_root().join("AGENTS.md"))
                .expect("read updated AGENTS.md"),
            updated
        );
    }

    #[test]
    fn opening_workspace_updates_old_managed_root_instructions() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        std::fs::create_dir_all(&root).expect("create workspace root");
        std::fs::write(
            root.join("AGENTS.md"),
            [
                "# AgentHTML World",
                "",
                "This directory is the AgentHTML workspace root.",
                "",
                "- Edit `.agent-html` artifacts when changing user-facing workspace content.",
                "",
            ]
            .join("\n"),
        )
        .expect("write old managed root instructions");

        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let instructions =
            std::fs::read_to_string(root.join("AGENTS.md")).expect("read root instructions");

        assert!(
            instructions.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`")
        );
        assert!(!instructions.contains("Edit `.agent-html` artifacts"));
    }

    #[test]
    fn opening_workspace_preserves_custom_root_instructions() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        std::fs::create_dir_all(&root).expect("create workspace root");
        std::fs::write(
            root.join("AGENTS.md"),
            "# Team Rules\n\nKeep project-specific instructions here.\n",
        )
        .expect("write custom root instructions");

        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let instructions =
            std::fs::read_to_string(root.join("AGENTS.md")).expect("read root instructions");

        assert_eq!(
            instructions,
            "# Team Rules\n\nKeep project-specific instructions here.\n"
        );
    }

    #[test]
    fn opening_workspace_removes_old_managed_agent_world_instructions() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let world_dir = root.join(".agent-world");
        std::fs::create_dir_all(&world_dir).expect("create internal workspace dir");
        std::fs::write(
            world_dir.join("AGENTS.md"),
            [
                "# AgentHTML World",
                "",
                "This directory is the AgentHTML workspace root.",
                "",
            ]
            .join("\n"),
        )
        .expect("write old managed internal instructions");

        WorkspaceStore::open(root.clone()).expect("open workspace root");

        assert!(!world_dir.join("AGENTS.md").exists());
    }

    #[test]
    fn opening_workspace_preserves_custom_agent_world_instructions() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let world_dir = root.join(".agent-world");
        std::fs::create_dir_all(&world_dir).expect("create internal workspace dir");
        std::fs::write(
            world_dir.join("AGENTS.md"),
            "# Internal Team Notes\n\nKeep this local override.\n",
        )
        .expect("write custom internal instructions");

        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let instructions =
            std::fs::read_to_string(world_dir.join("AGENTS.md")).expect("read internal notes");

        assert_eq!(
            instructions,
            "# Internal Team Notes\n\nKeep this local override.\n"
        );
    }

    #[test]
    fn document_table_does_not_store_source() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        WorkspaceStore::open(root.clone()).expect("open workspace root");
        let connection =
            Connection::open(WorkspaceStore::database_path(&root)).expect("open workspace db");
        let mut statement = connection
            .prepare("PRAGMA table_info(project_section_documents)")
            .expect("prepare table info");
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .expect("query columns")
            .collect::<Result<Vec<_>, _>>()
            .expect("collect columns");

        assert!(!columns.iter().any(|column| column == "ahtml_source"));
        assert_eq!(
            columns,
            vec!["project_id", "section_id", "created_at", "updated_at"]
        );
        assert!(!sqlite_table_exists(
            &connection,
            "project_section_documents_next"
        ));
    }

    #[test]
    fn opening_old_document_table_drops_stored_source() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let db_dir = root.join(".agent-world");
        std::fs::create_dir_all(&db_dir).expect("create workspace db dir");
        let connection =
            Connection::open(WorkspaceStore::database_path(&root)).expect("open workspace db");
        connection
            .execute_batch(
                "
                CREATE TABLE projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE project_sections (
                    id TEXT NOT NULL,
                    project_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    group_title TEXT NOT NULL,
                    sort_order INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (project_id, id)
                );
                CREATE TABLE project_section_documents (
                    project_id TEXT NOT NULL,
                    section_id TEXT NOT NULL,
                    ahtml_source TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (project_id, section_id)
                );
                INSERT INTO projects
                    (id, name, slug, created_at, updated_at)
                VALUES
                    ('old-project', 'Old Project', 'old-project', 'old', 'old');
                INSERT INTO project_sections
                    (id, project_id, title, group_title, sort_order, created_at, updated_at)
                VALUES
                    ('old-section', 'old-project', 'Old Section', 'Old', 0, 'old', 'old');
                INSERT INTO project_section_documents
                    (project_id, section_id, ahtml_source, created_at, updated_at)
                VALUES
                    ('old-project', 'old-section', '<Page title=\"Old DB Source\" />', 'old', 'old');
                ",
            )
            .expect("create old workspace schema");
        drop(connection);

        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        let connection =
            Connection::open(WorkspaceStore::database_path(&root)).expect("open workspace db");
        let mut statement = connection
            .prepare("PRAGMA table_info(project_section_documents)")
            .expect("prepare table info");
        let columns = statement
            .query_map([], |row| row.get::<_, String>(1))
            .expect("query columns")
            .collect::<Result<Vec<_>, _>>()
            .expect("collect columns");

        assert!(!columns.iter().any(|column| column == "ahtml_source"));
        let document = store
            .get_project_section_document("old-project", "old-section")
            .expect("read regenerated artifact");
        assert!(!document.source.contains("Old DB Source"));
        assert!(document.source.contains("Old Project"));
        assert!(document.file_path.ends_with("artifact.agent-html"));
        assert!(!sqlite_table_exists(
            &connection,
            "project_section_documents_next"
        ));
    }

    #[test]
    fn opening_old_thread_table_renames_ahtml_path_to_block_path() {
        let temp_dir = tempfile::tempdir().expect("create temp workspace");
        let root = temp_dir.path().join("AgentHTML");
        let db_dir = root.join(".agent-world");
        std::fs::create_dir_all(&db_dir).expect("create workspace db dir");
        let connection =
            Connection::open(WorkspaceStore::database_path(&root)).expect("open workspace db");
        connection
            .execute_batch(
                "
                CREATE TABLE projects (
                    id TEXT PRIMARY KEY,
                    name TEXT NOT NULL,
                    slug TEXT NOT NULL UNIQUE,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL
                );
                CREATE TABLE project_sections (
                    id TEXT NOT NULL,
                    project_id TEXT NOT NULL,
                    title TEXT NOT NULL,
                    group_title TEXT NOT NULL,
                    sort_order INTEGER NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (project_id, id)
                );
                CREATE TABLE project_section_documents (
                    project_id TEXT NOT NULL,
                    section_id TEXT NOT NULL,
                    created_at TEXT NOT NULL,
                    updated_at TEXT NOT NULL,
                    PRIMARY KEY (project_id, section_id)
                );
                CREATE TABLE project_codex_threads (
                    thread_id TEXT PRIMARY KEY,
                    project_id TEXT NOT NULL,
                    origin TEXT NOT NULL DEFAULT 'agent-html',
                    last_section_id TEXT,
                    last_ahtml_path TEXT,
                    last_document_path TEXT,
                    created_at TEXT NOT NULL,
                    last_used_at TEXT NOT NULL
                );
                INSERT INTO projects
                    (id, name, slug, created_at, updated_at)
                VALUES
                    ('old-project', 'Old Project', 'old-project', 'old', 'old');
                INSERT INTO project_codex_threads
                    (thread_id, project_id, origin, last_section_id, last_ahtml_path,
                     last_document_path, created_at, last_used_at)
                VALUES
                    ('thr_old', 'old-project', 'agent-html', 'old-section',
                     '/Page/Section[0]', 'projects/old-project/old-section/artifact.agent-html',
                     'old', 'old');
                ",
            )
            .expect("create old thread schema");
        drop(connection);

        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        let connection =
            Connection::open(WorkspaceStore::database_path(&root)).expect("open workspace db");
        let columns = sqlite_table_columns(&connection, "project_codex_threads");
        let link = store
            .list_project_codex_threads("old-project")
            .expect("list migrated links")
            .into_iter()
            .find(|link| link.thread_id == "thr_old")
            .expect("find migrated link");

        assert!(columns.iter().any(|column| column == "last_block_path"));
        assert!(!columns.iter().any(|column| column == "last_ahtml_path"));
        assert_eq!(link.last_block_path.as_deref(), Some("/Page/Section[0]"));
    }

    fn sqlite_table_exists(connection: &Connection, table_name: &str) -> bool {
        connection
            .query_row(
                "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1",
                [table_name],
                |_| Ok(()),
            )
            .is_ok()
    }

    fn sqlite_table_columns(connection: &Connection, table_name: &str) -> Vec<String> {
        let mut statement = connection
            .prepare(&format!("PRAGMA table_info({table_name})"))
            .expect("prepare table info");
        statement
            .query_map([], |row| row.get::<_, String>(1))
            .expect("query columns")
            .collect::<Result<Vec<_>, _>>()
            .expect("collect columns")
    }

    fn read_json(path: impl AsRef<Path>) -> serde_json::Value {
        serde_json::from_str(&std::fs::read_to_string(path.as_ref()).expect("read metadata json"))
            .expect("parse metadata json")
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
        assert!(document.source.contains("<Page"));
        assert!(
            document
                .file_path
                .ends_with("projects\\design-engineering\\installation\\artifact.agent-html")
                || document
                    .file_path
                    .ends_with("projects/design-engineering/installation/artifact.agent-html")
        );
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read document source file"),
            document.source
        );
        assert_eq!(
            read_json(
                store
                    .document_root()
                    .join("projects")
                    .join("design-engineering")
                    .join("project.json")
            )["id"],
            "design-engineering"
        );
        assert_eq!(
            read_json(
                store
                    .document_root()
                    .join("projects")
                    .join("design-engineering")
                    .join("installation")
                    .join("section.json")
            )["id"],
            "installation"
        );
    }

    #[test]
    fn reads_existing_file_as_document_source() {
        let workspace = test_store();
        let store = &workspace.store;
        let document_path = store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .join("installation")
            .join("artifact.agent-html");
        std::fs::create_dir_all(document_path.parent().expect("document parent"))
            .expect("create document parent");
        std::fs::write(&document_path, "<Page title=\"File Source\" />")
            .expect("write file source");

        let document = store
            .get_project_section_document("design-engineering", "installation")
            .expect("read document");

        assert_eq!(document.source, "<Page title=\"File Source\" />");
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
        assert!(document.source.contains("agent-html"));
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
    fn returns_error_when_artifact_file_is_missing() {
        let workspace = test_store();
        let store = &workspace.store;
        let document_path = store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .join("installation")
            .join("artifact.agent-html");
        std::fs::remove_file(document_path).expect("remove artifact file");

        let error = store
            .get_project_section_document("design-engineering", "installation")
            .expect_err("missing artifact should fail");

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
        assert!(document.source.contains("Research Notes"));
        assert!(document.source.contains("Blank project"));
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read created document file"),
            document.source
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
        assert!(!store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .exists());
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
        assert!(document.source.contains("Release Notes"));
        assert!(document.source.contains("Blank section"));
        assert!(store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .join("release-notes")
            .join("artifact.agent-html")
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
            .join("projects")
            .join(&project.id)
            .join("overview")
            .join("artifact.agent-html")
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
        assert_eq!(document.source, source);
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

        assert_eq!(document.source, source);
        assert_eq!(
            std::fs::read_to_string(&document.file_path).expect("read updated document file"),
            source
        );
        assert_eq!(document.updated_at, "2026-05-27T00:00:00.000Z");
    }

    #[test]
    fn writes_atomic_temp_files_under_agent_world_tmp() {
        let workspace = test_store();
        let store = &workspace.store;
        let source = "<Page title=\"Temp Location\" />";
        let section_path = store
            .document_root()
            .join("projects")
            .join("design-engineering")
            .join("installation");

        store
            .update_project_section_document("design-engineering", "installation", source)
            .expect("update document");

        let section_entries = std::fs::read_dir(&section_path)
            .expect("read section directory")
            .map(|entry| {
                entry
                    .expect("read section directory entry")
                    .file_name()
                    .to_string_lossy()
                    .to_string()
            })
            .collect::<Vec<_>>();
        assert!(section_entries.contains(&"artifact.agent-html".to_string()));
        assert!(section_entries.contains(&"section.json".to_string()));
        assert!(!section_entries.iter().any(|name| name.ends_with(".tmp")));
        let temp_dir = store.document_root().join(".agent-world").join("tmp");
        assert!(temp_dir.exists());
        assert_eq!(
            std::fs::read_dir(temp_dir)
                .expect("read workspace temp directory")
                .count(),
            0
        );
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
        assert_eq!(link.last_block_path.as_deref(), Some("/Page/Section[0]"));
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
