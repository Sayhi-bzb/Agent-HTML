import type {
  KernelDiagnostic,
  NormalizedArtifactDefinition,
} from "./index.mjs"

export type ArtifactInspection = {
  diagnostics: KernelDiagnostic[]
  metadata: {
    blocks: NormalizedArtifactDefinition["blocks"]
    title: string | null
  }
}

export type StaticCanvasIntent = {
  canvas: Record<string, never>
  nodes: Array<{
    id: string
    parentId?: string
    siblingOrder: number
    sources: string[]
  }>
}

export function extractStaticCanvasIntent(input: {
  filePath: string
  source: string
}): StaticCanvasIntent

export function extractStaticCanvasIntentGraph(input: {
  filePath: string
  loadModule: (input: {
    fromFilePath: string
    specifier: string
  }) => Promise<{ filePath: string; source: string }>
  source: string
}): Promise<StaticCanvasIntent>

export function reparentStaticCanvasNodes(input: {
  nodeIds: string[]
  parentId?: string | null
  source: string
}): { source: string }

export function reorderStaticCanvasNodes(input: {
  groups: Array<{
    nodeIds: string[]
    parentId: string | null
  }>
  source: string
}): { source: string }

export function inspectArtifactEntry(input: {
  filePath: string
  source: string
}): ArtifactInspection

export function replaceArtifactTitle(input: {
  filePath: string
  source: string
  title: string
}): {
  source: string
  title: string
}

export function validateArtifactEntry(input: {
  filePath: string
  source: string
}): KernelDiagnostic[]

export function validateBlockImplementation(input: {
  filePath: string
  source: string
}): KernelDiagnostic[]
