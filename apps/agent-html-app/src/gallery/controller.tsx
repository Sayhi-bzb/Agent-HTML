import * as React from "react"
import { BrushIcon, PackageIcon, SparklesIcon } from "lucide-react"

import type { AgentHtmlColorTokenValues } from "@/agent-html"
import {
  defaultEnabledGalleryComponentTags,
  galleryComponentMarketAllCategory,
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketFilters,
} from "@/app/gallery/component-market-catalog"
import { createGalleryComponentMarketStore } from "@/app/gallery/component-market-store"
import {
  GalleryPanel,
  preloadGalleryComponentMarketView,
  preloadGalleryWorkspaceSurface,
} from "@/app/gallery/panel"
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
  areAppThemeDraftsEqual,
  createAppPresetThemeDraft,
  resolveAppThemeColorTokenValues,
  resolveAppThemeCssVariables,
  updateAppThemeDraftColorTokenValue,
  updateAppThemeDraftCssVariable,
  updateAppThemeDraftCssVariables,
} from "@/app/shared/app-theme/theme"
import type { AppThemeEditableVariableName } from "@/app/shared/app-theme/variables"
import type { HeaderTab } from "@/app/shell/site-header"
import { useAppliedAppTheme } from "@/app/shared/app-theme/applied-theme-context"
import { useColorMode } from "@/app/shared/color-mode-context"
import { Skeleton } from "@/app/shared/ui/skeleton"

const galleryViewIcons: Record<
  GalleryViewId,
  React.ComponentType<{ className?: string }>
> = {
  components: PackageIcon,
  pets: SparklesIcon,
  theme: BrushIcon,
}

const galleryComponentMarketStore = createGalleryComponentMarketStore()

function preloadGalleryEditorPanel() {
  void import("@/app/gallery/editor")
}

function preloadGalleryThemeView() {
  preloadGalleryEditorPanel()
  preloadGalleryWorkspaceSurface()
}

const GalleryEditorPanel = React.lazy(() =>
  import("@/app/gallery/editor").then((module) => ({
    default: module.GalleryEditorPanel,
  }))
)

export function useGalleryController({
  canLeaveWorkspace,
  onActivateGallery,
  onActivateWorkspace,
}: {
  canLeaveWorkspace: () => boolean
  onActivateGallery: () => void
  onActivateWorkspace: () => void
}) {
  const { resolvedColorMode } = useColorMode()
  const {
    appliedThemeCssVariables,
    appliedThemeDraft,
    saveAppliedThemeDraft,
  } = useAppliedAppTheme()
  const [appThemeDraft, setAppThemeDraft] = React.useState(
    () => appliedThemeDraft
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
  const [, startThemeTransition] = React.useTransition()

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
    () => !areAppThemeDraftsEqual(appThemeDraft, appliedThemeDraft),
    [appliedThemeDraft, appThemeDraft]
  )

  const colorTokenValues = React.useMemo(
    () =>
      resolveAppThemeColorTokenValues(
        appThemeDraft,
        resolvedColorMode
      ) as AgentHtmlColorTokenValues,
    [appThemeDraft, resolvedColorMode]
  )

  const themeCssVariables = React.useMemo(
    () => resolveAppThemeCssVariables(appThemeDraft, resolvedColorMode),
    [appThemeDraft, resolvedColorMode]
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

    setIsExitDialogOpen(false)
    setPendingViewId(null)
    preloadGalleryThemeView()
    onActivateGallery()
  }, [canLeaveWorkspace, onActivateGallery])

  const requestExitGallery = React.useCallback(() => {
    if (activeViewId === "theme" && isThemeDirty) {
      setPendingViewId(null)
      setIsExitDialogOpen(true)
      return
    }

    setAppThemeDraft(appliedThemeDraft)
    onActivateWorkspace()
  }, [activeViewId, appliedThemeDraft, isThemeDirty, onActivateWorkspace])

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

      if (tabId === "theme") {
        preloadGalleryThemeView()
      }
      if (tabId === "components") {
        preloadGalleryComponentMarketView()
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
    saveAppliedThemeDraft(appThemeDraft)
  }, [appThemeDraft, saveAppliedThemeDraft])

  const saveAndExit = React.useCallback(() => {
    saveAppliedThemeDraft(appThemeDraft)
    setIsExitDialogOpen(false)
    if (pendingViewId) {
      setActiveViewId(pendingViewId)
      setPendingViewId(null)
      return
    }

    onActivateWorkspace()
  }, [appThemeDraft, onActivateWorkspace, pendingViewId, saveAppliedThemeDraft])

  const discardAndExit = React.useCallback(() => {
    setAppThemeDraft(appliedThemeDraft)
    setIsExitDialogOpen(false)
    if (pendingViewId) {
      setActiveViewId(pendingViewId)
      setPendingViewId(null)
      return
    }

    onActivateWorkspace()
  }, [appliedThemeDraft, onActivateWorkspace, pendingViewId])

  const selectThemePreset = React.useCallback((presetId: AppThemePresetId) => {
    const draft = createAppPresetThemeDraft(presetId)
    if (!draft) {
      return
    }

    startThemeTransition(() => {
      setAppThemeDraft(draft)
    })
  }, [startThemeTransition])

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
              startThemeTransition(() => {
                setAppThemeDraft((current) =>
                  updateAppThemeDraftColorTokenValue({
                    draft: current,
                    resolvedMode: resolvedColorMode,
                    token,
                    value,
                  })
                )
              })
            }
            onCssVariableChange={(
              name: AppThemeEditableVariableName,
              value: string
            ) =>
              startThemeTransition(() => {
                setAppThemeDraft((current) =>
                  updateAppThemeDraftCssVariable({
                    draft: current,
                    name,
                    resolvedMode: resolvedColorMode,
                    value,
                  })
                )
              })
            }
            onCssVariablesChange={(values) =>
              startThemeTransition(() => {
                setAppThemeDraft((current) =>
                  updateAppThemeDraftCssVariables({
                    draft: current,
                    resolvedMode: resolvedColorMode,
                    values,
                  })
                )
              })
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
      resolvedColorMode,
      startThemeTransition,
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
  return (
    <div className="flex flex-col gap-4 px-2 py-2" data-selection="none">
      {Array.from({ length: 3 }).map((_, groupIndex) => (
        <div className="space-y-2" key={groupIndex}>
          <Skeleton className="h-3 w-24" />
          <div className="space-y-1.5">
            {Array.from({ length: 3 }).map((__, rowIndex) => (
              <div className="flex items-center gap-2" key={rowIndex}>
                <Skeleton className="size-5 rounded-full" />
                <Skeleton className="h-8 flex-1" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
