
use super::resources::agent_html_skill_resources;
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
    assert!(instructions.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`"));
    assert!(instructions.contains(
            "Use workspace-root-relative paths for workspace files; read the AgentHTML skill at `.agents/skills/agent-html/SKILL.md`."
        ));
    assert!(instructions.contains("Use the `$agent-html` skill"));
    assert!(instructions.contains("The `agent-html` skill is the Codex bridge"));
    assert!(!instructions.contains("agent-html-prompt-schema.md"));
    assert!(!instructions.contains(".agent-world/tmp/agent-html-prompt-schema.md"));
    assert!(!instructions.contains("Edit `.agent-html` artifacts"));
    assert!(!instructions.contains(".agent/"));
    let skill_path = root
        .join(".agents")
        .join("skills")
        .join("agent-html")
        .join("SKILL.md");
    let skill = std::fs::read_to_string(skill_path).expect("read agent-html skill");
    assert!(skill.contains("name: agent-html"));
    assert!(skill.contains("Read `.agents/skills/agent-html/references/prompt-schema.md`"));
    assert!(skill.contains("Use `.agents/skills/agent-html/scripts/search_icons.py \"<query>\"`"));
    assert!(!skill.contains("`references/prompt-schema.md`"));
    assert!(!skill.contains("`references/examples.md`"));
    assert!(!skill.contains("`scripts/search_icons.py"));
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
        .join("references")
        .join("icon-names.txt")
        .exists());
    assert!(root
        .join(".agents")
        .join("skills")
        .join("agent-html")
        .join("scripts")
        .join("search_icons.py")
        .exists());
    assert!(root
        .join(".agents")
        .join("skills")
        .join("agent-html")
        .join("agents")
        .join("openai.yaml")
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
    let agents_dir = skill_dir.join("agents");
    std::fs::create_dir_all(&skill_dir).expect("create skill dir");
    std::fs::create_dir_all(&references_dir).expect("create references dir");
    std::fs::create_dir_all(&scripts_dir).expect("create scripts dir");
    std::fs::create_dir_all(&agents_dir).expect("create agents dir");
    std::fs::write(skill_dir.join("SKILL.md"), "# Custom AgentHTML Skill\n")
        .expect("write custom skill");
    std::fs::write(references_dir.join("examples.md"), "# Custom Examples\n")
        .expect("write custom examples");
    std::fs::write(references_dir.join("icons.md"), "# Custom Icons\n")
        .expect("write custom icons");
    std::fs::write(references_dir.join("icon-names.txt"), "custom-icon\n")
        .expect("write custom icon names");
    std::fs::write(scripts_dir.join("search_icons.py"), "print('custom')\n")
        .expect("write custom icon script");
    std::fs::write(
        agents_dir.join("openai.yaml"),
        "interface:\n  custom: true\n",
    )
    .expect("write custom openai agent");

    WorkspaceStore::open(root.clone()).expect("open workspace root");
    let skill = std::fs::read_to_string(skill_dir.join("SKILL.md")).expect("read skill");

    assert_eq!(skill, "# Custom AgentHTML Skill\n");
    assert!(skill_dir.join("references").exists());
    assert_eq!(
        std::fs::read_to_string(references_dir.join("examples.md")).expect("read custom examples"),
        "# Custom Examples\n"
    );
    assert_eq!(
        std::fs::read_to_string(references_dir.join("icons.md")).expect("read custom icons"),
        "# Custom Icons\n"
    );
    assert_eq!(
        std::fs::read_to_string(references_dir.join("icon-names.txt"))
            .expect("read custom icon names"),
        "custom-icon\n"
    );
    assert_eq!(
        std::fs::read_to_string(scripts_dir.join("search_icons.py"))
            .expect("read custom icon script"),
        "print('custom')\n"
    );
    assert_eq!(
        std::fs::read_to_string(agents_dir.join("openai.yaml")).expect("read custom openai agent"),
        "interface:\n  custom: true\n"
    );
}

#[test]
fn opening_workspace_updates_old_managed_agent_html_skill() {
    let temp_dir = tempfile::tempdir().expect("create temp workspace");
    let root = temp_dir.path().join("AgentHTML");
    let skill_dir = root.join(".agents").join("skills").join("agent-html");
    let references_dir = skill_dir.join("references");
    let scripts_dir = skill_dir.join("scripts");
    let agents_dir = skill_dir.join("agents");
    std::fs::create_dir_all(&skill_dir).expect("create skill dir");
    std::fs::create_dir_all(&references_dir).expect("create references dir");
    std::fs::create_dir_all(&scripts_dir).expect("create scripts dir");
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
    std::fs::write(
        references_dir.join("icons.md"),
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
        ]
        .join("\n"),
    )
    .expect("write old managed icons");
    std::fs::write(
            scripts_dir.join("search_icons.py"),
            [
                "from pathlib import Path",
                "import re",
                "import sys",
                "",
                "def load_icon_names() -> list[str]:",
                "    repo_root = Path(__file__).resolve().parents[3]",
                "    dynamic_file = repo_root / \"node_modules\" / \"lucide-react\" / \"dist\" / \"esm\" / \"dynamicIconImports.mjs\"",
                "    text = dynamic_file.read_text(encoding=\"utf-8\")",
                "    return re.findall(r'\"([^\"]+)\": \\(\\) => import', text)",
                "",
                "def search_icons(query: str, limit: int = 24) -> list[str]:",
                "    return []",
                "",
            ]
            .join("\n"),
        )
        .expect("write old managed icon script");

    WorkspaceStore::open(root.clone()).expect("open workspace root");
    let skill = std::fs::read_to_string(skill_dir.join("SKILL.md")).expect("read skill");
    let icons = std::fs::read_to_string(references_dir.join("icons.md")).expect("read icons ref");
    let script = std::fs::read_to_string(scripts_dir.join("search_icons.py")).expect("read script");
    let icon_names =
        std::fs::read_to_string(references_dir.join("icon-names.txt")).expect("read icon names");
    let openai_agent =
        std::fs::read_to_string(agents_dir.join("openai.yaml")).expect("read openai agent");

    assert!(skill.contains("Read `.agents/skills/agent-html/references/prompt-schema.md`"));
    assert!(skill.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`"));
    assert!(!skill.contains("Use raw fixture files"));
    assert!(icons.contains("Runtime workspaces do not"));
    assert!(icon_names.contains("workflow"));
    assert!(script.contains("bundled_icon_names_path"));
    assert!(!script.contains("def find_repo_root"));
    assert!(!script.contains("def lucide_metadata_candidates"));
    assert!(!script.contains("dynamicIconImports.mjs"));
    assert!(!script.contains("def read_metadata_text"));
    assert!(!script.contains("node_modules"));
    assert!(!script.contains("parents[3]"));
    assert!(openai_agent.contains("display_name: \"Agent HTML\""));
    for resource in agent_html_skill_resources() {
        assert!(skill_dir.join(resource.relative_path).exists());
    }
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
fn persists_company_agent_active_thread() {
    let workspace = test_store();
    let store = &workspace.store;

    let initial = store
        .get_company_agent_state()
        .expect("read initial company agent state");

    assert_eq!(initial.active_thread_id, None);

    let updated = store
        .update_company_agent_state(Some("thr_company"))
        .expect("update company agent state");

    assert_eq!(updated.active_thread_id.as_deref(), Some("thr_company"));

    let reloaded = store
        .get_company_agent_state()
        .expect("reload company agent state");

    assert_eq!(reloaded.active_thread_id.as_deref(), Some("thr_company"));
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

    assert!(instructions.contains("Edit `projects/{project-id}/{section-id}/artifact.agent-html`"));
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

fn sqlite_table_exists(connection: &Connection, table_name: &str) -> bool {
    connection
        .query_row(
            "SELECT 1 FROM sqlite_master WHERE type = 'table' AND name = ?1",
            [table_name],
            |_| Ok(()),
        )
        .is_ok()
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
    assert!(document.source.contains("<Cell"));
    assert!(document.source.contains("<Block"));
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
    let source = "<Cell title=\"File Source\"><Stack><Block></Block></Stack></Cell>";
    std::fs::write(&document_path, source).expect("write file source");

    let document = store
        .get_project_section_document("design-engineering", "installation")
        .expect("read document");

    assert_eq!(document.source, source);
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
    assert_eq!(
        document.source,
        super::seed::introduce_agent_html_source()
    );
    assert!(document.source.matches("<Block>").count() > 1);

    let zh_document = store
        .get_project_section_document("agent-html-example", "introduce-agent-html-zh")
        .expect("read Chinese introduce document");
    assert_eq!(
        zh_document.source,
        super::seed::introduce_agent_html_zh_source()
    );
    assert!(zh_document.source.matches("<Block>").count() > 1);
}

#[test]
fn opening_workspace_updates_old_managed_introduce_example_source() {
    let temp_dir = tempfile::tempdir().expect("create temp workspace");
    let root = temp_dir.path().join("AgentHTML");
    {
        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        let old_source = [
            "<Cell title=\"agent-html\">",
            "  <Block>",
            "    <Section width=\"content\">",
            "      <Stack>",
            "        <Text variant=\"muted\">This preview is interactive. Use the page itself to feel how agent-html turns layout nodes into Notion-like blocks.</Text>",
            "        <Separator />",
            "        <Text variant=\"small\">Hover any section until the left-side controls fade in.</Text>",
            "      </Stack>",
            "    </Section>",
            "  </Block>",
            "</Cell>",
        ]
        .join("\n");
        store
            .update_project_section_document(
                "agent-html-example",
                "introduce-agent-html",
                &old_source,
            )
            .expect("write old managed source");
    }

    let store = WorkspaceStore::open(root).expect("reopen workspace root");
    let document = store
        .get_project_section_document("agent-html-example", "introduce-agent-html")
        .expect("read synced introduce document");

    assert_eq!(
        document.source,
        super::seed::introduce_agent_html_source()
    );
    assert!(document.source.matches("<Block>").count() > 1);
}

#[test]
fn opening_workspace_updates_old_managed_chinese_introduce_example_source() {
    let temp_dir = tempfile::tempdir().expect("create temp workspace");
    let root = temp_dir.path().join("AgentHTML");
    {
        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        let old_source = [
            "<Cell title=\"agent-html\">",
            "  <Block>",
            "    <Section width=\"content\">",
            "      <Stack>",
            "        <Text variant=\"muted\">这个预览不是静态页面。直接在页面里操作，感受 agent-html 如何把布局节点变成类似 Notion 的可交互块。</Text>",
            "        <Separator />",
            "        <Text variant=\"small\">悬停任意区块，直到左侧控制按钮渐显。</Text>",
            "      </Stack>",
            "    </Section>",
            "  </Block>",
            "</Cell>",
        ]
        .join("\n");
        store
            .update_project_section_document(
                "agent-html-example",
                "introduce-agent-html-zh",
                &old_source,
            )
            .expect("write old managed Chinese source");
    }

    let store = WorkspaceStore::open(root).expect("reopen workspace root");
    let document = store
        .get_project_section_document("agent-html-example", "introduce-agent-html-zh")
        .expect("read synced Chinese introduce document");

    assert_eq!(
        document.source,
        super::seed::introduce_agent_html_zh_source()
    );
    assert!(document.source.matches("<Block>").count() > 1);
}

#[test]
fn opening_workspace_preserves_custom_introduce_example_source() {
    let temp_dir = tempfile::tempdir().expect("create temp workspace");
    let root = temp_dir.path().join("AgentHTML");
    let custom_source = "<Cell title=\"agent-html\"><Stack><Block><Text>Custom edited content.</Text></Block></Stack></Cell>";
    {
        let store = WorkspaceStore::open(root.clone()).expect("open workspace root");
        store
            .update_project_section_document(
                "agent-html-example",
                "introduce-agent-html",
                custom_source,
            )
            .expect("write custom source");
    }

    let store = WorkspaceStore::open(root).expect("reopen workspace root");
    let document = store
        .get_project_section_document("agent-html-example", "introduce-agent-html")
        .expect("read preserved introduce document");

    assert_eq!(document.source, custom_source);
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
    let source = "<Cell title=\"Saved Copy\"><Stack><Block></Block></Stack></Cell>";
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
    let source = r#"<Cell title="Updated">
  <Stack>
    <Block>
      <Section width="content">
        <Text variant="h1">Updated</Text>
      </Section>
    </Block>
  </Stack>
</Cell>"#;

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
    let source = "<Cell title=\"Temp Location\"><Stack><Block></Block></Stack></Cell>";
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
        .update_project_section_document(
            "design-engineering",
            "missing",
            "<Cell title=\"Missing\"><Stack><Block></Block></Stack></Cell>",
        )
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
            Some("/Cell/Block[0]"),
            Some("D:\\workspace\\installation.agent-html"),
        )
        .expect("link thread");

    assert_eq!(link.thread_id, "thr_project");
    assert_eq!(link.project_id, "design-engineering");
    assert_eq!(link.last_section_id.as_deref(), Some("installation"));
    assert_eq!(link.last_block_path.as_deref(), Some("/Cell/Block[0]"));
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
