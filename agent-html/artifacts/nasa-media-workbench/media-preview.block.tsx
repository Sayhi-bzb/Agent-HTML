import { ExternalLinkIcon, ImageIcon, VideoIcon } from "lucide-react"

import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"

import {
  compactDescription,
  formatNasaDate,
  type NasaMediaItem,
} from "./data"
import { useNasaVideoRendition } from "./hooks"

type MediaPreviewBlockProps = {
  item: NasaMediaItem | null
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body">{value || "Unknown"}</span>
    </div>
  )
}

export function MediaPreviewBlock({ item }: MediaPreviewBlockProps) {
  const { videoError, videoUrl } = useNasaVideoRendition(item)

  if (!item) {
    return (
      <section className="canvas-content-panel canvas-stack-sm">
        <h2 className="canvas-text-heading">No media selected</h2>
        <p className="canvas-text-body text-muted-foreground">
          Search NASA media to preview an image or video.
        </p>
      </section>
    )
  }

  const KindIcon = item.mediaType === "video" ? VideoIcon : ImageIcon

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge>
            <KindIcon data-icon="inline-start" />
            {item.mediaType}
          </Badge>
          <Badge variant="outline">{item.center}</Badge>
        </div>
        <h2 className="canvas-text-title">{item.title}</h2>
        <p className="canvas-text-body text-muted-foreground">
          {compactDescription(item.description, 320)}
        </p>
      </div>

      <div className="canvas-content-panel min-w-0">
        {item.mediaType === "image" ? (
          <img
            alt={item.title}
            className="max-h-96 w-full rounded-md object-cover"
            src={item.thumbnailUrl}
          />
        ) : videoUrl ? (
          <video className="max-h-96 w-full rounded-md" controls src={videoUrl}>
            <track kind="captions" />
          </video>
        ) : (
          <div className="canvas-stack-md">
            <img
              alt=""
              className="max-h-96 w-full rounded-md object-cover"
              src={item.thumbnailUrl}
            />
            <Alert>
              <AlertDescription>
                {videoError || "Looking up a playable NASA video rendition..."}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      <div className="canvas-grid-gap md:grid-cols-3">
        <MetadataRow label="NASA ID" value={item.nasaId} />
        <MetadataRow label="Date" value={formatNasaDate(item.dateCreated)} />
        <MetadataRow label="Center" value={item.center} />
      </div>

      <Separator />

      <div className="canvas-wrap-sm">
        {item.keywords.slice(0, 8).map((keyword) => (
          <Badge key={keyword} variant="secondary">
            {keyword}
          </Badge>
        ))}
      </div>

      <div>
        <Button asChild type="button" variant="outline">
          <a href={item.assetUrl} rel="noreferrer" target="_blank">
            <ExternalLinkIcon data-icon="inline-start" />
            Open asset manifest
          </a>
        </Button>
      </div>
    </section>
  )
}
