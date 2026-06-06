import * as React from "react"

import { useGalleryController } from "@/app/gallery/controller"
import { AppFrame } from "@/app/shell/app-frame"
import type { HeaderTab } from "@/app/shell/site-header"
import { useAppliedAppTheme } from "@/app/shared/app-theme/applied-theme-context"
import { resolveAppThemeCssVariables } from "@/app/shared/app-theme/theme"
import { useColorMode } from "@/app/shared/color-mode-context"
import { closeWindow } from "@/app/shared/lib/window-controls"
import { useWorkspaceController } from "@/app/workspace/controller"
import type { AgentHtmlColorCssVariables } from "@/agent-html"

type SurfaceMode = "gallery" | "workspace"

export function App() {
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const handleActivateWorkspace = React.useCallback(() => {
    setSurfaceMode("workspace")
  }, [])
  const { appliedThemeDraft } = useAppliedAppTheme()
  const { resolvedColorMode } = useColorMode()
  const workspace = useWorkspaceController({
    onActivateWorkspace: handleActivateWorkspace,
  })
  const canLeaveWorkspaceForGallery = React.useCallback(
    () => !workspace.guardDocumentNavigation(),
    [workspace]
  )
  const handleActivateGallery = React.useCallback(() => {
    setSurfaceMode("gallery")
  }, [])
  const galleryController = useGalleryController({
    canLeaveWorkspace: canLeaveWorkspaceForGallery,
    onActivateGallery: handleActivateGallery,
    onActivateWorkspace: handleActivateWorkspace,
  })
  const activeThemeDraft =
    surfaceMode === "gallery" ? galleryController.themeDraft : appliedThemeDraft
  const activeThemeCssVariables = React.useMemo(
    () =>
      resolveAppThemeCssVariables(
        activeThemeDraft,
        resolvedColorMode
      ) as AgentHtmlColorCssVariables,
    [activeThemeDraft, resolvedColorMode]
  )

  const headerTabs = React.useMemo<HeaderTab[]>(() => {
    if (surfaceMode === "gallery") {
      return galleryController.headerTabs
    }

    return workspace.openTabs.map((tab) => ({
      id: tab.id,
      isDirty: workspace.isTabDirty(tab.id),
      isClosable: true,
      label: tab.label,
    }))
  }, [galleryController, surfaceMode, workspace])

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
      if (tabId === workspace.activeTabId && surfaceMode !== "gallery") {
        return
      }

      if (surfaceMode === "gallery") {
        galleryController.selectViewTab(tabId)
        return
      }

      workspace.selectTab(tabId)
    },
    [galleryController, surfaceMode, workspace]
  )

  const handleReorderWorkspaceTabs = React.useCallback(
    (orderedTabIds: string[]) => {
      if (surfaceMode !== "workspace") {
        return
      }

      workspace.reorderTabs(orderedTabIds)
    },
    [surfaceMode, workspace]
  )

  const handleEnterGallery = React.useCallback(() => {
    galleryController.requestEnterGallery()
  }, [galleryController])

  const handleCloseWindow = React.useCallback(() => {
    if (
      workspace.guardDocumentNavigation(() => {
        void closeWindow()
      })
    ) {
      return
    }

    void closeWindow()
  }, [workspace])

  return (
    <>
      <AppFrame
        activeThemeCssVariables={activeThemeCssVariables}
        gallery={galleryController}
        headerTabs={headerTabs}
        onCloseWindow={handleCloseWindow}
        onEnterGalleryMode={handleEnterGallery}
        onReorderWorkspaceTabs={
          surfaceMode === "workspace" ? handleReorderWorkspaceTabs : undefined
        }
        onSelectTab={handleSelectTab}
        surfaceMode={surfaceMode}
        workspace={workspace}
      />
    </>
  )
}

export default App
