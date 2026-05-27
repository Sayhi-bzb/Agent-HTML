use std::fs;
use std::path::PathBuf;
use std::sync::Mutex;

use rusqlite::{params, Connection, OptionalExtension};
use serde::Serialize;
use tauri::{Manager, State};
use thiserror::Error;

#[derive(Debug, Error)]
enum WorkspaceError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("document not found for {project_id}/{section_id}")]
    DocumentNotFound {
        project_id: String,
        section_id: String,
    },
    #[error("unable to resolve app data directory")]
    MissingAppDataDir,
    #[error("project name is required")]
    ProjectNameRequired,
}

impl Serialize for WorkspaceError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

type WorkspaceResult<T> = Result<T, WorkspaceError>;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceProject {
    id: String,
    name: String,
    slug: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceProjectView {
    id: String,
    name: String,
    slug: String,
    sections: Vec<WorkspaceSection>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct WorkspaceSection {
    group_title: String,
    id: String,
    project_id: String,
    sort_order: i64,
    title: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
struct ProjectSectionDocument {
    ahtml_source: String,
    project_id: String,
    section_id: String,
    updated_at: String,
}

struct WorkspaceStore {
    connection: Mutex<Connection>,
}

impl WorkspaceStore {
    fn open(path: PathBuf) -> WorkspaceResult<Self> {
        if let Some(parent) = path.parent() {
            fs::create_dir_all(parent)?;
        }

        let connection = Connection::open(path)?;
        let store = Self {
            connection: Mutex::new(connection),
        };
        store.initialize()?;

        Ok(store)
    }

    fn initialize(&self) -> WorkspaceResult<()> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        create_schema(&connection)?;
        seed_if_empty(&connection)?;
        Ok(())
    }

    fn list_projects(&self) -> WorkspaceResult<Vec<WorkspaceProject>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        let mut statement = connection
            .prepare("SELECT id, name, slug FROM projects ORDER BY created_at ASC, id ASC")?;
        let rows = statement.query_map([], |row| {
            Ok(WorkspaceProject {
                id: row.get(0)?,
                name: row.get(1)?,
                slug: row.get(2)?,
            })
        })?;

        collect_rows(rows)
    }

    fn list_project_sections(&self, project_id: &str) -> WorkspaceResult<Vec<WorkspaceSection>> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        let mut statement = connection.prepare(
            "SELECT id, project_id, title, group_title, sort_order
             FROM project_sections
             WHERE project_id = ?1
             ORDER BY sort_order ASC, id ASC",
        )?;
        let rows = statement.query_map([project_id], |row| {
            Ok(WorkspaceSection {
                id: row.get(0)?,
                project_id: row.get(1)?,
                title: row.get(2)?,
                group_title: row.get(3)?,
                sort_order: row.get(4)?,
            })
        })?;

        collect_rows(rows)
    }

    fn get_project_section_document(
        &self,
        project_id: &str,
        section_id: &str,
    ) -> WorkspaceResult<ProjectSectionDocument> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        let document = connection
            .query_row(
                "SELECT project_id, section_id, ahtml_source, updated_at
                 FROM project_section_documents
                 WHERE project_id = ?1 AND section_id = ?2",
                params![project_id, section_id],
                |row| {
                    Ok(ProjectSectionDocument {
                        project_id: row.get(0)?,
                        section_id: row.get(1)?,
                        ahtml_source: row.get(2)?,
                        updated_at: row.get(3)?,
                    })
                },
            )
            .optional()?;

        document.ok_or_else(|| WorkspaceError::DocumentNotFound {
            project_id: project_id.to_string(),
            section_id: section_id.to_string(),
        })
    }

    fn create_project(&self, name: &str) -> WorkspaceResult<WorkspaceProjectView> {
        let name = name.trim();
        if name.is_empty() {
            return Err(WorkspaceError::ProjectNameRequired);
        }

        let mut connection = self.connection.lock().expect("workspace db lock poisoned");
        let slug = unique_slug(&connection, name)?;
        let now = current_timestamp();
        let project = WorkspaceProject {
            id: slug.clone(),
            name: name.to_string(),
            slug,
        };
        let section = seed_section(&project.id, "overview", "Overview", "Workspace", 0);
        let ahtml_source = create_blank_project_ahtml_source(&project);

        let transaction = connection.transaction()?;
        transaction.execute(
            "INSERT INTO projects (id, name, slug, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![project.id, project.name, project.slug, now, now],
        )?;
        transaction.execute(
            "INSERT INTO project_sections
             (id, project_id, title, group_title, sort_order, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
            params![
                section.id,
                section.project_id,
                section.title,
                section.group_title,
                section.sort_order,
                now,
                now
            ],
        )?;
        transaction.execute(
            "INSERT INTO project_section_documents
             (project_id, section_id, ahtml_source, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![project.id, section.id, ahtml_source, now, now],
        )?;
        transaction.commit()?;

        Ok(WorkspaceProjectView {
            id: project.id,
            name: project.name,
            slug: project.slug,
            sections: vec![section],
        })
    }

    fn update_project_section_document(
        &self,
        project_id: &str,
        section_id: &str,
        ahtml_source: &str,
    ) -> WorkspaceResult<ProjectSectionDocument> {
        let connection = self.connection.lock().expect("workspace db lock poisoned");
        let exists: Option<i64> = connection
            .query_row(
                "SELECT 1
                 FROM project_section_documents
                 WHERE project_id = ?1 AND section_id = ?2",
                params![project_id, section_id],
                |row| row.get(0),
            )
            .optional()?;

        if exists.is_none() {
            return Err(WorkspaceError::DocumentNotFound {
                project_id: project_id.to_string(),
                section_id: section_id.to_string(),
            });
        }

        let updated_at = current_timestamp();
        connection.execute(
            "UPDATE project_section_documents
             SET ahtml_source = ?3, updated_at = ?4
             WHERE project_id = ?1 AND section_id = ?2",
            params![project_id, section_id, ahtml_source, updated_at],
        )?;

        Ok(ProjectSectionDocument {
            ahtml_source: ahtml_source.to_string(),
            project_id: project_id.to_string(),
            section_id: section_id.to_string(),
            updated_at,
        })
    }
}

fn collect_rows<T>(
    rows: rusqlite::MappedRows<'_, impl FnMut(&rusqlite::Row<'_>) -> rusqlite::Result<T>>,
) -> WorkspaceResult<Vec<T>> {
    let mut values = Vec::new();
    for row in rows {
        values.push(row?);
    }

    Ok(values)
}

fn create_schema(connection: &Connection) -> WorkspaceResult<()> {
    connection.execute_batch(
        "
        CREATE TABLE IF NOT EXISTS projects (
            id TEXT PRIMARY KEY,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL
        );

        CREATE TABLE IF NOT EXISTS project_sections (
            id TEXT NOT NULL,
            project_id TEXT NOT NULL,
            title TEXT NOT NULL,
            group_title TEXT NOT NULL,
            sort_order INTEGER NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (project_id, id),
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS project_section_documents (
            project_id TEXT NOT NULL,
            section_id TEXT NOT NULL,
            ahtml_source TEXT NOT NULL,
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (project_id, section_id),
            FOREIGN KEY (project_id, section_id)
                REFERENCES project_sections(project_id, id)
                ON DELETE CASCADE
        );
        ",
    )?;

    Ok(())
}

fn seed_if_empty(connection: &Connection) -> WorkspaceResult<()> {
    let project_count: i64 =
        connection.query_row("SELECT COUNT(*) FROM projects", [], |row| row.get(0))?;
    if project_count > 0 {
        return Ok(());
    }

    let now = "2026-05-25T00:00:00.000Z";

    for project in seed_projects() {
        connection.execute(
            "INSERT INTO projects (id, name, slug, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4, ?5)",
            params![project.id, project.name, project.slug, now, now],
        )?;

        for section in seed_sections(&project.id) {
            connection.execute(
                "INSERT INTO project_sections
                 (id, project_id, title, group_title, sort_order, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7)",
                params![
                    section.id,
                    section.project_id,
                    section.title,
                    section.group_title,
                    section.sort_order,
                    now,
                    now
                ],
            )?;

            let ahtml_source = create_seed_ahtml_source(&project, &section);
            connection.execute(
                "INSERT INTO project_section_documents
                 (project_id, section_id, ahtml_source, created_at, updated_at)
                 VALUES (?1, ?2, ?3, ?4, ?5)",
                params![project.id, section.id, ahtml_source, now, now],
            )?;
        }
    }

    Ok(())
}

fn seed_projects() -> Vec<WorkspaceProject> {
    vec![
        WorkspaceProject {
            id: "design-engineering".to_string(),
            name: "Design Engineering".to_string(),
            slug: "design-engineering".to_string(),
        },
        WorkspaceProject {
            id: "sales-marketing".to_string(),
            name: "Sales & Marketing".to_string(),
            slug: "sales-marketing".to_string(),
        },
        WorkspaceProject {
            id: "travel".to_string(),
            name: "Travel".to_string(),
            slug: "travel".to_string(),
        },
    ]
}

fn seed_sections(project_id: &str) -> Vec<WorkspaceSection> {
    vec![
        seed_section(
            project_id,
            "installation",
            "Installation",
            "Getting Started",
            0,
        ),
        seed_section(
            project_id,
            "project-structure",
            "Project Structure",
            "Getting Started",
            1,
        ),
        seed_section(
            project_id,
            "routing",
            "Routing",
            "Build Your Application",
            2,
        ),
        seed_section(
            project_id,
            "data-fetching",
            "Data Fetching",
            "Build Your Application",
            3,
        ),
        seed_section(
            project_id,
            "rendering",
            "Rendering",
            "Build Your Application",
            4,
        ),
        seed_section(
            project_id,
            "caching",
            "Caching",
            "Build Your Application",
            5,
        ),
    ]
}

fn seed_section(
    project_id: &str,
    id: &str,
    title: &str,
    group_title: &str,
    sort_order: i64,
) -> WorkspaceSection {
    WorkspaceSection {
        group_title: group_title.to_string(),
        id: id.to_string(),
        project_id: project_id.to_string(),
        sort_order,
        title: title.to_string(),
    }
}

fn create_seed_ahtml_source(project: &WorkspaceProject, section: &WorkspaceSection) -> String {
    format!(
        r#"<Page title="{project_name} - {section_title}">
  <Section width="content">
    <Stack>
      <Stack>
        <Text variant="h1">{section_title}</Text>
        <Text variant="lead">{project_name} workspace content rendered through the agent-html runtime.</Text>
      </Stack>
      <Alert>
        <Icon name="database" />
        <AlertTitle>Local-first document</AlertTitle>
        <AlertDescription>This section is loaded from the desktop workspace repository and rendered from AHTML source.</AlertDescription>
      </Alert>
      <Grid columns="3">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
            <CardDescription>{project_name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Section</CardTitle>
            <CardDescription>{group_title}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
            <CardDescription>parse -> validate -> render</CardDescription>
          </CardHeader>
        </Card>
      </Grid>
    </Stack>
  </Section>
</Page>"#,
        group_title = section.group_title,
        project_name = project.name,
        section_title = section.title,
    )
}

fn current_timestamp() -> String {
    "2026-05-27T00:00:00.000Z".to_string()
}

fn slugify(value: &str) -> String {
    let mut slug = String::new();
    let mut pending_dash = false;

    for character in value.trim().chars() {
        if character.is_ascii_alphanumeric() {
            if pending_dash && !slug.is_empty() {
                slug.push('-');
            }
            slug.push(character.to_ascii_lowercase());
            pending_dash = false;
        } else {
            pending_dash = true;
        }
    }

    if slug.is_empty() {
        "project".to_string()
    } else {
        slug
    }
}

fn unique_slug(connection: &Connection, name: &str) -> WorkspaceResult<String> {
    let base = slugify(name);
    let mut suffix = 1;

    loop {
        let candidate = if suffix == 1 {
            base.clone()
        } else {
            format!("{base}-{suffix}")
        };
        let exists: Option<i64> = connection
            .query_row(
                "SELECT 1 FROM projects WHERE id = ?1 OR slug = ?1",
                [candidate.as_str()],
                |row| row.get(0),
            )
            .optional()?;

        if exists.is_none() {
            return Ok(candidate);
        }

        suffix += 1;
    }
}

fn create_blank_project_ahtml_source(project: &WorkspaceProject) -> String {
    format!(
        r#"<Page title="{project_name}">
  <Section width="content">
    <Stack>
      <Stack>
        <Text variant="h1">{project_name}</Text>
        <Text variant="lead">Start shaping this workspace artifact from a blank Agent-HTML document.</Text>
      </Stack>
      <Alert>
        <Icon name="file-plus-2" />
        <AlertTitle>Blank project</AlertTitle>
        <AlertDescription>This overview section is stored in the local desktop workspace database.</AlertDescription>
      </Alert>
    </Stack>
  </Section>
</Page>"#,
        project_name = project.name,
    )
}

#[tauri::command]
fn list_projects(store: State<'_, WorkspaceStore>) -> WorkspaceResult<Vec<WorkspaceProject>> {
    store.list_projects()
}

#[tauri::command]
fn list_project_sections(
    store: State<'_, WorkspaceStore>,
    project_id: String,
) -> WorkspaceResult<Vec<WorkspaceSection>> {
    store.list_project_sections(&project_id)
}

#[tauri::command]
fn get_project_section_document(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
) -> WorkspaceResult<ProjectSectionDocument> {
    store.get_project_section_document(&project_id, &section_id)
}

#[tauri::command]
fn create_project(
    store: State<'_, WorkspaceStore>,
    name: String,
) -> WorkspaceResult<WorkspaceProjectView> {
    store.create_project(&name)
}

#[tauri::command]
fn update_project_section_document(
    store: State<'_, WorkspaceStore>,
    project_id: String,
    section_id: String,
    ahtml_source: String,
) -> WorkspaceResult<ProjectSectionDocument> {
    store.update_project_section_document(&project_id, &section_id, &ahtml_source)
}

pub fn run() {
    tauri::Builder::default()
        .setup(|app| {
            let app_data_dir = app
                .path()
                .app_data_dir()
                .map_err(|_| WorkspaceError::MissingAppDataDir)?;
            let store = WorkspaceStore::open(app_data_dir.join("workspace.sqlite3"))?;
            app.manage(store);
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            list_projects,
            list_project_sections,
            get_project_section_document,
            create_project,
            update_project_section_document
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}

#[cfg(test)]
mod tests {
    use super::*;

    fn test_store() -> WorkspaceStore {
        let store = WorkspaceStore {
            connection: Mutex::new(Connection::open_in_memory().expect("open in-memory db")),
        };
        store.initialize().expect("initialize workspace store");
        store
    }

    #[test]
    fn seeds_projects_on_empty_database() {
        let store = test_store();

        let projects = store.list_projects().expect("list projects");

        assert_eq!(projects.len(), 3);
        assert_eq!(projects[0].id, "design-engineering");
    }

    #[test]
    fn lists_project_owned_sections() {
        let store = test_store();

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
        let store = test_store();

        let document = store
            .get_project_section_document("design-engineering", "installation")
            .expect("read document");

        assert_eq!(document.project_id, "design-engineering");
        assert_eq!(document.section_id, "installation");
        assert!(document.ahtml_source.contains("<Page"));
    }

    #[test]
    fn returns_error_for_missing_document() {
        let store = test_store();

        let error = store
            .get_project_section_document("design-engineering", "missing")
            .expect_err("missing document should fail");

        assert!(matches!(error, WorkspaceError::DocumentNotFound { .. }));
    }

    #[test]
    fn creates_blank_project_with_overview_document() {
        let store = test_store();

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
    }

    #[test]
    fn creates_unique_slug_for_duplicate_project_names() {
        let store = test_store();

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
    fn updates_project_section_document_source() {
        let store = test_store();
        let source = r#"<Page title="Updated">
  <Section width="content">
    <Text variant="h1">Updated</Text>
  </Section>
</Page>"#;

        let document = store
            .update_project_section_document("design-engineering", "installation", source)
            .expect("update document");

        assert_eq!(document.ahtml_source, source);
        assert_eq!(document.updated_at, "2026-05-27T00:00:00.000Z");
    }

    #[test]
    fn returns_error_when_updating_missing_document() {
        let store = test_store();

        let error = store
            .update_project_section_document("design-engineering", "missing", "<Page />")
            .expect_err("missing update should fail");

        assert!(matches!(error, WorkspaceError::DocumentNotFound { .. }));
    }
}
