import { useEffect, useState } from "react"
import {
  Artifact,
  Block,
  useEmitArtifactStateChange,
} from "@agent-html/react"

import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"
import { Checkbox } from "../ui/checkbox"
import { Label } from "../ui/label"
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select"
import { ScrollArea } from "../ui/scroll-area"
import { Slider } from "../ui/slider"

const promptDebugEventName = "agent-html:prompt-debug"

declare global {
  interface Window {
    __agentHtmlLastPrompt?: string
  }
}

export default function InteractionStateArtifact() {
  const [enabled, setEnabled] = useState(false)
  const [status, setStatus] = useState("draft")
  const [threshold, setThreshold] = useState(40)
  const emitChange = useEmitArtifactStateChange({
    blockId: "interaction-controls",
  })

  return (
    <Artifact title="Interaction State Example">
      <Block id="interaction-controls" title="Interaction Controls">
        <Card>
          <CardHeader>
            <CardTitle>Instrumented controls</CardTitle>
            <CardDescription>
              These controls emit semantic state changes that the host can attach
              to a block prompt.
            </CardDescription>
          </CardHeader>
          <CardContent className="canvas-stack-xl">
            <div className="canvas-cluster-md items-center">
              <Checkbox
                checked={enabled}
                id="capture-changes"
                onCheckedChange={(nextChecked) => {
                  const nextValue = nextChecked === true

                  emitChange({
                    after: nextValue,
                    before: enabled,
                    component: "checkbox",
                    controlId: "capture-changes",
                    kind: "toggle",
                    semantic: "toggle-change-capture",
                  })
                  setEnabled(nextValue)
                }}
              />
              <Label htmlFor="capture-changes">Capture state changes</Label>
              <Badge variant={enabled ? "default" : "secondary"}>
                {enabled ? "enabled" : "disabled"}
              </Badge>
            </div>

            <div className="canvas-stack-sm">
              <Label>Status</Label>
              <Select
                onValueChange={(nextValue) => {
                  emitChange({
                    after: nextValue,
                    before: status,
                    component: "select",
                    controlId: "artifact-status",
                    kind: "select",
                    semantic: "set-status",
                  })
                  setStatus(nextValue)
                }}
                value={status}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Choose status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="review">Review</SelectItem>
                    <SelectItem value="ready">Ready</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </div>

            <div className="canvas-stack-sm">
              <div className="canvas-cluster-md items-center justify-between">
                <Label>Animation threshold</Label>
                <Badge variant="outline">{threshold}%</Badge>
              </div>
              <Slider
                max={100}
                min={0}
                onValueCommit={(nextValue) => {
                  const nextThreshold = nextValue[0] ?? threshold

                  emitChange({
                    after: nextThreshold,
                    before: threshold,
                    component: "slider",
                    controlId: "animation-threshold",
                    kind: "set",
                    semantic: "set-animation-threshold",
                  })
                }}
                onValueChange={(nextValue) => {
                  setThreshold(nextValue[0] ?? threshold)
                }}
                step={5}
                value={[threshold]}
              />
            </div>
          </CardContent>
        </Card>
      </Block>

      <Block id="prompt-display" title="Prompt Display">
        <PromptDisplay />
      </Block>
    </Artifact>
  )
}

function PromptDisplay() {
  const [prompt, setPrompt] = useState("")

  useEffect(() => {
    setPrompt(window.__agentHtmlLastPrompt ?? "")

    function handlePromptDebug(event: Event) {
      if (!(event instanceof CustomEvent)) {
        return
      }

      const detail = event.detail as { prompt?: unknown }

      if (typeof detail.prompt === "string") {
        setPrompt(detail.prompt)
      }
    }

    window.addEventListener(promptDebugEventName, handlePromptDebug)

    return () => {
      window.removeEventListener(promptDebugEventName, handlePromptDebug)
    }
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Prompt display</CardTitle>
        <CardDescription>
          Submit a block prompt to preview the generated request.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-96 rounded-lg border bg-muted/30">
          {prompt ? (
            <pre className="whitespace-pre-wrap p-4 text-sm">{prompt}</pre>
          ) : (
            <div className="p-4">
              <p className="canvas-text-body text-muted-foreground">
                No generated prompt yet.
              </p>
            </div>
          )}
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
