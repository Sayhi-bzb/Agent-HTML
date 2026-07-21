import * as React from "react"

import type { Artifact } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "../ui/alert-dialog"

export function ArtifactDeleteDialog({
  artifact,
  onDelete,
  onDismiss,
}: {
  artifact: Pick<Artifact, "filePath" | "title">
  onDelete: (filePath: string) => Promise<void>
  onDismiss: () => void
}) {
  const { t } = useHostI18n()
  const [deleting, setDeleting] = React.useState(false)
  const [status, setStatus] = React.useState("")

  async function confirmDelete() {
    setDeleting(true)
    setStatus("")

    try {
      await onDelete(artifact.filePath)
      setDeleting(false)
      onDismiss()
    } catch (error) {
      setStatus(error instanceof Error ? error.message : String(error))
      setDeleting(false)
    }
  }

  return (
    <AlertDialog
      open
      onOpenChange={(open) => {
        if (!open && !deleting) onDismiss()
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>
            {t("sidebar.deleteArtifactTitle", { label: artifact.title })}
          </AlertDialogTitle>
          <AlertDialogDescription>
            {t("sidebar.deleteArtifactDescription")}
          </AlertDialogDescription>
        </AlertDialogHeader>
        {status ? (
          <p className="canvas-sidebar-dialog-status">{status}</p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={deleting}>
            {t("sidebar.cancel")}
          </AlertDialogCancel>
          <AlertDialogAction
            disabled={deleting}
            onClick={(event) => {
              event.preventDefault()
              void confirmDelete()
            }}
            variant="destructive"
          >
            {t("sidebar.delete")}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
