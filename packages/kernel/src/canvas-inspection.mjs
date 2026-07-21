export const CANVAS_INSPECTION_VERSION = 1

const maximumCanvasInspectionRecords = 100_000

function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readRequiredString(value, field) {
  if (typeof value !== "string" || !value || value !== value.trim()) {
    throw new TypeError(`Canvas inspection ${field} must be a non-empty string`)
  }
  return value
}

function readOptionalString(value, field) {
  return value === undefined ? undefined : readRequiredString(value, field)
}

function readFiniteNumber(value, field) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    throw new TypeError(`Canvas inspection ${field} must be a finite number`)
  }
  return value
}

function normalizeGeometry(value, field) {
  if (!isRecord(value)) {
    throw new TypeError(`Canvas inspection ${field} must be an object`)
  }
  const height = readFiniteNumber(value.height, `${field}.height`)
  const width = readFiniteNumber(value.width, `${field}.width`)
  if (height <= 0 || width <= 0) {
    throw new TypeError(
      `Canvas inspection ${field} dimensions must be positive`
    )
  }
  return {
    height,
    width,
    x: readFiniteNumber(value.x, `${field}.x`),
    y: readFiniteNumber(value.y, `${field}.y`),
  }
}

function normalizeCanvas(value) {
  if (value === null) return null
  if (!isRecord(value)) {
    throw new TypeError("Canvas inspection canvas must be an object or null")
  }
  return {
    id: readRequiredString(value.id, "canvas.id"),
    ...(value.title === undefined
      ? {}
      : { title: readRequiredString(value.title, "canvas.title") }),
  }
}

function normalizeNode(value, index) {
  if (!isRecord(value)) {
    throw new TypeError(`Canvas inspection nodes[${index}] must be an object`)
  }
  const id = readRequiredString(value.id, `nodes[${index}].id`)
  return {
    ...normalizeGeometry(value, `nodes.${id}`),
    id,
    ...(value.index === undefined
      ? {}
      : { index: readOptionalString(value.index, `nodes.${id}.index`) }),
    ...(value.parentId === undefined
      ? {}
      : {
          parentId: readOptionalString(value.parentId, `nodes.${id}.parentId`),
        }),
    ...(value.sourcePath === undefined
      ? {}
      : {
          sourcePath: readOptionalString(
            value.sourcePath,
            `nodes.${id}.sourcePath`
          ),
        }),
    ...(value.title === undefined
      ? {}
      : { title: readOptionalString(value.title, `nodes.${id}.title`) }),
    ...(value.type === undefined
      ? {}
      : { type: readOptionalString(value.type, `nodes.${id}.type`) }),
  }
}

function normalizeUniqueRecords(values, kind, normalize) {
  if (
    !Array.isArray(values) ||
    values.length > maximumCanvasInspectionRecords
  ) {
    throw new TypeError(
      `Canvas inspection ${kind} must be an array with at most ${maximumCanvasInspectionRecords} entries`
    )
  }
  const ids = new Set()
  return values.map((value, index) => {
    const record = normalize(value, index)
    if (ids.has(record.id)) {
      throw new TypeError(
        `Canvas inspection ${kind} id ${record.id} is duplicated`
      )
    }
    ids.add(record.id)
    return record
  })
}

export function normalizeCanvasInspectionDocument(value) {
  if (!isRecord(value)) {
    throw new TypeError("Canvas inspection document must be an object")
  }
  if (value.version !== CANVAS_INSPECTION_VERSION) {
    throw new TypeError(
      `Canvas inspection version must be ${CANVAS_INSPECTION_VERSION}`
    )
  }
  return {
    canvas: normalizeCanvas(value.canvas),
    nodes: normalizeUniqueRecords(value.nodes, "nodes", normalizeNode),
    sourceFilePath: readRequiredString(value.sourceFilePath, "sourceFilePath"),
    version: CANVAS_INSPECTION_VERSION,
  }
}

export function createCanvasInspectionDocument(value) {
  return normalizeCanvasInspectionDocument({
    ...value,
    version: CANVAS_INSPECTION_VERSION,
  })
}

function absoluteGeometryForNode(node, nodesById) {
  let x = node.x
  let y = node.y
  let parentId = node.parentId
  const visited = new Set([node.id])

  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    const parent = nodesById.get(parentId)
    if (!parent) break
    x += parent.x
    y += parent.y
    parentId = parent.parentId
  }

  return { height: node.height, width: node.width, x, y }
}

function inspectionNodes(document) {
  const nodesById = new Map(document.nodes.map((node) => [node.id, node]))
  return document.nodes.map((node) => ({
    ...node,
    absoluteGeometry: absoluteGeometryForNode(node, nodesById),
    source: {
      canvasFilePath: document.sourceFilePath,
      contentFilePath: node.sourcePath ?? null,
      nodeId: node.id,
    },
  }))
}

function geometryBounds(nodes) {
  if (nodes.length === 0) return null
  let left = Number.POSITIVE_INFINITY
  let top = Number.POSITIVE_INFINITY
  let right = Number.NEGATIVE_INFINITY
  let bottom = Number.NEGATIVE_INFINITY
  for (const node of nodes) {
    const geometry = node.absoluteGeometry
    left = Math.min(left, geometry.x)
    top = Math.min(top, geometry.y)
    right = Math.max(right, geometry.x + geometry.width)
    bottom = Math.max(bottom, geometry.y + geometry.height)
  }
  return { height: bottom - top, width: right - left, x: left, y: top }
}

function geometriesIntersect(node, viewport) {
  return (
    node.x < viewport.x + viewport.width &&
    node.x + node.width > viewport.x &&
    node.y < viewport.y + viewport.height &&
    node.y + node.height > viewport.y
  )
}

export function inspectCanvasOverview(document) {
  const nodes = inspectionNodes(document)
  const nodeIds = new Set(nodes.map((node) => node.id))
  return {
    bounds: geometryBounds(nodes),
    canvas: document.canvas,
    nodeCount: nodes.length,
    rootNodeIds: nodes
      .filter((node) => !node.parentId || !nodeIds.has(node.parentId))
      .map((node) => node.id),
    sourceFilePath: document.sourceFilePath,
  }
}

export function inspectCanvasViewport(document, bounds) {
  const viewport = normalizeGeometry(bounds, "viewport")
  const nodes = inspectionNodes(document).filter((node) =>
    geometriesIntersect(node.absoluteGeometry, viewport)
  )
  return {
    bounds: viewport,
    nodes,
    totalNodeCount: document.nodes.length,
  }
}

export function inspectCanvasNode(document, nodeId) {
  const id = readRequiredString(nodeId, "nodeId")
  const nodes = inspectionNodes(document)
  const node = nodes.find((candidate) => candidate.id === id)
  if (!node) return null

  return {
    childIds: nodes
      .filter((candidate) => candidate.parentId === id)
      .map((candidate) => candidate.id),
    node,
    parentId: node.parentId ?? null,
  }
}

export function resolveCanvasNodeSource(document, nodeId) {
  return inspectCanvasNode(document, nodeId)?.node.source ?? null
}
