import { describe, expect, it } from "vitest"

import {
  getAgentHtmlBlockLayoutTransition,
  getAgentHtmlBlockLayoutTransitions,
  getAgentHtmlBlockLayoutKeyframes,
  type AgentHtmlBlockLayoutSnapshot,
} from "@/agent-html/runtime/block/layout-transition"

function snapshot(
  path: string,
  motionKey: string,
  rect: Partial<AgentHtmlBlockLayoutSnapshot["rect"]>
): AgentHtmlBlockLayoutSnapshot {
  return {
    motionKey,
    path,
    rect: {
      height: 100,
      left: 0,
      top: 0,
      width: 200,
      ...rect,
    },
  }
}

describe("agent html block layout transitions", () => {
  it("computes FLIP deltas from previous to next rects", () => {
    expect(
      getAgentHtmlBlockLayoutTransition({
        next: snapshot("/Page/Text[1]", "B", {
          height: 50,
          left: 40,
          top: 80,
          width: 100,
        }),
        previous: snapshot("/Page/Text[0]", "B", {
          height: 100,
          left: 10,
          top: 20,
          width: 200,
        }),
      })
    ).toEqual({
      deltaX: -30,
      deltaY: -60,
      scaleX: 2,
      scaleY: 2,
    })
  })

  it("skips visually equivalent rects", () => {
    expect(
      getAgentHtmlBlockLayoutTransition({
        next: snapshot("/Page/Text[0]", "A", { left: 10, top: 10 }),
        previous: snapshot("/Page/Text[0]", "A", { left: 10.2, top: 10.2 }),
      })
    ).toBeNull()
  })

  it("matches moved blocks by unique motion key before path", () => {
    const transitions = getAgentHtmlBlockLayoutTransitions({
      next: [
        snapshot("/Page/Stack[0]/Text[0]", "B", { top: 0 }),
        snapshot("/Page/Stack[0]/Text[1]", "A", { top: 120 }),
      ],
      previous: [
        snapshot("/Page/Stack[0]/Text[0]", "A", { top: 0 }),
        snapshot("/Page/Stack[0]/Text[1]", "B", { top: 120 }),
      ],
    })

    expect(transitions.get("/Page/Stack[0]/Text[0]")).toMatchObject({
      deltaY: 120,
    })
    expect(transitions.get("/Page/Stack[0]/Text[1]")).toMatchObject({
      deltaY: -120,
    })
  })

  it("falls back to path when motion keys are not unique", () => {
    const transitions = getAgentHtmlBlockLayoutTransitions({
      next: [snapshot("/Page/Text[0]", "duplicate", { top: 80 })],
      previous: [
        snapshot("/Page/Text[0]", "duplicate", { top: 10 }),
        snapshot("/Page/Text[1]", "duplicate", { top: 160 }),
      ],
    })

    expect(transitions.get("/Page/Text[0]")).toMatchObject({
      deltaY: -70,
    })
  })

  it("builds keyframes around the top-left origin", () => {
    expect(
      getAgentHtmlBlockLayoutKeyframes({
        deltaX: -30,
        deltaY: -60,
        scaleX: 2,
        scaleY: 2,
      })
    ).toEqual([
      {
        transform: "translate(-30px, -60px) scale(2, 2)",
        transformOrigin: "top left",
      },
      {
        transform: "translate(0, 0) scale(1, 1)",
        transformOrigin: "top left",
      },
    ])
  })
})
