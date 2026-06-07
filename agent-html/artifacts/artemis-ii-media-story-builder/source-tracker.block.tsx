import { LinkIcon } from "lucide-react"

import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

import {
  artemisIiSourceUrl,
  buildNasaAssetUrl,
  getPhaseLabel,
  type ArtemisMediaItem,
  type StoryBeat,
} from "./data"

type SourceTrackerBlockProps = {
  endpoint: string
  item: ArtemisMediaItem | null
  sourceFocusId: string | null
  storyBeats: StoryBeat[]
}

function buildSourcePayload({
  endpoint,
  item,
  storyBeats,
}: {
  endpoint: string
  item: ArtemisMediaItem | null
  storyBeats: StoryBeat[]
}) {
  return {
    themeSource: {
      status: "source URL verified",
      url: artemisIiSourceUrl,
    },
    mediaDiscovery: {
      status: "NASA Images API search",
      endpoint,
    },
    selectedAsset: item
      ? {
          assetManifest: buildNasaAssetUrl(item.nasaId),
          center: item.center,
          dateCreated: item.dateCreated,
          mediaType: item.mediaType,
          nasaId: item.nasaId,
          title: item.title,
        }
      : {
          status: "source pending verification",
        },
    storyBeats: storyBeats.map((beat) => ({
      assetId: beat.assetId,
      headline: beat.headline,
      phase: getPhaseLabel(beat.phaseId),
      sourceNote: beat.sourceNote,
      verificationStatus: beat.verificationStatus,
    })),
  }
}

export function SourceTrackerBlock({
  endpoint,
  item,
  sourceFocusId,
  storyBeats,
}: SourceTrackerBlockProps) {
  const payload = buildSourcePayload({ endpoint, item, storyBeats })
  const sourceChain = [
    artemisIiSourceUrl,
    endpoint,
    item ? buildNasaAssetUrl(item.nasaId) : "source pending verification",
  ].join("\n")

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">source URL verified</Badge>
          <Badge variant="outline">NASA Images API search</Badge>
          <Badge variant="outline">
            {sourceFocusId ? "selected source chain" : "source pending verification"}
          </Badge>
        </div>
        <h2 className="canvas-text-heading">Source tracker</h2>
        <p className="canvas-text-body text-muted-foreground">
          Trace the story from the NASA theme page to the live search endpoint,
          selected asset manifest, and editable story beats.
        </p>
      </div>

      <div className="canvas-content-panel canvas-stack-md">
        <div className="canvas-cluster-md items-start">
          <span className="canvas-icon-box-sm">
            <LinkIcon />
          </span>
          <div className="canvas-stack-xs min-w-0">
            <p className="canvas-text-caption text-muted-foreground">
              Active source chain
            </p>
            <p className="canvas-text-body">
              {item
                ? `${item.title} (${item.nasaId})`
                : "No selected NASA Images API asset yet."}
            </p>
          </div>
        </div>
        <Separator />
        <div className="canvas-grid-gap md:grid-cols-2">
          {storyBeats.map((beat) => (
            <div className="canvas-content-panel-sm canvas-stack-xs" key={beat.id}>
              <div className="canvas-wrap-sm items-center">
                <Badge variant="outline">{getPhaseLabel(beat.phaseId)}</Badge>
                <Badge variant="secondary">{beat.verificationStatus}</Badge>
              </div>
              <p className="canvas-text-body">{beat.headline}</p>
              <p className="canvas-text-caption break-all text-muted-foreground">
                {beat.sourceNote}
              </p>
            </div>
          ))}
        </div>
      </div>

      <CodeBlock
        caption="Selectable source URLs used by the artifact state."
        code={sourceChain}
        language="text"
        title="Source chain"
        wrap
      />

      <CodeBlock
        caption="Compact source payload derived from local state."
        code={JSON.stringify(payload, null, 2)}
        language="json"
        showLineNumbers
        title="Tracked state"
      />
    </section>
  )
}
