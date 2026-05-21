import React from "react"

import type {
  ArtifactProfile,
  FocusedEditorField,
  GalleryPreviewSection,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "../types"

export type RendererNodeComponent = React.ComponentType<{
  node: GalleryPreviewSection["node"]
  path?: Array<number | string>
}>

export type TypographyPanelProps = {
  onSelectField: (field: FocusedEditorField) => void
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}

export type ColorPreviewPanelProps = {
  onActivateThemeMode: (mode: GalleryPreviewThemeMode) => void
  onSelectToken: (
    tokenName: ThemeTokenName,
    mode: GalleryPreviewThemeMode,
  ) => void
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
  themeSyncEnabled: boolean
}

export type PreviewSceneProps = {
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}
