import { Alert, AlertDescription } from "../../components/ui/alert"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"

export function ProjectPurposeBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>AgentHTML Project Visual Explainer</CardTitle>
        <CardDescription>
          A compact map of how this project turns agent output into durable,
          inspectable React artifacts.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-md canvas-text-body">
        <p>
          AgentHTML is an agent artifact workspace. It gives agents a local
          operating context, a React Canvas preview host, and guardrails for
          stable collaboration.
        </p>
        <Alert>
          <AlertDescription>
            The goal is not a Storybook clone. The goal is addressable,
            reviewable, reusable, and continuously editable agent output.
          </AlertDescription>
        </Alert>
        <p className="canvas-text-body text-muted-foreground">
          Use the host overlay icon on this block to ask for a focused rewrite.
        </p>
      </CardContent>
    </Card>
  )
}
