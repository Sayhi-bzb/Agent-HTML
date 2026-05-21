import React from "react"

import { useGalleryDraftActions, useGalleryProfileActions } from "./actions"
import { fetchGalleryState } from "./api"
import type { GalleryControlsPaneProps } from "./controls/types"
import { collectInspectorSourceTokens } from "./helpers"
import type { GalleryPreviewPaneProps } from "./preview"
import {
  mergeFetchedGalleryState,
  useGalleryDerivedState,
  useGalleryWorkbenchState,
} from "./state"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryEditorState,
  GalleryInspectorState,
  GalleryPreviewMode,
  GalleryPreviewThemeMode,
} from "./types"
import type { RuntimeVerificationState } from "../../renderer/types"

export function useHydrateGalleryState(
  setEditorState: React.Dispatch<React.SetStateAction<GalleryEditorState>>,
) {
  React.useEffect(() => {
    let cancelled = false

    void fetchGalleryState().then((nextState) => {
      if (!nextState || cancelled) {
        return
      }

      setEditorState((current) => mergeFetchedGalleryState(current, nextState))
    })

    return () => {
      cancelled = true
    }
  }, [setEditorState])
}

export function usePreviewFullscreenState(
  previewShellRef: React.RefObject<HTMLDivElement | null>,
) {
  const [isPreviewFullscreen, setIsPreviewFullscreen] = React.useState(false)

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return
    }

    const handleFullscreenChange = () => {
      setIsPreviewFullscreen(
        document.fullscreenElement === previewShellRef.current,
      )
    }

    document.addEventListener("fullscreenchange", handleFullscreenChange)
    handleFullscreenChange()

    return () => {
      document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }
  }, [previewShellRef])

  const togglePreviewFullscreen = React.useCallback(async () => {
    if (typeof document === "undefined") {
      return
    }

    const previewShell = previewShellRef.current

    if (!previewShell) {
      return
    }

    try {
      if (document.fullscreenElement === previewShell) {
        await document.exitFullscreen()
        return
      }

      if (document.fullscreenElement) {
        await document.exitFullscreen()
      }

      await previewShell.requestFullscreen()
    } catch {
      // Ignore fullscreen API failures and keep the workbench usable.
    }
  }, [previewShellRef])

  return {
    isPreviewFullscreen,
    togglePreviewFullscreen,
  }
}

export function useGalleryFocusReset({
  artifactProfileReference,
  previewMode,
  previewThemeMode,
  setFocusedEditorField,
  setFocusedToken,
}: {
  artifactProfileReference: string
  previewMode: GalleryPreviewMode
  previewThemeMode: GalleryPreviewThemeMode
  setFocusedEditorField: React.Dispatch<
    React.SetStateAction<FocusedEditorField | null>
  >
  setFocusedToken: React.Dispatch<
    React.SetStateAction<FocusedThemeToken | null>
  >
}) {
  React.useEffect(() => {
    setFocusedToken(null)
  }, [
    artifactProfileReference,
    previewMode,
    previewThemeMode,
    setFocusedToken,
  ])

  React.useEffect(() => {
    setFocusedEditorField(null)
  }, [artifactProfileReference, previewMode, setFocusedEditorField])
}

export function useGalleryInspector({
  inspectorEnabled,
  previewMode,
  previewSurfaceRef,
}: {
  inspectorEnabled: boolean
  previewMode: string
  previewSurfaceRef: React.RefObject<HTMLDivElement | null>
}) {
  const [inspectorState, setInspectorState] =
    React.useState<GalleryInspectorState | null>(null)
  const pinnedInspectorElementRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    const surface = previewSurfaceRef.current

    if (!surface) {
      return
    }

    const resetInspector = () => {
      setInspectorState(null)
    }

    if (!inspectorEnabled) {
      pinnedInspectorElementRef.current = null
      resetInspector()
      return
    }

    const getComponentLabel = (target: HTMLElement) => {
      const cardTitle =
        target.querySelector('[data-slot="card-title"], h1, h2, h3, h4, h5, h6') ??
        target

      const text = cardTitle.textContent?.trim() ?? target.textContent?.trim()
      return text ? text.slice(0, 80) : "Component"
    }

    const createNextInspectorState = (
      target: HTMLElement,
      pinned: boolean,
    ): GalleryInspectorState | null => {
      const component = target.dataset.agentHtmlComponent

      if (!component) {
        return null
      }

      const surfaceRect = surface.getBoundingClientRect()
      const targetRect = target.getBoundingClientRect()
      const classTokens = Array.from(
        new Set(
          (target.className || "")
            .split(/\s+/)
            .map((value) => value.trim())
            .filter(Boolean),
        ),
      )
      const sourceTokens = collectInspectorSourceTokens(target)

      return {
        classTokens,
        component,
        label: getComponentLabel(target),
        left: targetRect.left - surfaceRect.left + surface.scrollLeft,
        path: target.dataset.ahtmlPath ?? "0",
        pinned,
        renderKind: target.dataset.ahtmlRenderKind ?? "structural",
        sourceTokens,
        slot:
          target.dataset.slot ??
          target.getAttribute("data-slot") ??
          "component-root",
        source: target.dataset.ahtmlSource ?? "ahtml-standard",
        tagName: target.tagName.toLowerCase(),
        top: targetRect.top - surfaceRect.top + surface.scrollTop,
        treatment: target.dataset.ahtmlTreatment ?? "default",
        width: targetRect.width,
        height: targetRect.height,
      }
    }

    const handlePointerMove = (event: PointerEvent) => {
      const rawTarget = event.target instanceof HTMLElement ? event.target : null

      if (!rawTarget) {
        return
      }

      const componentTarget = rawTarget.closest<HTMLElement>(
        "[data-agent-html-component]",
      )

      if (!componentTarget || !surface.contains(componentTarget)) {
        if (!pinnedInspectorElementRef.current) {
          resetInspector()
        }
        return
      }

      if (pinnedInspectorElementRef.current) {
        return
      }

      const nextState = createNextInspectorState(componentTarget, false)

      if (nextState) {
        setInspectorState(nextState)
      }
    }

    const handleClick = (event: MouseEvent) => {
      const rawTarget = event.target instanceof HTMLElement ? event.target : null

      if (!rawTarget) {
        return
      }

      const componentTarget = rawTarget.closest<HTMLElement>(
        "[data-agent-html-component]",
      )

      if (!componentTarget || !surface.contains(componentTarget)) {
        pinnedInspectorElementRef.current = null
        resetInspector()
        return
      }

      const nextPinnedState = createNextInspectorState(componentTarget, true)

      if (!nextPinnedState) {
        return
      }

      pinnedInspectorElementRef.current = componentTarget
      setInspectorState(nextPinnedState)
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") {
        return
      }

      pinnedInspectorElementRef.current = null
      resetInspector()
    }

    const handleScroll = () => {
      if (!pinnedInspectorElementRef.current) {
        return
      }

      const nextPinnedState = createNextInspectorState(
        pinnedInspectorElementRef.current,
        true,
      )

      if (nextPinnedState) {
        setInspectorState(nextPinnedState)
      }
    }

    const handlePointerLeave = () => {
      if (!pinnedInspectorElementRef.current) {
        resetInspector()
      }
    }

    surface.addEventListener("pointermove", handlePointerMove)
    surface.addEventListener("pointerleave", handlePointerLeave)
    surface.addEventListener("click", handleClick)
    surface.addEventListener("scroll", handleScroll)
    window.addEventListener("keydown", handleKeyDown)

    return () => {
      surface.removeEventListener("pointermove", handlePointerMove)
      surface.removeEventListener("pointerleave", handlePointerLeave)
      surface.removeEventListener("click", handleClick)
      surface.removeEventListener("scroll", handleScroll)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [inspectorEnabled, previewMode, previewSurfaceRef])

  return {
    inspectorState,
  }
}

export function useGalleryAppController({
  artifactProfileReference,
  availableArtifactProfileReferences,
  builtinArtifactProfileReferences,
  initialProfile,
  runtimeRendererVerification,
}: {
  artifactProfileReference: string
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  initialProfile: ArtifactProfile
  runtimeRendererVerification: RuntimeVerificationState
}) {
  const workbenchState = useGalleryWorkbenchState({
    artifactProfileReference,
    availableArtifactProfileReferences,
    builtinArtifactProfileReferences,
    initialProfile,
  })
  const previewShellRef = React.useRef<HTMLDivElement | null>(null)
  const previewSurfaceRef = React.useRef<HTMLDivElement | null>(null)

  useHydrateGalleryState(workbenchState.setEditorState)

  const { isPreviewFullscreen, togglePreviewFullscreen } =
    usePreviewFullscreenState(previewShellRef)
  const { inspectorState } = useGalleryInspector({
    inspectorEnabled: workbenchState.inspectorEnabled,
    previewMode: workbenchState.previewMode,
    previewSurfaceRef,
  })
  useGalleryFocusReset({
    artifactProfileReference: workbenchState.editorState.artifactProfileReference,
    previewMode: workbenchState.previewMode,
    previewThemeMode: workbenchState.previewThemeMode,
    setFocusedEditorField: workbenchState.setFocusedEditorField,
    setFocusedToken: workbenchState.setFocusedToken,
  })

  const draftActions = useGalleryDraftActions({
    colorThemeSyncEnabled: workbenchState.colorThemeSyncEnabled,
    previewThemeMode: workbenchState.previewThemeMode,
    setColorSectionValues: workbenchState.setColorSectionValues,
    setControlTab: workbenchState.setControlTab,
    setEditorState: workbenchState.setEditorState,
    setFocusedEditorField: workbenchState.setFocusedEditorField,
    setFocusedToken: workbenchState.setFocusedToken,
    setHasCopiedProfile: workbenchState.setHasCopiedProfile,
    setMobileTab: workbenchState.setMobileTab,
    setPreviewThemeMode: workbenchState.setPreviewThemeMode,
  })
  const profileActions = useGalleryProfileActions({
    editorState: workbenchState.editorState,
    setEditorState: workbenchState.setEditorState,
  })
  const derivedState = useGalleryDerivedState({
    colorSearch: workbenchState.colorSearch,
    editorState: workbenchState.editorState,
    previewMode: workbenchState.previewMode,
    presetSearch: workbenchState.presetSearch,
    runtimeRendererVerification,
  })

  const controlsPaneProps: GalleryControlsPaneProps = {
    activeArtifactProfileEditorStatus:
      derivedState.activeArtifactProfileEditorStatus,
    activeArtifactProfileIsBuiltIn:
      derivedState.activeArtifactProfileIsBuiltIn,
    activeArtifactProfileKindLabel: derivedState.activeArtifactProfileKindLabel,
    activeArtifactProfileSummary: derivedState.activeArtifactProfileSummary,
    artifactProfileReference: workbenchState.editorState.artifactProfileReference,
    colorSearch: workbenchState.colorSearch,
    colorSectionValues: workbenchState.colorSectionValues,
    colorThemeSyncEnabled: workbenchState.colorThemeSyncEnabled,
    controlTab: workbenchState.controlTab,
    copyThemeTokens: draftActions.copyThemeTokens,
    createArtifactProfileReference:
      profileActions.createArtifactProfileReference,
    cycleArtifactProfileReference: profileActions.cycleArtifactProfileReference,
    deleteCurrentArtifactProfileReference:
      profileActions.deleteCurrentArtifactProfileReference,
    editorState: workbenchState.editorState,
    filteredArtifactProfileReferences:
      derivedState.filteredArtifactProfileReferences,
    filteredBuiltInArtifactProfileReferences:
      derivedState.filteredBuiltInArtifactProfileReferences,
    filteredColorTokenSections: derivedState.filteredColorTokenSections,
    filteredCustomArtifactProfileReferences:
      derivedState.filteredCustomArtifactProfileReferences,
    focusedEditorField: workbenchState.focusedEditorField,
    focusedToken: workbenchState.focusedToken,
    mobileTab: workbenchState.mobileTab,
    openControlTab: draftActions.openControlTab,
    presetPopoverOpen: workbenchState.presetPopoverOpen,
    presetSearch: workbenchState.presetSearch,
    previewMode: workbenchState.previewMode,
    previewThemeMode: workbenchState.previewThemeMode,
    randomizeArtifactProfileReference:
      profileActions.randomizeArtifactProfileReference,
    selectArtifactProfileReference:
      profileActions.selectArtifactProfileReference,
    setColorSearch: workbenchState.setColorSearch,
    setColorSectionValues: workbenchState.setColorSectionValues,
    setColorThemeSyncEnabled: workbenchState.setColorThemeSyncEnabled,
    setEditorState: workbenchState.setEditorState,
    setFocusedEditorField: workbenchState.setFocusedEditorField,
    setFocusedToken: workbenchState.setFocusedToken,
    setPresetPopoverOpen: workbenchState.setPresetPopoverOpen,
    setPresetSearch: workbenchState.setPresetSearch,
    setPreviewThemeMode: workbenchState.setPreviewThemeMode,
    resetDraft: draftActions.resetDraft,
    saveProfile: profileActions.saveProfile,
    updateDraftProfile: draftActions.updateDraftProfile,
    updateThemeTokenValue: draftActions.updateThemeTokenValue,
  }

  const previewPaneProps: GalleryPreviewPaneProps = {
    RendererNode: derivedState.RendererNode,
    artifactProfileReference: workbenchState.editorState.artifactProfileReference,
    colorThemeSyncEnabled: workbenchState.colorThemeSyncEnabled,
    copyCurrentArtifactProfile: () =>
      draftActions.copyCurrentArtifactProfile(workbenchState.editorState.draftProfile),
    draftProfile: workbenchState.editorState.draftProfile,
    focusEditorField: draftActions.focusEditorField,
    focusThemeToken: draftActions.focusThemeToken,
    focusedToken: workbenchState.focusedToken,
    hasCopiedProfile: workbenchState.hasCopiedProfile,
    inspectorEnabled: workbenchState.inspectorEnabled,
    inspectorState,
    isDirty: workbenchState.editorState.isDirty,
    isPreviewFullscreen,
    isSaving: workbenchState.editorState.isSaving,
    openControlTab: draftActions.openControlTab,
    previewMode: workbenchState.previewMode,
    previewModeLabel: derivedState.previewModeLabel,
    previewShellRef,
    previewSurfaceRef,
    previewThemeMode: workbenchState.previewThemeMode,
    resetDraft: draftActions.resetDraft,
    saveProfile: profileActions.saveProfile,
    setInspectorEnabled: workbenchState.setInspectorEnabled,
    setPreviewMode: workbenchState.setPreviewMode,
    setPreviewThemeMode: workbenchState.setPreviewThemeMode,
    togglePreviewFullscreen,
    visiblePreviewSections: derivedState.visiblePreviewSections,
  }

  return {
    artifactProfileId: workbenchState.editorState.draftProfile.id,
    artifactProfileReference: workbenchState.editorState.artifactProfileReference,
    controlsPaneProps,
    documentStyleCss: derivedState.documentStyleCss,
    mobileTab: workbenchState.mobileTab,
    previewPaneProps,
    previewThemeCss: derivedState.previewThemeCss,
    setMobileTab: workbenchState.setMobileTab,
  }
}
