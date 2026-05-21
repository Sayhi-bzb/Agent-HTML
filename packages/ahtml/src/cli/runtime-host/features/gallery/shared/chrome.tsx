import type {
  ComponentPropsWithoutRef,
  PropsWithChildren,
} from "react"

import { cn } from "@/lib/utils"
import { TabsTrigger } from "@/components/ui/tabs"

export function GalleryPreviewMeta({
  label,
  value,
}: {
  label: string
  value: string
}) {
  return (
    <div className="ahtml-gallery-preview-meta rounded-md border bg-card px-3 py-2">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  )
}

export function GalleryToolbarGroup({
  children,
  label,
}: PropsWithChildren<{
  label?: string
}>) {
  return (
    <div className="ahtml-gallery-toolbar-group flex flex-wrap items-center gap-2">
      {label ? (
        <span className="ahtml-gallery-toolbar-group-label">{label}</span>
      ) : null}
      <div className="ahtml-gallery-toolbar-group-body flex flex-wrap items-center gap-2">
        {children}
      </div>
    </div>
  )
}

export function GalleryTabsTriggerPill({
  children,
  className,
  ...props
}: ComponentPropsWithoutRef<typeof TabsTrigger>) {
  return (
    <TabsTrigger
      className={cn("ahtml-gallery-tabs-trigger-pill rounded-md", className)}
      {...props}
    >
      {children}
    </TabsTrigger>
  )
}
