import { describe, expect, it } from "vitest"

import { inferAgentHtmlDropIntentFromPointer } from "@/agent-html/runtime/block/drag-intent"

const target = {
  path: "/Page/Stack[0]/Text[1]",
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
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "before", targetPath: target.path })

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 300, y: 180 },
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "after", targetPath: target.path })
  })

  it("infers column intents from horizontal edge hot zones", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 110, y: 150 },
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "column-before", targetPath: target.path })

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [target],
        pointer: { x: 490, y: 150 },
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "column-after", targetPath: target.path })
  })

  it("infers inside for vertical drops on grid item stacks", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Page/Stack[0]/Grid[0]/Stack[0]",
            role: "grid-item",
          },
        ],
        pointer: { x: 300, y: 120 },
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "inside", targetPath: "/Page/Stack[0]/Grid[0]/Stack[0]" })
  })

  it("keeps column intents on grid item stack horizontal edge hot zones", () => {
    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Page/Stack[0]/Grid[0]/Stack[0]",
            role: "grid-item",
          },
        ],
        pointer: { x: 490, y: 150 },
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({
      type: "column-after",
      targetPath: "/Page/Stack[0]/Grid[0]/Stack[0]",
    })
  })

  it("uses current candidate rects when the same pointer is re-evaluated after scroll", () => {
    const pointer = { x: 300, y: 150 }

    expect(
      inferAgentHtmlDropIntentFromPointer({
        candidates: [
          {
            ...target,
            path: "/Page/Stack[0]/Text[1]",
            rect: { ...target.rect, bottom: 80, top: -20 },
          },
          {
            ...target,
            path: "/Page/Stack[0]/Text[2]",
            rect: { ...target.rect, bottom: 220, top: 120 },
          },
        ],
        pointer,
        sourcePath: "/Page/Stack[0]/Text[0]",
      })
    ).toEqual({ type: "before", targetPath: "/Page/Stack[0]/Text[2]" })
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
            path: "/Page/Stack[0]/Stack[0]/Text[0]",
          },
        ],
        pointer: { x: 300, y: 120 },
        sourcePath: "/Page/Stack[0]",
      })
    ).toBeNull()
  })
})
