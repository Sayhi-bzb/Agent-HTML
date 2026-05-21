use camino::Utf8PathBuf;
use serde::{Deserialize, Serialize};
use serde_json::Value;

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionSummary {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) directory: String,
    pub(crate) status: String,
    pub(crate) pinned: bool,
    pub(crate) updated_at: String,
    pub(crate) last_build_at: Option<String>,
    pub(crate) has_preview: bool,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionDetail {
    pub(crate) summary: SessionSummary,
    pub(crate) source_path: String,
    pub(crate) preview_path: Option<String>,
    pub(crate) last_build: Option<BuildRunSummary>,
    pub(crate) log_directory: String,
    pub(crate) chat_path: String,
    pub(crate) current_view: String,
    pub(crate) source: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct ProposalSnapshot {
    pub(crate) source: String,
    pub(crate) line_count: usize,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AgentShellMessage {
    pub(crate) id: String,
    pub(crate) role: String,
    pub(crate) created_at: String,
    pub(crate) text: String,
    pub(crate) kind: String,
    pub(crate) proposal_snapshot: Option<ProposalSnapshot>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct BuildRunSummary {
    pub(crate) run_id: String,
    pub(crate) session_id: String,
    pub(crate) started_at: String,
    pub(crate) finished_at: Option<String>,
    pub(crate) status: String,
    pub(crate) exit_code: Option<i32>,
    pub(crate) stdout_path: Option<String>,
    pub(crate) stderr_path: Option<String>,
    pub(crate) preview_path: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct DiagnosticItem {
    pub(crate) id: String,
    pub(crate) severity: String,
    pub(crate) message: String,
    pub(crate) source: String,
    pub(crate) line: Option<u32>,
    pub(crate) column: Option<u32>,
    pub(crate) code: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct InspectSnapshot {
    pub(crate) session_id: String,
    pub(crate) generated_at: String,
    pub(crate) diagnostics: Vec<DiagnosticItem>,
    pub(crate) structure_summary: String,
    pub(crate) last_build: Option<BuildRunSummary>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SourceValidationSnapshot {
    pub(crate) session_id: String,
    pub(crate) validated_at: String,
    pub(crate) status: String,
    pub(crate) diagnostics: Vec<DiagnosticItem>,
    pub(crate) structure_summary: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct LogSnapshot {
    pub(crate) stdout: Option<String>,
    pub(crate) stderr: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionCreateInput {
    pub(crate) name: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionViewInput {
    pub(crate) view: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppendChatMessageInput {
    pub(crate) role: String,
    pub(crate) text: String,
    pub(crate) kind: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct AppError {
    pub(crate) code: String,
    pub(crate) message: String,
    pub(crate) details: Option<String>,
    pub(crate) session_id: Option<String>,
    pub(crate) run_id: Option<String>,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub(crate) struct SessionRecord {
    pub(crate) id: String,
    pub(crate) name: String,
    pub(crate) status: String,
    pub(crate) pinned: bool,
    pub(crate) updated_at: String,
    pub(crate) last_build_at: Option<String>,
    #[serde(default)]
    pub(crate) last_build_status: Option<String>,
    #[serde(default)]
    pub(crate) last_build_exit_code: Option<i32>,
    #[serde(default)]
    pub(crate) last_build_stdout_path: Option<String>,
    #[serde(default)]
    pub(crate) last_build_stderr_path: Option<String>,
    pub(crate) has_preview: bool,
    pub(crate) current_view: String,
}

pub(crate) struct CliExecution {
    pub(crate) stdout_path: Utf8PathBuf,
    pub(crate) stderr_path: Utf8PathBuf,
    pub(crate) exit_code: Option<i32>,
    pub(crate) json: Option<Value>,
}
