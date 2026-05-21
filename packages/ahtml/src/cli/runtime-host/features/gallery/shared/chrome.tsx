import type {
  ComponentPropsWithoutRef,
  PropsWithChildren,
} from "react"

import { TabsTrigger } from "@/components/ui/tabs"

export function GalleryPreviewMeta({
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

export function GalleryToolbarGroup({
  children,
  label,
}: PropsWithChildren<{
  label?: string
}>) {
  return (
    <div className="ahtml-gallery-toolbar-group">
      {label ? (
        <span className="ahtml-gallery-toolbar-group-label">{label}</span>
      ) : null}
      <div className="ahtml-gallery-toolbar-group-body">{children}</div>
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
      className={["ahtml-gallery-tabs-trigger-pill", className]
        .filter(Boolean)
        .join(" ")}
      {...props}
    >
      {children}
    </TabsTrigger>
  )
}
