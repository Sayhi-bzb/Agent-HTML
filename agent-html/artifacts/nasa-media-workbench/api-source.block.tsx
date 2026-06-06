import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"

import { buildNasaAssetUrl, type NasaMediaItem } from "./data"

type ApiSourceBlockProps = {
  endpoint: string
  item: NasaMediaItem | null
}

function samplePayload(item: NasaMediaItem | null) {
  if (!item) {
    return {
      selected: null,
    }
  }

  return {
    selected: {
      asset: buildNasaAssetUrl(item.nasaId),
      center: item.center,
      dateCreated: item.dateCreated,
      mediaType: item.mediaType,
      nasaId: item.nasaId,
      title: item.title,
    },
  }
}

export function ApiSourceBlock({ endpoint, item }: ApiSourceBlockProps) {
  const json = JSON.stringify(samplePayload(item), null, 2)
  const endpointText = `${endpoint}
${item ? buildNasaAssetUrl(item.nasaId) : ""}`.trim()

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">source</Badge>
          <Badge variant="outline">remote JSON</Badge>
        </div>
        <h2 className="canvas-text-heading">API and source panel</h2>
        <p className="canvas-text-body text-muted-foreground">
          The artifact can show the live endpoint and the selected media payload
          as selectable, copyable source.
        </p>
      </div>

      <CodeBlock
        caption="The search block drives this endpoint."
        code={endpointText}
        language="text"
        title="NASA endpoints"
        wrap
      />

      <CodeBlock
        caption="This compact payload is derived from the selected result."
        code={json}
        language="json"
        showLineNumbers
        title="Selected media"
      />
    </section>
  )
}
