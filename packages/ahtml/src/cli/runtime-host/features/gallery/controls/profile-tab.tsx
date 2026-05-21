import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"
import { TabsContent } from "@/components/ui/tabs"

import { getPreviewModeLabel } from "../helpers"
import {
  FieldRow,
  GalleryPanelBody,
  LabeledInput,
} from "../shared/form-controls"
import type { GalleryProfileTabProps } from "./types"

export function GalleryProfileTab({
  createArtifactProfileReference,
  deleteCurrentArtifactProfileReference,
  editorState,
  previewMode,
  setEditorState,
}: GalleryProfileTabProps) {
  return (
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
                value={editorState.availableArtifactProfileReferences.join(", ")}
              />
              <div className="ahtml-gallery-actions">
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
  )
}
