import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs } from "@/components/ui/tabs"

import { GalleryColorsTab } from "./controls/colors-tab"
import { GalleryControlsHeader } from "./controls/header"
import { GalleryOtherTab } from "./controls/other-tab"
import { GalleryProfileTab } from "./controls/profile-tab"
import { GalleryTypographyTab } from "./controls/typography-tab"
import type { GalleryControlsPaneProps } from "./controls/types"

export function GalleryControlsPane({
  controlTab,
  mobileTab,
  openControlTab,
  setFocusedEditorField,
  setFocusedToken,
  ...props
}: GalleryControlsPaneProps) {
  return (
    <div
      className="ahtml-gallery-sidebar"
      data-gallery-frame="controls"
      data-mobile-panel={mobileTab === "controls" ? "active" : "hidden"}
    >
      <div className="ahtml-gallery-sidebar-inner">
        <Tabs
          className="ahtml-gallery-control-tabs"
          onValueChange={(value) => {
            const nextTab = value as GalleryControlsPaneProps["controlTab"]
            openControlTab(nextTab)
            if (nextTab !== "colors") {
              setFocusedToken(null)
            }
            if (nextTab !== "typography" && nextTab !== "other") {
              setFocusedEditorField(null)
            }
          }}
          value={controlTab}
        >
          <GalleryControlsHeader controlTab={controlTab} {...props} />
          <ScrollArea className="ahtml-gallery-control-scroll">
            <div className="ahtml-gallery-control-body">
              <GalleryProfileTab
                createArtifactProfileReference={
                  props.createArtifactProfileReference
                }
                deleteCurrentArtifactProfileReference={
                  props.deleteCurrentArtifactProfileReference
                }
                editorState={props.editorState}
                previewMode={props.previewMode}
                setEditorState={props.setEditorState}
              />
              <GalleryColorsTab
                colorSearch={props.colorSearch}
                colorSectionValues={props.colorSectionValues}
                colorThemeSyncEnabled={props.colorThemeSyncEnabled}
                copyThemeTokens={props.copyThemeTokens}
                editorState={props.editorState}
                filteredColorTokenSections={props.filteredColorTokenSections}
                focusedToken={props.focusedToken}
                previewThemeMode={props.previewThemeMode}
                setColorSearch={props.setColorSearch}
                setColorSectionValues={props.setColorSectionValues}
                setColorThemeSyncEnabled={props.setColorThemeSyncEnabled}
                updateThemeTokenValue={props.updateThemeTokenValue}
              />
              <GalleryTypographyTab
                editorState={props.editorState}
                focusedEditorField={props.focusedEditorField}
                previewThemeMode={props.previewThemeMode}
                updateDraftProfile={props.updateDraftProfile}
              />
              <GalleryOtherTab
                editorState={props.editorState}
                focusedEditorField={props.focusedEditorField}
                updateDraftProfile={props.updateDraftProfile}
              />
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
