use rusqlite::{params, Connection, OptionalExtension};

use crate::workspace::types::{
    ProjectCodexThreadLink, WorkspaceError, WorkspaceProject, WorkspaceResult, WorkspaceSection,
};

pub(crate) fn create_schema(connection: &Connection) -> WorkspaceResult<()> {
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
            created_at TEXT NOT NULL,
            updated_at TEXT NOT NULL,
            PRIMARY KEY (project_id, section_id),
            FOREIGN KEY (project_id, section_id)
                REFERENCES project_sections(project_id, id)
                ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS project_codex_threads (
            thread_id TEXT PRIMARY KEY,
            project_id TEXT NOT NULL,
            origin TEXT NOT NULL DEFAULT 'agent-html',
            last_section_id TEXT,
            last_block_path TEXT,
            last_document_path TEXT,
            created_at TEXT NOT NULL,
            last_used_at TEXT NOT NULL,
            FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE CASCADE
        );
        ",
    )?;
    Ok(())
}

pub(crate) fn collect_rows<T>(
    rows: rusqlite::MappedRows<'_, impl FnMut(&rusqlite::Row<'_>) -> rusqlite::Result<T>>,
) -> WorkspaceResult<Vec<T>> {
    let mut values = Vec::new();
    for row in rows {
        values.push(row?);
    }

    Ok(values)
}

pub(crate) fn find_project(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<Option<WorkspaceProject>> {
    connection
        .query_row(
            "SELECT id, name, slug FROM projects WHERE id = ?1",
            [project_id],
            |row| {
                Ok(WorkspaceProject {
                    id: row.get(0)?,
                    name: row.get(1)?,
                    slug: row.get(2)?,
                })
            },
        )
        .optional()
        .map_err(WorkspaceError::from)
}

pub(crate) fn ensure_project_exists(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<()> {
    if find_project(connection, project_id)?.is_none() {
        return Err(WorkspaceError::ProjectNotFound {
            project_id: project_id.to_string(),
        });
    }

    Ok(())
}

pub(crate) fn list_projects(connection: &Connection) -> WorkspaceResult<Vec<WorkspaceProject>> {
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

pub(crate) fn list_sections(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<Vec<WorkspaceSection>> {
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

pub(crate) fn get_section(
    connection: &Connection,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<WorkspaceSection> {
    let section = connection
        .query_row(
            "SELECT id, project_id, title, group_title, sort_order
             FROM project_sections
             WHERE project_id = ?1 AND id = ?2",
            params![project_id, section_id],
            |row| {
                Ok(WorkspaceSection {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    title: row.get(2)?,
                    group_title: row.get(3)?,
                    sort_order: row.get(4)?,
                })
            },
        )
        .optional()?;

    section.ok_or_else(|| WorkspaceError::SectionNotFound {
        project_id: project_id.to_string(),
        section_id: section_id.to_string(),
    })
}

pub(crate) fn get_section_for_document(
    connection: &Connection,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<(WorkspaceSection, String)> {
    let row = connection
        .query_row(
            "SELECT s.id, s.project_id, s.title, s.group_title, s.sort_order,
                    d.updated_at
             FROM project_sections s
             JOIN project_section_documents d
               ON d.project_id = s.project_id AND d.section_id = s.id
             WHERE s.project_id = ?1 AND s.id = ?2",
            params![project_id, section_id],
            |row| {
                let section = WorkspaceSection {
                    id: row.get(0)?,
                    project_id: row.get(1)?,
                    title: row.get(2)?,
                    group_title: row.get(3)?,
                    sort_order: row.get(4)?,
                };
                let updated_at = row.get(5)?;

                Ok((section, updated_at))
            },
        )
        .optional()?;

    row.ok_or_else(|| WorkspaceError::SectionNotFound {
        project_id: project_id.to_string(),
        section_id: section_id.to_string(),
    })
}

pub(crate) fn ensure_document_exists(
    connection: &Connection,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<()> {
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

    Ok(())
}

pub(crate) fn read_document_row(
    connection: &Connection,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<(String, String, String)> {
    let document = connection
        .query_row(
            "SELECT project_id, section_id, updated_at
             FROM project_section_documents
             WHERE project_id = ?1 AND section_id = ?2",
            params![project_id, section_id],
            |row| {
                Ok((
                    row.get::<_, String>(0)?,
                    row.get::<_, String>(1)?,
                    row.get::<_, String>(2)?,
                ))
            },
        )
        .optional()?;

    document.ok_or_else(|| WorkspaceError::DocumentNotFound {
        project_id: project_id.to_string(),
        section_id: section_id.to_string(),
    })
}

pub(crate) fn get_project_codex_thread_link(
    connection: &Connection,
    thread_id: &str,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    connection
        .query_row(
            "SELECT thread_id, project_id, origin, last_section_id, last_block_path,
                    last_document_path, created_at, last_used_at
             FROM project_codex_threads
             WHERE thread_id = ?1",
            [thread_id],
            |row| {
                Ok(ProjectCodexThreadLink {
                    thread_id: row.get(0)?,
                    project_id: row.get(1)?,
                    origin: row.get(2)?,
                    last_section_id: row.get(3)?,
                    last_block_path: row.get(4)?,
                    last_document_path: row.get(5)?,
                    created_at: row.get(6)?,
                    last_used_at: row.get(7)?,
                })
            },
        )
        .map_err(WorkspaceError::from)
}
