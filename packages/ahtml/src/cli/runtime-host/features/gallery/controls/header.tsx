import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  Shuffle,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { TabsList } from "@/components/ui/tabs"

import { GalleryTabsTriggerPill } from "../shared/chrome"
import { renderPresetChooserOption } from "../shared/preset-option"
import type { GalleryControlsHeaderProps } from "./types"

export function GalleryControlsHeader({
  activeArtifactProfileEditorStatus,
  activeArtifactProfileIsBuiltIn,
  activeArtifactProfileKindLabel,
  activeArtifactProfileSummary,
  artifactProfileReference,
  createArtifactProfileReference,
  cycleArtifactProfileReference,
  deleteCurrentArtifactProfileReference,
  editorState,
  filteredArtifactProfileReferences,
  filteredBuiltInArtifactProfileReferences,
  filteredCustomArtifactProfileReferences,
  presetPopoverOpen,
  presetSearch,
  previewThemeMode,
  randomizeArtifactProfileReference,
  selectArtifactProfileReference,
  setEditorState,
  setPresetPopoverOpen,
  setPresetSearch,
  setPreviewThemeMode,
}: GalleryControlsHeaderProps) {
  return (
    <Card
      className="ahtml-gallery-control-header rounded-none border-x-0 border-t-0 shadow-none"
      data-gallery-frame="hero"
    >
      <CardContent className="ahtml-gallery-control-header-content">
        <div className="ahtml-gallery-control-header-row">
          <div className="ahtml-gallery-toolbar-copy">
            <span className="ahtml-gallery-toolbar-label">Preset controls</span>
            <span className="ahtml-gallery-toolbar-caption">
              {activeArtifactProfileEditorStatus}
            </span>
          </div>
          <div className="ahtml-gallery-preset-rail-status">
            <Badge
              variant={activeArtifactProfileIsBuiltIn ? "outline" : "secondary"}
            >
              {activeArtifactProfileKindLabel}
            </Badge>
            <Badge variant="secondary">
              {editorState.isDirty ? "Draft unsaved" : "Gallery synced"}
            </Badge>
          </div>
        </div>
        <Separator />
        <div className="ahtml-gallery-control-header-row">
          <Popover onOpenChange={setPresetPopoverOpen} open={presetPopoverOpen}>
            <PopoverTrigger asChild>
              <Button
                className="ahtml-gallery-preset-popover-trigger"
                size="sm"
                title={`Open preset chooser for ${artifactProfileReference}`}
                type="button"
                variant="ghost"
              >
                <span className="ahtml-gallery-preset-swatch-row">
                  <span
                    className="ahtml-gallery-preset-swatch"
                    style={{
                      background:
                        editorState.draftProfile.globalStyle.tokenSets[
                          previewThemeMode
                        ].primary,
                    }}
                  />
                  <span
                    className="ahtml-gallery-preset-swatch"
                    style={{
                      background:
                        editorState.draftProfile.globalStyle.tokenSets[
                          previewThemeMode
                        ].accent,
                    }}
                  />
                  <span
                    className="ahtml-gallery-preset-swatch"
                    style={{
                      background:
                        editorState.draftProfile.globalStyle.tokenSets[
                          previewThemeMode
                        ].secondary,
                    }}
                  />
                  <span
                    className="ahtml-gallery-preset-swatch"
                    style={{
                      background:
                        editorState.draftProfile.globalStyle.tokenSets[
                          previewThemeMode
                        ].border,
                    }}
                  />
                </span>
                <span className="ahtml-gallery-preset-trigger-copy">
                  <strong>{artifactProfileReference}</strong>
                  <span>{activeArtifactProfileSummary}</span>
                </span>
                <ChevronDown
                  aria-hidden="true"
                  className="ahtml-gallery-preset-chevron"
                />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="start" className="ahtml-gallery-preset-popover">
              <PopoverHeader>
                <PopoverTitle>Profile gallery</PopoverTitle>
                <PopoverDescription>
                  Switch built-in and saved profiles without leaving the gallery
                  workbench.
                </PopoverDescription>
              </PopoverHeader>
              <div className="ahtml-gallery-preset-search-wrap">
                <div className="ahtml-gallery-preset-search-field">
                  <Search
                    aria-hidden="true"
                    className="ahtml-gallery-preset-search-icon"
                  />
                  <Input
                    aria-label="Search artifact profile presets"
                    className="ahtml-gallery-control-input-mono ahtml-gallery-preset-search-input"
                    onChange={(event) => setPresetSearch(event.target.value)}
                    placeholder="Search presets or ids..."
                    value={presetSearch}
                  />
                </div>
              </div>
              <div className="ahtml-gallery-preset-popover-stats">
                <div className="ahtml-gallery-preset-popover-stat">
                  <span>Visible</span>
                  <strong>
                    {filteredArtifactProfileReferences.length} preset
                    {filteredArtifactProfileReferences.length === 1 ? "" : "s"}
                  </strong>
                </div>
                <div className="ahtml-gallery-preset-popover-stat">
                  <span>Custom</span>
                  <strong>{filteredCustomArtifactProfileReferences.length}</strong>
                </div>
                <div className="ahtml-gallery-preset-popover-stat">
                  <span>Built-in</span>
                  <strong>{filteredBuiltInArtifactProfileReferences.length}</strong>
                </div>
                <div className="ahtml-gallery-preset-popover-stat">
                  <span>Preview</span>
                  <strong>{previewThemeMode}</strong>
                </div>
              </div>
              <Separator />
              <ScrollArea className="ahtml-gallery-preset-list-scroll">
                <div className="ahtml-gallery-preset-list">
                  {filteredArtifactProfileReferences.length > 0 ? (
                    <>
                      {filteredCustomArtifactProfileReferences.length > 0 ? (
                        <div className="ahtml-gallery-preset-group">
                          <div className="ahtml-gallery-preset-group-header">
                            <span>Custom presets</span>
                            <Badge variant="outline">
                              {filteredCustomArtifactProfileReferences.length}
                            </Badge>
                          </div>
                          {filteredCustomArtifactProfileReferences.map(
                            (artifactProfileId) =>
                              renderPresetChooserOption({
                                artifactProfileId,
                                builtinArtifactProfileReferences:
                                  editorState.builtinArtifactProfileReferences,
                                currentArtifactProfileReference:
                                  editorState.artifactProfileReference,
                                currentProfile: editorState.draftProfile,
                                isDraftDirty: editorState.isDirty,
                                onSelectArtifactProfileReference: (
                                  nextArtifactProfileId,
                                ) => {
                                  setPresetPopoverOpen(false)
                                  setPresetSearch("")
                                  void selectArtifactProfileReference(
                                    nextArtifactProfileId,
                                  )
                                },
                                previewThemeMode,
                              }),
                          )}
                        </div>
                      ) : null}
                      {filteredBuiltInArtifactProfileReferences.length > 0 ? (
                        <div className="ahtml-gallery-preset-group">
                          <div className="ahtml-gallery-preset-group-header">
                            <span>Built-in presets</span>
                            <Badge variant="outline">
                              {filteredBuiltInArtifactProfileReferences.length}
                            </Badge>
                          </div>
                          {filteredBuiltInArtifactProfileReferences.map(
                            (artifactProfileId) =>
                              renderPresetChooserOption({
                                artifactProfileId,
                                builtinArtifactProfileReferences:
                                  editorState.builtinArtifactProfileReferences,
                                currentArtifactProfileReference:
                                  editorState.artifactProfileReference,
                                currentProfile: editorState.draftProfile,
                                isDraftDirty: editorState.isDirty,
                                onSelectArtifactProfileReference: (
                                  nextArtifactProfileId,
                                ) => {
                                  setPresetPopoverOpen(false)
                                  setPresetSearch("")
                                  void selectArtifactProfileReference(
                                    nextArtifactProfileId,
                                  )
                                },
                                previewThemeMode,
                              }),
                          )}
                        </div>
                      ) : null}
                    </>
                  ) : (
                    <div className="ahtml-gallery-preset-empty">
                      No matching presets.
                    </div>
                  )}
                </div>
              </ScrollArea>
            </PopoverContent>
          </Popover>
          <div className="ahtml-gallery-preset-inline-tools">
            <Button
              aria-label="Previous profile"
              disabled={
                editorState.isSaving ||
                editorState.availableArtifactProfileReferences.length < 2
              }
              onClick={() => cycleArtifactProfileReference("prev")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ArrowLeft aria-hidden="true" />
            </Button>
            <Button
              aria-label="Random profile"
              disabled={
                editorState.isSaving ||
                editorState.availableArtifactProfileReferences.length < 2
              }
              onClick={randomizeArtifactProfileReference}
              size="sm"
              type="button"
              variant="ghost"
            >
              <Shuffle aria-hidden="true" />
            </Button>
            <Button
              aria-label="Next profile"
              disabled={
                editorState.isSaving ||
                editorState.availableArtifactProfileReferences.length < 2
              }
              onClick={() => cycleArtifactProfileReference("next")}
              size="sm"
              type="button"
              variant="ghost"
            >
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
          <div
            aria-label="Gallery theme mode"
            className="ahtml-gallery-segmented-toggle ahtml-gallery-preset-theme-toggle"
            role="group"
          >
            <span className="ahtml-gallery-toolbar-label">Gallery theme mode</span>
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
        </div>
        <Separator />
        <div className="ahtml-gallery-control-header-row ahtml-gallery-control-header-row-manager">
          <div className="ahtml-gallery-toolbar-copy">
            <span className="ahtml-gallery-toolbar-label">Profile manager</span>
            <span className="ahtml-gallery-toolbar-caption">
              Create or remove saved profile ids from the same selection rail.
            </span>
          </div>
          <div className="ahtml-gallery-profile-manager">
            <Input
              aria-label="New profile id"
              className="ahtml-gallery-control-input ahtml-gallery-control-input-mono"
              onChange={(event) =>
                setEditorState((current) => ({
                  ...current,
                  createId: event.target.value,
                }))
              }
              placeholder="team-ops"
              value={editorState.createId}
            />
            <div className="ahtml-gallery-actions ahtml-gallery-profile-manager-tools">
              <Button
                disabled={editorState.isSaving}
                onClick={() => void createArtifactProfileReference()}
                size="sm"
                type="button"
                variant="outline"
              >
                New Id
              </Button>
              <Button
                disabled={editorState.isSaving}
                onClick={() => void deleteCurrentArtifactProfileReference()}
                size="sm"
                type="button"
                variant="outline"
              >
                Delete Id
              </Button>
            </div>
          </div>
        </div>
        <Separator />
        <div className="ahtml-gallery-control-header-row ahtml-gallery-control-header-row-tabs">
          <div className="ahtml-gallery-toolbar-copy">
            <span className="ahtml-gallery-toolbar-label">Controls</span>
            <span className="ahtml-gallery-toolbar-caption">
              {editorState.status}
            </span>
          </div>
          <ScrollArea className="ahtml-gallery-pill-scroll">
            <TabsList className="ahtml-gallery-pill-tabs" variant="default">
              <GalleryTabsTriggerPill value="lightTokens">
                Light Tokens
              </GalleryTabsTriggerPill>
              <GalleryTabsTriggerPill value="darkTokens">
                Dark Tokens
              </GalleryTabsTriggerPill>
              <GalleryTabsTriggerPill value="typography">
                Typography
              </GalleryTabsTriggerPill>
              <GalleryTabsTriggerPill value="radius">
                Radius
              </GalleryTabsTriggerPill>
            </TabsList>
            <ScrollBar orientation="horizontal" />
          </ScrollArea>
        </div>
      </CardContent>
    </Card>
  )
}
