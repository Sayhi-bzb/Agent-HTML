import { useState } from "react"
import { useEmitArtifactStateChange } from "@agent-html/react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { CodeBlock } from "../../components/code-block"
import { Button } from "../../components/ui/button"
import { Separator } from "../../components/ui/separator"
import { agentNoteTemplate, patchPacket } from "./data"
import { CountBadge, StatusBadge, WorkbenchHeader } from "./shared"

const blockId = "patch-packet"

const validationCommands = `npm run typecheck
npm run test:run
git diff --check`

export function PatchPacketBlock() {
  const emitChange = useEmitArtifactStateChange({ blockId })
  const [copied, setCopied] = useState(false)
  const [packetReady, setPacketReady] = useState(false)

  function markReady() {
    if (packetReady) {
      return
    }

    emitChange({
      after: true,
      before: packetReady,
      component: "patch-packet",
      controlId: "packet-ready",
      kind: "set",
      semantic: "mark-patch-packet-ready",
    })
    setPacketReady(true)
  }

  function copyPacket() {
    if (!navigator.clipboard?.writeText) {
      return
    }

    void navigator.clipboard.writeText(patchPacket).then(() => {
      setCopied(true)
      emitChange({
        after: "copied",
        before: "idle",
        component: "patch-packet",
        controlId: "copy-packet",
        kind: "copy",
        semantic: "copy-patch-packet",
      })
      window.setTimeout(() => setCopied(false), 1600)
    })
  }

  return (
    <section className="canvas-stack-lg">
      <WorkbenchHeader title="Patch packet">
        A copyable handoff surface for the next reviewer: scope, review order,
        validation commands, and next action.
      </WorkbenchHeader>

      <div className="canvas-wrap-sm">
        <CountBadge count={2} label="paths" />
        <CountBadge count={3} label="checks" />
        <CountBadge count={1} label="open question" />
        <StatusBadge status={packetReady ? "Ready" : "Needs human"} />
      </div>

      <CodeBlock
        caption="Concise packet for human review or the next agent turn."
        code={patchPacket}
        language="text"
        title="Handoff packet"
        wrap
      />

      <Separator />

      <div className="canvas-grid-gap md:grid-cols-2">
        <CodeBlock
          caption="Commands stay separate so reviewers can copy only validation."
          code={validationCommands}
          language="bash"
          title="Local validation"
          wrap
        />
        <CodeBlock
          caption="Template for preserving context when the patch changes hands."
          code={agentNoteTemplate}
          language="text"
          title="Agent note template"
          wrap
        />
      </div>

      <div className="canvas-wrap-sm">
        <Button disabled={packetReady} onClick={markReady} type="button">
          <CheckIcon data-icon="inline-start" />
          {packetReady ? "Packet ready" : "Mark packet ready"}
        </Button>
        <Button onClick={copyPacket} type="button" variant="outline">
          <CopyIcon data-icon="inline-start" />
          {copied ? "Copied" : "Copy packet"}
        </Button>
      </div>
    </section>
  )
}
