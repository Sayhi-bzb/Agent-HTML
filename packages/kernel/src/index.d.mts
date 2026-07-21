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

export type CanvasViewport = {
  x: number
  y: number
  zoom: number
}

export type CanvasLayoutDocument = {
  nodes: Record<string, CanvasNodeGeometry>
  viewport?: CanvasViewport
  version: 2
}

export type CanvasInspectionCanvas = {
  id: string
  title?: string
}

export type CanvasInspectionNodeRecord = CanvasNodeGeometry & {
  id: string
  index?: string
  parentId?: string
  sourcePath?: string
  title?: string
  type?: string
}

export type CanvasInspectionDocument = {
  canvas: CanvasInspectionCanvas | null
  nodes: CanvasInspectionNodeRecord[]
  sourceFilePath: string
  version: 1
}

export type CanvasViewportBounds = CanvasNodeGeometry

export type CanvasNodeSourceReference = {
  canvasFilePath: string
  contentFilePath: string | null
  nodeId: string
}

export type CanvasInspectionNode = CanvasInspectionNodeRecord & {
  absoluteGeometry: CanvasNodeGeometry
  source: CanvasNodeSourceReference
}

export type CanvasOverviewInspection = {
  bounds: CanvasNodeGeometry | null
  canvas: CanvasInspectionCanvas | null
  nodeCount: number
  rootNodeIds: string[]
  sourceFilePath: string
}

export type CanvasViewportInspection = {
  bounds: CanvasViewportBounds
  nodes: CanvasInspectionNode[]
  totalNodeCount: number
}

export type CanvasNodeDetailInspection = {
  childIds: string[]
  node: CanvasInspectionNode
  parentId: string | null
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
export const CANVAS_LAYOUT_VERSION: 2
export const CANVAS_INSPECTION_VERSION: 1
export const DEFAULT_CANVAS_NODE_COLUMNS: 4
export const DEFAULT_CANVAS_NODE_GAP: 48
export const DEFAULT_CANVAS_NODE_HEIGHT: 180
export const DEFAULT_CANVAS_NODE_WIDTH: 320
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
export function defaultCanvasNodeGeometry(order: number): CanvasNodeGeometry
export function normalizeCanvasLayout(value: unknown): CanvasLayoutDocument
export function normalizeCanvasViewport(
  value: unknown
): CanvasViewport | undefined
export function normalizeCanvasInspectionDocument(
  value: unknown
): CanvasInspectionDocument
export function createCanvasInspectionDocument(
  value: Omit<CanvasInspectionDocument, "version">
): CanvasInspectionDocument
export function inspectCanvasOverview(
  document: CanvasInspectionDocument
): CanvasOverviewInspection
export function inspectCanvasViewport(
  document: CanvasInspectionDocument,
  bounds: CanvasViewportBounds
): CanvasViewportInspection
export function inspectCanvasNode(
  document: CanvasInspectionDocument,
  nodeId: string
): CanvasNodeDetailInspection | null
export function resolveCanvasNodeSource(
  document: CanvasInspectionDocument,
  nodeId: string
): CanvasNodeSourceReference | null
