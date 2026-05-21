use camino::Utf8Path;

use crate::{
    models::{BuildRunSummary, LogSnapshot, SessionRecord},
    paths::{path_to_string, preview_path},
};

pub(crate) fn build_session_proposal_text(
    record: &SessionRecord,
    source: &str,
    build: Option<&BuildRunSummary>,
    logs: &LogSnapshot,
) -> String {
    let mut items: Vec<String> = Vec::new();

    if !source.contains("<page") {
        items.push(
            "[build] Add a <page> root before the next build so the session has a valid top-level artifact."
                .into(),
        );
    }

    if source.contains("className=") {
        items.push(
            "[inspect] Remove raw UI props such as className and keep the document at the semantic agent-html layer."
                .into(),
        );
    }

    match record.status.as_str() {
        "dirty" => items.push(
            "[build] Rebuild this session so Preview and Inspect catch up with the latest saved source."
                .into(),
        ),
        "error" => items.push(
            "[inspect] Inspect the latest stderr log before editing again so the next build targets the actual failure."
                .into(),
        ),
        _ => {}
    }

    match build {
        Some(summary) if summary.status == "failed" => items.push(
            "[build] The latest build failed, so review the logs first and only rebuild after the failure path is understood."
                .into(),
        ),
        Some(summary) if summary.preview_path.is_some() => items.push(
            "[review] Compare the current preview artifact with the source intent and confirm the main recommendation still matches the rendered output."
                .into(),
        ),
        _ => items.push(
            "[build] Run Build to generate a fresh preview artifact before sharing or reviewing this session."
                .into(),
        ),
    }

    if logs.stderr.as_ref().map(|value| !value.trim().is_empty()).unwrap_or(false) {
        items.push(
            "[inspect] Keep the latest stderr log open while you edit because it is the fastest way to explain runtime and build failures."
                .into(),
        );
    } else if logs
        .stdout
        .as_ref()
        .map(|value| !value.trim().is_empty())
        .unwrap_or(false)
    {
        items.push(
            "[review] Use the captured stdout summary as the baseline and return to Source only if Preview diverges from that output."
                .into(),
        );
    }

    if items.is_empty() {
        items.push(
            "[review] Keep the source, preview, and inspect summary aligned before making the next artifact decision."
                .into(),
        );
    }

    let mut lines = vec![format!("Proposal for {}", record.name)];
    lines.extend(items.into_iter().map(|item| format!("- {item}")));
    lines.join("\n")
}

pub(crate) fn build_run_summary_from_record(
    record: &SessionRecord,
    session_dir: &Utf8Path,
) -> Option<BuildRunSummary> {
    let status = record
        .last_build_status
        .as_deref()
        .and_then(parse_build_status)
        .or_else(|| {
            if record.has_preview {
                Some("succeeded")
            } else if record.status == "error" {
                Some("failed")
            } else if record.status == "building" {
                Some("running")
            } else {
                None
            }
        });

    let started_at = record
        .last_build_at
        .clone()
        .unwrap_or_else(|| record.updated_at.clone());
    let preview_path = preview_path(session_dir)
        .filter(|path| path.exists())
        .map(path_to_string);

    if preview_path.is_none() && record.last_build_at.is_none() && status.is_none() {
        return None;
    }

    Some(BuildRunSummary {
        run_id: format!("{}-last-build", record.id),
        session_id: record.id.clone(),
        started_at: started_at.clone(),
        finished_at: record.last_build_at.clone(),
        status: status.unwrap_or("idle").into(),
        exit_code: record
            .last_build_exit_code
            .or_else(|| if preview_path.is_some() { Some(0) } else { None }),
        stdout_path: record.last_build_stdout_path.clone(),
        stderr_path: record.last_build_stderr_path.clone(),
        preview_path,
    })
}

fn parse_build_status(status: &str) -> Option<&'static str> {
    match status {
        "idle" => Some("idle"),
        "running" => Some("running"),
        "failed" => Some("failed"),
        "succeeded" => Some("succeeded"),
        _ => None,
    }
}

#[cfg(test)]
mod tests {
    use super::{build_run_summary_from_record, build_session_proposal_text};
    use crate::models::{BuildRunSummary, LogSnapshot, SessionRecord};
    use camino::Utf8PathBuf;
    use std::fs;
    use std::time::{SystemTime, UNIX_EPOCH};

    #[test]
    fn build_session_proposal_text_highlights_error_and_missing_page() {
        let record = SessionRecord {
            id: "session-test".into(),
            name: "Session Test".into(),
            status: "error".into(),
            updated_at: "epoch-1".into(),
            last_build_at: Some("epoch-2".into()),
            last_build_status: None,
            last_build_exit_code: None,
            last_build_stdout_path: None,
            last_build_stderr_path: None,
            has_preview: false,
            current_view: "inspect".into(),
        };
        let build = BuildRunSummary {
            run_id: "build-1".into(),
            session_id: "session-test".into(),
            started_at: "epoch-2".into(),
            finished_at: Some("epoch-3".into()),
            status: "failed".into(),
            exit_code: Some(1),
            stdout_path: None,
            stderr_path: None,
            preview_path: None,
        };
        let logs = LogSnapshot {
            stdout: None,
            stderr: Some("Validation failed".into()),
        };

        let text = build_session_proposal_text(&record, "<card />", Some(&build), &logs);

        assert!(text.contains("Proposal for Session Test"));
        assert!(text.contains("\n- [build] Add a <page> root"));
        assert!(text.contains("[build] Add a <page> root"));
        assert!(text.contains("[inspect]"));
        assert!(text.contains("stderr log"));
        assert!(text.contains("[build] The latest build failed"));
    }

    #[test]
    fn build_run_summary_from_record_keeps_failed_status_with_stale_preview() {
        let session_dir = test_session_dir("restore-failed-build");
        fs::create_dir_all(session_dir.join("build")).expect("create build dir");
        fs::write(session_dir.join("build").join("index.html"), "<html />")
            .expect("write preview");

        let summary = build_run_summary_from_record(
            &SessionRecord {
                id: "session-test".into(),
                name: "Session Test".into(),
                status: "error".into(),
                updated_at: "epoch-1".into(),
                last_build_at: Some("2026-05-16T09:00:00Z".into()),
                last_build_status: Some("failed".into()),
                last_build_exit_code: Some(1),
                last_build_stdout_path: Some("D:/tmp/build.stdout.log".into()),
                last_build_stderr_path: Some("D:/tmp/build.stderr.log".into()),
                has_preview: true,
                current_view: "inspect".into(),
            },
            &session_dir,
        )
        .expect("summary");

        assert_eq!(summary.status, "failed");
        assert_eq!(summary.exit_code, Some(1));
        assert_eq!(
            summary.stdout_path.as_deref(),
            Some("D:/tmp/build.stdout.log")
        );
        assert_eq!(
            summary.stderr_path.as_deref(),
            Some("D:/tmp/build.stderr.log")
        );
        assert_eq!(
            summary.preview_path,
            Some(session_dir.join("build").join("index.html").into_string())
        );

        let _ = fs::remove_dir_all(&session_dir);
    }

    fn test_session_dir(suffix: &str) -> Utf8PathBuf {
        let nonce = SystemTime::now()
            .duration_since(UNIX_EPOCH)
            .unwrap_or_default()
            .as_nanos();
        Utf8PathBuf::from_path_buf(
            std::env::temp_dir().join(format!("agent-html-app-{suffix}-{nonce}")),
        )
        .expect("temp dir should be valid UTF-8")
    }
}
