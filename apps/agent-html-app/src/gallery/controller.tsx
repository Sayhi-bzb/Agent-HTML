import * as React from "react"
import { BrushIcon, PackageIcon, SparklesIcon } from "lucide-react"

import type {
  AgentHtmlColorCssVariables,
  AgentHtmlColorTokenValues,
} from "@/agent-html"
import {
  defaultEnabledGalleryComponentTags,
  galleryComponentMarketAllCategory,
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketFilters,
} from "@/app/gallery/component-market-catalog"
import { createGalleryComponentMarketStore } from "@/app/gallery/component-market-store"
import { GalleryPanel } from "@/app/gallery/panel"
import {
  GalleryLazyComponentMarketSidebarFooter,
  GalleryLazyComponentMarketSidebarHeader,
  GalleryMarketSidebar,
  GalleryThemeSidebarFooter,
  GalleryThemeSidebarHeader,
} from "@/app/gallery/sidebar"
import type { GalleryThemeEditorSectionId } from "@/app/gallery/theme-editor-sections"
import {
  galleryViews,
  isGalleryViewId,
  type GalleryViewId,
} from "@/app/gallery/views"
import {
  appThemePresets,
  type AppColorTokenName,
  type AppColorTokenValue,
  type AppThemePresetId,
} from "@/app/shared/app-theme/tokens"
import {
  applyAppTheme,
  areAppThemeDraftsEqual,
  createAppPresetThemeDraft,
  createDefaultAppThemeDraft,
  loadAppliedAppTheme,
  resolveAppThemeColorTokenValues,
  resolveAppThemeCssVariables,
  saveAppliedAppTheme,
  updateAppThemeDraftColorTokenValue,
  updateAppThemeDraftCssVariable,
  updateAppThemeDraftCssVariables,
} from "@/app/shared/app-theme/theme"
import type { AppThemeEditableVariableName } from "@/app/shared/app-theme/variables"
import type { HeaderTab } from "@/app/shell/site-header"
import { useTheme } from "@/app/shared/theme-context"

const galleryViewIcons: Record<
  GalleryViewId,
  React.ComponentType<{ className?: string }>
> = {
  components: PackageIcon,
  pets: SparklesIcon,
  theme: BrushIcon,
}

const galleryComponentMarketStore = createGalleryComponentMarketStore()

const GalleryEditorPanel = React.lazy(() =>
  import("@/app/gallery/editor").then((module) => ({
    default: module.GalleryEditorPanel,
  }))
)

function getInitialAppliedAppTheme() {
  if (typeof window === "undefined") {
    return createDefaultAppThemeDraft()
  }

  return loadAppliedAppTheme() ?? createDefaultAppThemeDraft()
}

export function useGalleryController({
  canLeaveWorkspace,
  onActivateGallery,
  onActivateWorkspace,
}: {
  canLeaveWorkspace: () => boolean
  onActivateGallery: () => void
  onActivateWorkspace: () => void
}) {
  const { resolvedTheme } = useTheme()
  const [appliedAppThemeDraft, setAppliedAppThemeDraft] =
    React.useState(getInitialAppliedAppTheme)
  const [appThemeDraft, setAppThemeDraft] = React.useState(
    () => appliedAppThemeDraft
  )
  const [isExitDialogOpen, setIsExitDialogOpen] = React.useState(false)
  const [activeViewId, setActiveViewId] = React.useState<GalleryViewId>("theme")
  const [componentMarketFilters, setComponentMarketFilters] =
    React.useState<GalleryComponentMarketFilters>({
      category: galleryComponentMarketAllCategory,
      status: "all",
    })
  const [componentMarketSearchQuery, setComponentMarketSearchQuery] =
    React.useState("")
  const [enabledComponentTags, setEnabledComponentTags] =
    React.useState<EnabledGalleryComponentTags>(
      () => new Set(defaultEnabledGalleryComponentTags)
    )
  const [activeThemeEditorSectionId, setActiveThemeEditorSectionId] =
    React.useState<GalleryThemeEditorSectionId>("color")
  const [pendingViewId, setPendingViewId] =
    React.useState<GalleryViewId | null>(null)

  React.useEffect(() => {
    applyAppTheme(appliedAppThemeDraft)
  }, [appliedAppThemeDraft])

  React.useEffect(() => {
    let isCurrent = true

    galleryComponentMarketStore
      .loadEnabledComponentTags()
      .then((enabledTags) => {
        if (isCurrent) {
          setEnabledComponentTags(enabledTags)
        }

        return galleryComponentMarketStore.writePromptSchemaArtifact(
          enabledTags
        )
      })
      .catch((error: unknown) => {
        console.error("Unable to load component market settings.", error)
      })

    return () => {
      isCurrent = false
    }
  }, [])

  const isThemeDirty = React.useMemo(
    () => !areAppThemeDraftsEqual(appThemeDraft, appliedAppThemeDraft),
    [appliedAppThemeDraft, appThemeDraft]
  )

  const colorTokenValues = React.useMemo(
    () =>
      resolveAppThemeColorTokenValues(
        appThemeDraft,
        resolvedTheme
      ) as AgentHtmlColorTokenValues,
    [appThemeDraft, resolvedTheme]
  )

  const appliedThemeCssVariables = React.useMemo(
    () =>
      resolveAppThemeCssVariables(
        appliedAppThemeDraft,
        resolvedTheme
      ) as AgentHtmlColorCssVariables,
    [appliedAppThemeDraft, resolvedTheme]
  )

  const themeCssVariables = React.useMemo(
    () => resolveAppThemeCssVariables(appThemeDraft, resolvedTheme),
    [appThemeDraft, resolvedTheme]
  )

  const activeThemePresetId =
    appThemeDraft.kind === "preset" ? appThemeDraft.id : "default"

  const headerTabs = React.useMemo<HeaderTab[]>(
    () =>
      galleryViews.map((view) => ({
        Icon: galleryViewIcons[view.id],
        id: view.id,
        isClosable: false,
        label: view.label,
      })),
    []
  )

  const requestEnterGallery = React.useCallback((options?: {
    skipWorkspaceGuard?: boolean
  }) => {
    if (!options?.skipWorkspaceGuard && !canLeaveWorkspace()) {
      return
    }

    setAppThemeDraft(appliedAppThemeDraft)
    setIsExitDialogOpen(false)
    setPendingViewId(null)
    setActiveViewId("theme")
    onActivateGallery()
  }, [appliedAppThemeDraft, canLeaveWorkspace, onActivateGallery])

  const requestExitGallery = React.useCallback(() => {
    if (activeViewId === "theme" && isThemeDirty) {
      setPendingViewId(null)
      setIsExitDialogOpen(true)
      return
    }

    setAppThemeDraft(appliedAppThemeDraft)
    onActivateWorkspace()
  }, [activeViewId, appliedAppThemeDraft, isThemeDirty, onActivateWorkspace])

  const selectViewTab = React.useCallback(
    (tabId: string) => {
      if (!isGalleryViewId(tabId) || tabId === activeViewId) {
        return
      }

      if (activeViewId === "theme" && isThemeDirty) {
        setPendingViewId(tabId)
        setIsExitDialogOpen(true)
        return
      }

      setActiveViewId(tabId)
    },
    [activeViewId, isThemeDirty]
  )

  const closeExitDialog = React.useCallback((open: boolean) => {
    setIsExitDialogOpen(open)
    if (!open) {
      setPendingViewId(null)
    }
  }, [])

  const applyTheme = React.useCallback(() => {
    saveAppliedAppTheme(appThemeDraft)
    setAppliedAppThemeDraft(appThemeDraft)
  }, [appThemeDraft])

  const saveAndExit = React.useCallback(() => {
    saveAppliedAppTheme(appThemeDraft)
    setAppliedAppThemeDraft(appThemeDraft)
    setIsExitDialogOpen(false)
    if (pendingViewId) {
      setActiveViewId(pendingViewId)
      setPendingViewId(null)
      return
    }

    onActivateWorkspace()
  }, [appThemeDraft, onActivateWorkspace, pendingViewId])

  const discardAndExit = React.useCallback(() => {
    setAppThemeDraft(appliedAppThemeDraft)
    setIsExitDialogOpen(false)
    if (pendingViewId) {
      setActiveViewId(pendingViewId)
      setPendingViewId(null)
      return
    }

    onActivateWorkspace()
  }, [appliedAppThemeDraft, onActivateWorkspace, pendingViewId])

  const selectThemePreset = React.useCallback((presetId: AppThemePresetId) => {
    const draft = createAppPresetThemeDraft(presetId)
    if (!draft) {
      return
    }

    setAppThemeDraft(draft)
  }, [])

  const changeEnabledComponentTags = React.useCallback(
    (nextEnabledTags: EnabledGalleryComponentTags) => {
      const previousEnabledTags = enabledComponentTags
      const nextTags = new Set(nextEnabledTags)

      setEnabledComponentTags(nextTags)
      galleryComponentMarketStore
        .saveEnabledComponentTags(nextTags)
        .then((savedTags) =>
          galleryComponentMarketStore
            .writePromptSchemaArtifact(savedTags)
            .then(() => savedTags)
        )
        .then((savedTags) => {
          setEnabledComponentTags(savedTags)
        })
        .catch((error: unknown) => {
          console.error("Unable to save component market settings.", error)
          setEnabledComponentTags(previousEnabledTags)
        })
    },
    [enabledComponentTags]
  )

  const sidebarHeaderContent = React.useMemo(
    () =>
      activeViewId === "theme" ? (
        <GalleryThemeSidebarHeader
          activePresetId={activeThemePresetId}
          activeSectionId={activeThemeEditorSectionId}
          onSelectPreset={selectThemePreset}
          onSelectSection={setActiveThemeEditorSectionId}
          presets={appThemePresets}
        />
      ) : activeViewId === "components" ? (
        <GalleryLazyComponentMarketSidebarHeader
          componentMarketFilters={componentMarketFilters}
          enabledComponentTags={enabledComponentTags}
          onComponentMarketFiltersChange={setComponentMarketFilters}
          onSearchQueryCommit={setComponentMarketSearchQuery}
        />
      ) : null,
    [
      activeThemePresetId,
      activeThemeEditorSectionId,
      activeViewId,
      componentMarketFilters,
      enabledComponentTags,
      selectThemePreset,
    ]
  )

  const sidebarContent = React.useMemo(
    () =>
      activeViewId === "theme" ? (
        <React.Suspense fallback={<GallerySidebarFallback />}>
          <GalleryEditorPanel
            colorTokenValues={colorTokenValues}
            cssVariables={themeCssVariables}
            onColorTokenValueChange={(
              token: AppColorTokenName,
              value: AppColorTokenValue
            ) =>
              setAppThemeDraft((current) =>
                updateAppThemeDraftColorTokenValue({
                  draft: current,
                  resolvedMode: resolvedTheme,
                  token,
                  value,
                })
              )
            }
            onCssVariableChange={(
              name: AppThemeEditableVariableName,
              value: string
            ) =>
              setAppThemeDraft((current) =>
                updateAppThemeDraftCssVariable({
                  draft: current,
                  name,
                  resolvedMode: resolvedTheme,
                  value,
                })
              )
            }
            onCssVariablesChange={(values) =>
              setAppThemeDraft((current) =>
                updateAppThemeDraftCssVariables({
                  draft: current,
                  resolvedMode: resolvedTheme,
                  values,
                })
              )
            }
            sectionId={activeThemeEditorSectionId}
          />
        </React.Suspense>
      ) : (
        <GalleryMarketSidebar
          componentMarketFilters={componentMarketFilters}
          onComponentMarketFiltersChange={setComponentMarketFilters}
          viewId={activeViewId}
        />
      ),
    [
      activeThemeEditorSectionId,
      activeViewId,
      colorTokenValues,
      componentMarketFilters,
      resolvedTheme,
      themeCssVariables,
    ]
  )

  const sidebarFooterContent = React.useMemo(
    () =>
      activeViewId === "theme" ? (
        <GalleryThemeSidebarFooter isDirty={isThemeDirty} onApply={applyTheme} />
      ) : activeViewId === "components" ? (
        <GalleryLazyComponentMarketSidebarFooter
          enabledComponentTags={enabledComponentTags}
        />
      ) : null,
    [activeViewId, applyTheme, enabledComponentTags, isThemeDirty]
  )

  const panel = React.useMemo(
    () => (
      <GalleryPanel
        activeViewId={activeViewId}
        componentMarketFilters={componentMarketFilters}
        componentMarketSearchQuery={componentMarketSearchQuery}
        enabledComponentTags={enabledComponentTags}
        onComponentMarketFiltersChange={setComponentMarketFilters}
        onEnabledComponentTagsChange={changeEnabledComponentTags}
      />
    ),
    [
      activeViewId,
      changeEnabledComponentTags,
      componentMarketFilters,
      componentMarketSearchQuery,
      enabledComponentTags,
    ]
  )

  return React.useMemo(
    () => ({
      activeViewId,
      appliedThemeCssVariables,
      headerTabs,
      panel,
      requestEnterGallery,
      requestExitGallery,
      selectViewTab,
      sidebarContent,
      sidebarFooterContent,
      sidebarHeaderContent,
      themeDraft: appThemeDraft,
      themeExitDialog: {
        isOpen: isExitDialogOpen,
        onOpenChange: closeExitDialog,
        onDiscard: discardAndExit,
        onSave: saveAndExit,
      },
    }),
    [
      activeViewId,
      appliedThemeCssVariables,
      appThemeDraft,
      closeExitDialog,
      discardAndExit,
      headerTabs,
      isExitDialogOpen,
      panel,
      requestEnterGallery,
      requestExitGallery,
      saveAndExit,
      selectViewTab,
      sidebarContent,
      sidebarFooterContent,
      sidebarHeaderContent,
    ]
  )
}

export type GalleryController = ReturnType<typeof useGalleryController>

function GallerySidebarFallback() {
  return <div className="min-h-32" />
}
