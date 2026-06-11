import { CodeBlock } from "../../components/code-block"
import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"

const files = [
  {
    consequence: "writes payment intent state",
    file: "api/checkout/session.ts",
    lines: "+96 -28",
    risk: "high",
    size: "h-28 w-44",
    status: "destructive" as const,
    tone: "bg-destructive/35",
    type: "api",
  },
  {
    consequence: "changes idempotency key path",
    file: "billing/payment-client.ts",
    lines: "+42 -13",
    risk: "high",
    size: "h-20 w-36",
    status: "destructive" as const,
    tone: "bg-destructive/25",
    type: "service",
  },
  {
    consequence: "replays stale checkout state",
    file: "jobs/webhook-retry.ts",
    lines: "+68 -31",
    risk: "medium",
    size: "h-24 w-32",
    status: "warning" as const,
    tone: "bg-chart-3/35",
    type: "job",
  },
  {
    consequence: "changes cache lookup shape",
    file: "cache/session-key.ts",
    lines: "+24 -9",
    risk: "medium",
    size: "h-16 w-28",
    status: "warning" as const,
    tone: "bg-chart-3/25",
    type: "cache",
  },
  {
    consequence: "loading state copy only",
    file: "checkout-button.tsx",
    lines: "+18 -14",
    risk: "low",
    size: "h-14 w-24",
    status: "default" as const,
    tone: "bg-muted",
    type: "ui",
  },
  {
    consequence: "covers happy path only",
    file: "checkout-session.test.ts",
    lines: "+52 -0",
    risk: "evidence",
    size: "h-11 w-36",
    status: "success" as const,
    tone: "bg-chart-1/25",
    type: "test",
  },
]
const fileTypes = ["api", "service", "job", "cache", "ui", "test"]
const selectedDiff = `--- api/checkout/session.ts
+++ api/checkout/session.ts
- return createSession(cart, user)
+ const session = await createSession(cart, user, { reuseKey })
+ await recordSessionIntent(session.id, cart.id)
+ return session`

export function DiffRiskMapBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          diff risk map
        </p>
        <h2 className="canvas-text-subheading">
          Changed lines show size. Heat shows consequence.
        </h2>
      </div>

      <div className="grid gap-5 rounded-md bg-background p-4 lg:grid-cols-[minmax(0,0.58fr)_minmax(320px,0.42fr)]">
        <div className="canvas-stack-sm">
          <div className="flex flex-wrap gap-2">
            {fileTypes.map((type) => (
              <Badge key={type} variant="outline">
                {type}
              </Badge>
            ))}
          </div>
          <div className="flex min-h-72 flex-wrap items-end gap-3">
            {files.map((file) => (
              <div
                className={`${file.size} ${file.tone} flex flex-col justify-between rounded-sm p-2`}
                key={file.file}
              >
                <div className="canvas-stack-xs">
                  <div className="flex items-start justify-between gap-2">
                    <p className="truncate font-mono text-xs">{file.file}</p>
                    <StatusBadge status={file.status}>{file.risk}</StatusBadge>
                  </div>
                  <p className="canvas-text-caption text-muted-foreground">
                    {file.consequence}
                  </p>
                </div>
                <p className="font-mono text-xs tracking-normal text-muted-foreground">
                  {file.type} · {file.lines}
                </p>
              </div>
            ))}
          </div>
        </div>
        <CodeBlock
          caption="Selected diff skeleton: the changed lines are small, but the session intent write creates downstream review questions."
          code={selectedDiff}
          language="diff"
          showLineNumbers
          title="selected.diff"
        />
      </div>
    </section>
  )
}
