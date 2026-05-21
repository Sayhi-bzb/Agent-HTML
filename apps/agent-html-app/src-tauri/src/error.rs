use thiserror::Error;

use crate::models::AppError;

#[derive(Debug, Error)]
pub(crate) enum BackendError {
    #[error("{message}")]
    Io {
        code: &'static str,
        message: &'static str,
        #[source]
        source: std::io::Error,
    },
    #[error("{message}")]
    Json {
        code: &'static str,
        message: String,
        #[source]
        source: serde_json::Error,
    },
    #[error("{message}")]
    Message { code: &'static str, message: String },
}

impl BackendError {
    fn code(&self) -> &'static str {
        match self {
            Self::Io { code, .. } => code,
            Self::Json { code, .. } => code,
            Self::Message { code, .. } => code,
        }
    }

    fn details(&self) -> Option<String> {
        match self {
            Self::Io { source, .. } => Some(source.to_string()),
            Self::Json { source, .. } => Some(source.to_string()),
            Self::Message { .. } => None,
        }
    }

    pub(crate) fn session_io(message: &'static str, source: std::io::Error) -> Self {
        Self::Io {
            code: "session-io",
            message,
            source,
        }
    }

    pub(crate) fn cli_launch(message: &'static str, source: std::io::Error) -> Self {
        Self::Io {
            code: "cli-launch",
            message,
            source,
        }
    }

    pub(crate) fn preview_missing(message: &'static str, source: std::io::Error) -> Self {
        Self::Io {
            code: "preview-missing",
            message,
            source,
        }
    }

    pub(crate) fn json(
        code: &'static str,
        message: impl Into<String>,
        source: serde_json::Error,
    ) -> Self {
        Self::Json {
            code,
            message: message.into(),
            source,
        }
    }

    pub(crate) fn message(code: &'static str, message: impl Into<String>) -> Self {
        Self::Message {
            code,
            message: message.into(),
        }
    }

    pub(crate) fn ui_validation(message: impl Into<String>) -> Self {
        Self::message("ui-validation", message)
    }
}

impl From<BackendError> for AppError {
    fn from(error: BackendError) -> Self {
        Self {
            code: error.code().into(),
            message: error.to_string(),
            details: error.details(),
            session_id: None,
            run_id: None,
        }
    }
}

impl AppError {
    pub(crate) fn with_details(mut self, details: impl Into<String>) -> Self {
        self.details = Some(details.into());
        self
    }

    pub(crate) fn with_session(mut self, session_id: impl Into<String>) -> Self {
        self.session_id = Some(session_id.into());
        self
    }
}
