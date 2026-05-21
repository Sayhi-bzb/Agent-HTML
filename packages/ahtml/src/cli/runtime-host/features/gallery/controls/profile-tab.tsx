import { Button } from "@/components/ui/button"
import { Field, FieldDescription, FieldLabel } from "@/components/ui/field"

import { getPreviewModeLabel } from "../helpers"
import { FieldRow } from "../shared/form-controls"
import type { GalleryProfileTabProps } from "./types"

export function GalleryProfileTab({
  editorState,
  previewMode,
  resetDraft,
  saveProfile,
}: GalleryProfileTabProps) {
  return (
    <div className="ahtml-gallery-control-footer" data-gallery-frame="persist">
      <div className="ahtml-gallery-toolbar-copy">
        <span className="ahtml-gallery-toolbar-label">Persist</span>
        <span className="ahtml-gallery-toolbar-caption">{editorState.status}</span>
      </div>
      <div className="ahtml-gallery-control-footer-body">
        <FieldRow label="Status" value={editorState.status} />
        <FieldRow
          label="Profile id"
          value={editorState.artifactProfileReference}
        />
        <FieldRow
          label="Gallery view"
          value={getPreviewModeLabel(previewMode)}
        />
        <FieldRow
          label="Draft state"
          value={editorState.isDirty ? "Unsaved changes" : "Saved"}
        />
        <div className="ahtml-gallery-actions">
          <Button
            disabled={editorState.isSaving || !editorState.isDirty}
            onClick={resetDraft}
            size="sm"
            type="button"
            variant="outline"
          >
            Reset
          </Button>
          <Button
            disabled={editorState.isSaving}
            onClick={() => void saveProfile()}
            size="sm"
            type="button"
          >
            Save Profile
          </Button>
        </div>
        {editorState.error ? (
          <Field data-invalid>
            <FieldLabel>Error</FieldLabel>
            <FieldDescription className="ahtml-gallery-error">
              {editorState.error}
            </FieldDescription>
          </Field>
        ) : null}
      </div>
    </div>
  )
}
