use serde::Serialize;
use std::path::Path;

#[derive(Clone, Debug, Serialize)]
#[serde(rename_all = "camelCase")]
pub struct DesktopError {
    pub code: &'static str,
    pub phase: &'static str,
    pub message: String,
    pub recoverable: bool,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub log_path: Option<String>,
    #[serde(skip_serializing_if = "Option::is_none")]
    pub exit_code: Option<i32>,
}

impl DesktopError {
    pub fn new(
        code: &'static str,
        phase: &'static str,
        message: impl Into<String>,
        recoverable: bool,
    ) -> Self {
        Self {
            code,
            phase,
            message: message.into(),
            recoverable,
            log_path: None,
            exit_code: None,
        }
    }

    pub fn with_log(mut self, path: &Path) -> Self {
        self.log_path = Some(path.to_string_lossy().to_string());
        self
    }

    pub fn with_exit_code(mut self, code: Option<i32>) -> Self {
        self.exit_code = code;
        self
    }
}
