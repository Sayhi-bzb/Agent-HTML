import React from "react"
import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  Search,
  Shuffle,
  X,
} from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
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
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"

import { fontPresetOptions } from "./config"
import { getPreviewModeLabel } from "./helpers"
import {
  FieldRow,
  FontPickerField,
  GalleryPanelBody,
  GalleryTabsTriggerPill,
  LabeledInput,
  SliderInputField,
  TokenEditor,
  getThemeTokenControlLabel,
  pickThemeTokens,
  renderPresetChooserOption,
} from "./shared"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryColorTokenSection,
  GalleryControlTab,
  GalleryEditorState,
  GalleryPreviewMode,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "./types"

type ShadowTypographyField =
  | "shadowBlur"
  | "shadowSpread"
  | "shadowOffsetX"
  | "shadowOffsetY"

const shadowFieldControls: ReadonlyArray<{
  field: ShadowTypographyField
  label: string
  min: number
  max: number
  step: number
}> = [
  { field: "shadowBlur", label: "Shadow Blur", min: 0, max: 50, step: 0.5 },
  {
    field: "shadowSpread",
    label: "Shadow Spread",
    min: -50,
    max: 50,
    step: 0.5,
  },
  {
    field: "shadowOffsetX",
    label: "Shadow Offset X",
    min: -50,
    max: 50,
    step: 0.5,
  },
  {
    field: "shadowOffsetY",
    label: "Shadow Offset Y",
    min: -50,
    max: 50,
    step: 0.5,
  },
]

export function GalleryControlsPane({
  activeArtifactProfileEditorStatus,
  activeArtifactProfileIsBuiltIn,
  activeArtifactProfileKindLabel,
  activeArtifactProfileSummary,
  artifactProfileReference,
  colorSearch,
  colorSectionValues,
  colorThemeSyncEnabled,
  controlTab,
  copyThemeTokens,
  createArtifactProfileReference,
  deleteCurrentArtifactProfileReference,
  editorState,
  filteredArtifactProfileReferences,
  filteredBuiltInArtifactProfileReferences,
  filteredColorTokenSections,
  filteredCustomArtifactProfileReferences,
  focusedEditorField,
  focusedToken,
  mobileTab,
  openControlTab,
  presetPopoverOpen,
  presetSearch,
  previewMode,
  previewThemeMode,
  randomizeArtifactProfileReference,
  selectArtifactProfileReference,
  setColorSearch,
  setColorSectionValues,
  setColorThemeSyncEnabled,
  setEditorState,
  setFocusedEditorField,
  setFocusedToken,
  setPresetPopoverOpen,
  setPresetSearch,
  setPreviewThemeMode,
  updateDraftProfile,
  updateThemeTokenValue,
  cycleArtifactProfileReference,
}: {
  activeArtifactProfileEditorStatus: string
  activeArtifactProfileIsBuiltIn: boolean
  activeArtifactProfileKindLabel: string
  activeArtifactProfileSummary: string
  artifactProfileReference: string
  colorSearch: string
  colorSectionValues: string[]
  colorThemeSyncEnabled: boolean
  controlTab: GalleryControlTab
  copyThemeTokens: (
    sourceMode: GalleryPreviewThemeMode,
    targetMode: GalleryPreviewThemeMode,
  ) => void
  createArtifactProfileReference: () => Promise<void>
  deleteCurrentArtifactProfileReference: () => Promise<void>
  editorState: GalleryEditorState
  filteredArtifactProfileReferences: string[]
  filteredBuiltInArtifactProfileReferences: string[]
  filteredColorTokenSections: GalleryColorTokenSection[]
  filteredCustomArtifactProfileReferences: string[]
  focusedEditorField: FocusedEditorField | null
  focusedToken: FocusedThemeToken | null
  mobileTab: "controls" | "preview"
  openControlTab: (nextTab: GalleryControlTab) => void
  presetPopoverOpen: boolean
  presetSearch: string
  previewMode: GalleryPreviewMode
  previewThemeMode: GalleryPreviewThemeMode
  randomizeArtifactProfileReference: () => void
  selectArtifactProfileReference: (
    artifactProfileReference: string,
  ) => Promise<void>
  setColorSearch: React.Dispatch<React.SetStateAction<string>>
  setColorSectionValues: React.Dispatch<React.SetStateAction<string[]>>
  setColorThemeSyncEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setEditorState: React.Dispatch<React.SetStateAction<GalleryEditorState>>
  setFocusedEditorField: React.Dispatch<
    React.SetStateAction<FocusedEditorField | null>
  >
  setFocusedToken: React.Dispatch<
    React.SetStateAction<FocusedThemeToken | null>
  >
  setPresetPopoverOpen: React.Dispatch<React.SetStateAction<boolean>>
  setPresetSearch: React.Dispatch<React.SetStateAction<string>>
  setPreviewThemeMode: React.Dispatch<
    React.SetStateAction<GalleryPreviewThemeMode>
  >
  updateDraftProfile: (
    updater: (draft: ArtifactProfile) => ArtifactProfile,
  ) => void
  updateThemeTokenValue: (tokenName: ThemeTokenName, value: string) => void
  cycleArtifactProfileReference: (direction: "prev" | "next") => void
}) {
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
            const nextTab = value as GalleryControlTab
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
          <div
            className="ahtml-gallery-control-header ahtml-gallery-toolbar-border"
            data-gallery-frame="hero"
          >
            <div className="ahtml-gallery-control-header-row">
              <div className="ahtml-gallery-toolbar-copy">
                <span className="ahtml-gallery-toolbar-label">
                  Preset controls
                </span>
                <span className="ahtml-gallery-toolbar-caption">
                  {activeArtifactProfileEditorStatus}
                </span>
              </div>
              <div className="ahtml-gallery-preset-rail-status">
                <Badge
                  variant={
                    activeArtifactProfileIsBuiltIn ? "outline" : "secondary"
                  }
                >
                  {activeArtifactProfileKindLabel}
                </Badge>
                <Badge variant="secondary">
                  {editorState.isDirty ? "Draft unsaved" : "Preview synced"}
                </Badge>
              </div>
            </div>
            <div className="ahtml-gallery-control-header-row">
              <Popover
                onOpenChange={setPresetPopoverOpen}
                open={presetPopoverOpen}
              >
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
                <PopoverContent
                  align="start"
                  className="ahtml-gallery-preset-popover"
                >
                  <PopoverHeader>
                    <PopoverTitle>Preset chooser</PopoverTitle>
                    <PopoverDescription>
                      Switch built-in and saved profiles without leaving the
                      editor shell.
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
                        onChange={(event) =>
                          setPresetSearch(event.target.value)
                        }
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
                        {filteredArtifactProfileReferences.length === 1
                          ? ""
                          : "s"}
                      </strong>
                    </div>
                    <div className="ahtml-gallery-preset-popover-stat">
                      <span>Custom</span>
                      <strong>
                        {filteredCustomArtifactProfileReferences.length}
                      </strong>
                    </div>
                    <div className="ahtml-gallery-preset-popover-stat">
                      <span>Built-in</span>
                      <strong>
                        {filteredBuiltInArtifactProfileReferences.length}
                      </strong>
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
                          {filteredCustomArtifactProfileReferences.length >
                          0 ? (
                            <div className="ahtml-gallery-preset-group">
                              <div className="ahtml-gallery-preset-group-header">
                                <span>Custom presets</span>
                                <Badge variant="outline">
                                  {
                                    filteredCustomArtifactProfileReferences.length
                                  }
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
                          {filteredBuiltInArtifactProfileReferences.length >
                          0 ? (
                            <div className="ahtml-gallery-preset-group">
                              <div className="ahtml-gallery-preset-group-header">
                                <span>Built-in presets</span>
                                <Badge variant="outline">
                                  {
                                    filteredBuiltInArtifactProfileReferences.length
                                  }
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
                aria-label="Editor theme mode"
                className="ahtml-gallery-segmented-toggle ahtml-gallery-preset-theme-toggle"
                role="group"
              >
                <span className="ahtml-gallery-toolbar-label">
                  Editor theme mode
                </span>
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
            <div className="ahtml-gallery-control-header-row ahtml-gallery-control-header-row-tabs">
              <div className="ahtml-gallery-toolbar-copy">
                <span className="ahtml-gallery-toolbar-label">Controls</span>
                <span className="ahtml-gallery-toolbar-caption">
                  {editorState.status}
                </span>
              </div>
              <ScrollArea className="ahtml-gallery-pill-scroll">
                <TabsList className="ahtml-gallery-pill-tabs">
                  <GalleryTabsTriggerPill value="colors">
                    Colors
                  </GalleryTabsTriggerPill>
                  <GalleryTabsTriggerPill value="typography">
                    Typography
                  </GalleryTabsTriggerPill>
                  <GalleryTabsTriggerPill value="other">
                    Other
                  </GalleryTabsTriggerPill>
                  <GalleryTabsTriggerPill value="profile">
                    Profile
                  </GalleryTabsTriggerPill>
                </TabsList>
                <ScrollBar orientation="horizontal" />
              </ScrollArea>
            </div>
            <div className="ahtml-gallery-preset-footnote">
              <span>{activeArtifactProfileEditorStatus}</span>
              <span>{activeArtifactProfileSummary}</span>
            </div>
          </div>

          <ScrollArea className="ahtml-gallery-control-scroll">
            <div className="ahtml-gallery-control-body">
              <TabsContent className="ahtml-gallery-tab-panel" value="profile">
                <Accordion
                  className="ahtml-gallery-control-sections"
                  defaultValue={["style-id", "persist"]}
                  type="multiple"
                >
                  <AccordionItem value="style-id">
                    <AccordionTrigger>Artifact profile</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <FieldRow
                          label="Current profile id"
                          value={editorState.artifactProfileReference}
                        />
                        <FieldRow
                          label="Available ids"
                          multiline
                          value={editorState.availableArtifactProfileReferences.join(
                            ", ",
                          )}
                        />
                        <div className="ahtml-gallery-actions">
                          <Button
                            disabled={editorState.isSaving}
                            onClick={() =>
                              void createArtifactProfileReference()
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            New Id
                          </Button>
                          <Button
                            disabled={editorState.isSaving}
                            onClick={() =>
                              void deleteCurrentArtifactProfileReference()
                            }
                            size="sm"
                            type="button"
                            variant="outline"
                          >
                            Delete Id
                          </Button>
                        </div>
                        <LabeledInput
                          description="Create a new persisted artifact profile from the current draft."
                          label="New Profile Id"
                          mono
                          onChange={(value) =>
                            setEditorState((current) => ({
                              ...current,
                              createId: value,
                            }))
                          }
                          value={editorState.createId}
                        />
                        {editorState.error ? (
                          <Field data-invalid>
                            <FieldLabel>Error</FieldLabel>
                            <FieldDescription className="ahtml-gallery-error">
                              {editorState.error}
                            </FieldDescription>
                          </Field>
                        ) : null}
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="persist">
                    <AccordionTrigger>Persist</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <FieldRow label="Status" value={editorState.status} />
                        <FieldRow
                          label="Preview mode"
                          value={getPreviewModeLabel(previewMode)}
                        />
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent className="ahtml-gallery-tab-panel" value="colors">
                <div className="ahtml-gallery-control-filter-bar">
                  <div className="ahtml-gallery-control-filter-field">
                    <Search
                      aria-hidden="true"
                      className="ahtml-gallery-control-filter-icon"
                    />
                    <Input
                      aria-label="Search theme tokens"
                      className="ahtml-gallery-control-filter-input ahtml-gallery-control-input-mono"
                      onChange={(event) => setColorSearch(event.target.value)}
                      placeholder="Search color groups or controls..."
                      value={colorSearch}
                    />
                    {colorSearch ? (
                      <Button
                        className="ahtml-gallery-control-filter-clear"
                        onClick={() => setColorSearch("")}
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        <X aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                  <div className="ahtml-gallery-control-filter-meta">
                    <span>
                      {filteredColorTokenSections.reduce(
                        (count, section) => count + section.tokenNames.length,
                        0,
                      )}{" "}
                      control
                      {filteredColorTokenSections.reduce(
                        (count, section) => count + section.tokenNames.length,
                        0,
                      ) === 1
                        ? ""
                        : "s"}
                    </span>
                    <div className="ahtml-gallery-control-filter-actions">
                      <Button
                        className="ahtml-gallery-filter-pill"
                        onClick={() =>
                          setColorThemeSyncEnabled((current) => !current)
                        }
                        size="sm"
                        type="button"
                        variant={colorThemeSyncEnabled ? "secondary" : "ghost"}
                      >
                        {colorThemeSyncEnabled ? "Theme sync on" : "Theme sync"}
                      </Button>
                      <Button
                        className="ahtml-gallery-filter-pill"
                        onClick={() =>
                          copyThemeTokens(
                            previewThemeMode,
                            previewThemeMode === "light" ? "dark" : "light",
                          )
                        }
                        size="sm"
                        type="button"
                        variant="ghost"
                      >
                        {previewThemeMode === "light"
                          ? "Copy light to dark"
                          : "Copy dark to light"}
                      </Button>
                      <Badge variant="outline">{previewThemeMode}</Badge>
                    </div>
                  </div>
                </div>
                {filteredColorTokenSections.length > 0 ? (
                  <Accordion
                    className="ahtml-gallery-control-sections"
                    onValueChange={setColorSectionValues}
                    type="multiple"
                    value={colorSectionValues}
                  >
                    {filteredColorTokenSections.map((section) => (
                      <AccordionItem key={section.id} value={section.id}>
                        <AccordionTrigger>{section.title}</AccordionTrigger>
                        <AccordionContent>
                          <GalleryPanelBody>
                            <p className="ahtml-gallery-section-note">
                              {section.description}
                            </p>
                            <TokenEditor
                              focusedToken={
                                focusedToken?.mode === previewThemeMode
                                  ? focusedToken.tokenName
                                  : null
                              }
                              labels={Object.fromEntries(
                                section.tokenNames.map((tokenName) => [
                                  tokenName,
                                  getThemeTokenControlLabel(tokenName),
                                ]),
                              )}
                              onChange={updateThemeTokenValue}
                              tokens={pickThemeTokens(
                                editorState.draftProfile.globalStyle.tokenSets[
                                  previewThemeMode
                                ],
                                section.tokenNames,
                              )}
                            />
                          </GalleryPanelBody>
                        </AccordionContent>
                      </AccordionItem>
                    ))}
                  </Accordion>
                ) : (
                  <div className="ahtml-gallery-control-empty">
                    No color controls match the current search.
                  </div>
                )}
              </TabsContent>

              <TabsContent
                className="ahtml-gallery-tab-panel"
                value="typography"
              >
                <Accordion
                  className="ahtml-gallery-control-sections"
                  defaultValue={["fonts"]}
                  type="multiple"
                >
                  <AccordionItem value="fonts">
                    <AccordionTrigger>Font family</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <FontPickerField
                          description="Primary UI font for editor and rendered artifact surfaces."
                          focused={focusedEditorField === "fontSans"}
                          label="Font Sans"
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  fontSans: value,
                                },
                              },
                            }))
                          }
                          options={fontPresetOptions.sans}
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .fontSans
                          }
                        />
                        <FontPickerField
                          description="Display font used for section titles and prominent headings."
                          focused={focusedEditorField === "fontHeading"}
                          label="Font Heading"
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  fontHeading: value,
                                },
                              },
                            }))
                          }
                          options={fontPresetOptions.heading}
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .fontHeading
                          }
                        />
                        <FontPickerField
                          description="Serif companion used in richer editorial or marketing surfaces."
                          focused={focusedEditorField === "fontSerif"}
                          label="Font Serif"
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  fontSerif: value,
                                },
                              },
                            }))
                          }
                          options={fontPresetOptions.serif}
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .fontSerif
                          }
                        />
                        <FontPickerField
                          description="Monospace font for token readouts, code, and utility surfaces."
                          focused={focusedEditorField === "fontMono"}
                          label="Font Mono"
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  fontMono: value,
                                },
                              },
                            }))
                          }
                          options={fontPresetOptions.mono}
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .fontMono
                          }
                        />
                        <LabeledInput
                          description="Global tracking used for denser UI and headline rhythm."
                          label="Letter Spacing"
                          mono
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  letterSpacing: value,
                                },
                              },
                            }))
                          }
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .letterSpacing
                          }
                        />
                        <FieldRow
                          label="Preview mode"
                          value={previewThemeMode}
                        />
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>

              <TabsContent className="ahtml-gallery-tab-panel" value="other">
                <Accordion
                  className="ahtml-gallery-control-sections"
                  defaultValue={[
                    "geometry",
                    "spacing",
                    "shadow",
                    "component-treatments",
                  ]}
                  type="multiple"
                >
                  <AccordionItem value="geometry">
                    <AccordionTrigger>Radius</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <SliderInputField
                          description="Shared radius token applied across card, input, and popover surfaces."
                          focused={focusedEditorField === "radiusBase"}
                          label="Radius Base"
                          max={2}
                          min={0}
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                radiusScale: {
                                  ...draft.globalStyle.radiusScale,
                                  base: `${value
                                    .toFixed(3)
                                    .replace(/0+$/, "")
                                    .replace(/\.$/, "")}rem`,
                                },
                              },
                            }))
                          }
                          step={0.025}
                          unit="rem"
                          value={parseFloat(
                            editorState.draftProfile.globalStyle.radiusScale
                              .base,
                          )}
                        />
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="spacing">
                    <AccordionTrigger>Spacing</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <SliderInputField
                          description="Global spacing step used to tighten or relax editor rhythm."
                          focused={focusedEditorField === "spacing"}
                          label="Spacing"
                          max={0.35}
                          min={0.15}
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  spacing: `${value.toFixed(2)}rem`,
                                },
                              },
                            }))
                          }
                          step={0.01}
                          unit="rem"
                          value={parseFloat(
                            editorState.draftProfile.globalStyle.typography
                              .spacing,
                          )}
                        />
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="shadow">
                    <AccordionTrigger>Shadow</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        <LabeledInput
                          description="Base shadow color for elevated preview surfaces."
                          label="Shadow Color"
                          mono
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  shadowColor: value,
                                },
                              },
                            }))
                          }
                          value={
                            editorState.draftProfile.globalStyle.typography
                              .shadowColor
                          }
                        />
                        <SliderInputField
                          description="Opacity applied to the shared preview shadow."
                          focused={focusedEditorField === "shadow"}
                          label="Shadow Opacity"
                          max={1}
                          min={0}
                          onChange={(value) =>
                            updateDraftProfile((draft) => ({
                              ...draft,
                              globalStyle: {
                                ...draft.globalStyle,
                                typography: {
                                  ...draft.globalStyle.typography,
                                  shadowOpacity: value.toFixed(2),
                                },
                              },
                            }))
                          }
                          step={0.01}
                          unit=""
                          value={parseFloat(
                            editorState.draftProfile.globalStyle.typography
                              .shadowOpacity,
                          )}
                        />
                        <div className="ahtml-gallery-shadow-grid">
                          {shadowFieldControls.map(
                            ({ field: shadowField, label, min, max, step }) => {
                              return (
                                <SliderInputField
                                  key={shadowField}
                                  label={label}
                                  max={max}
                                  min={min}
                                  onChange={(value) =>
                                    updateDraftProfile((draft) => ({
                                      ...draft,
                                      globalStyle: {
                                        ...draft.globalStyle,
                                        typography: {
                                          ...draft.globalStyle.typography,
                                          [shadowField]: `${value}px`,
                                        },
                                      },
                                    }))
                                  }
                                  step={step}
                                  unit="px"
                                  value={parseFloat(
                                    editorState.draftProfile.globalStyle.typography[
                                      shadowField
                                    ].replace("px", ""),
                                  )}
                                />
                              )
                            },
                          )}
                        </div>
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                  <AccordionItem value="component-treatments">
                    <AccordionTrigger>Treatments</AccordionTrigger>
                    <AccordionContent>
                      <GalleryPanelBody>
                        {Object.entries(
                          editorState.draftProfile.componentStyle.treatments,
                        )
                          .sort(([left], [right]) => left.localeCompare(right))
                          .map(([componentName, treatment]) => (
                            <LabeledInput
                              description="Treatment alias applied when the renderer maps this component into the gallery shell."
                              key={componentName}
                              label={componentName}
                              mono
                              onChange={(value) =>
                                updateDraftProfile((draft) => ({
                                  ...draft,
                                  componentStyle: {
                                    ...draft.componentStyle,
                                    treatments: {
                                      ...draft.componentStyle.treatments,
                                      [componentName]: value,
                                    },
                                  },
                                }))
                              }
                              value={treatment}
                            />
                          ))}
                      </GalleryPanelBody>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </TabsContent>
            </div>
          </ScrollArea>
        </Tabs>
      </div>
    </div>
  )
}
