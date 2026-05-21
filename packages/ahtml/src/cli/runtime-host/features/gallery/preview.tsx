import React from "react"
import {
  Check,
  Copy,
  Inspect,
  Maximize2,
  Minimize2,
  MoreVertical,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"

import { DocumentArtifactShell } from "../../artifact-shell"
import { GalleryCardsWorkbenchPanel } from "./preview/cards"
import { GalleryColorPreviewPanel } from "./preview/colors"
import { GalleryCustomPreviewPanel } from "./preview/custom"
import { GalleryDashboardWorkbenchPanel } from "./preview/dashboard"
import { GalleryMailWorkbenchPanel } from "./preview/mail"
import { GalleryPricingWorkbenchPanel } from "./preview/pricing"
import { GalleryTypographyPanel } from "./preview/typography"
import type { RendererNodeComponent } from "./preview/types"
import { GalleryTabsTriggerPill, GalleryToolbarGroup } from "./shared/chrome"
import { GalleryExamplesPreviewContainer } from "./shared/preview-container"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryInspectorState,
  GalleryPreviewMode,
  GalleryPreviewSection,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "./types"

export type GalleryPreviewPaneProps = {
  colorThemeSyncEnabled: boolean
  copyCurrentArtifactProfile: () => Promise<void>
  draftProfile: ArtifactProfile
  focusEditorField: (field: FocusedEditorField) => void
  focusThemeToken: (
    tokenName: ThemeTokenName,
    mode?: GalleryPreviewThemeMode,
  ) => void
  focusedToken: FocusedThemeToken | null
  hasCopiedProfile: boolean
  inspectorEnabled: boolean
  inspectorState: GalleryInspectorState | null
  isDirty: boolean
  isPreviewFullscreen: boolean
  isSaving: boolean
  artifactProfileReference: string
  openControlTab: (
    nextTab: "colors" | "typography" | "other" | "profile",
  ) => void
  previewMode: GalleryPreviewMode
  previewModeLabel: string
  previewShellRef: React.RefObject<HTMLDivElement | null>
  previewSurfaceRef: React.RefObject<HTMLDivElement | null>
  previewThemeMode: GalleryPreviewThemeMode
  resetDraft: () => void
  saveProfile: () => Promise<void>
  setInspectorEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setPreviewMode: React.Dispatch<React.SetStateAction<GalleryPreviewMode>>
  setPreviewThemeMode: React.Dispatch<
    React.SetStateAction<GalleryPreviewThemeMode>
  >
  togglePreviewFullscreen: () => Promise<void>
  visiblePreviewSections: GalleryPreviewSection[]
  RendererNode: RendererNodeComponent
}

export function GalleryPreviewPane({
  colorThemeSyncEnabled,
  copyCurrentArtifactProfile,
  draftProfile,
  focusEditorField,
  focusThemeToken,
  focusedToken,
  hasCopiedProfile,
  inspectorEnabled,
  inspectorState,
  isDirty,
  isPreviewFullscreen,
  isSaving,
  artifactProfileReference,
  openControlTab,
  previewMode,
  previewModeLabel,
  previewShellRef,
  previewSurfaceRef,
  previewThemeMode,
  resetDraft,
  saveProfile,
  setInspectorEnabled,
  setPreviewMode,
  setPreviewThemeMode,
  togglePreviewFullscreen,
  visiblePreviewSections,
  RendererNode,
}: GalleryPreviewPaneProps) {
  return (
    <div
      className="ahtml-gallery-preview-shell"
      data-fullscreen={isPreviewFullscreen ? "true" : "false"}
      ref={previewShellRef}
    >
      <Tabs
        className="ahtml-gallery-preview-tabs"
        onValueChange={(value) => setPreviewMode(value as GalleryPreviewMode)}
        value={previewMode}
      >
        <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-topbar">
          <div className="ahtml-gallery-toolbar-copy">
            <span className="ahtml-gallery-toolbar-label">Preview actions</span>
            <span className="ahtml-gallery-toolbar-caption">
              Profile {artifactProfileReference} · Draft{" "}
              {isDirty ? "unsaved" : "synced"} · Theme {previewThemeMode}
            </span>
          </div>
          <div className="ahtml-gallery-preview-toolbar">
            <GalleryToolbarGroup label="Tools">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="More editor tools"
                    className="ahtml-gallery-more-previews"
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <MoreVertical aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Editor tools</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() => {
                      openControlTab("colors")
                      setPreviewMode("colors")
                    }}
                  >
                    Edit colors
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      openControlTab("typography")
                      setPreviewMode("typography")
                    }}
                  >
                    Edit typography
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openControlTab("other")}>
                    Edit geometry
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openControlTab("profile")}>
                    Manage profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setPreviewMode("components")}
                  >
                    Cards preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPreviewMode("full")}>
                    Full component gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => void copyCurrentArtifactProfile()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {hasCopiedProfile ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {hasCopiedProfile ? "Copied" : "Copy"}
              </Button>
            </GalleryToolbarGroup>
            <GalleryToolbarGroup label="View">
              <div
                aria-label="Preview theme"
                className="ahtml-gallery-segmented-toggle"
                role="group"
              >
                <Button
                  aria-pressed={previewThemeMode === "light"}
                  className="ahtml-gallery-toggle-button"
                  onClick={() => setPreviewThemeMode("light")}
                  size="sm"
                  type="button"
                  variant={previewThemeMode === "light" ? "secondary" : "ghost"}
                >
                  Light
                </Button>
                <Button
                  aria-pressed={previewThemeMode === "dark"}
                  className="ahtml-gallery-toggle-button"
                  onClick={() => setPreviewThemeMode("dark")}
                  size="sm"
                  type="button"
                  variant={previewThemeMode === "dark" ? "secondary" : "ghost"}
                >
                  Dark
                </Button>
              </div>
              <Button
                aria-pressed={inspectorEnabled}
                className="ahtml-gallery-inspector-button"
                onClick={() => setInspectorEnabled((current) => !current)}
                size="sm"
                type="button"
                variant={inspectorEnabled ? "secondary" : "ghost"}
              >
                <Inspect aria-hidden="true" />
                {inspectorEnabled ? "Inspecting" : "Inspect"}
              </Button>
              <Button
                onClick={() => void togglePreviewFullscreen()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {isPreviewFullscreen ? (
                  <Minimize2 aria-hidden="true" />
                ) : (
                  <Maximize2 aria-hidden="true" />
                )}
                {isPreviewFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </GalleryToolbarGroup>
            <GalleryToolbarGroup label="Persist">
              <Button
                disabled={isSaving || !isDirty}
                onClick={resetDraft}
                size="sm"
                type="button"
                variant="ghost"
              >
                Reset
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => void saveProfile()}
                size="sm"
                type="button"
              >
                Save Profile
              </Button>
            </GalleryToolbarGroup>
          </div>
        </div>
        <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-modebar">
          <div className="ahtml-gallery-preview-mode-tools">
            <ScrollArea className="ahtml-gallery-pill-scroll ahtml-gallery-preview-pill-scroll">
              <TabsList className="ahtml-gallery-pill-tabs">
                <GalleryTabsTriggerPill value="custom">
                  Custom
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="components">
                  Cards
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="dashboard">
                  Dashboard
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="mail">
                  Mail
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="pricing">
                  Pricing
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="colors">
                  Color Palette
                </GalleryTabsTriggerPill>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ahtml-gallery-more-previews"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <MoreVertical aria-hidden="true" />
                  More previews
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Preview catalog</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setPreviewMode("forms")}>
                  Form controls
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("selection")}>
                  Selection patterns
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("disclosure")}>
                  Disclosure patterns
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("typography")}>
                  Typography audit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPreviewMode("full")}>
                  Full component gallery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="ahtml-gallery-preview-context">
            <span>Mode</span>
            <strong>{previewModeLabel}</strong>
            <span>Draft</span>
            <strong>{isDirty ? "unsaved" : "synced"}</strong>
            <span>Style</span>
            <strong>{artifactProfileReference}</strong>
          </div>
        </div>
        <section className="ahtml-gallery-preview-stage">
          <ScrollArea className="ahtml-gallery-preview-canvas">
            <TabsContent
              className="ahtml-gallery-preview-panel"
              value={previewMode}
            >
              <GalleryExamplesPreviewContainer
                focusedToken={focusedToken}
                inspectorEnabled={inspectorEnabled}
                inspectorState={inspectorState}
                onInspectorTokenSelect={focusThemeToken}
                previewMode={previewMode}
                previewSurfaceRef={previewSurfaceRef}
                previewThemeMode={previewThemeMode}
              >
                {previewMode === "typography" ? (
                  <GalleryTypographyPanel
                    onSelectField={focusEditorField}
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "colors" ? (
                  <GalleryColorPreviewPanel
                    onActivateThemeMode={setPreviewThemeMode}
                    onSelectToken={focusThemeToken}
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                    themeSyncEnabled={colorThemeSyncEnabled}
                  />
                ) : previewMode === "custom" ? (
                  <GalleryCustomPreviewPanel profile={draftProfile} />
                ) : previewMode === "components" ? (
                  <GalleryCardsWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "dashboard" ? (
                  <GalleryDashboardWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "mail" ? (
                  <GalleryMailWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "pricing" ? (
                  <GalleryPricingWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : (
                  <DocumentArtifactShell
                    artifactProfile={draftProfile}
                    className="ahtml-gallery-preview-document"
                    layoutPolicy="gallery"
                  >
                    {visiblePreviewSections.map((section, index) => (
                      <RendererNode
                        key={`${section.mode}-${index}`}
                        node={section.node}
                        path={[index]}
                      />
                    ))}
                  </DocumentArtifactShell>
                )}
              </GalleryExamplesPreviewContainer>
            </TabsContent>
          </ScrollArea>
        </section>
      </Tabs>
    </div>
  )
}
