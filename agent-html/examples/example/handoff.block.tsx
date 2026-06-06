import { useState } from "react"
import { ClipboardCheckIcon } from "lucide-react"

import { Button } from "../../components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../../components/ui/dialog"
import { Progress } from "../../components/ui/progress"
import { Separator } from "../../components/ui/separator"
import { Textarea } from "../../components/ui/textarea"

import { exampleCopy } from "./copy"

export function HandoffBlock() {
  const [draft, setDraft] = useState(exampleCopy.prompt)
  const progressValue = draft.trim().length > 120 ? 92 : 68

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Block-level handoff</h2>
        <p className="canvas-text-body text-muted-foreground">
          The prompt should name one block and preserve the split structure.
        </p>
      </div>

      <div className="canvas-content-panel canvas-stack-lg">
        <div className="canvas-stack-sm">
          <div className="canvas-cluster-md canvas-text-body items-center justify-between">
            <span>handoff clarity</span>
            <span className="text-muted-foreground">{progressValue}%</span>
          </div>
          <Progress value={progressValue} />
        </div>

        <Textarea
          onChange={(event) => setDraft(event.target.value)}
          value={draft}
        />

        <Dialog>
          <DialogTrigger asChild>
            <Button>
              <ClipboardCheckIcon data-icon="inline-start" />
              Prepare block rewrite
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rewrite one block</DialogTitle>
              <DialogDescription>{draft}</DialogDescription>
            </DialogHeader>
            <DialogFooter showCloseButton>
              <Button type="button">Use selected block</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="canvas-stack-md items-start">
        <Separator />
        <p className="canvas-text-body text-muted-foreground">
          Entry files preserve the map. Block files preserve the local working
          surface.
        </p>
      </div>
    </section>
  )
}
