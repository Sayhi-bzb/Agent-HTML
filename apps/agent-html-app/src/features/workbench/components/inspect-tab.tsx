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
    <Card className="h-full">
      <CardHeader>
        <div className="flex items-center justify-between gap-2">
          <div>
            <CardTitle>Inspect</CardTitle>
            <CardDescription>{inspect.generatedAt}</CardDescription>
          </div>
          <Badge variant="outline">{inspect.diagnostics.length} items</Badge>
        </div>
      </CardHeader>
      <CardContent className="flex h-full min-h-0 flex-col gap-4">
        <div className="grid gap-2">
          {inspect.diagnostics.map((item) => (
            <div className="rounded-lg border px-3 py-2 text-sm" key={item.id}>
              <div className="flex items-center justify-between gap-2">
                <span>{item.message}</span>
                <Badge variant={getDiagnosticVariant(item.severity)}>
                  {item.severity}
                </Badge>
              </div>
            </div>
          ))}
        </div>
        <Separator />
        <div className="grid min-h-0 flex-1 gap-2">
          <p className="text-xs uppercase text-muted-foreground">stdout</p>
          <pre className="min-h-0 overflow-auto rounded-lg border bg-muted p-3 text-xs">
            {logs.stdout || "n/a"}
          </pre>
        </div>
      </CardContent>
    </Card>
  )
}
