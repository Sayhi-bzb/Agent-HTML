export const CANVAS_LAYOUT_VERSION = 2
export const DEFAULT_CANVAS_NODE_WIDTH = 320
export const DEFAULT_CANVAS_NODE_HEIGHT = 180
export const DEFAULT_CANVAS_NODE_GAP = 48
export const DEFAULT_CANVAS_NODE_COLUMNS = 4

export function defaultCanvasNodeGeometry(order) {
  if (!Number.isInteger(order) || order < 0) {
    throw new TypeError("Canvas Node order must be a non-negative integer")
  }
  return {
    height: DEFAULT_CANVAS_NODE_HEIGHT,
    width: DEFAULT_CANVAS_NODE_WIDTH,
    x:
      (order % DEFAULT_CANVAS_NODE_COLUMNS) *
      (DEFAULT_CANVAS_NODE_WIDTH + DEFAULT_CANVAS_NODE_GAP),
    y:
      Math.floor(order / DEFAULT_CANVAS_NODE_COLUMNS) *
      (DEFAULT_CANVAS_NODE_HEIGHT + DEFAULT_CANVAS_NODE_GAP),
  }
}

export function createEmptyCanvasLayout() {
  return {
    nodes: {},
    version: CANVAS_LAYOUT_VERSION,
  }
}

function readFiniteNumber(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Canvas layout ${field} must be a finite number`)
  }
  return value
}

export function normalizeCanvasViewport(value) {
  if (value === undefined || value === null) return undefined
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Canvas layout viewport must be an object")
  }
  const zoom = readFiniteNumber(value.zoom, "viewport.zoom")
  if (zoom <= 0) {
    throw new TypeError("Canvas layout viewport zoom must be positive")
  }
  return {
    x: readFiniteNumber(value.x, "viewport.x"),
    y: readFiniteNumber(value.y, "viewport.y"),
    zoom,
  }
}

export function normalizeCanvasLayout(value) {
  if (value === undefined || value === null) {
    return createEmptyCanvasLayout()
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Canvas layout must be an object")
  }
  if (value.version !== 1 && value.version !== CANVAS_LAYOUT_VERSION) {
    throw new TypeError(
      `Canvas layout version must be 1 or ${CANVAS_LAYOUT_VERSION}`
    )
  }
  if (
    typeof value.nodes !== "object" ||
    value.nodes === null ||
    Array.isArray(value.nodes)
  ) {
    throw new TypeError("Canvas layout nodes must be an object")
  }

  const nodes = {}
  for (const [id, geometry] of Object.entries(value.nodes)) {
    if (!id || typeof geometry !== "object" || geometry === null) {
      throw new TypeError(
        "Canvas layout node entries must have an id and geometry"
      )
    }
    const width = readFiniteNumber(geometry.width, `${id}.width`)
    const height = readFiniteNumber(geometry.height, `${id}.height`)
    if (width <= 0 || height <= 0) {
      throw new TypeError(`Canvas layout ${id} dimensions must be positive`)
    }
    nodes[id] = {
      height,
      width,
      x: readFiniteNumber(geometry.x, `${id}.x`),
      y: readFiniteNumber(geometry.y, `${id}.y`),
    }
  }

  const viewport = normalizeCanvasViewport(value.viewport)
  return {
    nodes,
    ...(viewport ? { viewport } : {}),
    version: CANVAS_LAYOUT_VERSION,
  }
}
