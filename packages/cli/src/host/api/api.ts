import type {
  CanvasInspectionDocument,
  CanvasLayoutDocument,
  CanvasViewport,
} from "@agent-html/kernel"

import type { Artifact, CanvasDiagnostic, CanvasEntry } from "../host-contracts"

export type CodexThread = {
  createdAt?: string
  id: string
  name: string | null
  preview?: string
  status: string | null
  updatedAt?: string
}

export type CodexTranscriptItem = {
  aggregatedOutput?: string
  argumentsText?: string
  command?: string
  contentText?: string
  cwd?: string
  id: string
  phase?: string
  query?: string
  resultText?: string
  server?: string
  status?: string
  summaryText?: string
  tool?: string
  type: string
}

export type CodexTranscriptTurn = {
  id: string
  items: CodexTranscriptItem[]
  status?: string
}

export type CodexTranscript = {
  notifications: unknown[]
  threadId: string
  turns: CodexTranscriptTurn[]
}

export const hostApiRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifactCreate: "/__agent-html/artifact/create",
  artifactDelete: "/__agent-html/artifact/delete",
  artifactRename: "/__agent-html/artifact/rename",
  artifactTitle: "/__agent-html/artifact/title",
  artifacts: "/__agent-html/artifacts",
  canvasBundle: "/__agent-html/canvas.js",
  canvasInspection: "/__agent-html/canvas/inspection",
  canvasLayout: "/__agent-html/canvas/layout",
  canvases: "/__agent-html/canvases",
  blockImplementation: "/__agent-html/block-implementation",
  codexThreads: "/__agent-html/codex/threads",
  codexTranscript: "/__agent-html/codex/transcript",
  codexTurn: "/__agent-html/codex/turn",
  fontStylesheet: "/__agent-html/font-stylesheet",
  publicAsset: "/__agent-html/public/",
} as const

export const artifactRenderedEventName = "agent-html:artifact-rendered"

async function readHostJsonResponse<T>(
  response: Response,
  url: string
): Promise<T> {
  const contentType = response.headers?.get("Content-Type") ?? ""

  if (contentType && !contentType.includes("application/json")) {
    const body =
      typeof response.text === "function" ? await response.text() : ""
    const returnedHtml =
      contentType.includes("text/html") ||
      body.trimStart().toLowerCase().startsWith("<!doctype html")

    if (returnedHtml || contentType) {
      const message = returnedHtml
        ? `Host API route returned HTML instead of JSON: ${url}`
        : `Host API route returned ${contentType}: ${url}`

      throw new Error(message)
    }

    let data: { error?: string }
    try {
      data = JSON.parse(body)
    } catch {
      throw new Error(`Host API route returned non-JSON: ${url}`)
    }

    if (!response.ok || data.error) {
      throw new Error(data.error ?? `Request failed: ${response.status}`)
    }

    return data as T
  }

  if (!contentType && typeof response.clone === "function") {
    try {
      const body = await response.clone().text()

      if (body.trimStart().toLowerCase().startsWith("<!doctype html")) {
        throw new Error(`Host API route returned HTML instead of JSON: ${url}`)
      }
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.startsWith("Host API route returned HTML")
      ) {
        throw error
      }
    }
  }

  let data: { error?: string }
  try {
    data = await response.json()
  } catch {
    throw new Error(`Host API route returned non-JSON: ${url}`)
  }

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Request failed: ${response.status}`)
  }

  return data as T
}

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return readHostJsonResponse<T>(response, url)
}

export async function fetchArtifacts({
  refresh = false,
}: {
  refresh?: boolean
} = {}) {
  const url = refresh
    ? `${hostApiRoutes.artifacts}?refresh=1`
    : hostApiRoutes.artifacts

  return fetchJson<{
    artifacts: Artifact[]
    diagnostics: CanvasDiagnostic[]
    status?: "checking" | "ready"
    version?: number
  }>(url)
}

export async function fetchCanvases({
  refresh = false,
}: {
  refresh?: boolean
} = {}) {
  const url = refresh
    ? `${hostApiRoutes.canvases}?refresh=1`
    : hostApiRoutes.canvases

  return fetchJson<{
    canvases: CanvasEntry[]
    status?: "checking" | "ready"
    version?: number
  }>(url)
}

export async function fetchCanvasLayout(filePath: string) {
  const params = new URLSearchParams({ filePath })
  return fetchJson<{
    layout: CanvasLayoutDocument
    layoutPath: string
    storage: "monolithic" | "sharded"
  }>(`${hostApiRoutes.canvasLayout}?${params}`)
}

export async function saveCanvasLayout({
  filePath,
  layout,
}: {
  filePath: string
  layout: CanvasLayoutDocument
}) {
  const response = await fetch(hostApiRoutes.canvasLayout, {
    body: JSON.stringify({ filePath, layout }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })
  return readHostJsonResponse<{
    layout: CanvasLayoutDocument
    layoutPath: string
    storage: "monolithic" | "sharded"
  }>(response, hostApiRoutes.canvasLayout)
}

export async function saveCanvasLayoutPatch({
  filePath,
  nodes = {},
  removedNodeIds = [],
  viewport,
}: {
  filePath: string
  nodes?: CanvasLayoutDocument["nodes"]
  removedNodeIds?: readonly string[]
  viewport?: CanvasViewport
}) {
  const response = await fetch(hostApiRoutes.canvasLayout, {
    body: JSON.stringify({
      filePath,
      nodes,
      ...(removedNodeIds.length > 0 ? { removedNodeIds } : {}),
      ...(viewport ? { viewport } : {}),
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })
  return readHostJsonResponse<{
    layoutPath: string
    nodes: CanvasLayoutDocument["nodes"]
    removedNodeIds: string[]
    storage: "monolithic" | "sharded"
    viewport?: CanvasViewport
  }>(response, hostApiRoutes.canvasLayout)
}

export async function publishCanvasInspection(
  document: CanvasInspectionDocument
) {
  const response = await fetch(hostApiRoutes.canvasInspection, {
    body: JSON.stringify({ document }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  })
  return readHostJsonResponse<{
    ok: true
    sourceFilePath: string
  }>(response, hostApiRoutes.canvasInspection)
}

export async function fetchBlockImplementation({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  const params = new URLSearchParams({ blockId, filePath })
  return fetchJson<{
    implementationPath: string | null
  }>(`${hostApiRoutes.blockImplementation}?${params}`)
}

export async function fetchCodexThreads() {
  return fetchJson<{
    cwd: string
    threads: CodexThread[]
  }>(hostApiRoutes.codexThreads)
}

export async function fetchCodexTranscript(threadId: string) {
  const params = new URLSearchParams({ threadId })
  return fetchJson<CodexTranscript>(
    `${hostApiRoutes.codexTranscript}?${params}`
  )
}

export async function startCodexTurn({
  prompt,
  threadId,
}: {
  prompt: string
  threadId?: string | null
}) {
  const response = await fetch(hostApiRoutes.codexTurn, {
    body: JSON.stringify({ prompt, threadId: threadId ?? null }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
  return readHostJsonResponse<{
    startedNewThread: boolean
    threadId: string
    turnId?: string | null
  }>(response, hostApiRoutes.codexTurn)
}

export async function renameArtifact({
  filePath,
  nextFileName,
}: {
  filePath: string
  nextFileName: string
}) {
  const response = await fetch(hostApiRoutes.artifactRename, {
    body: JSON.stringify({ filePath, nextFileName }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
  return readHostJsonResponse<{
    filePath: string
  }>(response, hostApiRoutes.artifactRename)
}

export async function renameArtifactTitle({
  filePath,
  title,
}: {
  filePath: string
  title: string
}) {
  const response = await fetch(hostApiRoutes.artifactTitle, {
    body: JSON.stringify({ filePath, title }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
  return readHostJsonResponse<{
    filePath: string
    title: string
  }>(response, hostApiRoutes.artifactTitle)
}

export async function createArtifact({
  filePath,
  request,
}: {
  filePath: string
  request: string
}) {
  const response = await fetch(hostApiRoutes.artifactCreate, {
    body: JSON.stringify({ filePath, request }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
  return readHostJsonResponse<{
    filePath: string
  }>(response, hostApiRoutes.artifactCreate)
}

export async function deleteArtifact({ filePath }: { filePath: string }) {
  const response = await fetch(hostApiRoutes.artifactDelete, {
    body: JSON.stringify({ filePath }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  })
  return readHostJsonResponse<{
    ok: true
  }>(response, hostApiRoutes.artifactDelete)
}

export function artifactBundleUrl(
  filePath: string,
  version: string | number = 0
) {
  const params = new URLSearchParams({
    filePath,
    v: String(version),
  })
  return `${hostApiRoutes.artifactBundle}?${params}`
}

export function canvasBundleUrl(
  filePath: string,
  version: string | number = 0
) {
  const params = new URLSearchParams({
    filePath,
    v: String(version),
  })
  return `${hostApiRoutes.canvasBundle}?${params}`
}

export function isArtifactBundleUrl(url: string) {
  return url.startsWith(`${hostApiRoutes.artifactBundle}?`)
}

export function fontStylesheetUrl(sourceUrl: string) {
  const params = new URLSearchParams({
    url: sourceUrl,
  })
  return `${hostApiRoutes.fontStylesheet}?${params}`
}

export function publicAssetUrl(pathname: string) {
  return `${hostApiRoutes.publicAsset}${pathname.replace(/^\/+/, "")}`
}

export function artifactLabel(filePath: string) {
  const fileName = filePath.split(/[\\/]/).at(-1) ?? filePath
  return fileName.endsWith(".artifact.tsx")
    ? fileName.slice(0, -".artifact.tsx".length)
    : fileName
}
