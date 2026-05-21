use camino::{Utf8Path, Utf8PathBuf};
use fs_err as fs;
use std::time::{SystemTime, UNIX_EPOCH};
use time::format_description::well_known::Rfc3339;
use time::OffsetDateTime;

pub(crate) fn read_latest_log(logs_dir: &Utf8Path, suffix: &str) -> Option<String> {
    let mut matches = fs::read_dir(logs_dir)
        .ok()?
        .flatten()
        .filter_map(|entry| Utf8PathBuf::from_path_buf(entry.path()).ok())
        .filter(|path| {
            path.file_name()
                .map(|name| name.ends_with(suffix))
                .unwrap_or(false)
        })
        .collect::<Vec<_>>();

    matches.sort();
    let latest = matches.pop()?;
    fs::read_to_string(latest).ok()
}

pub(crate) fn default_source(name: &str) -> String {
    format!(
        "<meta-agent profile=\"report-default\" />\n\n<page title=\"{name}\">\n  <card title=\"Summary\">\n    Draft the first artifact content here.\n  </card>\n</page>\n"
    )
}

pub(crate) fn slugify(input: &str) -> String {
    let slug = input
        .chars()
        .map(|char| {
            if char.is_ascii_alphanumeric() {
                char.to_ascii_lowercase()
            } else {
                '-'
            }
        })
        .collect::<String>();

    let trimmed = slug.trim_matches('-').to_string();
    if trimmed.is_empty() {
        "untitled".into()
    } else {
        trimmed
            .split('-')
            .filter(|segment| !segment.is_empty())
            .collect::<Vec<_>>()
            .join("-")
    }
}

pub(crate) fn now_epoch_millis() -> u128 {
    SystemTime::now()
        .duration_since(UNIX_EPOCH)
        .unwrap_or_default()
        .as_millis()
}

pub(crate) fn now_iso_stub() -> String {
    OffsetDateTime::now_utc()
        .format(&Rfc3339)
        .unwrap_or_else(|_| format!("epoch-{}", now_epoch_millis()))
}
