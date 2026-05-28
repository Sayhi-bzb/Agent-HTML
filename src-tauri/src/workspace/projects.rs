use rusqlite::{params, Connection};

use crate::workspace::db;
use crate::workspace::documents::DocumentStore;
use crate::workspace::seed::{create_blank_project_ahtml_source, seed_section};
use crate::workspace::types::{
    WorkspaceError, WorkspaceProject, WorkspaceProjectView, WorkspaceResult,
};
use crate::workspace::util::{current_timestamp, unique_slug, unique_slug_excluding_project};

pub(crate) fn list_projects(connection: &Connection) -> WorkspaceResult<Vec<WorkspaceProject>> {
    db::list_projects(connection)
}

pub(crate) fn create_project(
    connection: &mut Connection,
    documents: &DocumentStore,
    name: &str,
) -> WorkspaceResult<WorkspaceProjectView> {
    let name = name.trim();
    if name.is_empty() {
        return Err(WorkspaceError::ProjectNameRequired);
    }

    let slug = unique_slug(connection, name)?;
    let now = current_timestamp();
    let project = WorkspaceProject {
        id: slug.clone(),
        name: name.to_string(),
        slug,
    };
    let section = seed_section(&project.id, "overview", "Overview", "Workspace", 0);
    let ahtml_source = create_blank_project_ahtml_source(&project);
    documents.write_document(&project.id, &section.id, &ahtml_source)?;

    let transaction_result = (|| -> WorkspaceResult<()> {
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
        Ok(())
    })();

    if transaction_result.is_err() {
        let _ = documents.remove_project_documents(&project.id);
    }
    transaction_result?;

    Ok(WorkspaceProjectView {
        id: project.id,
        name: project.name,
        slug: project.slug,
        sections: vec![section],
    })
}

pub(crate) fn rename_project(
    connection: &mut Connection,
    documents: &DocumentStore,
    project_id: &str,
    name: &str,
) -> WorkspaceResult<WorkspaceProjectView> {
    let name = name.trim();
    if name.is_empty() {
        return Err(WorkspaceError::ProjectNameRequired);
    }

    let existing = db::find_project(connection, project_id)?;
    if existing.is_none() {
        return Err(WorkspaceError::ProjectNotFound {
            project_id: project_id.to_string(),
        });
    }

    let new_slug = unique_slug_excluding_project(connection, name, project_id)?;
    let now = current_timestamp();
    documents.rename_project_documents(project_id, &new_slug)?;

    connection.execute("PRAGMA foreign_keys = OFF", [])?;
    let transaction_result = (|| -> WorkspaceResult<()> {
        let transaction = connection.transaction()?;

        transaction.execute(
            "UPDATE projects
             SET id = ?2, name = ?3, slug = ?2, updated_at = ?4
             WHERE id = ?1",
            params![project_id, new_slug, name, now],
        )?;
        transaction.execute(
            "UPDATE project_sections
             SET project_id = ?2, updated_at = ?3
             WHERE project_id = ?1",
            params![project_id, new_slug, now],
        )?;
        transaction.execute(
            "UPDATE project_section_documents
             SET project_id = ?2, updated_at = ?3
             WHERE project_id = ?1",
            params![project_id, new_slug, now],
        )?;
        transaction.commit()?;

        Ok(())
    })();
    connection.execute("PRAGMA foreign_keys = ON", [])?;
    transaction_result?;

    let project = db::find_project(connection, &new_slug)?.ok_or_else(|| {
        WorkspaceError::ProjectNotFound {
            project_id: new_slug.clone(),
        }
    })?;
    let sections = db::list_sections(connection, &new_slug)?;

    Ok(WorkspaceProjectView {
        id: project.id,
        name: project.name,
        slug: project.slug,
        sections,
    })
}

pub(crate) fn delete_project(
    connection: &Connection,
    documents: &DocumentStore,
    project_id: &str,
) -> WorkspaceResult<String> {
    db::ensure_project_exists(connection, project_id)?;
    documents.remove_project_documents(project_id)?;
    let changed = connection.execute("DELETE FROM projects WHERE id = ?1", [project_id])?;

    if changed == 0 {
        return Err(WorkspaceError::ProjectNotFound {
            project_id: project_id.to_string(),
        });
    }

    Ok(project_id.to_string())
}
