import { cn } from "../lib/cn"

export type MediaAsset = {
  alt: string
  caption?: string
  credit?: string
  src: string
}

export function MediaFigure({
  asset,
  density = "comfortable",
  figureClassName,
  fit = "cover",
  imageClassName,
  showCaption = true,
  showCredit = true,
}: {
  asset: MediaAsset
  density?: "compact" | "comfortable"
  figureClassName?: string
  fit?: "contain" | "cover"
  imageClassName?: string
  showCaption?: boolean
  showCredit?: boolean
}) {
  const captionParts = [
    showCaption ? asset.caption : undefined,
    showCredit ? asset.credit : undefined,
  ].filter(Boolean)

  return (
    <figure
      className={cn(
        density === "compact" ? "canvas-stack-xs" : "canvas-stack-sm",
        figureClassName
      )}
    >
      <img
        alt={asset.alt}
        className={cn(
          "w-full rounded-md",
          fit === "contain" ? "object-contain" : "object-cover",
          imageClassName
        )}
        src={asset.src}
      />
      {captionParts.length ? (
        <p className="canvas-text-caption text-muted-foreground">
          {captionParts.join(" ")}
          {captionParts.length > 1 ? "." : null}
        </p>
      ) : null}
    </figure>
  )
}
