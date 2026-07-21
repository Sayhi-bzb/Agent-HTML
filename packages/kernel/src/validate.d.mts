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
  canvas: {
    id: string
    title?: string
  }
  nodes: Array<{
    height?: number
    id: string
    index?: string
    parentId?: string
    sourcePath?: string
    title?: string
    type?: string
    width?: number
    x?: number
    y?: number
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
