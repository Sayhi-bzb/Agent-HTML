import React from "react"

import generatedDocument from "../document.generated.json"
import runtimeStateSource from "../runtime-state.generated.json"
import runtimeVerificationState from "../render-verification.generated.json"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import {
  assertRendererRegistryParity,
  createRendererSpecMap,
} from "./renderer/parity"
import { createRendererNode } from "./renderer/render-node"
import { createGalleryPreviewSections } from "./gallery-preview-document.mjs"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldLabel,
  FieldTitle,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type { AgentDocument, RuntimeVerificationState } from "./renderer/types"

type StyleProfile = AgentDocument["meta"]["styleProfile"]
type RuntimeState = {
  kind?: string
  version?: number
  mode?: "document" | "gallery"
  gallery?: {
    availableStyleReferences: string[]
    styleReference: string
    styleProfile: StyleProfile
  }
}

type GalleryStateResponse = {
  ok: boolean
  availableStyleReferences: string[]
  styleReference: string
  styleProfile: StyleProfile
}

type GalleryMutationResponse = {
  ok: boolean
  error?: string
  availableStyleReferences?: string[]
  styleReference?: string
  styleProfile?: StyleProfile
}

type GalleryEditorState = {
  availableStyleReferences: string[]
  createId: string
  draftProfile: StyleProfile
  error: string
  isDirty: boolean
  isSaving: boolean
  persistedProfile: StyleProfile
  status: string
  styleReference: string
}

type GalleryControlTab = "profile" | "tokens" | "typography" | "treatments"
type GalleryPreviewMode =
  | "components"
  | "forms"
  | "disclosure"
  | "typography"
  | "full"

const agentDocument = generatedDocument as AgentDocument
const runtimeState = runtimeStateSource as RuntimeState
const runtimeRendererVerification =
  runtimeVerificationState as RuntimeVerificationState
const rendererSpecByName = createRendererSpecMap(runtimeRendererVerification)

assertRendererRegistryParity(runtimeRendererVerification, rendererSpecByName)

export function App() {
  const title = getDocumentTitle(agentDocument)

  React.useEffect(() => {
    if (title && typeof document !== "undefined") {
      document.title = title
    }
  }, [title])

  if (runtimeState.mode === "gallery" && runtimeState.gallery) {
    return (
      <GalleryApp
        availableStyleReferences={runtimeState.gallery.availableStyleReferences}
        initialProfile={runtimeState.gallery.styleProfile}
        styleReference={runtimeState.gallery.styleReference}
      />
    )
  }

  return <DocumentApp document={agentDocument} />
}

function DocumentApp({ document }: { document: AgentDocument }) {
  const documentStyleCss = createDocumentStyleCss(document.meta.styleProfile)
  const RendererNode = createRendererNode(
    rendererSpecByName,
    document.meta.styleProfile.componentStyle.treatments,
  )

  return (
    <>
      <RuntimeStyleElements documentStyleCss={documentStyleCss} />
      <main
        className="ahtml-runtime-host ahtml-runtime-document"
        data-style-profile={document.meta.styleProfile.id}
      >
        <DocumentArtifactShell layoutPolicy="document">
          {document.components.map((node, index) => (
            <RendererNode key={index} node={node} path={[index]} />
          ))}
        </DocumentArtifactShell>
      </main>
    </>
  )
}

function GalleryApp({
  availableStyleReferences,
  initialProfile,
  styleReference,
}: {
  availableStyleReferences: string[]
  initialProfile: StyleProfile
  styleReference: string
}) {
  const [editorState, setEditorState] = React.useState<GalleryEditorState>({
    availableStyleReferences,
    createId: "",
    draftProfile: initialProfile,
    error: "",
    isDirty: false,
    isSaving: false,
    persistedProfile: initialProfile,
    status: "Style gallery ready.",
    styleReference,
  })
  const [controlTab, setControlTab] =
    React.useState<GalleryControlTab>("profile")
  const [previewMode, setPreviewMode] =
    React.useState<GalleryPreviewMode>("components")
  const [mobileTab, setMobileTab] = React.useState<"controls" | "preview">(
    "controls",
  )

  React.useEffect(() => {
    let cancelled = false

    void fetchGalleryState().then((nextState) => {
      if (!nextState || cancelled) {
        return
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences: nextState.availableStyleReferences,
        draftProfile: current.isDirty
          ? current.draftProfile
          : nextState.styleProfile,
        error: "",
        persistedProfile: nextState.styleProfile,
        status: current.isDirty ? current.status : "Style gallery ready.",
        styleReference: current.isDirty
          ? current.styleReference
          : nextState.styleReference,
      }))
    })

    return () => {
      cancelled = true
    }
  }, [])

  const RendererNode = React.useMemo(
    () =>
      createRendererNode(
        rendererSpecByName,
        editorState.draftProfile.componentStyle.treatments,
      ),
    [editorState.draftProfile.componentStyle.treatments],
  )
  const documentStyleCss = React.useMemo(
    () => createDocumentStyleCss(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const previewSections = React.useMemo(
    () => createGalleryPreviewSections(editorState.draftProfile),
    [editorState.draftProfile],
  )
  const visiblePreviewSections = React.useMemo(
    () =>
      previewMode === "full"
        ? previewSections
        : previewSections.filter((section) => section.mode === previewMode),
    [previewMode, previewSections],
  )

  const updateDraftProfile = React.useCallback(
    (updater: (draft: StyleProfile) => StyleProfile) => {
      setEditorState((current) => ({
        ...current,
        draftProfile: updater(current.draftProfile),
        error: "",
        isDirty: true,
        status: "Unsaved changes.",
      }))
    },
    [],
  )

  const saveProfile = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: "Saving style profile...",
    }))

    try {
      const response = await fetch("/__ahtml/gallery/save", {
        body: JSON.stringify({
          styleProfile: editorState.draftProfile,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.styleProfile ||
        !result.styleReference
      ) {
        throw new Error(result.error ?? "Unable to save gallery style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableStyleReferences ?? current.availableStyleReferences,
        draftProfile: result.styleProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.styleProfile!,
        status: `Saved ${result.styleReference}.`,
        styleReference: result.styleReference!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Save failed.",
      }))
    }
  }, [editorState])

  const selectStyleReference = React.useCallback(
    async (nextStyleReference: string) => {
      setEditorState((current) => ({
        ...current,
        error: "",
        status: `Loading ${nextStyleReference}...`,
      }))

      try {
        const response = await fetch("/__ahtml/gallery/select", {
          body: JSON.stringify({
            styleReference: nextStyleReference,
          }),
          headers: {
            "content-type": "application/json",
          },
          method: "POST",
        })
        const result = (await response.json()) as GalleryMutationResponse

        if (
          !response.ok ||
          !result.ok ||
          !result.styleProfile ||
          !result.styleReference
        ) {
          throw new Error(result.error ?? "Unable to switch style profile.")
        }

        setEditorState((current) => ({
          ...current,
          availableStyleReferences:
            result.availableStyleReferences ?? current.availableStyleReferences,
          draftProfile: result.styleProfile!,
          error: "",
          isDirty: false,
          persistedProfile: result.styleProfile!,
          status: `Selected ${result.styleReference}.`,
          styleReference: result.styleReference!,
        }))
      } catch (error) {
        setEditorState((current) => ({
          ...current,
          error: error instanceof Error ? error.message : String(error),
          status: "Switch failed.",
        }))
      }
    },
    [],
  )

  const createStyleReference = React.useCallback(async () => {
    const createId = editorState.createId.trim()

    if (!createId) {
      setEditorState((current) => ({
        ...current,
        error: 'New style id is required, for example "team-ops".',
      }))
      return
    }

    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Creating ${createId}...`,
    }))

    try {
      const response = await fetch("/__ahtml/gallery/create", {
        body: JSON.stringify({
          styleReference: createId,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.styleProfile ||
        !result.styleReference
      ) {
        throw new Error(result.error ?? "Unable to create style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableStyleReferences ?? current.availableStyleReferences,
        createId: "",
        draftProfile: result.styleProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.styleProfile!,
        status: `Created ${result.styleReference}.`,
        styleReference: result.styleReference!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Create failed.",
      }))
    }
  }, [editorState.createId])

  const deleteCurrentStyleReference = React.useCallback(async () => {
    setEditorState((current) => ({
      ...current,
      error: "",
      isSaving: true,
      status: `Deleting ${current.styleReference}...`,
    }))

    try {
      const response = await fetch("/__ahtml/gallery/delete", {
        body: JSON.stringify({
          styleReference: editorState.styleReference,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const result = (await response.json()) as GalleryMutationResponse

      if (
        !response.ok ||
        !result.ok ||
        !result.styleProfile ||
        !result.styleReference
      ) {
        throw new Error(result.error ?? "Unable to delete style profile.")
      }

      setEditorState((current) => ({
        ...current,
        availableStyleReferences:
          result.availableStyleReferences ?? current.availableStyleReferences,
        draftProfile: result.styleProfile!,
        error: "",
        isDirty: false,
        isSaving: false,
        persistedProfile: result.styleProfile!,
        status: `Deleted style. Current is ${result.styleReference}.`,
        styleReference: result.styleReference!,
      }))
    } catch (error) {
      setEditorState((current) => ({
        ...current,
        error: error instanceof Error ? error.message : String(error),
        isSaving: false,
        status: "Delete failed.",
      }))
    }
  }, [editorState.styleReference])

  const resetDraft = React.useCallback(() => {
    setEditorState((current) => ({
      ...current,
      draftProfile: current.persistedProfile,
      error: "",
      isDirty: false,
      status: `Reset ${current.styleReference}.`,
    }))
  }, [])

  return (
    <>
      <RuntimeStyleElements
        documentStyleCss={documentStyleCss}
        includeGalleryShell
      />
      <main
        className="ahtml-runtime-host ahtml-gallery-shell"
        data-style-profile={editorState.draftProfile.id}
      >
        <header
          className="ahtml-gallery-page-header"
          data-gallery-frame="header"
        >
          <div className="ahtml-gallery-page-brand">
            <strong>agent-html</strong>
            <span>AHTML Gallery Editor</span>
          </div>
          <div className="ahtml-gallery-header-actions">
            <Badge variant="secondary">{editorState.styleReference}</Badge>
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
            <TabsTrigger value="controls">Controls</TabsTrigger>
            <TabsTrigger value="preview">Preview</TabsTrigger>
          </TabsList>
        </Tabs>
        <div className="ahtml-gallery-main">
          <ResizablePanelGroup
            className="ahtml-gallery-workbench"
            direction="horizontal"
          >
            <ResizablePanel
              className="ahtml-gallery-sidebar"
              data-gallery-frame="controls"
              data-mobile-panel={mobileTab === "controls" ? "active" : "hidden"}
              defaultSize={30}
              minSize={22}
              maxSize={42}
            >
              <div className="ahtml-gallery-sidebar-inner">
                <div
                  className="ahtml-gallery-sidebar-header"
                  data-gallery-frame="hero"
                >
                  <div className="ahtml-gallery-hero-copy">
                    <Badge
                      className="ahtml-gallery-kicker-badge"
                      variant="outline"
                    >
                      Gallery customizer
                    </Badge>
                    <h1 className="ahtml-gallery-hero-title">
                      {editorState.draftProfile.id}
                    </h1>
                    <p className="ahtml-gallery-meta">
                      Compact controls on the left, live preview workbench on
                      the right.
                    </p>
                  </div>
                  <div className="ahtml-gallery-sidebar-status">
                    <FieldRow
                      label="Active style"
                      value={editorState.styleReference}
                    />
                    <FieldRow
                      label="Draft"
                      value={editorState.isDirty ? "unsaved" : "synced"}
                    />
                  </div>
                </div>

                <Tabs
                  className="ahtml-gallery-control-tabs"
                  onValueChange={(value) =>
                    setControlTab(value as GalleryControlTab)
                  }
                  value={controlTab}
                >
                  <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border">
                    <TabsList className="ahtml-gallery-pill-tabs">
                      <TabsTrigger value="profile">Profile</TabsTrigger>
                      <TabsTrigger value="tokens">Tokens</TabsTrigger>
                      <TabsTrigger value="typography">Typography</TabsTrigger>
                      <TabsTrigger value="treatments">Treatments</TabsTrigger>
                    </TabsList>
                  </div>

                  <ScrollArea className="ahtml-gallery-control-scroll">
                    <div className="ahtml-gallery-control-body">
                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="profile"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={["style-id", "persist"]}
                          type="multiple"
                        >
                          <AccordionItem value="style-id">
                            <AccordionTrigger>Style profile</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <Field>
                                  <FieldLabel>Current style id</FieldLabel>
                                  <Select
                                    onValueChange={(value) =>
                                      void selectStyleReference(value)
                                    }
                                    value={editorState.styleReference}
                                  >
                                    <SelectTrigger>
                                      <SelectValue placeholder="Select a style id" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectGroup>
                                        {editorState.availableStyleReferences.map(
                                          (styleId) => (
                                            <SelectItem
                                              key={styleId}
                                              value={styleId}
                                            >
                                              {styleId}
                                            </SelectItem>
                                          ),
                                        )}
                                      </SelectGroup>
                                    </SelectContent>
                                  </Select>
                                  <FieldDescription>
                                    Switch the preview to another saved style
                                    profile.
                                  </FieldDescription>
                                </Field>
                                <FieldRow
                                  label="Available ids"
                                  multiline
                                  value={editorState.availableStyleReferences.join(
                                    ", ",
                                  )}
                                />
                                <div className="ahtml-gallery-actions">
                                  <Button
                                    disabled={editorState.isSaving}
                                    onClick={() => void createStyleReference()}
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    New Id
                                  </Button>
                                  <Button
                                    disabled={editorState.isSaving}
                                    onClick={() =>
                                      void deleteCurrentStyleReference()
                                    }
                                    size="sm"
                                    type="button"
                                    variant="outline"
                                  >
                                    Delete Id
                                  </Button>
                                </div>
                                <LabeledInput
                                  label="New Style Id"
                                  value={editorState.createId}
                                  onChange={(value) =>
                                    setEditorState((current) => ({
                                      ...current,
                                      createId: value,
                                    }))
                                  }
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
                                <FieldRow
                                  label="Status"
                                  value={editorState.status}
                                />
                                <FieldRow
                                  label="Preview mode"
                                  value={
                                    previewMode === "full"
                                      ? "component-gallery"
                                      : previewMode
                                  }
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="tokens"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={["light-tokens"]}
                          type="multiple"
                        >
                          <AccordionItem value="light-tokens">
                            <AccordionTrigger>Light tokens</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <TokenEditor
                                  tokens={
                                    editorState.draftProfile.globalStyle
                                      .tokenSets.light
                                  }
                                  onChange={(tokenName, value) =>
                                    updateDraftProfile((draft) => ({
                                      ...draft,
                                      globalStyle: {
                                        ...draft.globalStyle,
                                        tokenSets: {
                                          ...draft.globalStyle.tokenSets,
                                          light: {
                                            ...draft.globalStyle.tokenSets
                                              .light,
                                            [tokenName]: value,
                                          },
                                        },
                                      },
                                    }))
                                  }
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>

                          <AccordionItem value="dark-tokens">
                            <AccordionTrigger>Dark tokens</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <TokenEditor
                                  tokens={
                                    editorState.draftProfile.globalStyle
                                      .tokenSets.dark
                                  }
                                  onChange={(tokenName, value) =>
                                    updateDraftProfile((draft) => ({
                                      ...draft,
                                      globalStyle: {
                                        ...draft.globalStyle,
                                        tokenSets: {
                                          ...draft.globalStyle.tokenSets,
                                          dark: {
                                            ...draft.globalStyle.tokenSets.dark,
                                            [tokenName]: value,
                                          },
                                        },
                                      },
                                    }))
                                  }
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="typography"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={["fonts", "geometry"]}
                          type="multiple"
                        >
                          <AccordionItem value="fonts">
                            <AccordionTrigger>Font family</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <LabeledInput
                                  label="Font Sans"
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontSans
                                  }
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
                                />
                                <LabeledInput
                                  label="Font Heading"
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .typography.fontHeading
                                  }
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
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                          <AccordionItem value="geometry">
                            <AccordionTrigger>Geometry</AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                <LabeledInput
                                  label="Radius Base"
                                  value={
                                    editorState.draftProfile.globalStyle
                                      .radiusScale.base
                                  }
                                  onChange={(value) =>
                                    updateDraftProfile((draft) => ({
                                      ...draft,
                                      globalStyle: {
                                        ...draft.globalStyle,
                                        radiusScale: {
                                          ...draft.globalStyle.radiusScale,
                                          base: value,
                                        },
                                      },
                                    }))
                                  }
                                />
                              </GalleryPanelBody>
                            </AccordionContent>
                          </AccordionItem>
                        </Accordion>
                      </TabsContent>

                      <TabsContent
                        className="ahtml-gallery-tab-panel"
                        value="treatments"
                      >
                        <Accordion
                          className="ahtml-gallery-control-sections"
                          defaultValue={["component-treatments"]}
                          type="multiple"
                        >
                          <AccordionItem value="component-treatments">
                            <AccordionTrigger>
                              Component treatments
                            </AccordionTrigger>
                            <AccordionContent>
                              <GalleryPanelBody>
                                {Object.entries(
                                  editorState.draftProfile.componentStyle
                                    .treatments,
                                )
                                  .sort(([left], [right]) =>
                                    left.localeCompare(right),
                                  )
                                  .map(([componentName, treatment]) => (
                                    <LabeledInput
                                      key={componentName}
                                      label={componentName}
                                      value={treatment}
                                      onChange={(value) =>
                                        updateDraftProfile((draft) => ({
                                          ...draft,
                                          componentStyle: {
                                            ...draft.componentStyle,
                                            treatments: {
                                              ...draft.componentStyle
                                                .treatments,
                                              [componentName]: value,
                                            },
                                          },
                                        }))
                                      }
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
            </ResizablePanel>

            <ResizableHandle className="ahtml-gallery-divider" withHandle />

            <ResizablePanel
              className="ahtml-gallery-preview"
              data-gallery-frame="preview"
              data-mobile-panel={mobileTab === "preview" ? "active" : "hidden"}
              defaultSize={70}
              minSize={58}
            >
              <div className="ahtml-gallery-preview-shell">
                <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border">
                  <div className="ahtml-gallery-preview-toolbar">
                    <Button
                      disabled={editorState.isSaving || !editorState.isDirty}
                      onClick={resetDraft}
                      size="sm"
                      type="button"
                      variant="outline"
                    >
                      Reset Draft
                    </Button>
                    <Button
                      disabled={editorState.isSaving}
                      onClick={() => void saveProfile()}
                      size="sm"
                      type="button"
                    >
                      Save Current Style
                    </Button>
                  </div>
                </div>
                <Tabs
                  className="ahtml-gallery-preview-tabs"
                  onValueChange={(value) =>
                    setPreviewMode(value as GalleryPreviewMode)
                  }
                  value={previewMode}
                >
                  <div className="ahtml-gallery-preview-shell">
                    <div className="ahtml-gallery-preview-headline">
                      <div className="ahtml-gallery-preview-title-block">
                        <Badge
                          className="ahtml-gallery-kicker-badge"
                          variant="outline"
                        >
                          Preview
                        </Badge>
                        <CardTitle>Component gallery workbench</CardTitle>
                        <FieldDescription className="ahtml-gallery-preview-note">
                          Compare component families, forms, disclosure
                          patterns, and global typography inside one work
                          surface.
                        </FieldDescription>
                      </div>
                      <div className="ahtml-gallery-preview-meta-rail">
                        <GalleryPreviewMeta
                          label="Style"
                          value={editorState.styleReference}
                        />
                        <GalleryPreviewMeta
                          label="Draft"
                          value={editorState.isDirty ? "unsaved" : "synced"}
                        />
                        <GalleryPreviewMeta
                          label="Mode"
                          value={
                            previewMode === "full"
                              ? "component-gallery"
                              : previewMode
                          }
                        />
                      </div>
                    </div>

                    <div className="ahtml-gallery-toolbar ahtml-gallery-preview-modebar">
                      <TabsList className="ahtml-gallery-pill-tabs">
                        <TabsTrigger value="components">Components</TabsTrigger>
                        <TabsTrigger value="forms">Forms</TabsTrigger>
                        <TabsTrigger value="disclosure">Disclosure</TabsTrigger>
                        <TabsTrigger value="typography">Typography</TabsTrigger>
                        <TabsTrigger value="full">Full</TabsTrigger>
                      </TabsList>
                    </div>

                    <ScrollArea className="ahtml-gallery-preview-canvas">
                      <TabsContent
                        className="ahtml-gallery-preview-panel"
                        value={previewMode}
                      >
                        <div className="ahtml-gallery-stage-frame">
                          {previewMode === "typography" ? (
                            <GalleryTypographyPanel
                              profile={editorState.draftProfile}
                            />
                          ) : (
                            <DocumentArtifactShell
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
                        </div>
                      </TabsContent>
                    </ScrollArea>
                  </div>
                </Tabs>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </main>
    </>
  )
}

function RuntimeStyleElements({
  documentStyleCss,
  includeGalleryShell = false,
}: {
  documentStyleCss: string
  includeGalleryShell?: boolean
}) {
  return (
    <>
      <style>{createRuntimeHostCss()}</style>
      <style>{createArtifactShellCss()}</style>
      <style>{createDocumentLayoutPolicyCss()}</style>
      <style>{createGalleryLayoutPolicyCss()}</style>
      {includeGalleryShell ? <style>{createGalleryShellCss()}</style> : null}
      <style>{documentStyleCss}</style>
    </>
  )
}

function DocumentArtifactShell({
  children,
  className,
  layoutPolicy = "document",
}: React.PropsWithChildren<{
  className?: string
  layoutPolicy?: "document" | "gallery"
}>) {
  const classes = [
    "ahtml-artifact-root",
    layoutPolicy === "document"
      ? "ahtml-layout-policy-document"
      : "ahtml-layout-policy-gallery",
    className,
  ]
    .filter(Boolean)
    .join(" ")

  return <div className={classes}>{children}</div>
}

function TokenEditor({
  tokens,
  onChange,
}: {
  tokens: StyleProfile["globalStyle"]["tokenSets"]["light"]
  onChange: (
    tokenName: keyof StyleProfile["globalStyle"]["tokenSets"]["light"],
    value: string,
  ) => void
}) {
  return (
    <div className="ahtml-gallery-stack">
      {Object.entries(tokens).map(([tokenName, tokenValue]) => (
        <div className="ahtml-gallery-token-row" key={tokenName}>
          <span
            className="ahtml-gallery-swatch"
            style={{ background: tokenValue }}
            aria-hidden="true"
          />
          <LabeledInput
            label={tokenName}
            value={tokenValue}
            onChange={(value) =>
              onChange(
                tokenName as keyof StyleProfile["globalStyle"]["tokenSets"]["light"],
                value,
              )
            }
          />
        </div>
      ))}
    </div>
  )
}

function LabeledInput({
  label,
  onChange,
  value,
}: {
  label: string
  onChange: (value: string) => void
  value: string
}) {
  const id = React.useId()

  return (
    <Field>
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <Input
        id={id}
        onChange={(event) => onChange(event.target.value)}
        value={value}
      />
    </Field>
  )
}

function FieldRow({
  label,
  multiline = false,
  value,
}: {
  label: string
  multiline?: boolean
  value: string
}) {
  return (
    <Field className="ahtml-gallery-field-row">
      <FieldTitle>{label}</FieldTitle>
      <FieldContent>
        <strong className={multiline ? "ahtml-gallery-wrap" : undefined}>
          {value}
        </strong>
      </FieldContent>
    </Field>
  )
}

function GalleryPanelBody({ children }: React.PropsWithChildren) {
  return (
    <div className="ahtml-gallery-stack ahtml-gallery-panel-body">
      {children}
    </div>
  )
}

function GalleryPreviewMeta({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="ahtml-gallery-preview-meta">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

function fetchGalleryState() {
  return fetch("/__ahtml/gallery/state", {
    headers: {
      accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        return null
      }

      return (await response.json()) as GalleryStateResponse
    })
    .catch(() => null)
}

function GalleryTypographyPanel({ profile }: { profile: StyleProfile }) {
  return (
    <Card className="ahtml-gallery-typography-panel">
      <CardHeader>
        <CardTitle>Typography system</CardTitle>
        <FieldDescription>
          Mirror tweakcn&apos;s type check: headline, body, annotation, and
          token channels in one dense reading surface.
        </FieldDescription>
      </CardHeader>
      <CardContent className="ahtml-gallery-typography-content">
        <div className="ahtml-gallery-typography-sample">
          <p className="ahtml-gallery-typography-kicker">Heading</p>
          <h2>{profile.globalStyle.typography.fontHeading}</h2>
          <p>
            Review rhythm, line length, and contrast before shipping a style
            profile into preview artifacts.
          </p>
        </div>
        <Separator />
        <div className="ahtml-gallery-typography-grid">
          <FieldRow
            label="Font Sans"
            multiline
            value={profile.globalStyle.typography.fontSans}
          />
          <FieldRow
            label="Font Heading"
            multiline
            value={profile.globalStyle.typography.fontHeading}
          />
          <FieldRow
            label="Radius Base"
            value={profile.globalStyle.radiusScale.base}
          />
        </div>
        <div className="ahtml-gallery-typography-token">
          <code>{`--font-sans: ${profile.globalStyle.typography.fontSans};`}</code>
          <code>{`--font-heading: ${profile.globalStyle.typography.fontHeading};`}</code>
        </div>
      </CardContent>
    </Card>
  )
}

function createDocumentStyleCss(styleProfile: StyleProfile) {
  const globalStyle = styleProfile.globalStyle

  return [
    `:root{${createGlobalStyleDeclarations(globalStyle, "light")}}`,
    `@media (prefers-color-scheme: dark){:root{${createGlobalStyleDeclarations(
      globalStyle,
      "dark",
    )}}}`,
  ].join("")
}

function createGlobalStyleDeclarations(
  globalStyle: StyleProfile["globalStyle"],
  mode: "light" | "dark",
) {
  return [
    `${globalStyle.cssVariableMap.background}:${globalStyle.tokenSets[mode].background};`,
    `${globalStyle.cssVariableMap.foreground}:${globalStyle.tokenSets[mode].foreground};`,
    `${globalStyle.cssVariableMap.card}:${globalStyle.tokenSets[mode].card};`,
    `${globalStyle.cssVariableMap.cardForeground}:${globalStyle.tokenSets[mode].cardForeground};`,
    `${globalStyle.cssVariableMap.popover}:${globalStyle.tokenSets[mode].popover};`,
    `${globalStyle.cssVariableMap.popoverForeground}:${globalStyle.tokenSets[mode].popoverForeground};`,
    `${globalStyle.cssVariableMap.primary}:${globalStyle.tokenSets[mode].primary};`,
    `${globalStyle.cssVariableMap.primaryForeground}:${globalStyle.tokenSets[mode].primaryForeground};`,
    `${globalStyle.cssVariableMap.secondary}:${globalStyle.tokenSets[mode].secondary};`,
    `${globalStyle.cssVariableMap.secondaryForeground}:${globalStyle.tokenSets[mode].secondaryForeground};`,
    `${globalStyle.cssVariableMap.muted}:${globalStyle.tokenSets[mode].muted};`,
    `${globalStyle.cssVariableMap.mutedForeground}:${globalStyle.tokenSets[mode].mutedForeground};`,
    `${globalStyle.cssVariableMap.accent}:${globalStyle.tokenSets[mode].accent};`,
    `${globalStyle.cssVariableMap.accentForeground}:${globalStyle.tokenSets[mode].accentForeground};`,
    `${globalStyle.cssVariableMap.destructive}:${globalStyle.tokenSets[mode].destructive};`,
    `${globalStyle.cssVariableMap.border}:${globalStyle.tokenSets[mode].border};`,
    `${globalStyle.cssVariableMap.input}:${globalStyle.tokenSets[mode].input};`,
    `${globalStyle.cssVariableMap.ring}:${globalStyle.tokenSets[mode].ring};`,
    `${globalStyle.cssVariableMap.radius}:${globalStyle.radiusScale.base};`,
    `${globalStyle.cssVariableMap.fontSans}:${globalStyle.typography.fontSans};`,
    `${globalStyle.cssVariableMap.fontHeading}:${globalStyle.typography.fontHeading};`,
    `color-scheme:${mode};`,
  ].join("")
}

function createRuntimeHostCss() {
  return `
    body {
      margin: 0;
      background:
        radial-gradient(circle at top left, color-mix(in srgb, var(--primary) 12%, transparent), transparent 32%),
        linear-gradient(180deg, color-mix(in srgb, var(--background) 96%, black 4%), var(--background));
      color: var(--foreground);
      font-family: var(--font-sans);
    }
    .ahtml-runtime-host {
      min-height: 100vh;
      box-sizing: border-box;
    }
  `
}

function createArtifactShellCss() {
  return `
    .ahtml-artifact-root {
      box-sizing: border-box;
      display: grid;
    }
    .ahtml-artifact-root > * {
      min-width: 0;
    }
    .ahtml-artifact-root [data-agent-html-component="page"] > * {
      min-width: 0;
    }
  `
}

function createDocumentLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-document {
      width: min(100%, 72rem);
      margin: 0 auto;
      padding: 4rem 1.25rem 5rem;
      gap: 2rem;
    }
    .ahtml-layout-policy-document .ahtml-prose-block {
      max-width: 68ch;
    }
    .ahtml-layout-policy-document .ahtml-prose-block > p {
      line-height: 1.75;
    }
    .ahtml-layout-policy-document .ahtml-prose-inline {
      line-height: 1.65;
    }
    .ahtml-layout-policy-document .ahtml-section-stack {
      display: grid;
      gap: 1.35rem;
    }
    .ahtml-layout-policy-document [data-slot="card-content"].ahtml-section-stack > :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) + :where(
      [data-agent-html-component="alert"],
      [data-agent-html-component="table"],
      [data-agent-html-component="list"],
      [data-agent-html-component="tabs"],
      [data-agent-html-component="accordion"],
      [data-agent-html-component="checkbox"],
      [data-agent-html-component="switch"],
      [data-agent-html-component="input"],
      [data-agent-html-component="textarea"],
      [data-agent-html-component="slider"],
      [data-agent-html-component="radio-group"],
      [data-agent-html-component="toggle-group"],
      [data-agent-html-component="select"],
      [data-agent-html-component="combobox"],
      [data-agent-html-component="progress"],
      [data-agent-html-component="badge"],
      [data-agent-html-component="separator"]
    ) {
      margin-top: 0;
    }
    @media (max-width: 1100px) {
      .ahtml-layout-policy-document {
        width: min(100%, 60rem);
        padding: 2.75rem 1rem 3.5rem;
        gap: 1.5rem;
      }
    }
    @media (min-width: 1200px) {
      .ahtml-layout-policy-document {
        width: min(100%, 76rem);
        padding-top: 4.5rem;
      }
    }
  `
}

function createGalleryLayoutPolicyCss() {
  return `
    .ahtml-layout-policy-gallery {
      width: 100%;
      padding: 0;
      grid-template-columns: repeat(auto-fit, minmax(18rem, 1fr));
      gap: 1.25rem;
      align-items: start;
    }
    .ahtml-layout-policy-gallery > * {
      min-width: 0;
    }
  `
}

function createGalleryShellCss() {
  return `
    .ahtml-gallery-shell {
      display: grid;
      min-height: 100vh;
      grid-template-rows: auto auto minmax(0, 1fr);
      box-sizing: border-box;
      background: var(--background);
    }
    .ahtml-gallery-page-header {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 1rem;
      min-height: 3.5rem;
      padding: 0.9rem 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
    }
    .ahtml-gallery-page-brand {
      display: grid;
      gap: 0.2rem;
    }
    .ahtml-gallery-page-brand strong {
      font-family: var(--font-heading);
      letter-spacing: -0.03em;
    }
    .ahtml-gallery-page-brand span {
      color: var(--muted-foreground);
      font-size: 0.78rem;
      text-transform: uppercase;
      letter-spacing: 0.12em;
    }
    .ahtml-gallery-header-actions {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }
    .ahtml-gallery-mobile-tabs {
      display: none;
      padding: 0.6rem 1rem 0;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-mobile-tabs-list {
      width: 100%;
      border-radius: 0;
    }
    .ahtml-gallery-main {
      display: flex;
      min-height: 0;
      min-width: 0;
      position: relative;
    }
    .ahtml-gallery-sidebar {
      width: min(31rem, 33vw);
      min-width: 20rem;
      overflow: hidden;
    }
    .ahtml-gallery-divider {
      width: 0.75rem;
      flex: none;
      border-left: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      border-right: 1px solid color-mix(in srgb, var(--background) 96%, var(--muted) 4%);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 94%, var(--muted) 6%),
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%)
        );
      cursor: col-resize;
    }
    .ahtml-gallery-sidebar-inner {
      height: 100%;
      min-height: 0;
      overflow: hidden;
      display: flex;
      flex-direction: column;
      box-sizing: border-box;
    }
    .ahtml-gallery-sidebar-header {
      display: flex;
      flex-direction: column;
      gap: 1rem;
      padding: 1rem;
      border-bottom: 1px solid color-mix(in srgb, var(--border) 86%, transparent);
      background: color-mix(in srgb, var(--background) 94%, var(--muted) 6%);
    }
    .ahtml-gallery-hero-copy {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .ahtml-gallery-sidebar-status {
      display: grid;
      grid-template-columns: repeat(2, minmax(0, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-kicker-badge {
      width: fit-content;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-hero-title,
    .ahtml-gallery-hero h1,
    .ahtml-gallery-preview-header h2 {
      margin: 0;
      font-family: var(--font-heading);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-meta,
    .ahtml-gallery-preview-note {
      margin: 0;
      color: var(--muted-foreground);
      line-height: 1.5;
    }
    .ahtml-gallery-control-tabs {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
    }
    .ahtml-gallery-toolbar {
      display: flex;
      align-items: center;
      justify-content: space-between;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
    }
    .ahtml-gallery-toolbar-border {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 82%, transparent);
    }
    .ahtml-gallery-pill-tabs {
      width: fit-content;
      border-radius: 999px;
      background: color-mix(in srgb, var(--background) 86%, var(--muted) 14%);
    }
    .ahtml-gallery-control-body {
      min-height: 0;
      flex: 1;
      overflow: auto;
    }
    .ahtml-gallery-tab-panel {
      margin-top: 0;
      height: 100%;
    }
    .ahtml-gallery-control-sections {
      display: grid;
      gap: 0;
      padding: 0 1rem 1rem;
    }
    .ahtml-gallery-control-sections [data-slot="accordion-item"] {
      border-bottom: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
    }
    .ahtml-gallery-control-sections [data-slot="accordion-trigger"] {
      font-size: 0.76rem;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-panel-body {
      padding: 0.15rem 0 0.8rem;
    }
    .ahtml-gallery-stack {
      display: flex;
      flex-direction: column;
      gap: 0.8rem;
    }
    .ahtml-gallery-token-row {
      display: grid;
      grid-template-columns: 1.75rem minmax(0, 1fr);
      gap: 0.7rem;
      align-items: start;
    }
    .ahtml-gallery-swatch {
      width: 1.75rem;
      height: 1.75rem;
      border-radius: 999px;
      border: 1px solid color-mix(in srgb, var(--border) 80%, transparent);
      margin-top: 1.35rem;
    }
    .ahtml-gallery-actions {
      display: flex;
      flex-wrap: wrap;
      gap: 0.75rem;
    }
    .ahtml-gallery-field-row {
      display: grid;
      gap: 0.28rem;
      padding: 0.75rem;
      border-radius: calc(var(--radius) * 1);
      background: color-mix(in srgb, var(--muted) 60%, transparent);
    }
    .ahtml-gallery-field-row strong {
      font-weight: 600;
      line-height: 1.5;
    }
    .ahtml-gallery-wrap {
      word-break: break-word;
    }
    .ahtml-gallery-error {
      margin: 0;
      color: var(--destructive);
      line-height: 1.4;
    }
    .ahtml-gallery-preview {
      display: flex;
      min-height: 0;
      flex: 1;
      flex-direction: column;
      min-width: 0;
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%),
          var(--background)
        );
    }
    .ahtml-gallery-preview-toolbar {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.75rem;
      width: 100%;
    }
    .ahtml-gallery-preview-tabs {
      min-height: 0;
      flex: 1;
    }
    .ahtml-gallery-preview-shell {
      display: flex;
      min-height: 0;
      height: 100%;
      flex-direction: column;
    }
    .ahtml-gallery-preview-headline {
      display: flex;
      align-items: start;
      justify-content: space-between;
      gap: 1.25rem;
      padding: 1rem 1rem 0.75rem;
    }
    .ahtml-gallery-preview-title-block {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .ahtml-gallery-preview-meta-rail {
      display: flex;
      flex-wrap: wrap;
      justify-content: flex-end;
      gap: 0.65rem;
      min-width: min(26rem, 44%);
    }
    .ahtml-gallery-preview-meta {
      display: grid;
      gap: 0.15rem;
      min-width: 7.5rem;
      padding: 0.7rem 0.85rem;
      border: 1px solid color-mix(in srgb, var(--border) 72%, transparent);
      border-radius: calc(var(--radius) * 1.2);
      background: color-mix(in srgb, var(--background) 88%, var(--muted) 12%);
    }
    .ahtml-gallery-preview-meta span {
      color: var(--muted-foreground);
      font-size: 0.68rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
    }
    .ahtml-gallery-preview-meta strong {
      line-height: 1.35;
      word-break: break-word;
    }
    .ahtml-gallery-preview-canvas {
      min-height: 0;
      flex: 1;
      overflow: auto;
      padding: 0 1rem 1rem;
    }
    .ahtml-gallery-preview-modebar {
      padding-top: 0;
    }
    .ahtml-gallery-preview-panel {
      margin-top: 0;
      min-height: 100%;
    }
    .ahtml-gallery-stage-frame {
      min-height: 100%;
      border: 1px solid color-mix(in srgb, var(--border) 74%, transparent);
      border-radius: calc(var(--radius) * 1.6);
      background:
        linear-gradient(
          180deg,
          color-mix(in srgb, var(--background) 98%, var(--muted) 2%),
          color-mix(in srgb, var(--background) 93%, var(--muted) 7%)
        );
      box-sizing: border-box;
      padding: 1rem;
    }
    .ahtml-gallery-preview-document {
      width: 100%;
      padding: 0;
      min-height: auto;
      align-content: start;
    }
    .ahtml-gallery-typography-panel {
      max-width: 68rem;
    }
    .ahtml-gallery-typography-content {
      display: flex;
      flex-direction: column;
      gap: 1rem;
    }
    .ahtml-gallery-typography-sample {
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
    }
    .ahtml-gallery-typography-sample h2 {
      margin: 0;
      font-family: var(--font-heading);
      font-size: clamp(2rem, 4vw, 3rem);
      letter-spacing: -0.04em;
    }
    .ahtml-gallery-typography-kicker {
      margin: 0;
      font-size: 0.75rem;
      font-weight: 600;
      letter-spacing: 0.12em;
      text-transform: uppercase;
      color: var(--muted-foreground);
    }
    .ahtml-gallery-typography-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(14rem, 1fr));
      gap: 0.75rem;
    }
    .ahtml-gallery-typography-token {
      display: grid;
      gap: 0.5rem;
      padding: 1rem;
      border-radius: calc(var(--radius) * 1.1);
      background: color-mix(in srgb, var(--muted) 56%, transparent);
      font-family: monospace;
      font-size: 0.86rem;
    }
    @media (max-width: 1100px) {
      .ahtml-gallery-shell {
        grid-template-rows: auto auto auto minmax(0, 1fr);
      }
      .ahtml-gallery-sidebar {
        width: 100%;
        min-width: 0;
        border-right: 0;
      }
      .ahtml-gallery-mobile-tabs {
        display: block;
      }
      .ahtml-gallery-main {
        flex-direction: column;
      }
      .ahtml-gallery-divider {
        display: none;
      }
      .ahtml-gallery-sidebar,
      .ahtml-gallery-preview {
        min-height: 0;
      }
      .ahtml-gallery-sidebar[data-mobile-panel="hidden"],
      .ahtml-gallery-preview[data-mobile-panel="hidden"] {
        display: none;
      }
      .ahtml-gallery-preview-headline {
        align-items: start;
        flex-direction: column;
      }
      .ahtml-gallery-page-header {
        align-items: start;
        flex-direction: column;
      }
      .ahtml-gallery-sidebar-status {
        grid-template-columns: 1fr;
        min-width: 0;
      }
      .ahtml-gallery-preview-meta-rail {
        justify-content: start;
        min-width: 0;
      }
      .ahtml-gallery-stage-frame {
        border-radius: calc(var(--radius) * 1.2);
        padding: 0.85rem;
      }
    }
  `
}

function getDocumentTitle(document: AgentDocument) {
  const page = document.components.find(
    (node): node is AgentComponentNode =>
      node.type === "component" && node.name === "page",
  )

  return page?.props.title
}
