use rusqlite::{params, Connection};
use serde_json::json;

use crate::workspace::db;
use crate::workspace::documents::DocumentStore;
use crate::workspace::seed::{create_blank_section_source, seed_section};
use crate::workspace::types::{
    ProjectSectionDocument, WorkspaceError, WorkspaceResult, WorkspaceSection,
};
use crate::workspace::util::{
    current_timestamp, next_section_sort_order, unique_section_id, unique_section_title,
};

pub(crate) fn list_project_sections(
    connection: &Connection,
    project_id: &str,
) -> WorkspaceResult<Vec<WorkspaceSection>> {
    db::list_sections(connection, project_id)
}

pub(crate) fn get_project_section_document(
    connection: &Connection,
    documents: &DocumentStore,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<ProjectSectionDocument> {
    let (project_id, section_id, updated_at) =
        db::read_document_row(connection, project_id, section_id)?;
    let (source, file_path) = documents.read_document(&project_id, &section_id)?;

    Ok(ProjectSectionDocument {
        file_path,
        project_id,
        section_id,
        source,
        updated_at,
    })
}

pub(crate) fn create_project_section(
    connection: &mut Connection,
    documents: &DocumentStore,
    project_id: &str,
    title: &str,
) -> WorkspaceResult<WorkspaceSection> {
    let title = title.trim();
    if title.is_empty() {
        return Err(WorkspaceError::SectionTitleRequired);
    }

    let project = db::find_project(connection, project_id)?.ok_or_else(|| {
        WorkspaceError::ProjectNotFound {
            project_id: project_id.to_string(),
        }
    })?;
    let section_id = unique_section_id(connection, project_id, title)?;
    let sort_order = next_section_sort_order(connection, project_id)?;
    let now = current_timestamp();
    let section = seed_section(project_id, &section_id, title, "Workspace", sort_order);
    let source = create_blank_section_source(&project, &section);
    documents.write_section_metadata(
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
    documents.write_document(&section.project_id, &section.id, &source)?;

    let transaction_result = (|| -> WorkspaceResult<()> {
        let transaction = connection.transaction()?;
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
             (project_id, section_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![section.project_id, section.id, now, now],
        )?;
        transaction.commit()?;
        Ok(())
    })();

    if transaction_result.is_err() {
        let _ = documents.remove_document(&section.project_id, &section.id);
    }
    transaction_result?;

    Ok(section)
}

pub(crate) fn rename_project_section(
    connection: &Connection,
    documents: &DocumentStore,
    project_id: &str,
    section_id: &str,
    title: &str,
) -> WorkspaceResult<WorkspaceSection> {
    let title = title.trim();
    if title.is_empty() {
        return Err(WorkspaceError::SectionTitleRequired);
    }

    let now = current_timestamp();
    let changed = connection.execute(
        "UPDATE project_sections
         SET title = ?3, updated_at = ?4
         WHERE project_id = ?1 AND id = ?2",
        params![project_id, section_id, title, now],
    )?;

    if changed == 0 {
        return Err(WorkspaceError::SectionNotFound {
            project_id: project_id.to_string(),
            section_id: section_id.to_string(),
        });
    }

    let section = db::get_section(connection, project_id, section_id)?;
    documents.write_section_metadata(
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
    Ok(section)
}

pub(crate) fn delete_project_section(
    connection: &Connection,
    documents: &DocumentStore,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<String> {
    db::ensure_document_exists(connection, project_id, section_id)?;
    documents.remove_document(project_id, section_id)?;
    let changed = connection.execute(
        "DELETE FROM project_sections WHERE project_id = ?1 AND id = ?2",
        params![project_id, section_id],
    )?;

    if changed == 0 {
        return Err(WorkspaceError::SectionNotFound {
            project_id: project_id.to_string(),
            section_id: section_id.to_string(),
        });
    }

    Ok(section_id.to_string())
}

pub(crate) fn duplicate_project_section(
    connection: &mut Connection,
    documents: &DocumentStore,
    project_id: &str,
    section_id: &str,
) -> WorkspaceResult<WorkspaceSection> {
    let (source_section, _) = db::get_section_for_document(connection, project_id, section_id)?;
    let next_title = unique_section_title(
        connection,
        project_id,
        &format!("{} Copy", source_section.title),
    )?;
    let next_section_id = unique_section_id(connection, project_id, &next_title)?;
    let sort_order = next_section_sort_order(connection, project_id)?;
    let now = current_timestamp();
    let section = seed_section(
        project_id,
        &next_section_id,
        &next_title,
        &source_section.group_title,
        sort_order,
    );
    documents.write_section_metadata(
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
    documents.duplicate_document(project_id, section_id, &section.project_id, &section.id)?;

    let transaction_result = (|| -> WorkspaceResult<()> {
        let transaction = connection.transaction()?;
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
             (project_id, section_id, created_at, updated_at)
             VALUES (?1, ?2, ?3, ?4)",
            params![section.project_id, section.id, now, now],
        )?;
        transaction.commit()?;
        Ok(())
    })();

    if transaction_result.is_err() {
        let _ = documents.remove_document(&section.project_id, &section.id);
    }
    transaction_result?;

    Ok(section)
}

pub(crate) fn update_project_section_document(
    connection: &Connection,
    documents: &DocumentStore,
    project_id: &str,
    section_id: &str,
    source: &str,
) -> WorkspaceResult<ProjectSectionDocument> {
    db::ensure_document_exists(connection, project_id, section_id)?;

    let updated_at = current_timestamp();
    let file_path = documents
        .write_document(project_id, section_id, source)?
        .to_string_lossy()
        .to_string();
    connection.execute(
        "UPDATE project_section_documents
         SET updated_at = ?3
         WHERE project_id = ?1 AND section_id = ?2",
        params![project_id, section_id, updated_at],
    )?;

    Ok(ProjectSectionDocument {
        file_path,
        project_id: project_id.to_string(),
        section_id: section_id.to_string(),
        source: source.to_string(),
        updated_at,
    })
}
