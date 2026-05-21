import { Badge } from "@/components/ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import type { InspectSnapshot, LogSnapshot } from "@/lib/types"

type InspectTabProps = {
  inspect: InspectSnapshot
  logs: LogSnapshot
}

function getDiagnosticVariant(
  severity: InspectSnapshot["diagnostics"][number]["severity"],
): "destructive" | "outline" | "secondary" {
  if (severity === "error") {
    return "destructive"
  }

  if (severity === "warning") {
    return "outline"
  }

  return "secondary"
}

export function InspectTab({ inspect, logs }: InspectTabProps) {
  return (
    <Card className="app-shell-fill-card">
      <CardHeader>
        <div className="app-shell-split-row">
          <div>
            <CardTitle>Inspect</CardTitle>
            <CardDescription>{inspect.generatedAt}</CardDescription>
          </div>
          <Badge variant="outline">{inspect.diagnostics.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="app-shell-content-stack">
        <div className="app-shell-surface-grid">
          {inspect.diagnostics.map((item) => (
            <div className="app-shell-surface-item" key={item.id}>
              <div className="app-shell-split-row">
                <span>{item.message}</span>
                <Badge variant={getDiagnosticVariant(item.severity)}>
                  {item.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="app-shell-surface-grid min-h-0 flex-1">
          <p className="app-shell-kicker">stdout</p>
          <pre className="app-shell-console">
            {logs.stdout || "n/a"}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
