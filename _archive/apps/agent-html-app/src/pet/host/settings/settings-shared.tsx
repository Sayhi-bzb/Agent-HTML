import type {
  CodexRuntimeCapabilityStatus,
  CodexRuntimeStatus,
} from "@/app/codex/connection"
import type { CodexRuntimeCapabilityItem } from "@/app/codex/connection/types"
import type { CodexSettingsMutation } from "@/app/codex/connection/codex-settings-service"
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
import { Badge } from "@/app/shared/ui/badge"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import { Skeleton } from "@/app/shared/ui/skeleton"
import { cn } from "@/app/shared/lib/utils"

import { formatCapability } from "./utils"

export function SettingsSectionHeader({
  label,
  runtimeStatus,
  status,
}: {
  label: string
  runtimeStatus: CodexRuntimeStatus["status"]
  status: CodexRuntimeCapabilityStatus
}) {
  const isUnavailable = runtimeStatus === "error" && !status.ok

  return (
    <div className="flex items-center justify-between gap-3 border-b border-border/60 pb-2 text-xs">
      <h3 className="text-sm font-medium" data-selection="none">
        {label}
      </h3>
      <span
        className={isUnavailable ? "text-destructive" : "text-muted-foreground"}
        data-cursor={isUnavailable ? "text" : undefined}
        data-selection={isUnavailable ? "text" : "none"}
      >
        {runtimeStatus === "loading" ? (
          <Skeleton className="h-3 w-16" />
        ) : (
          formatCapability(status, runtimeStatus)
        )}
      </span>
    </div>
  )
}

export function CapabilityNameList({
  emptyLabel = "No items reported",
  items,
  onCreateToggleMutation,
  onQueueMutation,
  runtimeStatus,
}: {
  emptyLabel?: string
  items?: CodexRuntimeCapabilityItem[]
  onCreateToggleMutation?: (
    item: CodexRuntimeCapabilityItem,
    enabled: boolean
  ) => CodexSettingsMutation | null
  onQueueMutation?: (mutation: CodexSettingsMutation) => void
  runtimeStatus: CodexRuntimeStatus["status"]
}) {
  if (runtimeStatus === "idle" || runtimeStatus === "loading") {
    return null
  }

  if (!items?.length) {
    return (
      <div
        className="rounded-lg border border-dashed border-border/70 px-3 py-2 text-xs text-muted-foreground"
        data-selection="none"
      >
        {emptyLabel}
      </div>
    )
  }

  return (
    <ScrollArea className="max-h-56">
      <div className="grid gap-1.5">
        {items.map((item) => (
          <div
            className="flex min-w-0 items-center justify-between gap-3 rounded-md px-2.5 py-1.5 text-xs hover:bg-muted/40"
            key={`${item.id ?? item.name}:${item.path ?? item.source ?? ""}`}
          >
            <span
              className="block min-w-0 flex-1 truncate font-medium"
              data-cursor="text"
              data-selection="text"
              title={item.name}
            >
              {item.name}
            </span>
            <CapabilityItemMeta item={item} />
            {onCreateToggleMutation ? (
              <CapabilitySwitch
                item={item}
                onCreateMutation={onCreateToggleMutation}
                onQueueMutation={onQueueMutation}
              />
            ) : null}
          </div>
        ))}
      </div>
    </ScrollArea>
  )
}

function CapabilityItemMeta({ item }: { item: CodexRuntimeCapabilityItem }) {
  const label =
    item.scope ??
    item.authStatus ??
    (typeof item.childrenCount === "number"
      ? `${item.childrenCount} items`
      : undefined) ??
    item.status

  if (!label) {
    return null
  }

  return (
    <Badge className="shrink-0 font-normal" variant="outline">
      {label}
    </Badge>
  )
}

function CapabilitySwitch({
  item,
  onCreateMutation,
  onQueueMutation,
}: {
  item: CodexRuntimeCapabilityItem
  onCreateMutation: (
    item: CodexRuntimeCapabilityItem,
    enabled: boolean
  ) => CodexSettingsMutation | null
  onQueueMutation?: (mutation: CodexSettingsMutation) => void
}) {
  const enabled = item.enabled !== false
  const nextEnabled = !enabled
  const mutation = onCreateMutation(item, nextEnabled)

  if (!mutation) {
    return (
      <span className="shrink-0 text-[0.6875rem] text-muted-foreground">
        Read-only
      </span>
    )
  }

  return (
    <button
      aria-checked={enabled}
      aria-label={`${enabled ? "Disable" : "Enable"} ${item.name}`}
      className={cn(
        "inline-flex h-5 w-9 shrink-0 items-center rounded-full border px-0.5 transition-colors",
        enabled
          ? "border-primary bg-primary"
          : "border-border bg-muted"
      )}
      data-popover-no-drag
      data-window-no-drag
      onClick={() => {
        const nextMutation = onCreateMutation(item, nextEnabled)
        if (nextMutation) {
          onQueueMutation?.(nextMutation)
        }
      }}
      role="switch"
      type="button"
    >
      <span
        className={cn(
          "size-4 rounded-full bg-background shadow-sm transition-transform",
          enabled ? "translate-x-4" : "translate-x-0"
        )}
      />
    </button>
  )
}

export function DetailsBlock({
  children,
  label = "Details",
}: {
  children: React.ReactNode
  label?: string
}) {
  return (
    <details className="group text-xs text-muted-foreground">
      <summary
        className="cursor-pointer select-none py-1 font-medium text-foreground/80 marker:text-muted-foreground"
        data-selection="none"
      >
        {label}
      </summary>
      <div className="mt-2 grid gap-1.5 border-l border-border/60 pl-3">
        {children}
      </div>
    </details>
  )
}

export function CompactMetaRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="grid grid-cols-[7rem_minmax(0,1fr)] gap-3">
      <span data-selection="none">{label}</span>
      <span className="break-all text-foreground" data-cursor="text" data-selection="text">
        {value}
      </span>
    </div>
  )
}

export function SettingsFormSkeleton() {
  return (
    <div className="flex flex-col gap-3" data-selection="none">
      <Skeleton className="h-9 w-full" />
      <div className="flex min-h-0 flex-col gap-1.5">
        <div className="flex items-center justify-between gap-3">
          <Skeleton className="h-3 w-32" />
          <Skeleton className="h-3 w-16" />
        </div>
        <Skeleton className="h-72 w-full rounded-lg" />
      </div>
      <footer className="flex shrink-0 items-center justify-end gap-2">
        <Skeleton className="h-8 w-20" />
        <Skeleton className="h-8 w-16" />
      </footer>
    </div>
  )
}

export function ConfirmSettingsMutationDialog({
  mutation,
  onCancel,
  onConfirm,
}: {
  mutation: CodexSettingsMutation | null
  onCancel: () => void
  onConfirm: () => void
}) {
  return (
    <AlertDialog open={Boolean(mutation)} onOpenChange={(open) => !open && onCancel()}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{mutation?.title ?? "Confirm change"}</AlertDialogTitle>
          <AlertDialogDescription>
            {mutation?.description ??
              "This will send a write request to the Codex app-server."}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <div className="rounded-md border bg-muted/30 px-3 py-2 font-mono text-xs">
          {mutation?.method ?? "unknown"}
        </div>
        <AlertDialogFooter>
          <AlertDialogCancel onClick={onCancel}>Cancel</AlertDialogCancel>
          <AlertDialogAction onClick={onConfirm}>Confirm</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
