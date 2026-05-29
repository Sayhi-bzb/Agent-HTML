use std::path::PathBuf;

use crate::workspace::WorkspaceStore;

use super::error::CodexHostResult;

pub(crate) fn resolve_workspace_cwd(store: &WorkspaceStore) -> CodexHostResult<PathBuf> {
    Ok(store.root().to_path_buf())
}
