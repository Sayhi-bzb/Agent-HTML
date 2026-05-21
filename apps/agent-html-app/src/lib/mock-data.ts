import type {
  AgentShellMessage,
  AppState,
  BuildRunSummary,
  DiagnosticItem,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
  SessionSummary,
} from "./types"

const now = "2026-05-15T12:45:00.000Z"

const sessions: SessionSummary[] = [
  {
    id: "session-vendor-decision",
    name: "Vendor Decision",
    directory: "D:/Users/demo/.agent-html-app/sessions/vendor-decision",
    status: "dirty",
    pinned: true,
    updatedAt: now,
    lastBuildAt: "2026-05-15T12:30:00.000Z",
    hasPreview: true,
  },
  {
    id: "session-stream-review",
    name: "Streaming Review",
    directory: "D:/Users/demo/.agent-html-app/sessions/streaming-review",
    status: "ready",
    pinned: false,
    updatedAt: "2026-05-15T11:50:00.000Z",
    lastBuildAt: "2026-05-15T11:48:00.000Z",
    hasPreview: true,
  },
]

const currentSession: SessionDetail = {
  summary: sessions[0],
  sourcePath: "D:/Users/demo/.agent-html-app/sessions/vendor-decision/source.agent.html",
  previewPath: "D:/Users/demo/.agent-html-app/sessions/vendor-decision/build/index.html",
  logDirectory: "D:/Users/demo/.agent-html-app/sessions/vendor-decision/logs",
  chatPath: "D:/Users/demo/.agent-html-app/sessions/vendor-decision/chat.jsonl",
  currentView: "preview",
  source: `<meta-agent profile="review-dense" />\n\n<page title="Vendor Decision">\n  <alert title="Recommendation" tone="neutral">\n    Choose Vendor A for the initial rollout.\n  </alert>\n\n  <card title="Decision Notes">\n    <list variant="unordered">\n      <item>Lower migration risk.</item>\n      <item>Faster initial rollout.</item>\n      <item>Needs stricter post-launch monitoring.</item>\n    </list>\n  </card>\n</page>`,
}

const diagnostics: DiagnosticItem[] = [
  {
    id: "diag-1",
    severity: "warning",
    message: "Build preview is older than source changes.",
    source: "build",
    code: "preview-stale",
  },
  {
    id: "diag-2",
    severity: "info",
    message: "No schema violations detected in the latest source snapshot.",
    source: "source",
  },
]

const currentBuild: BuildRunSummary = {
  runId: "build-20260515-1230",
  sessionId: currentSession.summary.id,
  startedAt: "2026-05-15T12:30:00.000Z",
  finishedAt: "2026-05-15T12:30:04.000Z",
  status: "succeeded",
  exitCode: 0,
  stdoutPath: `${currentSession.logDirectory}/build-20260515-1230.stdout.log`,
  stderrPath: `${currentSession.logDirectory}/build-20260515-1230.stderr.log`,
  previewPath: currentSession.previewPath,
}

// This mock preview is sample artifact content for the preview pane.
// It intentionally does not define the app shell theme contract.
const previewHtml = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>Vendor Decision</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: "Inter", system-ui, sans-serif;
        background: #0f141b;
        color: #eef3fb;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        min-height: 100vh;
        background:
          radial-gradient(circle at top, rgba(255, 122, 26, 0.08), transparent 22%),
          linear-gradient(180deg, #0d1218 0%, #10151c 100%);
        padding: 0;
      }
      main {
        max-width: 980px;
        margin: 0 auto;
        display: grid;
        gap: 0;
        min-height: 100vh;
        padding: 32px 36px 40px;
      }
      .review-shell {
        display: grid;
        gap: 28px;
      }
      .topline {
        display: flex;
        align-items: center;
        gap: 12px;
        color: #90a0b8;
        font-size: 12px;
        letter-spacing: 0.06em;
        text-transform: uppercase;
      }
      .status {
        color: #ffbf7f;
        font-weight: 600;
      }
      h1 {
        margin: 0;
        max-width: 14ch;
        font-size: 44px;
        line-height: 1.02;
        letter-spacing: -0.05em;
      }
      p {
        margin: 0;
        color: #9aabc4;
        line-height: 1.6;
      }
      .summary {
        max-width: 60ch;
        font-size: 18px;
        color: #a8b7cc;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip {
        border: 1px solid rgba(145, 167, 199, 0.1);
        border-radius: 999px;
        padding: 5px 10px;
        color: #cfd8e5;
        font-size: 12px;
      }
      .divider {
        height: 1px;
        background: rgba(145, 167, 199, 0.12);
      }
      .notes {
        display: grid;
        gap: 16px;
      }
      .notes-head {
        display: flex;
        align-items: baseline;
        justify-content: space-between;
        gap: 16px;
      }
      .notes h2 {
        margin: 0;
        font-size: 15px;
        letter-spacing: -0.02em;
      }
      .notes-meta {
        color: #76849b;
        font-size: 13px;
      }
      ul {
        margin: 0;
        padding-left: 20px;
        color: #dbe4ef;
        display: grid;
        gap: 12px;
      }
      li::marker {
        color: #6c7b92;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="review-shell">
        <div class="topline">
          <span>Vendor decision</span>
          <span class="status">Recommendation</span>
        </div>
        <h1>Choose Vendor A for the initial rollout.</h1>
        <p class="summary">Lower migration risk and faster delivery make Vendor A the safest launch path, with targeted monitoring after release.</p>
        <div class="meta">
          <span class="chip">Lower migration risk</span>
          <span class="chip">Faster initial rollout</span>
          <span class="chip">Needs post-launch monitoring</span>
        </div>
        <div class="divider"></div>
        <section class="notes">
          <div class="notes-head">
            <h2>Decision notes</h2>
            <span class="notes-meta">Review before publish</span>
          </div>
          <ul>
            <li>Migration complexity stays inside the current delivery window.</li>
            <li>Support load is lower during the initial release phase.</li>
            <li>Observability and rollback playbooks still need to be finalized.</li>
          </ul>
        </section>
      </section>
    </main>
  </body>
</html>`

const currentInspect: InspectSnapshot = {
  sessionId: currentSession.summary.id,
  generatedAt: now,
  diagnostics,
  structureSummary: "1 page, 1 alert, 1 card, 1 list, 3 items",
  lastBuild: currentBuild,
}

const chat: AgentShellMessage[] = [
  {
    id: "msg-1",
    role: "system",
    createdAt: now,
    text: "Agent shell is scaffolded. Live provider integration is intentionally disabled in v1.",
    kind: "message",
  },
  {
    id: "msg-2",
    role: "placeholder",
    createdAt: now,
    text: [
      "Proposal for Vendor Decision",
      "- [build] Rebuild after updating the decision notes so Preview matches the latest source.",
      "- [review] Compare the refreshed preview against the current recommendation card before sharing the artifact.",
      "- [inspect] Clear the stale-preview warning in Inspect before treating this session as ready.",
    ].join("\n"),
    kind: "proposal-placeholder",
    proposalSnapshot: {
      lineCount: currentSession.source.split(/\r?\n/).length,
      source: currentSession.source,
    },
  },
]

const currentLogs: LogSnapshot = {
  stdout: "{\n  \"kind\": \"agent-html-build-result\",\n  \"ok\": true\n}",
  stderr: "",
}

export const mockAppState: AppState = {
  sessions,
  currentSession,
  currentInspect,
  currentBuild,
  currentLogs,
  chat,
}

export const mockPreviewHtml = previewHtml
