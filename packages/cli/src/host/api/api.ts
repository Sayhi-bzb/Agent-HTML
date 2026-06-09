import type {
  Artifact,
  GuardIssue,
} from "../host-contracts"

export type CodexThread = {
  createdAt?: string
  id: string
  name: string | null
  preview?: string
  status: string | null
  updatedAt?: string
}

export const hostApiRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifactDelete: "/__agent-html/artifact/delete",
  artifactRename: "/__agent-html/artifact/rename",
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
    status?: "checking" | "ready"
    version?: number
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

export async function fetchCodexThreads() {
  return fetchJson<{
    cwd: string
    threads: CodexThread[]
  }>(hostApiRoutes.codexThreads)
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
  const data = await response.json()

  if (!response.ok || data.error) {
    throw new Error(data.error ?? `Request failed: ${response.status}`)
  }

  return data as {
    filePath: string
  }
}

export async function deleteArtifact({ filePath }: { filePath: string }) {
  const response = await fetch(hostApiRoutes.artifactDelete, {
    body: JSON.stringify({ filePath }),
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
    ok: true
  }
}

export function artifactBundleUrl(filePath: string, version: string | number = 0) {
  const params = new URLSearchParams({
    filePath,
    v: String(version),
  })
  return `${hostApiRoutes.artifactBundle}?${params}`
}

export function artifactLabel(filePath: string) {
  const fileName = filePath.split(/[\\/]/).at(-1) ?? filePath
  return fileName.endsWith(".artifact.tsx")
    ? fileName.slice(0, -".artifact.tsx".length)
    : fileName
}
