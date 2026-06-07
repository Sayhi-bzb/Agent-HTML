import { EyeIcon, PlusIcon, Trash2Icon } from "lucide-react"

import { Badge } from "../../components/ui/badge"
import { Button } from "../../components/ui/button"
import {
  Field,
  FieldDescription,
  FieldGroup,
  FieldLabel,
} from "../../components/ui/field"
import {
  NativeSelect,
  NativeSelectOption,
} from "../../components/ui/native-select"
import { ScrollArea } from "../../components/ui/scroll-area"
import { Textarea } from "../../components/ui/textarea"

import {
  artemisTimelinePhases,
  buildNasaAssetUrl,
  getPhaseLabel,
  type ArtemisMediaItem,
  type StoryBeat,
} from "./data"

type StoryBuilderBlockProps = {
  activePhaseId: string
  addSelectedItemToStory: () => void
  items: ArtemisMediaItem[]
  removeStoryBeat: (id: string) => void
  selectedItem: ArtemisMediaItem | null
  setSourceFocusId: (id: string | null) => void
  storyBeats: StoryBeat[]
  updateStoryBeat: (id: string, patch: Partial<StoryBeat>) => void
}

function assetLabel(items: ArtemisMediaItem[], assetId: string | null) {
  if (!assetId) {
    return "source pending verification"
  }

  return items.find((item) => item.nasaId === assetId)?.title ?? assetId
}

export function StoryBuilderBlock({
  activePhaseId,
  addSelectedItemToStory,
  items,
  removeStoryBeat,
  selectedItem,
  setSourceFocusId,
  storyBeats,
  updateStoryBeat,
}: StoryBuilderBlockProps) {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">{storyBeats.length} beats</Badge>
          <Badge variant="outline">{getPhaseLabel(activePhaseId)}</Badge>
          {selectedItem ? (
            <Badge variant="outline">selected {selectedItem.nasaId}</Badge>
          ) : (
            <Badge variant="outline">source pending verification</Badge>
          )}
        </div>
        <h2 className="canvas-text-heading">Story builder</h2>
        <p className="canvas-text-body text-muted-foreground">
          Add selected media, edit the beat text, assign mission phases, and
          keep source notes visible while drafting.
        </p>
      </div>

      <div className="canvas-content-panel canvas-cluster-md items-center justify-between">
        <div className="canvas-stack-xs min-w-0">
          <p className="canvas-text-body">Selected asset</p>
          <p className="canvas-text-caption text-muted-foreground">
            {selectedItem
              ? `${selectedItem.title} (${selectedItem.mediaType})`
              : "Select a NASA Images API result before adding an asset beat."}
          </p>
        </div>
        <Button
          disabled={!selectedItem}
          onClick={addSelectedItemToStory}
          type="button"
        >
          <PlusIcon data-icon="inline-start" />
          Add beat
        </Button>
      </div>

      <ScrollArea className="h-96 rounded-md border">
        <FieldGroup className="p-3">
          {storyBeats.map((beat, index) => (
            <div className="canvas-content-panel-sm canvas-stack-md" key={beat.id}>
              <div className="canvas-cluster-md items-start justify-between">
                <div className="canvas-stack-xs min-w-0">
                  <div className="canvas-wrap-sm items-center">
                    <Badge variant="outline">Beat {index + 1}</Badge>
                    <Badge variant="secondary">
                      {beat.verificationStatus}
                    </Badge>
                  </div>
                  <p className="canvas-text-body">
                    {assetLabel(items, beat.assetId)}
                  </p>
                  <p className="canvas-text-caption break-all text-muted-foreground">
                    {beat.sourceNote}
                  </p>
                </div>
                <div className="canvas-wrap-sm">
                  <Button
                    disabled={!beat.assetId}
                    onClick={() => setSourceFocusId(beat.assetId)}
                    type="button"
                    variant="outline"
                  >
                    <EyeIcon data-icon="inline-start" />
                    Sources
                  </Button>
                  <Button
                    disabled={storyBeats.length === 1}
                    onClick={() => removeStoryBeat(beat.id)}
                    type="button"
                    variant="outline"
                  >
                    <Trash2Icon data-icon="inline-start" />
                    Remove
                  </Button>
                </div>
              </div>

              <Field>
                <FieldLabel htmlFor={`${beat.id}-headline`}>Headline</FieldLabel>
                <Textarea
                  id={`${beat.id}-headline`}
                  onChange={(event) =>
                    updateStoryBeat(beat.id, {
                      headline: event.currentTarget.value,
                    })
                  }
                  value={beat.headline}
                />
              </Field>

              <div className="canvas-grid-gap md:grid-cols-2">
                <Field>
                  <FieldLabel htmlFor={`${beat.id}-phase`}>Phase</FieldLabel>
                  <NativeSelect
                    id={`${beat.id}-phase`}
                    onChange={(event) =>
                      updateStoryBeat(beat.id, {
                        phaseId: event.currentTarget.value,
                      })
                    }
                    value={beat.phaseId}
                  >
                    {artemisTimelinePhases.map((phase) => (
                      <NativeSelectOption key={phase.id} value={phase.id}>
                        {phase.label}
                      </NativeSelectOption>
                    ))}
                  </NativeSelect>
                  <FieldDescription>
                    Assigns the beat to the mission narrative timeline.
                  </FieldDescription>
                </Field>

                <Field>
                  <FieldLabel htmlFor={`${beat.id}-source`}>
                    Source note
                  </FieldLabel>
                  <Textarea
                    id={`${beat.id}-source`}
                    onChange={(event) =>
                      updateStoryBeat(beat.id, {
                        sourceNote: event.currentTarget.value,
                      })
                    }
                    value={
                      beat.assetId
                        ? beat.sourceNote || buildNasaAssetUrl(beat.assetId)
                        : beat.sourceNote
                    }
                  />
                </Field>
              </div>

              <Field>
                <FieldLabel htmlFor={`${beat.id}-angle`}>Story angle</FieldLabel>
                <Textarea
                  id={`${beat.id}-angle`}
                  onChange={(event) =>
                    updateStoryBeat(beat.id, {
                      angle: event.currentTarget.value,
                    })
                  }
                  value={beat.angle}
                />
              </Field>

              <Field>
                <FieldLabel htmlFor={`${beat.id}-narration`}>
                  Narration
                </FieldLabel>
                <Textarea
                  id={`${beat.id}-narration`}
                  onChange={(event) =>
                    updateStoryBeat(beat.id, {
                      narration: event.currentTarget.value,
                    })
                  }
                  value={beat.narration}
                />
              </Field>
            </div>
          ))}
        </FieldGroup>
      </ScrollArea>
    </section>
  )
}
