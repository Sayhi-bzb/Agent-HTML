import React from "react"

import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsList } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"

import { RuntimeStyleElements } from "../../host-styles"
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
import {
  createGalleryArtifactProfile,
  deleteGalleryArtifactProfile,
  fetchGalleryState,
  saveGalleryArtifactProfile,
  selectGalleryArtifactProfile,
} from "./api"
import { colorTokenSections } from "./config"
import { GalleryControlsPane } from "./controls"
import {
  collectInspectorSourceTokens,
  formatThemeTokenLabel,
  getColorSectionIdForToken,
  getPreviewModeLabel,
  isBuiltinArtifactProfileReference,
} from "./helpers"
import { GalleryPreviewPane } from "./preview"
import { GalleryTabsTriggerPill } from "./shared"
import { createGalleryWorkbenchCss } from "./styles"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryControlTab,
  GalleryEditorState,
  GalleryInspectorState,
  GalleryPreviewSection,
  GalleryPreviewMode,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "./types"

export function GalleryApp({
  availableArtifactProfileReferences,
  builtinArtifactProfileReferences,
  initialProfile,
  runtimeRendererVerification,
  artifactProfileReference,
}: {
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  initialProfile: ArtifactProfile
  runtimeRendererVerification: RuntimeVerificationState
  artifactProfileReference: string
}) {
  const rendererSpecByName = React.useMemo(() => {
    const specByName = createRendererSpecMap(runtimeRendererVerification)
    assertRendererRegistryParity(runtimeRendererVerification, specByName)
    return specByName
  }, [runtimeRendererVerification])
  const [editorState, setEditorState] = React.useState<GalleryEditorState>({
    availableArtifactProfileReferences,
    builtinArtifactProfileReferences,
    createId: "",
    draftProfile: initialProfile,
    error: "",
    isDirty: false,
    isSaving: false,
    persistedProfile: initialProfile,
    status: "Artifact profile gallery ready.",
    artifactProfileReference,
  })
  const [controlTab, setControlTab] =
    React.useState<GalleryControlTab>("colors")
  const [colorSectionValues, setColorSectionValues] = React.useState<string[]>([
    "base-tokens",
    "surface-tokens",
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
  const [inspectorState, setInspectorState] =
    React.useState<GalleryInspectorState | null>(null)
  const [focusedToken, setFocusedToken] =
    React.useState<FocusedThemeToken | null>(null)
  const [focusedEditorField, setFocusedEditorField] =
    React.useState<FocusedEditorField | null>(null)
  const [hasCopiedProfile, setHasCopiedProfile] = React.useState(false)
  const [isPreviewFullscreen, setIsPreviewFullscreen] = React.useState(false)
  const [mobileTab, setMobileTab] = React.useState<"controls" | "preview">(
    "controls",
  )
  const previewShellRef = React.useRef<HTMLDivElement | null>(null)
  const previewSurfaceRef = React.useRef<HTMLDivElement | null>(null)
  const pinnedInspectorElementRef = React.useRef<HTMLElement | null>(null)

  React.useEffect(() => {
    let cancelled = false

    void fetchGalleryState().then((nextState) => {
      if (!nextState || cancelled) {
        return
      }

      setEditorState((current) => ({
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
        status: current.isDirty
          ? current.status
          : "Artifact profile gallery ready.",
        artifactProfileReference: current.isDirty
          ? current.artifactProfileReference
          : (nextState.artifactProfileReference ??
            current.artifactProfileReference),
      }))
    })

    return () => {
      cancelled = true
    }
  }, [])

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
  }, [])

  const RendererNode = React.useMemo(
    () =>
      createRendererNode(
        rendererSpecByName,
        editorState.draftProfile.componentStyle.treatments,
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
  const filteredArtifactProfileReferences = React.useMemo(() => {
    const query = presetSearch.trim().toLowerCase()

    if (!query) {
      return editorState.availableArtifactProfileReferences
    }

    return editorState.availableArtifactProfileReferences.filter(
      (nextArtifactProfileReference) =>
        nextArtifactProfileReference.toLowerCase().includes(query),
    )
  }, [editorState.availableArtifactProfileReferences, presetSearch])
  const filteredBuiltInArtifactProfileReferences = React.useMemo(
    () =>
      filteredArtifactProfileReferences.filter((nextArtifactProfileReference) =>
        isBuiltinArtifactProfileReference(
          nextArtifactProfileReference,
          editorState.builtinArtifactProfileReferences,
        ),
      ),
    [
      editorState.builtinArtifactProfileReferences,
      filteredArtifactProfileReferences,
    ],
  )
  const filteredCustomArtifactProfileReferences = React.useMemo(
    () =>
      filteredArtifactProfileReferences.filter(
        (nextArtifactProfileReference) =>
          !isBuiltinArtifactProfileReference(
            nextArtifactProfileReference,
            editorState.builtinArtifactProfileReferences,
          ),
      ),
    [
      editorState.builtinArtifactProfileReferences,
      filteredArtifactProfileReferences,
    ],
  )
  const filteredColorTokenSections = React.useMemo(() => {
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
  }, [colorSearch])
  const visiblePreviewSections = React.useMemo(
    () =>
      previewMode === "full"
        ? previewSections
        : previewSections.filter((section) => section.mode === previewMode),
    [previewMode, previewSections],
  )
  const previewModeLabel = getPreviewModeLabel(previewMode)

  const activeArtifactProfileIsBuiltIn = isBuiltinArtifactProfileReference(
    editorState.artifactProfileReference,
    editorState.builtinArtifactProfileReferences,
  )
  const activeArtifactProfileKindLabel = activeArtifactProfileIsBuiltIn
    ? "Built-in"
    : "Custom"
  const activeArtifactProfileSummary = activeArtifactProfileIsBuiltIn
    ? "Read-only baseline preset"
    : "Saved custom preset"
  const activeArtifactProfileEditorStatus = editorState.isDirty
    ? "Current draft differs from the saved preset."
    : activeArtifactProfileIsBuiltIn
      ? "Baseline preset loaded in the editor."
      : "Saved preset loaded in the editor."

  const updateDraftProfile = React.useCallback(
    (updater: (draft: ArtifactProfile) => ArtifactProfile) => {
      setEditorState((current) => ({
        ...current,
        draftProfile: updater(current.draftProfile),
        error: "",
        isDirty: true,
        status: "Unsaved changes.",
      }))
    },
    [],
  )

  const updateThemeTokenValue = React.useCallback(
    (tokenName: ThemeTokenName, value: string) => {
      updateDraftProfile((draft) => {
        const nextTokenSets = {
          ...draft.globalStyle.tokenSets,
          [previewThemeMode]: {
            ...draft.globalStyle.tokenSets[previewThemeMode],
            [tokenName]: value,
          },
        }

        if (colorThemeSyncEnabled) {
          const otherMode = previewThemeMode === "light" ? "dark" : "light"
          nextTokenSets[otherMode] = {
            ...draft.globalStyle.tokenSets[otherMode],
            [tokenName]: value,
          }
        }

        return {
          ...draft,
          globalStyle: {
            ...draft.globalStyle,
            tokenSets: nextTokenSets,
          },
        }
      })
    },
    [colorThemeSyncEnabled, previewThemeMode, updateDraftProfile],
  )

  const copyThemeTokens = React.useCallback(
    (
      sourceMode: GalleryPreviewThemeMode,
      targetMode: GalleryPreviewThemeMode,
    ) => {
      updateDraftProfile((draft) => ({
        ...draft,
        globalStyle: {
          ...draft.globalStyle,
          tokenSets: {
            ...draft.globalStyle.tokenSets,
            [targetMode]: {
              ...draft.globalStyle.tokenSets[sourceMode],
            },
          },
        },
      }))
    },
    [updateDraftProfile],
  )

  const openControlTab = React.useCallback((nextTab: GalleryControlTab) => {
    setControlTab(nextTab)
    setMobileTab("controls")

    if (nextTab !== "colors") {
      setFocusedToken(null)
    }

    if (nextTab !== "typography" && nextTab !== "other") {
      setFocusedEditorField(null)
    }
  }, [])

  const focusEditorField = React.useCallback(
    (field: FocusedEditorField) => {
      openControlTab(
        field === "radiusBase" || field === "spacing" || field === "shadow"
          ? "other"
          : "typography",
      )
      setFocusedEditorField(field)
    },
    [openControlTab],
  )

  const focusThemeToken = React.useCallback(
    (
      tokenName: ThemeTokenName,
      mode: GalleryPreviewThemeMode = previewThemeMode,
    ) => {
      const sectionValue = getColorSectionIdForToken(tokenName)

      openControlTab("colors")
      setPreviewThemeMode(mode)
      setColorSectionValues((current) =>
        current.includes(sectionValue) ? current : [...current, sectionValue],
      )
      setFocusedToken({
        mode,
        tokenName,
      })
    },
    [openControlTab, previewThemeMode],
  )

  React.useEffect(() => {
    setFocusedToken(null)
  }, [editorState.artifactProfileReference, previewMode, previewThemeMode])

  React.useEffect(() => {
    setFocusedEditorField(null)
  }, [editorState.artifactProfileReference, previewMode])

  const saveProfile = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: "Saving artifact profile...",
    }))

    try {
      const result = await saveGalleryArtifactProfile(editorState.draftProfile)

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Saved ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Save failed.",
      }))
    }
  }, [editorState.draftProfile])

  const selectArtifactProfileReference = React.useCallback(
    async (nextArtifactProfileReference: string) => {
      setEditorState((current) => ({
        ...current,
        error: "",
        status: `Loading ${nextArtifactProfileReference}...`,
      }))

      try {
        const result = await selectGalleryArtifactProfile(
          nextArtifactProfileReference,
        )

        setEditorState((current) => ({
          ...current,
          availableArtifactProfileReferences:
            result.availableArtifactProfileReferences ??
            current.availableArtifactProfileReferences,
          builtinArtifactProfileReferences:
            result.builtinArtifactProfileReferences ??
            current.builtinArtifactProfileReferences,
          draftProfile: result.artifactProfile,
          error: "",
          isDirty: false,
          persistedProfile: result.artifactProfile,
          status: `Selected ${result.artifactProfileReference}.`,
          artifactProfileReference: result.artifactProfileReference,
        }))
      } catch (error) {
        setEditorState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
          status: "Switch failed.",
        }))
      }
    },
    [],
  )

  const cycleArtifactProfileReference = React.useCallback(
    (direction: "prev" | "next") => {
      const profileIds = editorState.availableArtifactProfileReferences
      const currentIndex = profileIds.indexOf(
        editorState.artifactProfileReference,
      )

      if (currentIndex === -1 || profileIds.length < 2) {
        return
      }

      const nextIndex =
        direction === "next"
          ? (currentIndex + 1) % profileIds.length
          : (currentIndex - 1 + profileIds.length) % profileIds.length

      void selectArtifactProfileReference(profileIds[nextIndex])
    },
    [
      editorState.availableArtifactProfileReferences,
      editorState.artifactProfileReference,
      selectArtifactProfileReference,
    ],
  )

  const randomizeArtifactProfileReference = React.useCallback(() => {
    const profileIds = editorState.availableArtifactProfileReferences

    if (profileIds.length < 2) {
      return
    }

    const nextCandidates = profileIds.filter(
      (profileId) => profileId !== editorState.artifactProfileReference,
    )
    const nextArtifactProfileReference =
      nextCandidates[Math.floor(Math.random() * nextCandidates.length)]

    if (nextArtifactProfileReference) {
      void selectArtifactProfileReference(nextArtifactProfileReference)
    }
  }, [
    editorState.availableArtifactProfileReferences,
    editorState.artifactProfileReference,
    selectArtifactProfileReference,
  ])

  const copyCurrentArtifactProfile = React.useCallback(async () => {
    if (
      typeof navigator === "undefined" ||
      !navigator.clipboard ||
      typeof navigator.clipboard.writeText !== "function"
    ) {
      setEditorState((current) => ({
        ...current,
        status: "Clipboard unavailable in this runtime.",
      }))
      return
    }

    try {
      await navigator.clipboard.writeText(
        JSON.stringify(editorState.draftProfile, null, 2),
      )
      setHasCopiedProfile(true)
      setEditorState((current) => ({
        ...current,
        status: `Copied ${current.artifactProfileReference} JSON.`,
      }))
      window.setTimeout(() => {
        setHasCopiedProfile(false)
      }, 1800)
    } catch {
      setEditorState((current) => ({
        ...current,
        status: "Copy failed.",
      }))
    }
  }, [editorState.draftProfile])

  const createArtifactProfileReference = React.useCallback(async () => {
    const createId = editorState.createId.trim()

    if (!createId) {
      setEditorState((current) => ({
        ...current,
        error: 'New profile id is required, for example "team-ops".',
      }))
      return
    }

    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Creating ${createId}...`,
    }))

    try {
      const result = await createGalleryArtifactProfile(createId)

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        createId: "",
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Created ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Create failed.",
      }))
    }
  }, [editorState.createId])

  const deleteCurrentArtifactProfileReference = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Deleting ${current.artifactProfileReference}...`,
    }))

    try {
      const result = await deleteGalleryArtifactProfile(
        editorState.artifactProfileReference,
      )

      setEditorState((current) => ({
        ...current,
        availableArtifactProfileReferences:
          result.availableArtifactProfileReferences ??
          current.availableArtifactProfileReferences,
        builtinArtifactProfileReferences:
          result.builtinArtifactProfileReferences ??
          current.builtinArtifactProfileReferences,
        draftProfile: result.artifactProfile,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.artifactProfile,
        status: `Deleted profile. Current is ${result.artifactProfileReference}.`,
        artifactProfileReference: result.artifactProfileReference,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Delete failed.",
      }))
    }
  }, [editorState.artifactProfileReference])

  const resetDraft = React.useCallback(() => {
    setEditorState((current) => ({
      ...current,
      draftProfile: current.persistedProfile,
      error: "",
      isDirty: false,
      status: `Reset ${current.artifactProfileReference}.`,
    }))
  }, [])

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
  }, [])

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
        target.querySelector(
          '[data-slot="card-title"], h1, h2, h3, h4, h5, h6',
        ) ?? target

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
      const rawTarget =
        event.target instanceof HTMLElement ? event.target : null

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
      const rawTarget =
        event.target instanceof HTMLElement ? event.target : null

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
  }, [inspectorEnabled, previewMode])

  return (
    <>
      <RuntimeStyleElements
        documentStyleCss={documentStyleCss}
        extraCss={createGalleryWorkbenchCss()}
        galleryPreviewThemeCss={previewThemeCss}
        includeGalleryShell
      />
      <main
        className="ahtml-runtime-host ahtml-gallery-shell"
        data-artifact-profile={editorState.draftProfile.id}
      >
        <header
          className="ahtml-gallery-page-header"
          data-gallery-frame="header"
        >
          <div className="ahtml-gallery-page-brand">
            <strong>agent-html</strong>
            <span>Gallery</span>
          </div>
          <div className="ahtml-gallery-header-actions">
            <Badge variant="outline">
              {editorState.artifactProfileReference}
            </Badge>
            <Button asChild size="sm" variant="ghost">
              <a
                href="https://github.com/Sayhi-bzb/Agent-HTML"
                rel="noreferrer"
                target="_blank"
              >
                GitHub
              </a>
            </Button>
          </div>
        </header>
        <Tabs
          className="ahtml-gallery-mobile-tabs"
          onValueChange={(value) =>
            setMobileTab(value as "controls" | "preview")
          }
          value={mobileTab}
        >
          <TabsList className="ahtml-gallery-mobile-tabs-list">
            <GalleryTabsTriggerPill
              className="ahtml-gallery-mobile-tabs-trigger"
              value="controls"
            >
              Controls
            </GalleryTabsTriggerPill>
            <GalleryTabsTriggerPill
              className="ahtml-gallery-mobile-tabs-trigger"
              value="preview"
            >
              Preview
            </GalleryTabsTriggerPill>
          </TabsList>
        </Tabs>
        <div className="ahtml-gallery-main">
          <ResizablePanelGroup
            className="ahtml-gallery-workbench"
            orientation="horizontal"
          >
            <ResizablePanel defaultSize={30} maxSize={42} minSize={22}>
              <GalleryControlsPane
                activeArtifactProfileEditorStatus={
                  activeArtifactProfileEditorStatus
                }
                activeArtifactProfileIsBuiltIn={activeArtifactProfileIsBuiltIn}
                activeArtifactProfileKindLabel={activeArtifactProfileKindLabel}
                activeArtifactProfileSummary={activeArtifactProfileSummary}
                artifactProfileReference={editorState.artifactProfileReference}
                colorSearch={colorSearch}
                colorSectionValues={colorSectionValues}
                colorThemeSyncEnabled={colorThemeSyncEnabled}
                controlTab={controlTab}
                copyThemeTokens={copyThemeTokens}
                createArtifactProfileReference={createArtifactProfileReference}
                cycleArtifactProfileReference={cycleArtifactProfileReference}
                deleteCurrentArtifactProfileReference={
                  deleteCurrentArtifactProfileReference
                }
                editorState={editorState}
                filteredArtifactProfileReferences={
                  filteredArtifactProfileReferences
                }
                filteredBuiltInArtifactProfileReferences={
                  filteredBuiltInArtifactProfileReferences
                }
                filteredColorTokenSections={filteredColorTokenSections}
                filteredCustomArtifactProfileReferences={
                  filteredCustomArtifactProfileReferences
                }
                focusedEditorField={focusedEditorField}
                focusedToken={focusedToken}
                mobileTab={mobileTab}
                openControlTab={openControlTab}
                presetPopoverOpen={presetPopoverOpen}
                presetSearch={presetSearch}
                previewMode={previewMode}
                previewThemeMode={previewThemeMode}
                randomizeArtifactProfileReference={
                  randomizeArtifactProfileReference
                }
                selectArtifactProfileReference={selectArtifactProfileReference}
                setColorSearch={setColorSearch}
                setColorSectionValues={setColorSectionValues}
                setColorThemeSyncEnabled={setColorThemeSyncEnabled}
                setEditorState={setEditorState}
                setFocusedEditorField={setFocusedEditorField}
                setFocusedToken={setFocusedToken}
                setPresetPopoverOpen={setPresetPopoverOpen}
                setPresetSearch={setPresetSearch}
                setPreviewThemeMode={setPreviewThemeMode}
                updateDraftProfile={updateDraftProfile}
                updateThemeTokenValue={updateThemeTokenValue}
              />
            </ResizablePanel>

            <ResizableHandle className="ahtml-gallery-divider" withHandle />

            <ResizablePanel defaultSize={70} minSize={58}>
              <div
                className="ahtml-gallery-preview"
                data-gallery-frame="preview"
                data-mobile-panel={
                  mobileTab === "preview" ? "active" : "hidden"
                }
              >
                <GalleryPreviewPane
                  RendererNode={RendererNode}
                  artifactProfileReference={
                    editorState.artifactProfileReference
                  }
                  colorThemeSyncEnabled={colorThemeSyncEnabled}
                  copyCurrentArtifactProfile={copyCurrentArtifactProfile}
                  draftProfile={editorState.draftProfile}
                  focusEditorField={focusEditorField}
                  focusThemeToken={focusThemeToken}
                  focusedToken={focusedToken}
                  hasCopiedProfile={hasCopiedProfile}
                  inspectorEnabled={inspectorEnabled}
                  inspectorState={inspectorState}
                  isDirty={editorState.isDirty}
                  isPreviewFullscreen={isPreviewFullscreen}
                  isSaving={editorState.isSaving}
                  openControlTab={openControlTab}
                  previewMode={previewMode}
                  previewModeLabel={previewModeLabel}
                  previewShellRef={previewShellRef}
                  previewSurfaceRef={previewSurfaceRef}
                  previewThemeMode={previewThemeMode}
                  resetDraft={resetDraft}
                  saveProfile={saveProfile}
                  setInspectorEnabled={setInspectorEnabled}
                  setPreviewMode={setPreviewMode}
                  setPreviewThemeMode={setPreviewThemeMode}
                  togglePreviewFullscreen={togglePreviewFullscreen}
                  visiblePreviewSections={visiblePreviewSections}
                />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}
