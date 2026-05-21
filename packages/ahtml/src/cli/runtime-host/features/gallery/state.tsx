import React from "react"

import {
  assertRendererRegistryParity,
  createRendererSpecMap,
} from "../../renderer/parity"
import { createRendererNode } from "../../renderer/render-node"
import {
  createDocumentStyleCss,
  createGalleryPreviewThemeCss,
} from "../../profile-theme"
import type { RuntimeVerificationState } from "../../renderer/types"
import { createGalleryPreviewSections } from "./preview-document.mjs"
import { colorTokenSections } from "./config"
import {
  formatThemeTokenLabel,
  getPreviewModeLabel,
  isBuiltinArtifactProfileReference,
} from "./helpers"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryControlTab,
  GalleryEditorState,
  GalleryPreviewMode,
  GalleryPreviewSection,
  GalleryPreviewThemeMode,
  GalleryStateResponse,
} from "./types"

export const galleryReadyStatus = "Artifact profile gallery ready."
export const galleryUnsavedStatus = "Unsaved changes."

export function useGalleryWorkbenchState({
  artifactProfileReference,
  availableArtifactProfileReferences,
  builtinArtifactProfileReferences,
  initialProfile,
}: {
  artifactProfileReference: string
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  initialProfile: ArtifactProfile
}) {
  const [editorState, setEditorState] = React.useState(() =>
    createInitialGalleryEditorState({
      artifactProfileReference,
      availableArtifactProfileReferences,
      builtinArtifactProfileReferences,
      initialProfile,
    }),
  )
  const [controlTab, setControlTab] =
    React.useState<GalleryControlTab>("lightTokens")
  const [colorSectionValues, setColorSectionValues] = React.useState<string[]>([
    "base-colors",
    "card-colors",
  ])
  const [presetSearch, setPresetSearch] = React.useState("")
  const [presetPopoverOpen, setPresetPopoverOpen] = React.useState(false)
  const [colorSearch, setColorSearch] = React.useState("")
  const [colorThemeSyncEnabled, setColorThemeSyncEnabled] =
    React.useState(false)
  const [previewMode, setPreviewMode] =
    React.useState<GalleryPreviewMode>("components")
  const [previewThemeMode, setPreviewThemeMode] =
    React.useState<GalleryPreviewThemeMode>("light")
  const [inspectorEnabled, setInspectorEnabled] = React.useState(false)
  const [focusedToken, setFocusedToken] =
    React.useState<FocusedThemeToken | null>(null)
  const [focusedEditorField, setFocusedEditorField] =
    React.useState<FocusedEditorField | null>(null)
  const [hasCopiedProfile, setHasCopiedProfile] = React.useState(false)
  const [mobileTab, setMobileTab] = React.useState<"controls" | "preview">(
    "preview",
  )

  return {
    colorSearch,
    colorSectionValues,
    colorThemeSyncEnabled,
    controlTab,
    editorState,
    focusedEditorField,
    focusedToken,
    hasCopiedProfile,
    inspectorEnabled,
    mobileTab,
    presetPopoverOpen,
    presetSearch,
    previewMode,
    previewThemeMode,
    setColorSearch,
    setColorSectionValues,
    setColorThemeSyncEnabled,
    setControlTab,
    setEditorState,
    setFocusedEditorField,
    setFocusedToken,
    setHasCopiedProfile,
    setInspectorEnabled,
    setMobileTab,
    setPresetPopoverOpen,
    setPresetSearch,
    setPreviewMode,
    setPreviewThemeMode,
  }
}

export function createInitialGalleryEditorState({
  artifactProfileReference,
  availableArtifactProfileReferences,
  builtinArtifactProfileReferences,
  initialProfile,
}: {
  artifactProfileReference: string
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  initialProfile: ArtifactProfile
}): GalleryEditorState {
  return {
    availableArtifactProfileReferences,
    builtinArtifactProfileReferences,
    createId: "",
    draftProfile: initialProfile,
    error: "",
    isDirty: false,
    isSaving: false,
    persistedProfile: initialProfile,
    status: galleryReadyStatus,
    artifactProfileReference,
  }
}

export function mergeFetchedGalleryState(
  current: GalleryEditorState,
  nextState: GalleryStateResponse,
): GalleryEditorState {
  return {
    ...current,
    availableArtifactProfileReferences:
      nextState.availableArtifactProfileReferences ??
      current.availableArtifactProfileReferences,
    builtinArtifactProfileReferences:
      nextState.builtinArtifactProfileReferences ??
      current.builtinArtifactProfileReferences,
    draftProfile: current.isDirty
      ? current.draftProfile
      : nextState.artifactProfile,
    error: "",
    persistedProfile: nextState.artifactProfile,
    status: current.isDirty ? current.status : galleryReadyStatus,
    artifactProfileReference: current.isDirty
      ? current.artifactProfileReference
      : (nextState.artifactProfileReference ?? current.artifactProfileReference),
  }
}

export function filterArtifactProfileReferences(
  artifactProfileReferences: string[],
  presetSearch: string,
) {
  const query = presetSearch.trim().toLowerCase()

  if (!query) {
    return artifactProfileReferences
  }

  return artifactProfileReferences.filter((artifactProfileReference) =>
    artifactProfileReference.toLowerCase().includes(query),
  )
}

export function filterBuiltInArtifactProfileReferences(
  artifactProfileReferences: string[],
  builtinArtifactProfileReferences: string[],
) {
  return artifactProfileReferences.filter((artifactProfileReference) =>
    isBuiltinArtifactProfileReference(
      artifactProfileReference,
      builtinArtifactProfileReferences,
    ),
  )
}

export function filterCustomArtifactProfileReferences(
  artifactProfileReferences: string[],
  builtinArtifactProfileReferences: string[],
) {
  return artifactProfileReferences.filter(
    (artifactProfileReference) =>
      !isBuiltinArtifactProfileReference(
        artifactProfileReference,
        builtinArtifactProfileReferences,
      ),
  )
}

export function filterColorTokenSections(colorSearch: string) {
  const query = colorSearch.trim().toLowerCase()

  if (!query) {
    return colorTokenSections
  }

  return colorTokenSections
    .map((section) => {
      const matchedTokenNames = section.tokenNames.filter((tokenName) => {
        const tokenKey = tokenName.toLowerCase()
        const tokenLabel = formatThemeTokenLabel(tokenName).toLowerCase()

        return tokenKey.includes(query) || tokenLabel.includes(query)
      })

      const sectionMatches =
        section.title.toLowerCase().includes(query) ||
        section.description.toLowerCase().includes(query)

      return {
        ...section,
        tokenNames: sectionMatches ? section.tokenNames : matchedTokenNames,
      }
    })
    .filter((section) => section.tokenNames.length > 0)
}

export function getVisiblePreviewSections(
  previewMode: GalleryPreviewMode,
  previewSections: GalleryPreviewSection[],
) {
  return previewMode === "full"
    ? previewSections
    : previewSections.filter((section) => section.mode === previewMode)
}

export function describeActiveArtifactProfile(editorState: GalleryEditorState) {
  const activeArtifactProfileIsBuiltIn = isBuiltinArtifactProfileReference(
    editorState.artifactProfileReference,
    editorState.builtinArtifactProfileReferences,
  )

  return {
    activeArtifactProfileEditorStatus: editorState.isDirty
      ? "Current draft differs from the saved preset."
      : activeArtifactProfileIsBuiltIn
        ? "Baseline preset loaded in the editor."
        : "Saved preset loaded in the editor.",
    activeArtifactProfileIsBuiltIn,
    activeArtifactProfileKindLabel: activeArtifactProfileIsBuiltIn
      ? "Built-in"
      : "Custom",
    activeArtifactProfileSummary: activeArtifactProfileIsBuiltIn
      ? "Read-only baseline preset"
      : "Saved custom preset",
  }
}

export function useGalleryDerivedState({
  colorSearch,
  editorState,
  previewMode,
  presetSearch,
  runtimeRendererVerification,
}: {
  colorSearch: string
  editorState: GalleryEditorState
  previewMode: GalleryPreviewMode
  presetSearch: string
  runtimeRendererVerification: RuntimeVerificationState
}) {
  const rendererSpecByName = React.useMemo(() => {
    const specByName = createRendererSpecMap(runtimeRendererVerification)
    assertRendererRegistryParity(runtimeRendererVerification, specByName)
    return specByName
  }, [runtimeRendererVerification])

  const RendererNode = React.useMemo(
    () =>
      createRendererNode(
        rendererSpecByName,
        editorState.draftProfile,
      ),
    [editorState.draftProfile, rendererSpecByName],
  )
  const documentStyleCss = React.useMemo(
    () => createDocumentStyleCss(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const previewThemeCss = React.useMemo(
    () => createGalleryPreviewThemeCss(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const previewSections = React.useMemo<GalleryPreviewSection[]>(
    () =>
      createGalleryPreviewSections(
        editorState.draftProfile,
      ) as GalleryPreviewSection[],
    [editorState.draftProfile],
  )
  const filteredArtifactProfileReferences = React.useMemo(
    () =>
      filterArtifactProfileReferences(
        editorState.availableArtifactProfileReferences,
        presetSearch,
      ),
    [editorState.availableArtifactProfileReferences, presetSearch],
  )
  const filteredBuiltInArtifactProfileReferences = React.useMemo(
    () =>
      filterBuiltInArtifactProfileReferences(
        filteredArtifactProfileReferences,
        editorState.builtinArtifactProfileReferences,
      ),
    [
      editorState.builtinArtifactProfileReferences,
      filteredArtifactProfileReferences,
    ],
  )
  const filteredCustomArtifactProfileReferences = React.useMemo(
    () =>
      filterCustomArtifactProfileReferences(
        filteredArtifactProfileReferences,
        editorState.builtinArtifactProfileReferences,
      ),
    [
      editorState.builtinArtifactProfileReferences,
      filteredArtifactProfileReferences,
    ],
  )
  const filteredColorTokenSections = React.useMemo(
    () => filterColorTokenSections(colorSearch),
    [colorSearch],
  )
  const visiblePreviewSections = React.useMemo(
    () => getVisiblePreviewSections(previewMode, previewSections),
    [previewMode, previewSections],
  )
  const previewModeLabel = React.useMemo(
    () => getPreviewModeLabel(previewMode),
    [previewMode],
  )
  const activeArtifactProfileSummary = React.useMemo(
    () => describeActiveArtifactProfile(editorState),
    [editorState],
  )

  return {
    RendererNode,
    ...activeArtifactProfileSummary,
    documentStyleCss,
    filteredArtifactProfileReferences,
    filteredBuiltInArtifactProfileReferences,
    filteredColorTokenSections,
    filteredCustomArtifactProfileReferences,
    previewModeLabel,
    previewSections,
    previewThemeCss,
    visiblePreviewSections,
  }
}
