import type React from "react"

import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryColorTokenSection,
  GalleryControlTab,
  GalleryEditorState,
  GalleryPreviewMode,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "../types"

export type GalleryControlsPaneProps = {
  activeArtifactProfileEditorStatus: string
  activeArtifactProfileIsBuiltIn: boolean
  activeArtifactProfileKindLabel: string
  activeArtifactProfileSummary: string
  artifactProfileReference: string
  colorSearch: string
  colorSectionValues: string[]
  colorThemeSyncEnabled: boolean
  controlTab: GalleryControlTab
  copyThemeTokens: (
    sourceMode: GalleryPreviewThemeMode,
    targetMode: GalleryPreviewThemeMode,
  ) => void
  createArtifactProfileReference: () => Promise<void>
  cycleArtifactProfileReference: (direction: "prev" | "next") => void
  deleteCurrentArtifactProfileReference: () => Promise<void>
  editorState: GalleryEditorState
  filteredArtifactProfileReferences: string[]
  filteredBuiltInArtifactProfileReferences: string[]
  filteredColorTokenSections: GalleryColorTokenSection[]
  filteredCustomArtifactProfileReferences: string[]
  focusedEditorField: FocusedEditorField | null
  focusedToken: FocusedThemeToken | null
  mobileTab: "controls" | "preview"
  openControlTab: (nextTab: GalleryControlTab) => void
  presetPopoverOpen: boolean
  presetSearch: string
  previewMode: GalleryPreviewMode
  previewThemeMode: GalleryPreviewThemeMode
  randomizeArtifactProfileReference: () => void
  selectArtifactProfileReference: (
    artifactProfileReference: string,
  ) => Promise<void>
  setColorSearch: React.Dispatch<React.SetStateAction<string>>
  setColorSectionValues: React.Dispatch<React.SetStateAction<string[]>>
  setColorThemeSyncEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setEditorState: React.Dispatch<React.SetStateAction<GalleryEditorState>>
  setFocusedEditorField: React.Dispatch<
    React.SetStateAction<FocusedEditorField | null>
  >
  setFocusedToken: React.Dispatch<
    React.SetStateAction<FocusedThemeToken | null>
  >
  setPresetPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPresetSearch: React.Dispatch<React.SetStateAction<string>>
  setPreviewThemeMode: React.Dispatch<
    React.SetStateAction<GalleryPreviewThemeMode>
  >
  updateDraftProfile: (
    updater: (draft: ArtifactProfile) => ArtifactProfile,
  ) => void
  updateThemeTokenValue: (tokenName: ThemeTokenName, value: string) => void
}

export type GalleryControlsHeaderProps = Pick<
  GalleryControlsPaneProps,
  | "activeArtifactProfileEditorStatus"
  | "activeArtifactProfileIsBuiltIn"
  | "activeArtifactProfileKindLabel"
  | "activeArtifactProfileSummary"
  | "artifactProfileReference"
  | "controlTab"
  | "cycleArtifactProfileReference"
  | "editorState"
  | "filteredArtifactProfileReferences"
  | "filteredBuiltInArtifactProfileReferences"
  | "filteredCustomArtifactProfileReferences"
  | "presetPopoverOpen"
  | "presetSearch"
  | "previewThemeMode"
  | "randomizeArtifactProfileReference"
  | "selectArtifactProfileReference"
  | "setPresetPopoverOpen"
  | "setPresetSearch"
  | "setPreviewThemeMode"
>

export type GalleryProfileTabProps = Pick<
  GalleryControlsPaneProps,
  | "createArtifactProfileReference"
  | "deleteCurrentArtifactProfileReference"
  | "editorState"
  | "previewMode"
  | "setEditorState"
>

export type GalleryColorsTabProps = Pick<
  GalleryControlsPaneProps,
  | "colorSearch"
  | "colorSectionValues"
  | "colorThemeSyncEnabled"
  | "copyThemeTokens"
  | "editorState"
  | "filteredColorTokenSections"
  | "focusedToken"
  | "previewThemeMode"
  | "setColorSearch"
  | "setColorSectionValues"
  | "setColorThemeSyncEnabled"
  | "updateThemeTokenValue"
>

export type GalleryTypographyTabProps = Pick<
  GalleryControlsPaneProps,
  | "editorState"
  | "focusedEditorField"
  | "previewThemeMode"
  | "updateDraftProfile"
>

export type GalleryOtherTabProps = Pick<
  GalleryControlsPaneProps,
  | "editorState"
  | "focusedEditorField"
  | "updateDraftProfile"
>
