export const CANVAS_INSPECTION_VERSION = 2

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

function normalizeSources(value, field) {
  if (!Array.isArray(value) || value.length === 0) {
    throw new TypeError(`Canvas inspection ${field} must be a non-empty array`)
  }
  return [
    ...new Set(
      value.map((source, index) =>
        readRequiredString(source, `${field}[${index}]`)
      )
    ),
  ]
}

function normalizeNode(value, index) {
  if (!isRecord(value)) {
    throw new TypeError(`Canvas inspection nodes[${index}] must be an object`)
  }
  const id = readRequiredString(value.id, `nodes[${index}].id`)
  const siblingOrder = readFiniteNumber(
    value.siblingOrder,
    `nodes.${id}.siblingOrder`
  )
  if (!Number.isInteger(siblingOrder) || siblingOrder < 0) {
    throw new TypeError(
      `Canvas inspection nodes.${id}.siblingOrder must be a non-negative integer`
    )
  }
  return {
    ...normalizeGeometry(value, `nodes.${id}`),
    id,
    ...(value.parentId === undefined
      ? {}
      : {
          parentId: readRequiredString(value.parentId, `nodes.${id}.parentId`),
        }),
    siblingOrder,
    sources: normalizeSources(value.sources, `nodes.${id}.sources`),
  }
}

function normalizeUniqueNodes(values) {
  if (
    !Array.isArray(values) ||
    values.length > maximumCanvasInspectionRecords
  ) {
    throw new TypeError(
      `Canvas inspection nodes must be an array with at most ${maximumCanvasInspectionRecords} entries`
    )
  }
  const ids = new Set()
  return values.map((value, index) => {
    const record = normalizeNode(value, index)
    if (ids.has(record.id)) {
      throw new TypeError(
        `Canvas inspection nodes id ${record.id} is duplicated`
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
  if (typeof value.active !== "boolean") {
    throw new TypeError("Canvas inspection active must be a boolean")
  }
  return {
    active: value.active,
    nodes: normalizeUniqueNodes(value.nodes),
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
      nodeId: node.id,
      sources: node.sources,
    },
  }))
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
  const nodeIds = new Set(document.nodes.map((node) => node.id))
  return {
    nodeCount: document.nodes.length,
    rootNodeIds: document.nodes
      .filter((node) => !node.parentId || !nodeIds.has(node.parentId))
      .map((node) => node.id),
    sourceFilePath: document.sourceFilePath,
  }
}

export function inspectCanvasViewport(document, bounds) {
  const viewport = normalizeGeometry(bounds, "viewport")
  const nodes = inspectionNodes(document)
    .filter((node) => geometriesIntersect(node.absoluteGeometry, viewport))
    .map(({ id, parentId, siblingOrder, sources }) => ({
      id,
      ...(parentId ? { parentId } : {}),
      siblingOrder,
      sources,
    }))
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
      .sort((left, right) => left.siblingOrder - right.siblingOrder)
      .map((candidate) => candidate.id),
    node,
    parentId: node.parentId ?? null,
  }
}

export function resolveCanvasNodeSource(document, nodeId) {
  return inspectCanvasNode(document, nodeId)?.node.source ?? null
}
