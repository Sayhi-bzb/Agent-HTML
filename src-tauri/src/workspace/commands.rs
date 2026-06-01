use tauri::State;

use super::{
    CompanyAgentState, ProjectCodexThreadLink, ProjectSectionDocument, WorkspaceProject,
    WorkspaceProjectView, WorkspaceResult, WorkspaceSection, WorkspaceStore,
};

#[tauri::command]
pub(crate) fn list_projects(
    store: State<'_, WorkspaceStore>,
) -> WorkspaceResult<Vec<WorkspaceProject>> {
    store.list_projects()
}

#[tauri::command]
pub(crate) fn get_company_agent_state(
    store: State<'_, WorkspaceStore>,
) -> WorkspaceResult<CompanyAgentState> {
    store.get_company_agent_state()
}

#[tauri::command]
pub(crate) fn update_company_agent_state(
    store: State<'_, WorkspaceStore>,
    active_thread_id: Option<String>,
) -> WorkspaceResult<CompanyAgentState> {
    store.update_company_agent_state(active_thread_id.as_deref())
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
