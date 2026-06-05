import { Badge } from "../../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"

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
    <div className="canvas-stack-md canvas-content-panel-sm min-w-0">
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
    <Card>
      <CardHeader>
        <CardTitle>Guardrails</CardTitle>
        <CardDescription>
          Agent freedom stays inside reusable Canvas boundaries.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-grid-gap md:grid-cols-2">
        <SignalList items={allowedSignals} label="Use" />
        <SignalList items={blockedSignals} label="Avoid" />
      </CardContent>
    </Card>
  )
}
