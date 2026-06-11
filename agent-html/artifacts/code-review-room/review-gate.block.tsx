import { Checkbox } from "../../components/ui/checkbox"
import { StatusBadge } from "../../components/ui/status-badge"

const lanes = [
  {
    count: "2",
    detail: "Prove session idempotency before merge.",
    label: "blocking",
    status: "destructive" as const,
  },
  {
    count: "3",
    detail: "Clarify who owns webhook retry recovery.",
    label: "question",
    status: "warning" as const,
  },
  {
    count: "1",
    detail: "Split button cleanup from checkout behavior.",
    label: "follow-up",
    status: "default" as const,
  },
  {
    count: "4",
    detail: "Rename the helper after intent writes are documented.",
    label: "nit",
    status: "default" as const,
  },
]

const checks = [
  "duplicate session regression added",
  "webhook retry replay verified",
  "rollback flag documented",
  "billing owner signed off",
]

export function ReviewGateBlock() {
  return (
    <section className="canvas-stack-md">
      <div className="canvas-stack-xs">
        <p className="canvas-text-caption text-muted-foreground">
          review gate
        </p>
        <h2 className="canvas-text-subheading">
          Comments become release conditions.
        </h2>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,0.58fr)_minmax(260px,0.42fr)]">
        <div className="grid gap-3 rounded-md bg-background p-4 sm:grid-cols-2">
          {lanes.map((lane) => (
            <div
              className="canvas-stack-xs rounded-md bg-muted/40 p-3"
              key={lane.label}
            >
              <div className="flex items-center justify-between gap-2">
                <span className="canvas-text-caption text-muted-foreground">
                  {lane.label}
                </span>
                <StatusBadge status={lane.status}>{lane.count}</StatusBadge>
              </div>
              <p className="canvas-text-body">{lane.detail}</p>
            </div>
          ))}
        </div>

        <div className="canvas-stack-sm rounded-md bg-background p-4">
          <StatusBadge status="warning">ready after evidence lands</StatusBadge>
          {checks.map((check) => (
            <label className="flex items-center gap-3" key={check}>
              <Checkbox />
              <span className="canvas-text-body">{check}</span>
            </label>
          ))}
        </div>
      </div>
    </section>
  )
}
