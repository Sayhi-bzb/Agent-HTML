export type ArtifactStateChangeKind =
  | "set"
  | "toggle"
  | "select"
  | "open"
  | "action"
  | "move"
  | "resize"
  | (string & {})

export type ArtifactStateChange = {
  after: unknown
  before: unknown
  blockId?: string
  component: string
  controlId: string
  kind: ArtifactStateChangeKind
  label?: string
  semantic?: string
  timestamp: number
}

export type ArtifactStateChangeInput = Omit<
  ArtifactStateChange,
  "timestamp"
> & {
  timestamp?: number
}

export type ArtifactInteractionSnapshot = {
  blockId?: string
  currentState: Record<string, unknown>
  recentChanges: ArtifactStateChange[]
}

export type ArtifactBlockDefinition = string | { id: string; title?: string }
export type ArtifactDefinition = {
  blocks: ArtifactBlockDefinition[]
  title: string
}

export type NormalizedArtifactBlockDefinition = {
  id: string
  title: string
}

export type NormalizedArtifactDefinition = {
  blocks: NormalizedArtifactBlockDefinition[]
  title: string
}

export type CanvasNodeGeometry = {
  height: number
  width: number
  x: number
  y: number
}

export type CanvasLayoutDocument = {
  nodes: Record<string, CanvasNodeGeometry>
  version: 1
}

export type KernelDiagnostic = {
  category: "dependency" | "manifest" | "protocol" | "style" | "workspace"
  code: string
  column: number
  filePath: string
  line: number
  message: string
  policyVersion: number
  suggestion?: string
}

export const CANVAS_POLICY_VERSION: number
export const CANVAS_LAYOUT_VERSION: 1
export const canvasInteractionEventName: string
export const canvasDomAttributes: Readonly<Record<string, string>>
export const canvasDiagnosticCategories: Readonly<Record<string, string>>
export const canvasDiagnosticCodes: Readonly<Record<string, string>>
export const canvasSourceLayers: ReadonlyArray<
  Readonly<{ name: string; path: string }>
>
export const canvasRuntimeCatalog: Readonly<Record<string, string>>
export const canvasRuntimeDependencyNames: readonly string[]
export function canvasWorkspaceDependenciesMatchCatalog(
  dependencies?: Record<string, string>
): boolean
export function canvasRuntimeProviderMatchesCatalog(
  dependencies?: Record<string, string>
): boolean
export function titleizeBlockId(id: string): string
export function normalizeArtifactDefinition(
  definition: ArtifactDefinition
): NormalizedArtifactDefinition
export function createEmptyCanvasLayout(): CanvasLayoutDocument
export function normalizeCanvasLayout(value: unknown): CanvasLayoutDocument
