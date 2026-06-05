import type { ArtifactStateChangeInput } from "@agent-html/react"

export type TextEditChangeInput = Pick<
  ArtifactStateChangeInput,
  "after" | "before" | "component" | "controlId" | "kind" | "semantic"
>

export function createTextEditChange({
  component,
  controlId,
  from,
  semantic,
  to,
}: {
  component: string
  controlId: "input" | "textarea"
  from: string
  semantic: string
  to: string
}): TextEditChangeInput | null {
  if (Object.is(from, to)) {
    return null
  }

  return {
    after: to,
    before: from,
    component,
    controlId,
    kind: "set",
    semantic,
  }
}
