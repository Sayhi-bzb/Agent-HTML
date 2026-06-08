import type {
  Artifact,
  GuardIssue,
} from "../host-contracts"

export const hostApiRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifacts: "/__agent-html/artifacts",
  blockImplementation: "/__agent-html/block-implementation",
  codexThreads: "/__agent-html/codex/threads",
  codexTranscript: "/__agent-html/codex/transcript",
  codexTurn: "/__agent-html/codex/turn",
} as const

export const artifactRenderedEventName = "agent-html:artifact-rendered"

export async function fetchJson<T>(url: string): Promise<T> {
  const response = await fetch(url)
  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Request failed: ${response.status}`)
  }

  return data
}

export async function fetchArtifacts() {
  return fetchJson<{
    artifacts: Artifact[]
    guardIssues: GuardIssue[]
  }>(hostApiRoutes.artifacts)
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
  }>(
    `${hostApiRoutes.blockImplementation}?${params}`
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
  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Request failed: ${response.status}`)
  }

  return data as {
    startedNewThread: boolean
    threadId: string
    turnId?: string | null
  }
}

export function artifactBundleUrl(filePath: string) {
  const params = new URLSearchParams({
    filePath,
    v: String(Date.now()),
  })
  return `${hostApiRoutes.artifactBundle}?${params}`
}

export function artifactLabel(filePath: string) {
  const fileName = filePath.split(/[\\/]/).at(-1) ?? filePath
  return fileName.endsWith(".artifact.tsx")
    ? fileName.slice(0, -".artifact.tsx".length)
    : fileName
}
