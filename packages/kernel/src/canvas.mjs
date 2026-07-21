export const CANVAS_LAYOUT_VERSION = 1

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

export function normalizeCanvasLayout(value) {
  if (value === undefined || value === null) {
    return createEmptyCanvasLayout()
  }
  if (typeof value !== "object" || Array.isArray(value)) {
    throw new TypeError("Canvas layout must be an object")
  }
  if (value.version !== CANVAS_LAYOUT_VERSION) {
    throw new TypeError(
      `Canvas layout version must be ${CANVAS_LAYOUT_VERSION}`
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

  return {
    nodes,
    version: CANVAS_LAYOUT_VERSION,
  }
}
