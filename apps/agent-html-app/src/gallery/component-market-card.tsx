import {
  ArrowDownToLineIcon,
  CheckCircle2Icon,
  InfoIcon,
  PackageIcon,
} from "lucide-react"

import {
  galleryComponentMarketCategoryLabels,
  type EnabledGalleryComponentTags,
  type GalleryComponentMarketItem,
} from "@/app/gallery/component-market-catalog"
import { GalleryComponentDetailPopoverContent } from "@/app/gallery/component-market-detail-popover"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import { cn } from "@/app/shared/lib/utils"
import { Popover, PopoverTrigger } from "@/app/shared/ui/popover"

export function GalleryComponentMarketCard({
  component,
  enabledTags,
  isInstalled,
  tokenCount,
  onToggleEnabled,
}: {
  component: GalleryComponentMarketItem
  enabledTags: EnabledGalleryComponentTags
  isInstalled: boolean
  tokenCount: number
  onToggleEnabled: (component: GalleryComponentMarketItem) => void
}) {
  return (
    <article
      className={cn(
        "flex min-h-32 min-w-0 flex-col rounded-lg border bg-card p-3 text-left text-card-foreground shadow-xs transition-colors focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50",
        isInstalled ? "border-primary/25 bg-primary/5" : "hover:border-foreground/20"
      )}
    >
      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="grid size-8 shrink-0 place-items-center rounded-lg border bg-background text-muted-foreground">
            <PackageIcon aria-hidden="true" className="size-4" />
          </div>
          <div className="min-w-0">
            <div className="flex min-w-0 items-center gap-1.5">
              <h3 className="min-w-0 truncate text-sm font-medium">
                {component.market.title}
              </h3>
              {isInstalled ? (
                <CheckCircle2Icon
                  aria-label="Installed"
                  className="size-4 shrink-0 text-primary"
                />
              ) : null}
            </div>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {galleryComponentMarketCategoryLabels[component.market.category]}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          <Badge variant="default">{tokenCount.toLocaleString()} tokens</Badge>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                size="icon-sm"
                type="button"
                variant="ghost"
                aria-label={`View ${component.market.title} details`}
              >
                <InfoIcon aria-hidden="true" className="size-4" />
              </Button>
            </PopoverTrigger>
            <GalleryComponentDetailPopoverContent
              component={component}
              enabledTags={enabledTags}
            />
          </Popover>
        </div>
      </div>

      <p className="mt-2 line-clamp-2 text-sm leading-5 text-muted-foreground">
        {component.market.summary}
      </p>

      <div className="mt-auto flex items-center pt-3">
        <Button
          onClick={() => onToggleEnabled(component)}
          size="sm"
          variant={isInstalled ? "outline" : "default"}
        >
          {isInstalled ? (
            <CheckCircle2Icon aria-hidden="true" className="size-4" />
          ) : (
            <ArrowDownToLineIcon aria-hidden="true" className="size-4" />
          )}
          {isInstalled ? "Remove" : "Install"}
        </Button>
      </div>
    </article>
  )
}
