use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum WorkspaceError {
    #[error("database error: {0}")]
    Database(#[from] rusqlite::Error),
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("document not found for {project_id}/{section_id}")]
    DocumentNotFound {
        project_id: String,
        section_id: String,
    },
    #[error("project name is required")]
    ProjectNameRequired,
    #[error("project not found for {project_id}")]
    ProjectNotFound { project_id: String },
    #[error("section not found for {project_id}/{section_id}")]
    SectionNotFound {
        project_id: String,
        section_id: String,
    },
    #[error("section title is required")]
    SectionTitleRequired,
}

impl Serialize for WorkspaceError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type WorkspaceResult<T> = Result<T, WorkspaceError>;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WorkspaceProject {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) slug: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WorkspaceProjectView {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) slug: String,
    pub(crate) sections: Vec<WorkspaceSection>,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct WorkspaceSection {
    pub(crate) group_title: String,
    pub(crate) id: String,
    pub(crate) project_id: String,
    pub(crate) sort_order: i64,
    pub(crate) title: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProjectSectionDocument {
    pub(crate) ahtml_source: String,
    pub(crate) file_path: String,
    pub(crate) project_id: String,
    pub(crate) section_id: String,
    pub(crate) updated_at: String,
}

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProjectCodexThreadLink {
    pub(crate) created_at: String,
    pub(crate) last_ahtml_path: Option<String>,
    pub(crate) last_document_path: Option<String>,
    pub(crate) last_section_id: Option<String>,
    pub(crate) last_used_at: String,
    pub(crate) origin: String,
    pub(crate) project_id: String,
    pub(crate) thread_id: String,
}

pub(super) struct SectionWithDocument {
    pub(super) document: ProjectSectionDocument,
    pub(super) section: WorkspaceSection,
}
