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
          radial-gradient(circle at top, rgba(255, 122, 26, 0.1), transparent 28%),
          linear-gradient(180deg, #0f141b 0%, #10161f 100%);
        padding: 32px;
      }
      main {
        max-width: 920px;
        margin: 0 auto;
        display: grid;
        gap: 18px;
      }
      .hero,
      .card {
        border: 1px solid rgba(145, 167, 199, 0.14);
        border-radius: 18px;
        background: rgba(18, 25, 34, 0.88);
      }
      .hero {
        padding: 28px;
        display: grid;
        gap: 14px;
      }
      .eyebrow {
        width: fit-content;
        border: 1px solid rgba(255, 122, 26, 0.22);
        border-radius: 999px;
        background: rgba(255, 122, 26, 0.1);
        color: #ffb06b;
        font-size: 11px;
        font-weight: 600;
        letter-spacing: 0.08em;
        padding: 6px 10px;
        text-transform: uppercase;
      }
      h1 {
        margin: 0;
        font-size: 34px;
        line-height: 1.08;
        letter-spacing: -0.04em;
      }
      p {
        margin: 0;
        color: #9aabc4;
        line-height: 1.6;
      }
      .meta {
        display: flex;
        flex-wrap: wrap;
        gap: 10px;
      }
      .chip {
        border: 1px solid rgba(145, 167, 199, 0.14);
        border-radius: 999px;
        padding: 6px 10px;
        color: #d8e1ee;
        font-size: 13px;
      }
      .card {
        padding: 22px;
        display: grid;
        gap: 14px;
      }
      .card h2 {
        margin: 0;
        font-size: 15px;
      }
      ul {
        margin: 0;
        padding-left: 18px;
        color: #d8e1ee;
        display: grid;
        gap: 10px;
      }
    </style>
  </head>
  <body>
    <main>
      <section class="hero">
        <span class="eyebrow">Recommendation</span>
        <h1>Choose Vendor A for the initial rollout.</h1>
        <p>Lower migration risk and faster delivery make Vendor A the safest launch path, with targeted monitoring after release.</p>
        <div class="meta">
          <span class="chip">Lower migration risk</span>
          <span class="chip">Faster initial rollout</span>
          <span class="chip">Needs post-launch monitoring</span>
        </div>
      </section>
      <section class="card">
        <h2>Decision Notes</h2>
        <ul>
          <li>Migration complexity stays inside the current delivery window.</li>
          <li>Support load is lower during the initial release phase.</li>
          <li>Observability and rollback playbooks still need to be finalized.</li>
        </ul>
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
