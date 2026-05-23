import {
  Alert,
  AlertAction,
  AlertDescription,
  AlertTitle,
} from "@/gallery/preview/ui/alert"
import { ShowcaseShell } from "@/gallery/preview/cards/showcase-shell"
import { ShieldCheckIcon, TriangleAlertIcon } from "lucide-react"

export function AlertShowcase() {
  return (
    <ShowcaseShell
      title="Alert"
      description="Inline notice patterns for status, guardrails, and time-sensitive decisions."
      bodyClassName="flex flex-col gap-3"
      footer="Both default and destructive variants stay readable without needing extra shell chrome."
    >
      <Alert>
        <ShieldCheckIcon className="size-4" />
        <AlertTitle>Review lane is synchronized</AlertTitle>
        <AlertDescription>
          Preview tokens are aligned with the current local scene and ready for comparison.
        </AlertDescription>
        <AlertAction>
          <button
            className="type-control rounded-md border border-border px-2 py-1 text-foreground transition-colors hover:bg-muted"
            type="button"
          >
            Inspect
          </button>
        </AlertAction>
      </Alert>

      <Alert variant="destructive">
        <TriangleAlertIcon className="size-4" />
        <AlertTitle>Export route is missing a proof step</AlertTitle>
        <AlertDescription>
          A destructive alert works when the warning carries a real action cost, not generic noise.
        </AlertDescription>
      </Alert>
    </ShowcaseShell>
  )
}

