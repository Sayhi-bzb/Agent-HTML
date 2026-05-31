import * as React from "react"

import type { GalleryController } from "@/app/gallery/controller"
import { AppFrame } from "@/app/shell/app-frame"
import type { HeaderTab } from "@/app/shell/site-header"
import { useAppliedAppThemeCssVariables } from "@/app/shared/app-theme/applied-theme-provider"
import { closeWindow } from "@/app/shared/lib/window-controls"
import { useWorkspaceController } from "@/app/workspace/controller"

type SurfaceMode = "gallery" | "workspace"

const GalleryMode = React.lazy(() =>
  import("@/app/gallery/gallery-mode").then((module) => ({
    default: module.GalleryMode,
  }))
)

export function App() {
  const [surfaceMode, setSurfaceMode] = React.useState<SurfaceMode>("workspace")
  const handleActivateWorkspace = React.useCallback(() => {
    setSurfaceMode("workspace")
  }, [])
  const [galleryController, setGalleryController] =
    React.useState<GalleryController | null>(null)
  const appliedThemeCssVariables = useAppliedAppThemeCssVariables()
  const workspace = useWorkspaceController({
    onActivateWorkspace: handleActivateWorkspace,
  })

  const headerTabs = React.useMemo<HeaderTab[]>(() => {
    if (surfaceMode === "gallery" && galleryController) {
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

      if (surfaceMode === "gallery" && galleryController) {
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

  const handleEnterGalleryMode = React.useCallback(() => {
    if (
      workspace.guardDocumentNavigation(() => {
        setSurfaceMode("gallery")
      })
    ) {
      return
    }

    setSurfaceMode("gallery")
  }, [workspace])
  const canLeaveWorkspaceForGallery = React.useCallback(
    () => !workspace.guardDocumentNavigation(),
    [workspace]
  )
  const handleActivateGallery = React.useCallback(() => {
    setSurfaceMode("gallery")
  }, [])

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
        appliedThemeCssVariables={appliedThemeCssVariables}
        gallery={galleryController}
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
      {surfaceMode === "gallery" ? (
        <React.Suspense fallback={null}>
          <GalleryMode
            canLeaveWorkspace={canLeaveWorkspaceForGallery}
            onActivateGallery={handleActivateGallery}
            onActivateWorkspace={handleActivateWorkspace}
            onControllerChange={setGalleryController}
          />
        </React.Suspense>
      ) : null}
    </>
  )
}

export default App
