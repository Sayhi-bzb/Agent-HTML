import { assign, setup } from "xstate"

export type CanvasTool = "navigate" | "select"
export type CanvasFocusOwner =
  | "canvas"
  | "nodeChrome"
  | "nodeContent"
  | "none"
  | "overlay"
export type CanvasInteractionPhase =
  | "choosingParent"
  | "idle"
  | "interacting"
  | "marquee"
  | "moving"
  | "panning"
  | "reordering"
  | "resizing"
  | "reparenting"

export type CanvasInteractionContext = {
  focusOwner: CanvasFocusOwner
  reparentingNodeIds: readonly string[]
  selectedNodeIds: readonly string[]
  spacePressed: boolean
  tool: CanvasTool
}

export type CanvasInteractionEvent =
  | { type: "FOCUS.CHANGED"; owner: CanvasFocusOwner }
  | { type: "HIERARCHY.CANCEL" }
  | { type: "HIERARCHY.CHOOSE.START"; nodeIds: readonly string[] }
  | { type: "HIERARCHY.COMMIT.START" }
  | { type: "HIERARCHY.COMMIT.END" }
  | { type: "LAYER.COMMIT.START" }
  | { type: "LAYER.COMMIT.END" }
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
    clearHierarchy: assign({ reparentingNodeIds: [] }),
    clearSpace: assign({ spacePressed: false }),
    resetTransient: assign({
      focusOwner: "none" as const,
      reparentingNodeIds: [],
      spacePressed: false,
    }),
    resetFocusTransient: assign({
      focusOwner: "none" as const,
      spacePressed: false,
    }),
    selectNavigateTool: assign({
      reparentingNodeIds: [],
      spacePressed: false,
      tool: "navigate" as const,
    }),
    selectPointerTool: assign({
      reparentingNodeIds: [],
      spacePressed: false,
      tool: "select" as const,
    }),
    setFocusOwner: assign({
      focusOwner: ({ event }) =>
        event.type === "FOCUS.CHANGED" ? event.owner : "none",
    }),
    setHierarchySelection: assign({
      reparentingNodeIds: ({ event }) =>
        event.type === "HIERARCHY.CHOOSE.START"
          ? [...new Set(event.nodeIds)]
          : [],
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
    reparentingNodeIds: [],
    selectedNodeIds: [],
    spacePressed: false,
    tool: "select",
  },
  initial: "idle",
  on: {
    "FOCUS.CHANGED": { actions: "setFocusOwner" },
    "HIERARCHY.CHOOSE.START": {
      actions: "setHierarchySelection",
      target: ".choosingParent",
    },
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
    choosingParent: {
      on: {
        "HIERARCHY.CANCEL": {
          actions: "clearHierarchy",
          target: "idle",
        },
        "HIERARCHY.COMMIT.START": "reparenting",
      },
    },
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
        "LAYER.COMMIT.START": "reordering",
      },
    },
    interacting: { on: { "PHASE.END": "idle" } },
    marquee: { on: { "PHASE.END": "idle" } },
    moving: { on: { "PHASE.END": "idle" } },
    panning: { on: { "PHASE.END": "idle" } },
    resizing: { on: { "PHASE.END": "idle" } },
    reordering: {
      on: {
        "LAYER.COMMIT.END": "idle",
        "TOOL.NAVIGATE": {},
        "TOOL.SELECT": {},
        "TRANSIENT.RESET": { actions: "resetFocusTransient" },
      },
    },
    reparenting: {
      on: {
        "HIERARCHY.COMMIT.END": {
          actions: "clearHierarchy",
          target: "idle",
        },
        "TOOL.NAVIGATE": {},
        "TOOL.SELECT": {},
        "TRANSIENT.RESET": { actions: "resetFocusTransient" },
      },
    },
  },
})
