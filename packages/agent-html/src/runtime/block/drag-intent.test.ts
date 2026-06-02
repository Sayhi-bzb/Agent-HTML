import { describe, expect, it } from "vitest"

import { inferAgentHtmlDropIntentFromPointer } from "@/agent-html/runtime/block/drag-intent"

const target = {
  path: "/Cell/Stack[0]/Block[1]",
  rect: {
    bottom: 200,
    height: 100,
    left: 100,
    right: 500,
    top: 100,
    width: 400,
  },
}

describe("inferAgentHtmlDropIntentFromPointer", () => {
  it("infers before and after from vertical halves", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 300, y: 120 },
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toEqual({ type: "before", targetPath: target.path })

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 300, y: 180 },
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toEqual({ type: "after", targetPath: target.path })
  })

  it("infers column intents from horizontal edge hot zones", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 110, y: 150 },
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toEqual({ type: "column-before", targetPath: target.path })

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 490, y: 150 },
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toEqual({ type: "column-after", targetPath: target.path })
  })

  it("keeps column intents on horizontal edge hot zones", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Cell/Grid[0]/Block[0]",
          },
        ],
        pointer: { x: 490, y: 150 },
        sourcePath: "/Cell/Block[0]",
      })
    ).toEqual({
      type: "column-after",
      targetPath: "/Cell/Grid[0]/Block[0]",
    })
  })

  it("uses current candidate rects when the same pointer is re-evaluated after scroll", () => {
    const pointer = { x: 300, y: 150 }

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Cell/Stack[0]/Block[1]",
            rect: { ...target.rect, bottom: 80, top: -20 },
          },
          {
            ...target,
            path: "/Cell/Stack[0]/Block[2]",
            rect: { ...target.rect, bottom: 220, top: 120 },
          },
        ],
        pointer,
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toEqual({ type: "before", targetPath: "/Cell/Stack[0]/Block[2]" })
  })

  it("rejects self and descendant targets", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 300, y: 120 },
        sourcePath: target.path,
      })
    ).toBeNull()

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Cell/Stack[0]/Block[0]/Stack[0]/Text[0]",
          },
        ],
        pointer: { x: 300, y: 120 },
        sourcePath: "/Cell/Stack[0]/Block[0]",
      })
    ).toBeNull()
  })
})
