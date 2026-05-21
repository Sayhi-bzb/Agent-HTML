import type { AgentDocument } from "../../renderer/types"

export type ArtifactProfile = AgentDocument["meta"]["artifactProfile"]

export type GalleryStateResponse = {
  ok: boolean
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  artifactProfileReference: string
  artifactProfile: ArtifactProfile
}

export type GalleryMutationResponse = {
  ok: boolean
  error?: string
  availableArtifactProfileReferences?: string[]
  builtinArtifactProfileReferences?: string[]
  artifactProfileReference?: string
  artifactProfile?: ArtifactProfile
}

export type GalleryEditorState = {
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  createId: string
  draftProfile: ArtifactProfile
  error: string
  isDirty: boolean
  isSaving: boolean
  persistedProfile: ArtifactProfile
  status: string
  artifactProfileReference: string
}

export type GalleryControlTab = "colors" | "typography" | "other" | "profile"

export type GalleryPreviewMode =
  | "components"
  | "colors"
  | "custom"
  | "dashboard"
  | "mail"
  | "forms"
  | "pricing"
  | "selection"
  | "disclosure"
  | "typography"
  | "full"

export type GalleryPreviewThemeMode = "light" | "dark"

export type ThemeTokenName =
  keyof ArtifactProfile["globalStyle"]["tokenSets"]["light"]

export type FocusedThemeToken = {
  mode: GalleryPreviewThemeMode
  tokenName: ThemeTokenName
}

export type FocusedEditorField =
  | "fontSans"
  | "fontHeading"
  | "fontSerif"
  | "fontMono"
  | "letterSpacing"
  | "spacing"
  | "shadow"
  | "radiusBase"

export type FontPickerOption = {
  category: "Heading" | "Mono" | "Sans" | "Serif"
  label: string
  value: string
}

export type GalleryInspectorState = {
  classTokens: string[]
  component: string
  label: string
  left: number
  pinned: boolean
  path: string
  renderKind: string
  sourceTokens: string[]
  slot: string
  source: string
  tagName: string
  top: number
  treatment: string
  width: number
  height: number
}

export type GalleryColorTokenSection = {
  description: string
  id: string
  title: string
  tokenNames: ThemeTokenName[]
}

export type GalleryPreviewSection = {
  mode: GalleryPreviewMode
  node: AgentDocument["components"][number]
}
