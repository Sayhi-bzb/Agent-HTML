import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

const allowedSignals = [
  "local ui primitives",
  "semantic tokens",
  "compact layout scale",
  "hooks / lib / schema / data",
  "stable kebab-case blocks",
]

const blockedSignals = [
  "raw palette classes",
  "arbitrary values",
  "oversized typography",
  "raw common controls",
  "old runtime imports",
]

function SignalList({ items, label }: { items: string[]; label: string }) {
  return (
    <div className="canvas-stack-md min-w-0">
      <p className="canvas-text-body">{label}</p>
      <div className="canvas-wrap-sm">
        {items.map((item) => (
          <Badge key={item} variant="secondary">
            {item}
          </Badge>
        ))}
      </div>
    </div>
  )
}

export function GuardrailsBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Guardrails</h2>
        <p className="canvas-text-body text-muted-foreground">
          Agent freedom stays inside reusable Canvas boundaries.
        </p>
      </div>

      <div className="canvas-content-panel canvas-grid-gap md:grid-cols-2">
        <SignalList items={allowedSignals} label="Use" />
        <Separator className="md:hidden" />
        <SignalList items={blockedSignals} label="Avoid" />
      </div>
    </section>
  )
}
