import { useState } from "react"
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
import { Slider } from "../ui/slider"

export default function InteractionStateExample() {
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
    </Artifact>
  )
}
