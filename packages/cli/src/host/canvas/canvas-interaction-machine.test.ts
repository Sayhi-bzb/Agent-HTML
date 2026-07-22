import { createActor } from "xstate"
import { describe, expect, it } from "vitest"

import {
  canvasInteractionMachine,
  canvasInteractionPhase,
  isCanvasNavigateMode,
} from "./canvas-interaction-machine"

function startInteractionActor() {
  return createActor(canvasInteractionMachine).start()
}

describe("Canvas interaction machine", () => {
  it("starts in Pointer and allows only spatial edit phases", () => {
    const actor = startInteractionActor()
    expect(actor.getSnapshot().context.tool).toBe("select")
    expect(isCanvasNavigateMode(actor.getSnapshot().context)).toBe(false)

    actor.send({ type: "PHASE.PAN.START", source: "primary" })
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("idle")
    actor.send({ type: "PHASE.PAN.START", source: "wheel" })
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("panning")
    actor.send({ type: "PHASE.END" })
    actor.send({ type: "PHASE.MOVE.START" })
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("moving")
  })

  it("uses Space as a temporary Navigate override and restores Pointer", () => {
    const actor = startInteractionActor()
    actor.send({ type: "FOCUS.CHANGED", owner: "canvas" })
    actor.send({ type: "SPACE.DOWN" })
    expect(isCanvasNavigateMode(actor.getSnapshot().context)).toBe(true)
    actor.send({ type: "PHASE.PAN.START", source: "primary" })
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("panning")

    actor.send({ type: "SPACE.UP" })
    actor.send({ type: "PHASE.END" })
    expect(isCanvasNavigateMode(actor.getSnapshot().context)).toBe(false)
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("idle")
  })

  it("preserves content and overlay keyboard ownership", () => {
    const actor = startInteractionActor()
    actor.send({ type: "FOCUS.CHANGED", owner: "nodeContent" })
    actor.send({ type: "SPACE.DOWN" })
    expect(isCanvasNavigateMode(actor.getSnapshot().context)).toBe(false)

    actor.send({ type: "FOCUS.CHANGED", owner: "overlay" })
    actor.send({ type: "SPACE.DOWN" })
    expect(isCanvasNavigateMode(actor.getSnapshot().context)).toBe(false)
  })

  it("retains selection across tools while resetting transient state", () => {
    const actor = startInteractionActor()
    actor.send({
      type: "SELECTION.CHANGED",
      nodeIds: ["card", "card", "chart"],
    })
    actor.send({ type: "TOOL.NAVIGATE" })
    actor.send({ type: "PHASE.PAN.START", source: "primary" })
    actor.send({ type: "TRANSIENT.RESET" })

    expect(actor.getSnapshot().context).toMatchObject({
      focusOwner: "none",
      selectedNodeIds: ["card", "chart"],
      spacePressed: false,
      tool: "navigate",
    })
    expect(canvasInteractionPhase(actor.getSnapshot().value)).toBe("idle")
  })

  it("owns parent picking and protects a pending hierarchy commit", () => {
    const actor = startInteractionActor()
    actor.send({ nodeIds: ["card"], type: "HIERARCHY.CHOOSE.START" })
    expect(actor.getSnapshot().value).toBe("choosingParent")
    expect(actor.getSnapshot().context.reparentingNodeIds).toEqual(["card"])

    actor.send({ type: "HIERARCHY.COMMIT.START" })
    actor.send({ type: "TOOL.NAVIGATE" })
    actor.send({ type: "TRANSIENT.RESET" })
    expect(actor.getSnapshot().value).toBe("reparenting")

    actor.send({ type: "HIERARCHY.COMMIT.END" })
    expect(actor.getSnapshot().value).toBe("idle")
    expect(actor.getSnapshot().context.reparentingNodeIds).toEqual([])
  })
})
