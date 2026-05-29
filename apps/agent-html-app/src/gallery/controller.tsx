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
import { createGalleryComponentMarketRepository } from "@/app/gallery/component-market-repository"
import { GalleryEditorPanel } from "@/app/gallery/editor"
import { GalleryPanel } from "@/app/gallery/panel"
import {
  GalleryComponentMarketSidebarHeader,
  GalleryComponentMarketSidebarFooter,
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
import { useTheme } from "@/app/shared/theme-provider"

const galleryViewIcons: Record<
  GalleryViewId,
  React.ComponentType<{ className?: string }>
> = {
  components: PackageIcon,
  pets: SparklesIcon,
  theme: BrushIcon,
}

const galleryComponentMarketRepository =
  createGalleryComponentMarketRepository()

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

    galleryComponentMarketRepository
      .loadEnabledComponentTags()
      .then((enabledTags) => {
        if (isCurrent) {
          setEnabledComponentTags(enabledTags)
        }

        return galleryComponentMarketRepository.writePromptSchemaArtifact(
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
      galleryComponentMarketRepository
        .saveEnabledComponentTags(nextTags)
        .then((savedTags) =>
          galleryComponentMarketRepository
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

  const sidebarHeaderContent =
    activeViewId === "theme" ? (
      <GalleryThemeSidebarHeader
        activePresetId={activeThemePresetId}
        activeSectionId={activeThemeEditorSectionId}
        onSelectPreset={selectThemePreset}
        onSelectSection={setActiveThemeEditorSectionId}
        presets={appThemePresets}
      />
    ) : activeViewId === "components" ? (
      <GalleryComponentMarketSidebarHeader
        componentMarketFilters={componentMarketFilters}
        enabledComponentTags={enabledComponentTags}
        onComponentMarketFiltersChange={setComponentMarketFilters}
        onSearchQueryCommit={setComponentMarketSearchQuery}
      />
    ) : null

  const sidebarContent =
    activeViewId === "theme" ? (
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
    ) : (
      <GalleryMarketSidebar
        componentMarketFilters={componentMarketFilters}
        onComponentMarketFiltersChange={setComponentMarketFilters}
        viewId={activeViewId}
      />
    )

  const sidebarFooterContent =
    activeViewId === "theme" ? (
      <GalleryThemeSidebarFooter isDirty={isThemeDirty} onApply={applyTheme} />
    ) : activeViewId === "components" ? (
      <GalleryComponentMarketSidebarFooter
        enabledComponentTags={enabledComponentTags}
      />
    ) : null

  const panel = (
    <GalleryPanel
      activeViewId={activeViewId}
      componentMarketFilters={componentMarketFilters}
      componentMarketSearchQuery={componentMarketSearchQuery}
      enabledComponentTags={enabledComponentTags}
      onComponentMarketFiltersChange={setComponentMarketFilters}
      onEnabledComponentTagsChange={changeEnabledComponentTags}
    />
  )

  return {
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
  }
}
