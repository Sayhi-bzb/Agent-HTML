import { describe, expect, it } from "vitest"

import { createBlockMessageTarget } from "./use-canvas-prompt-lifecycle"

const target = {
  anchorElement: {} as HTMLElement,
  id: "summary",
  title: "Summary",
  triggerElement: {} as HTMLElement,
}

describe("createBlockMessageTarget", () => {
  it("returns null without an active artifact", () => {
    expect(
      createBlockMessageTarget({
        filePath: null,
        target,
      })
    ).toBeNull()
  })

  it("maps a floating prompt target into a block message target", () => {
    expect(
      createBlockMessageTarget({
        filePath: "agent-html/artifacts/example.artifact.tsx",
        target,
      })
    ).toEqual({
      blockId: "summary",
      filePath: "agent-html/artifacts/example.artifact.tsx",
      title: "Summary",
    })
  })
})
