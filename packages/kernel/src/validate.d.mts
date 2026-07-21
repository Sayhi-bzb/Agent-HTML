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
