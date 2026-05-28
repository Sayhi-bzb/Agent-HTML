use rusqlite::{params, Connection, OptionalExtension};

use crate::workspace::types::WorkspaceResult;

pub(crate) fn current_timestamp() -> String {
    "2026-05-27T00:00:00.000Z".to_string()
}

pub(crate) fn slugify(value: &str) -> String {
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

pub(crate) fn unique_slug(connection: &Connection, name: &str) -> WorkspaceResult<String> {
    unique_slug_excluding_project(connection, name, "")
}

pub(crate) fn unique_slug_excluding_project(
    connection: &Connection,
    name: &str,
    excluded_project_id: &str,
) -> WorkspaceResult<String> {
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
                "SELECT 1 FROM projects WHERE (id = ?1 OR slug = ?1) AND id <> ?2",
                params![candidate.as_str(), excluded_project_id],
                |row| row.get(0),
            )
            .optional()?;

        if exists.is_none() {
            return Ok(candidate);
        }

        suffix += 1;
    }
}

pub(crate) fn unique_section_id(
    connection: &Connection,
    project_id: &str,
    title: &str,
) -> WorkspaceResult<String> {
    let base = slugify(title);
    let mut suffix = 1;

    loop {
        let candidate = if suffix == 1 {
            base.clone()
        } else {
            format!("{base}-{suffix}")
        };
        let exists: Option<i64> = connection
            .query_row(
                "SELECT 1 FROM project_sections WHERE project_id = ?1 AND id = ?2",
                params![project_id, candidate],
                |row| row.get(0),
            )
            .optional()?;

        if exists.is_none() {
            return Ok(candidate);
        }

        suffix += 1;
    }
}

pub(crate) fn unique_section_title(
    connection: &Connection,
    project_id: &str,
    title: &str,
) -> WorkspaceResult<String> {
    let base = title.trim();
    let mut suffix = 1;

    loop {
        let candidate = if suffix == 1 {
            base.to_string()
        } else {
            format!("{base} {suffix}")
        };
        let exists: Option<i64> = connection
            .query_row(
                "SELECT 1 FROM project_sections WHERE project_id = ?1 AND title = ?2",
                params![project_id, candidate],
                |row| row.get(0),
            )
            .optional()?;

        if exists.is_none() {
            return Ok(candidate);
        }

        suffix += 1;
    }
}

pub(crate) fn next_section_sort_order(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<i64> {
    let max_sort_order: Option<i64> = connection.query_row(
        "SELECT MAX(sort_order) FROM project_sections WHERE project_id = ?1",
        [project_id],
        |row| row.get(0),
    )?;

    Ok(max_sort_order.map_or(0, |value| value + 1))
}
