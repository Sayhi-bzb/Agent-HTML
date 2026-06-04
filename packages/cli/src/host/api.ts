import type { Artifact, GuardIssue } from "./host-contracts"

export const hostApiRoutes = {
  artifactBundle: "/__agent-html/artifact.js",
  artifacts: "/__agent-html/artifacts",
  blockSource: "/__agent-html/block-source",
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

export async function fetchBlockSource({
  blockId,
  filePath,
}: {
  blockId: string
  filePath: string
}) {
  const params = new URLSearchParams({ blockId, filePath })
  return fetchJson<{ selectedSource: string | null }>(
    `${hostApiRoutes.blockSource}?${params}`
  )
}

export function artifactBundleUrl(filePath: string) {
  const params = new URLSearchParams({
    filePath,
    v: String(Date.now()),
  })
  return `${hostApiRoutes.artifactBundle}?${params}`
}

export function artifactLabel(filePath: string) {
  return filePath.split(/[\\/]/).at(-1) ?? filePath
}
