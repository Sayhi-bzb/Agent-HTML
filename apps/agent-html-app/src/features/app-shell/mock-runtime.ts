import { mockAppState, mockPreviewHtml } from "@/lib/mock-data"
import type {
  BuildRunSummary,
  DiagnosticItem,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
  SessionSummary,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"
import { createMockPreviewArtifact } from "./mock-preview-artifact"

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
    Hold the current line.
  </alert>

  <card title="Decision Notes">
    <list variant="unordered">
      <item>Confirm the current recommendation.</item>
      <item>Preview stale.</item>
      <item>One open warning.</item>
    </list>
  </card>
</page>`,
    fallbackLead: "Hold the current line.",
    fallbackNotes: [
      "Confirm the current recommendation.",
      "Preview stale.",
      "One open warning.",
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
  "sourcePath" | "previewPath" | "logDirectory"
> {
  return {
    sourcePath: `${summary.directory}/source.agent.html`,
    previewPath: `${summary.directory}/build/index.html`,
    logDirectory: `${summary.directory}/logs`,
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
      message: "Page missing.",
      source: "source",
      code: "page-missing",
    })
  }

  if (includePreviewWarning && summary.status === "dirty") {
    diagnostics.push({
      id: `${summary.id}-preview-stale`,
      severity: "warning",
      message: "Preview stale.",
      source: "build",
      code: "preview-stale",
    })
  }

  if (diagnostics.length === 0) {
    diagnostics.push({
      id: `${summary.id}-structure-ok`,
      severity: "info",
      message: "Clear.",
      source: "source",
      code: "structure-ok",
    })
  }

  return diagnostics
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
    ...summary,
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
  const diagnostics = createDiagnostics(summary, source, true)
  const issue = diagnostics.find((item) => item.severity !== "info")

  return {
    stdout: issue ? `${issue.message}\n${summarizeStructure(source)}` : "",
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
    summary.id === mockAppState.currentSession.id &&
    source === mockAppState.currentSession.source
  ) {
    return mockPreviewHtml
  }

  const seed = getMockSeed(summary)
  const title = extractPageTitle(source, summary.name)
  const lead = extractLead(source, seed.fallbackLead)
  const notes = extractListItems(source)
  const finalNotes = notes.length > 0 ? notes : seed.fallbackNotes

  return createMockPreviewArtifact(summary, title, lead, finalNotes)
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
    updatedAt: createdAt,
    hasPreview: false,
  }
}
