import { mockAppState, mockPreviewHtml } from "@/lib/mock-data"
import type {
  AgentShellMessage,
  BuildRunSummary,
  DiagnosticItem,
  InspectSnapshot,
  LogSnapshot,
  RuntimeReport,
  SessionDetail,
  SessionSummary,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

type MockSessionSeed = {
  source: string
  fallbackLead: string
  fallbackNotes: string[]
}

const mockSessionSeeds: Record<string, MockSessionSeed> = {
  "session-vendor-decision": {
    source: mockAppState.currentSession.source,
    fallbackLead: "Choose Vendor A for the initial rollout.",
    fallbackNotes: [
      "Lower migration risk.",
      "Faster initial rollout.",
      "Needs stricter post-launch monitoring.",
    ],
  },
  "session-stream-review": {
    source: `<meta-agent profile="review-dense" />

<page title="Streaming Review">
  <alert title="Release Stance" tone="neutral">
    Keep the staged rollout and monitor transport regressions before broad release.
  </alert>

  <card title="Review Notes">
    <list variant="unordered">
      <item>Edge buffering behavior still needs verification under load.</item>
      <item>Transport fallback logic should stay enabled for the next cohort.</item>
      <item>Watch reconnect latency before expanding the rollout window.</item>
    </list>
  </card>
</page>`,
    fallbackLead:
      "Keep the staged rollout and monitor transport regressions before broad release.",
    fallbackNotes: [
      "Edge buffering behavior still needs verification under load.",
      "Transport fallback logic should stay enabled for the next cohort.",
      "Watch reconnect latency before expanding the rollout window.",
    ],
  },
}

function nowIso(): string {
  return new Date().toISOString()
}

function stripMarkup(value: string): string {
  return value.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim()
}

function pluralize(count: number, noun: string): string {
  return `${count} ${noun}${count === 1 ? "" : "s"}`
}

function countMatches(source: string, pattern: RegExp): number {
  return Array.from(source.matchAll(pattern)).length
}

function getMockSeed(summary: SessionSummary): MockSessionSeed {
  const seed = mockSessionSeeds[summary.id]
  if (seed) {
    return seed
  }

  return {
    source: `<meta-agent profile="review-dense" />

<page title="${summary.name}">
  <alert title="Recommendation" tone="neutral">
    Review the latest changes for ${summary.name} before sharing the artifact.
  </alert>

  <card title="Decision Notes">
    <list variant="unordered">
      <item>Confirm the current recommendation.</item>
      <item>Rebuild the preview before final review.</item>
      <item>Check inspect output for unresolved warnings.</item>
    </list>
  </card>
</page>`,
    fallbackLead: `Review the latest changes for ${summary.name} before sharing the artifact.`,
    fallbackNotes: [
      "Confirm the current recommendation.",
      "Rebuild the preview before final review.",
      "Check inspect output for unresolved warnings.",
    ],
  }
}

function extractMatch(source: string, pattern: RegExp): string | undefined {
  const match = pattern.exec(source)
  if (!match) {
    return undefined
  }

  return stripMarkup(match[1] ?? "")
}

function extractListItems(source: string): string[] {
  return Array.from(source.matchAll(/<item>([\s\S]*?)<\/item>/g))
    .map((match) => stripMarkup(match[1] ?? ""))
    .filter(Boolean)
}

function extractPageTitle(source: string, fallback: string): string {
  return extractMatch(source, /<page[^>]*title="([^"]+)"/) ?? fallback
}

function extractLead(source: string, fallback: string): string {
  return (
    extractMatch(source, /<alert[^>]*>([\s\S]*?)<\/alert>/) ??
    extractMatch(source, /<card[^>]*>([\s\S]*?)<\/card>/) ??
    fallback
  )
}

function summarizeStructure(source: string): string {
  const parts = [
    pluralize(countMatches(source, /<page\b/g), "page"),
    pluralize(countMatches(source, /<alert\b/g), "alert"),
    pluralize(countMatches(source, /<card\b/g), "card"),
    pluralize(countMatches(source, /<list\b/g), "list"),
    pluralize(countMatches(source, /<item>/g), "item"),
  ]

  return parts.join(", ")
}

function createPaths(summary: SessionSummary): Pick<
  SessionDetail,
  "sourcePath" | "previewPath" | "logDirectory" | "chatPath"
> {
  return {
    sourcePath: `${summary.directory}/source.agent.html`,
    previewPath: `${summary.directory}/build/index.html`,
    logDirectory: `${summary.directory}/logs`,
    chatPath: `${summary.directory}/chat.jsonl`,
  }
}

function createDiagnostics(
  summary: SessionSummary,
  source: string,
  includePreviewWarning: boolean,
): DiagnosticItem[] {
  const diagnostics: DiagnosticItem[] = []

  if (!source.includes("<page")) {
    diagnostics.push({
      id: `${summary.id}-missing-page`,
      severity: "error",
      message: "Source is missing a <page> root node.",
      source: "source",
      code: "page-missing",
    })
  }

  if (includePreviewWarning && summary.status === "dirty") {
    diagnostics.push({
      id: `${summary.id}-preview-stale`,
      severity: "warning",
      message: "Build preview is older than the latest saved source.",
      source: "build",
      code: "preview-stale",
    })
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      id: `${summary.id}-structure-ok`,
      severity: "info",
      message: "Mock review found no structural issues in the current source.",
      source: "source",
      code: "structure-ok",
    })
  }

  return diagnostics
}

function escapeHtml(value: string): string {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;")
}

export function createInitialMockSessionSources(
  summaries: SessionSummary[],
): Record<string, string> {
  return Object.fromEntries(
    summaries.map((summary) => [summary.id, getMockSeed(summary).source]),
  )
}

export function createMockSessionDetail(
  summary: SessionSummary,
  source: string,
  currentView: WorkbenchView,
): SessionDetail {
  return {
    summary,
    ...createPaths(summary),
    currentView,
    source,
  }
}

export function createMockBuildSummary(
  summary: SessionSummary,
  session: SessionDetail,
): BuildRunSummary {
  const startedAt = summary.lastBuildAt ?? summary.updatedAt

  if (!summary.hasPreview) {
    return {
      runId: `${summary.id}-idle`,
      sessionId: summary.id,
      startedAt,
      status: "idle",
    }
  }

  return {
    runId: `${summary.id}-build`,
    sessionId: summary.id,
    startedAt,
    finishedAt: startedAt,
    status: "succeeded",
    exitCode: 0,
    stdoutPath: `${session.logDirectory}/build.stdout.log`,
    stderrPath: `${session.logDirectory}/build.stderr.log`,
    previewPath: session.previewPath,
  }
}

export function createMockInspectSnapshot(
  summary: SessionSummary,
  session: SessionDetail,
  source: string,
): InspectSnapshot {
  return {
    sessionId: summary.id,
    generatedAt: summary.updatedAt,
    diagnostics: createDiagnostics(summary, source, true),
    structureSummary: summarizeStructure(source),
    lastBuild: createMockBuildSummary(summary, session),
  }
}

export function createMockLogs(
  summary: SessionSummary,
  source: string,
): LogSnapshot {
  return {
    stdout: JSON.stringify(
      {
        kind: "agent-html-mock-runtime",
        sessionId: summary.id,
        status: summary.status,
        structure: summarizeStructure(source),
      },
      null,
      2,
    ),
    stderr: "",
  }
}

export function createMockPreviewHtml(
  summary: SessionSummary,
  source: string,
): string | undefined {
  if (!summary.hasPreview) {
    return undefined
  }

  if (
    summary.id === mockAppState.currentSession.summary.id &&
    source === mockAppState.currentSession.source
  ) {
    return mockPreviewHtml
  }

  const seed = getMockSeed(summary)
  const title = extractPageTitle(source, summary.name)
  const lead = extractLead(source, seed.fallbackLead)
  const notes = extractListItems(source)
  const finalNotes = notes.length > 0 ? notes : seed.fallbackNotes

  // This inline HTML/CSS is sample artifact content for the preview pane.
  // It intentionally does not inherit the app shell design system contract.
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>${escapeHtml(title)}</title>
    <style>
      :root {
        color-scheme: dark;
        font-family: ui-sans-serif, system-ui, sans-serif;
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
        gap: 28px;
        min-height: 100vh;
        padding: 32px 36px 40px;
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
      .divider {
        height: 1px;
        background: rgba(145, 167, 199, 0.12);
      }
    </style>
  </head>
  <body>
    <main>
      <div class="topline">
        <span>${escapeHtml(summary.name)}</span>
        <span class="status">${escapeHtml(summary.status)}</span>
      </div>
      <h1>${escapeHtml(title)}</h1>
      <p>${escapeHtml(lead)}</p>
      <div class="divider"></div>
      <ul>
        ${finalNotes.map((item) => `<li>${escapeHtml(item)}</li>`).join("")}
      </ul>
    </main>
  </body>
</html>`
}

export function createMockValidationSnapshot(
  summary: SessionSummary,
  source: string,
): SourceValidationSnapshot {
  const diagnostics = createDiagnostics(summary, source, false)
  const hasErrors = diagnostics.some((item) => item.severity === "error")

  return {
    sessionId: summary.id,
    validatedAt: nowIso(),
    status: hasErrors ? "invalid" : "valid",
    diagnostics,
    structureSummary: summarizeStructure(source),
  }
}

export function createMockRuntimeReport(): RuntimeReport {
  return {
    kind: "agent-html-doctor-report",
    version: 1,
    status: "ok",
    packageVersion: "mock-local",
    runtimeRoot: "mock://runtime",
    outputDir: "mock://runtime/output",
    counts: {
      ok: 4,
      warn: 0,
      skip: 1,
      fail: 0,
    },
    checks: [
      {
        category: "runtime",
        name: "mock-mode",
        status: "ok",
        detail: "Mock runtime state is active in the browser workspace.",
      },
      {
        category: "preview",
        name: "preview-renderer",
        status: "ok",
        detail: "Preview HTML is generated from the current mock session source.",
      },
      {
        category: "inspect",
        name: "inspect-pipeline",
        status: "ok",
        detail: "Inspect diagnostics are derived from the current source snapshot.",
      },
      {
        category: "network",
        name: "provider-link",
        status: "skip",
        detail: "Live provider integration is intentionally unavailable in mock mode.",
      },
      {
        category: "sessions",
        name: "session-store",
        status: "ok",
        detail: "Session switching is handled locally without a Tauri backend.",
      },
    ],
  }
}

export function createMockProposalMessage(
  summary: SessionSummary,
  source: string,
): AgentShellMessage {
  const title = extractPageTitle(source, summary.name)
  const notes = extractListItems(source)
  const focus = notes.length > 0 ? notes : getMockSeed(summary).fallbackNotes

  return {
    id: `proposal-${summary.id}-${Date.now()}`,
    role: "placeholder",
    createdAt: nowIso(),
    kind: "proposal-placeholder",
    text: [
      `Proposal for ${title}`,
      `- [source] Re-read the current recommendation before editing downstream copy.`,
      `- [build] Rebuild the preview after changing the session source so the artifact is current.`,
      `- [review] Verify ${focus[0]} before treating this session as ready.`,
    ].join("\n"),
    proposalSnapshot: {
      source,
      lineCount: source.split(/\r?\n/).length,
    },
  }
}

export function createMockBaseChat(
  summary: SessionSummary,
  source: string,
): AgentShellMessage[] {
  return [
    {
      id: `system-${summary.id}`,
      role: "system",
      createdAt: summary.updatedAt,
      kind: "message",
      text: "Agent shell is running in local mock mode.",
    },
    createMockProposalMessage(summary, source),
  ]
}

export function createInitialMockSessionChats(
  summaries: SessionSummary[],
  sources: Record<string, string>,
): Record<string, AgentShellMessage[]> {
  return Object.fromEntries(
    summaries.map((summary) => {
      const source = sources[summary.id] ?? getMockSeed(summary).source
      return [summary.id, createMockBaseChat(summary, source)]
    }),
  )
}

export function createMockUserMessage(text: string): AgentShellMessage {
  return {
    id: `user-${Date.now()}`,
    role: "user",
    createdAt: nowIso(),
    kind: "message",
    text,
  }
}

export function createMockSessionSummary(
  name: string,
  index: number,
): SessionSummary {
  const slug = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")

  const createdAt = nowIso()

  return {
    id: `session-${slug || "new"}-${index}`,
    name,
    directory: `D:/Users/demo/.agent-html-app/sessions/${slug || `session-${index}`}`,
    status: "draft",
    pinned: false,
    updatedAt: createdAt,
    hasPreview: false,
  }
}
