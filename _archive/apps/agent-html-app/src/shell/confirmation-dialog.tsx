import * as React from "react"

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/app/shared/ui/alert-dialog"
import type { Button } from "@/app/shared/ui/button"

type ConfirmationDialogAction = {
  disabled?: boolean
  label: React.ReactNode
  onClick?: React.MouseEventHandler<HTMLButtonElement>
  variant?: React.ComponentProps<typeof Button>["variant"]
}

export function ConfirmationDialog({
  cancelDisabled = false,
  cancelLabel = "Cancel",
  description,
  onOpenChange,
  open,
  primaryAction,
  secondaryAction,
  title,
}: {
  cancelDisabled?: boolean
  cancelLabel?: React.ReactNode
  description?: React.ReactNode
  onOpenChange: (open: boolean) => void
  open: boolean
  primaryAction: ConfirmationDialogAction
  secondaryAction?: ConfirmationDialogAction
  title: React.ReactNode
}) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          {description ? (
            <AlertDialogDescription>{description}</AlertDialogDescription>
          ) : null}
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={cancelDisabled}>
            {cancelLabel}
          </AlertDialogCancel>
          {secondaryAction ? (
            <AlertDialogAction
              disabled={secondaryAction.disabled}
              onClick={secondaryAction.onClick}
              variant={secondaryAction.variant ?? "outline"}
            >
              {secondaryAction.label}
            </AlertDialogAction>
          ) : null}
          <AlertDialogAction
            disabled={primaryAction.disabled}
            onClick={primaryAction.onClick}
            variant={primaryAction.variant ?? "default"}
          >
            {primaryAction.label}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
