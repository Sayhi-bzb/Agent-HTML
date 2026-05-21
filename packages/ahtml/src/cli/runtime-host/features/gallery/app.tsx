import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Tabs, TabsList } from "@/components/ui/tabs"

import { RuntimeStyleElements } from "../../host-styles"
import type { RuntimeVerificationState } from "../../renderer/types"
import { GalleryControlsPane } from "./controls"
import { useGalleryAppController } from "./hooks"
import { GalleryPreviewPane } from "./preview"
import { GalleryTabsTriggerPill } from "./shared/chrome"
import { createGalleryWorkbenchCss } from "./styles"
import type { ArtifactProfile } from "./types"

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
  const {
    artifactProfileId,
    artifactProfileReference: activeArtifactProfileReference,
    controlsPaneProps,
    documentStyleCss,
    mobileTab,
    previewPaneProps,
    previewThemeCss,
    setMobileTab,
  } = useGalleryAppController({
    artifactProfileReference,
    availableArtifactProfileReferences,
    builtinArtifactProfileReferences,
    initialProfile,
    runtimeRendererVerification,
  })

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
        data-artifact-profile={artifactProfileId}
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
            <Badge variant="outline">{activeArtifactProfileReference}</Badge>
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
              <GalleryControlsPane {...controlsPaneProps} />
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
                <GalleryPreviewPane {...previewPaneProps} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}
