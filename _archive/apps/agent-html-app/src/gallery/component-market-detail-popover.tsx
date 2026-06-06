import * as React from "react"

import type {
  EnabledGalleryComponentTags,
  GalleryComponentMarketItem,
} from "@/app/gallery/component-market-catalog"
import { buildGalleryComponentPromptMetrics } from "@/app/gallery/component-market-store"
import { Badge } from "@/app/shared/ui/badge"
import { PopoverContent } from "@/app/shared/ui/popover"

export function GalleryComponentDetailPopoverContent({
  component,
  enabledTags,
}: {
  component: GalleryComponentMarketItem
  enabledTags: EnabledGalleryComponentTags
}) {
  const promptMetrics = React.useMemo(
    () => buildGalleryComponentPromptMetrics(enabledTags, component.tag),
    [component.tag, enabledTags]
  )

  return (
    <PopoverContent align="end" className="w-80" side="top">
      <div className="flex min-w-0 flex-wrap gap-1.5">
        <Badge variant="outline">{component.tag}</Badge>
        <Badge variant="default">
          {promptMetrics.componentTokens.toLocaleString()} tokens
        </Badge>
      </div>

      <div className="space-y-3 pt-3">
        <InlineBadgeRow
          label="Props"
          values={[...(component.market.configurableAttrs ?? ["children"])]}
        />
        <KeyValueRow label="Runtime" value={component.runtime} />
        <KeyValueRow label="Role" value={component.role} />
      </div>
    </PopoverContent>
  )
}

function InlineBadgeRow({
  label,
  values,
  variant = "secondary",
}: {
  label: string
  values: readonly string[]
  variant?: React.ComponentProps<typeof Badge>["variant"]
}) {
  return (
    <div className="flex min-w-0 items-center gap-2">
      <span className="shrink-0 text-xs font-medium uppercase text-muted-foreground">
        {label}
      </span>
      <div className="flex min-w-0 flex-wrap gap-1.5">
        {values.map((value) => (
          <Badge key={value} variant={variant}>
            {value}
          </Badge>
        ))}
      </div>
    </div>
  )
}

function KeyValueRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 items-center justify-between gap-3 text-sm">
      <span className="shrink-0 text-muted-foreground">{label}</span>
      <span className="min-w-0 truncate font-medium">{value}</span>
    </div>
  )
}
