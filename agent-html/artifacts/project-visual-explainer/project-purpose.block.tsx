import { ArrowRightIcon, BlocksIcon, EyeIcon, Repeat2Icon } from "lucide-react"

import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { Separator } from "../../components/ui/separator"

const projectSignals = [
  {
    icon: BlocksIcon,
    label: "durable source",
    summary: "React artifact files stay readable after the conversation moves on.",
  },
  {
    icon: EyeIcon,
    label: "inspectable blocks",
    summary: "Stable block metadata lets the host target one semantic region.",
  },
  {
    icon: Repeat2Icon,
    label: "continuous revision",
    summary: "Focused prompts can revise source without flattening the artifact.",
  },
]

export function ProjectPurposeBlock() {
  return (
    <section className="canvas-stack-xl">
      <div className="canvas-stack-md">
        <Badge className="w-fit" variant="secondary">
          React Canvas workspace
        </Badge>
        <div className="canvas-stack-sm">
          <h2 className="canvas-text-title">
            AgentHTML turns agent output into durable, inspectable React work.
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            The project gives agents a local operating context, a preview host,
            and source guardrails so generated artifacts stay addressable after
            the first draft.
          </p>
        </div>
      </div>

      <div className="canvas-grid-gap md:grid-cols-3">
        {projectSignals.map((signal) => {
          const Icon = signal.icon

          return (
            <div
              className="canvas-content-panel-sm canvas-stack-sm min-w-0"
              key={signal.label}
            >
              <div className="canvas-cluster-sm items-center">
                <div className="canvas-icon-box-sm">
                  <Icon />
                </div>
                <Badge variant="outline">{signal.label}</Badge>
              </div>
              <p className="canvas-text-body text-muted-foreground">
                {signal.summary}
              </p>
            </div>
          )
        })}
      </div>

      <Separator />

      <Alert>
        <ArrowRightIcon />
        <AlertDescription>
          Not a Storybook clone: Canvas exists so agent-authored output can be
          reviewed, reused, and revised at block level.
        </AlertDescription>
      </Alert>
    </section>
  )
}
