use rusqlite::{params, Connection};

use crate::workspace::db;
use crate::workspace::types::{ProjectCodexThreadLink, WorkspaceResult};
use crate::workspace::util::current_timestamp;

pub(crate) fn list_project_codex_threads(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<Vec<ProjectCodexThreadLink>> {
    let mut statement = connection.prepare(
        "SELECT thread_id, project_id, origin, last_section_id, last_block_path,
                last_document_path, created_at, last_used_at
         FROM project_codex_threads
         WHERE project_id = ?1
         ORDER BY last_used_at DESC, created_at DESC, thread_id ASC",
    )?;
    let rows = statement.query_map([project_id], |row| {
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
    })?;

    db::collect_rows(rows)
}

pub(crate) fn upsert_project_codex_thread_link(
    connection: &Connection,
    project_id: &str,
    thread_id: &str,
    section_id: Option<&str>,
    block_path: Option<&str>,
    document_path: Option<&str>,
) -> WorkspaceResult<ProjectCodexThreadLink> {
    let now = current_timestamp();
    db::ensure_project_exists(connection, project_id)?;
    connection.execute(
        "INSERT INTO project_codex_threads
         (thread_id, project_id, origin, last_section_id, last_block_path,
          last_document_path, created_at, last_used_at)
         VALUES (?1, ?2, 'agent-html', ?3, ?4, ?5, ?6, ?6)
         ON CONFLICT(thread_id) DO UPDATE SET
            project_id = excluded.project_id,
            origin = excluded.origin,
            last_section_id = excluded.last_section_id,
            last_block_path = excluded.last_block_path,
            last_document_path = excluded.last_document_path,
            last_used_at = excluded.last_used_at",
        params![
            thread_id,
            project_id,
            section_id,
            block_path,
            document_path,
            now
        ],
    )?;

    db::get_project_codex_thread_link(connection, thread_id)
}

pub(crate) fn delete_project_codex_thread_link(
    connection: &Connection,
    project_id: &str,
    thread_id: &str,
) -> WorkspaceResult<String> {
    connection.execute(
        "DELETE FROM project_codex_threads
         WHERE project_id = ?1 AND thread_id = ?2",
        params![project_id, thread_id],
    )?;

    Ok(thread_id.to_string())
}
