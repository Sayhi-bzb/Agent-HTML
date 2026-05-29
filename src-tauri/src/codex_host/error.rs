use serde::Serialize;
use thiserror::Error;

#[derive(Debug, Error)]
pub(crate) enum CodexHostError {
    #[error("filesystem error: {0}")]
    Filesystem(#[from] std::io::Error),
    #[error("json error: {0}")]
    Json(#[from] serde_json::Error),
    #[error("process error: {0}")]
    Process(String),
}

impl Serialize for CodexHostError {
    fn serialize<S>(&self, serializer: S) -> Result<S::Ok, S::Error>
    where
        S: serde::Serializer,
    {
        serializer.serialize_str(&self.to_string())
    }
}

pub(crate) type CodexHostResult<T> = Result<T, CodexHostError>;
