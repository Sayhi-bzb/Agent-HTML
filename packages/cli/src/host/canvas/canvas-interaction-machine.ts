import { assign, setup } from "xstate"

export type CanvasTool = "navigate" | "select"
export type CanvasFocusOwner =
  | "canvas"
  | "nodeChrome"
  | "nodeContent"
  | "none"
  | "overlay"
export type CanvasInteractionPhase =
  | "idle"
  | "interacting"
  | "marquee"
  | "moving"
  | "panning"
  | "resizing"

export type CanvasInteractionContext = {
  focusOwner: CanvasFocusOwner
  selectedNodeIds: readonly string[]
  spacePressed: boolean
  tool: CanvasTool
}

export type CanvasInteractionEvent =
  | { type: "FOCUS.CHANGED"; owner: CanvasFocusOwner }
  | { type: "PHASE.END" }
  | { type: "PHASE.INTERACT.START" }
  | { type: "PHASE.MARQUEE.START" }
  | { type: "PHASE.MOVE.START" }
  | { type: "PHASE.PAN.START"; source: "middle" | "primary" | "wheel" }
  | { type: "PHASE.RESIZE.START" }
  | { type: "SELECTION.CHANGED"; nodeIds: readonly string[] }
  | { type: "SPACE.DOWN" }
  | { type: "SPACE.UP" }
  | { type: "TOOL.NAVIGATE" }
  | { type: "TOOL.SELECT" }
  | { type: "TRANSIENT.RESET" }

const canvasKeyboardFocusOwners = new Set<CanvasFocusOwner>([
  "canvas",
  "nodeChrome",
])

export function isCanvasNavigateMode(context: CanvasInteractionContext) {
  return context.tool === "navigate" || context.spacePressed
}

export function canvasInteractionPhase(value: unknown): CanvasInteractionPhase {
  return typeof value === "string" ? (value as CanvasInteractionPhase) : "idle"
}

export const canvasInteractionMachine = setup({
  types: {
    context: {} as CanvasInteractionContext,
    events: {} as CanvasInteractionEvent,
  },
  actions: {
    clearSpace: assign({ spacePressed: false }),
    resetTransient: assign({
      focusOwner: "none" as const,
      spacePressed: false,
    }),
    selectNavigateTool: assign({
      spacePressed: false,
      tool: "navigate" as const,
    }),
    selectPointerTool: assign({
      spacePressed: false,
      tool: "select" as const,
    }),
    setFocusOwner: assign({
      focusOwner: ({ event }) =>
        event.type === "FOCUS.CHANGED" ? event.owner : "none",
    }),
    setSelection: assign({
      selectedNodeIds: ({ event }) =>
        event.type === "SELECTION.CHANGED" ? [...new Set(event.nodeIds)] : [],
    }),
    setSpace: assign({ spacePressed: true }),
  },
  guards: {
    canvasKeyboardAvailable: ({ context }) =>
      canvasKeyboardFocusOwners.has(context.focusOwner),
    panAllowed: ({ context, event }) =>
      event.type === "PHASE.PAN.START" &&
      (event.source !== "primary" || isCanvasNavigateMode(context)),
    navigateModeActive: ({ context }) => isCanvasNavigateMode(context),
    selectModeActive: ({ context }) => !isCanvasNavigateMode(context),
  },
}).createMachine({
  id: "canvas-interaction",
  context: {
    focusOwner: "none",
    selectedNodeIds: [],
    spacePressed: false,
    tool: "select",
  },
  initial: "idle",
  on: {
    "FOCUS.CHANGED": { actions: "setFocusOwner" },
    "SELECTION.CHANGED": { actions: "setSelection" },
    "SPACE.DOWN": {
      actions: "setSpace",
      guard: "canvasKeyboardAvailable",
    },
    "SPACE.UP": { actions: "clearSpace" },
    "TOOL.NAVIGATE": {
      actions: "selectNavigateTool",
      target: ".idle",
    },
    "TOOL.SELECT": {
      actions: "selectPointerTool",
      target: ".idle",
    },
    "TRANSIENT.RESET": {
      actions: "resetTransient",
      target: ".idle",
    },
  },
  states: {
    idle: {
      on: {
        "PHASE.INTERACT.START": {
          guard: "navigateModeActive",
          target: "interacting",
        },
        "PHASE.MARQUEE.START": {
          guard: "selectModeActive",
          target: "marquee",
        },
        "PHASE.MOVE.START": {
          guard: "selectModeActive",
          target: "moving",
        },
        "PHASE.PAN.START": {
          guard: "panAllowed",
          target: "panning",
        },
        "PHASE.RESIZE.START": {
          guard: "selectModeActive",
          target: "resizing",
        },
      },
    },
    interacting: { on: { "PHASE.END": "idle" } },
    marquee: { on: { "PHASE.END": "idle" } },
    moving: { on: { "PHASE.END": "idle" } },
    panning: { on: { "PHASE.END": "idle" } },
    resizing: { on: { "PHASE.END": "idle" } },
  },
})
