import * as React from "react"

import { useGalleryController } from "@/app/gallery/controller"
import { AppFrame } from "@/app/shell/app-frame"
import type { HeaderTab } from "@/app/shell/site-header"
import { closeWindow } from "@/app/shared/lib/window-controls"
import { useWorkspaceController } from "@/app/workspace/controller"

type SurfaceMode = "gallery" | "workspace"

export function App() {
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const handleActivateWorkspace = React.useCallback(() => {
    setSurfaceMode("workspace")
  }, [])
  const workspace = useWorkspaceController({
    onActivateWorkspace: handleActivateWorkspace,
  })
  const gallery = useGalleryController({
    canLeaveWorkspace: React.useCallback(
      () => !workspace.guardDocumentNavigation(),
      [workspace]
    ),
    onActivateGallery: React.useCallback(() => {
      setSurfaceMode("gallery")
    }, []),
    onActivateWorkspace: handleActivateWorkspace,
  })

  const headerTabs = React.useMemo<HeaderTab[]>(() => {
    if (surfaceMode === "gallery") {
      return gallery.headerTabs
    }

    return workspace.openTabs.map((tab) => ({
      id: tab.id,
      isDirty: workspace.isTabDirty(tab.id),
      isClosable: true,
      label: tab.label,
    }))
  }, [gallery.headerTabs, surfaceMode, workspace])

  const handleSelectTab = React.useCallback(
    (tabId: string) => {
      if (tabId === workspace.activeTabId && surfaceMode !== "gallery") {
        return
      }

      if (surfaceMode === "gallery") {
        gallery.selectViewTab(tabId)
        return
      }

      workspace.selectTab(tabId)
    },
    [gallery, surfaceMode, workspace]
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

  const handleEnterGalleryMode = React.useCallback(() => {
    if (
      workspace.guardDocumentNavigation(() => {
        gallery.requestEnterGallery({ skipWorkspaceGuard: true })
      })
    ) {
      return
    }

    gallery.requestEnterGallery()
  }, [gallery, workspace])

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
    <AppFrame
      gallery={gallery}
      headerTabs={headerTabs}
      onCloseWindow={handleCloseWindow}
      onEnterGalleryMode={handleEnterGalleryMode}
      onReorderWorkspaceTabs={
        surfaceMode === "workspace" ? handleReorderWorkspaceTabs : undefined
      }
      onSelectTab={handleSelectTab}
      surfaceMode={surfaceMode}
      workspace={workspace}
    />
  )
}

export default App
