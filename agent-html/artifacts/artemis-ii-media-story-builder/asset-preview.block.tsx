import {
  ExternalLinkIcon,
  ImageIcon,
  LinkIcon,
  PlusIcon,
  VideoIcon,
} from "lucide-react"

import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"

import {
  buildNasaAssetUrl,
  compactDescription,
  formatNasaDate,
  type ArtemisMediaItem,
} from "./data"
import { useArtemisAssetRendition } from "./hooks"

type AssetPreviewBlockProps = {
  addSelectedItemToStory: () => void
  item: ArtemisMediaItem | null
  setSourceFocusId: (id: string | null) => void
}

function MetadataRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="canvas-stack-xs min-w-0">
      <span className="canvas-text-caption text-muted-foreground">{label}</span>
      <span className="canvas-text-body break-words">{value || "Unknown"}</span>
    </div>
  )
}

export function AssetPreviewBlock({
  addSelectedItemToStory,
  item,
  setSourceFocusId,
}: AssetPreviewBlockProps) {
  const { renditionError, renditionUrl } = useArtemisAssetRendition(item)

  if (!item) {
    return (
      <section className="canvas-content-panel canvas-stack-sm">
        <Badge variant="outline">source pending verification</Badge>
        <h2 className="canvas-text-heading">No asset selected</h2>
        <p className="canvas-text-body text-muted-foreground">
          Run a NASA Images API search and select an asset to preview media,
          metadata, and source links.
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
          <Badge variant="secondary">NASA Images API result</Badge>
        </div>
        <h2 className="canvas-text-title">{item.title}</h2>
        <p className="canvas-text-body text-muted-foreground">
          {compactDescription(item.description, 360)}
        </p>
      </div>

      <div className="canvas-content-panel min-w-0">
        {item.mediaType === "image" ? (
          <img
            alt={item.title}
            className="max-h-96 w-full rounded-md object-contain"
            src={renditionUrl || item.thumbnailUrl}
          />
        ) : renditionUrl ? (
          <video className="max-h-96 w-full rounded-md" controls src={renditionUrl}>
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
                {renditionError ||
                  "Looking up a playable NASA video rendition..."}
              </AlertDescription>
            </Alert>
          </div>
        )}
      </div>

      {renditionError && item.mediaType === "image" ? (
        <Alert>
          <AlertDescription>
            {renditionError} Showing the NASA Images API preview thumbnail.
          </AlertDescription>
        </Alert>
      ) : null}

      <div className="canvas-grid-gap md:grid-cols-3">
        <MetadataRow label="NASA ID" value={item.nasaId} />
        <MetadataRow label="Date" value={formatNasaDate(item.dateCreated)} />
        <MetadataRow label="Center" value={item.center} />
      </div>

      <Separator />

      <div className="canvas-wrap-sm">
        {item.keywords.slice(0, 10).map((keyword) => (
          <Badge key={keyword} variant="secondary">
            {keyword}
          </Badge>
        ))}
      </div>

      <div className="canvas-wrap-sm">
        <Button onClick={addSelectedItemToStory} type="button">
          <PlusIcon data-icon="inline-start" />
          Add to story
        </Button>
        <Button
          onClick={() => setSourceFocusId(item.nasaId)}
          type="button"
          variant="outline"
        >
          <LinkIcon data-icon="inline-start" />
          View source chain
        </Button>
        <Button asChild type="button" variant="outline">
          <a href={buildNasaAssetUrl(item.nasaId)} rel="noreferrer" target="_blank">
            <ExternalLinkIcon data-icon="inline-start" />
            Open manifest
          </a>
        </Button>
      </div>
    </section>
  )
}
