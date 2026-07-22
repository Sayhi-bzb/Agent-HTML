import { defaultCanvasNodeGeometry } from "./canvas.mjs"

function readNodeId(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`Canvas hierarchy ${field} must be a non-empty string`)
  }
  return value
}

function readNodes(value) {
  if (!Array.isArray(value)) {
    throw new TypeError("Canvas hierarchy nodes must be an array")
  }

  const byId = new Map()
  for (const [index, node] of value.entries()) {
    if (!node || typeof node !== "object" || Array.isArray(node)) {
      throw new TypeError(`Canvas hierarchy nodes.${index} must be an object`)
    }
    const id = readNodeId(node.id, `nodes.${index}.id`)
    if (byId.has(id)) {
      throw new TypeError(`Canvas hierarchy Node id ${id} must be unique`)
    }
    const parentId =
      node.parentId === undefined || node.parentId === null
        ? undefined
        : readNodeId(node.parentId, `nodes.${index}.parentId`)
    byId.set(id, { id, index, parentId })
  }

  for (const node of byId.values()) {
    if (node.parentId && !byId.has(node.parentId)) {
      throw new TypeError(
        `Canvas hierarchy parent Node ${node.parentId} was not found`
      )
    }
    const visited = new Set([node.id])
    let parentId = node.parentId
    while (parentId) {
      if (visited.has(parentId)) {
        throw new TypeError("Canvas hierarchy must not contain a cycle")
      }
      visited.add(parentId)
      parentId = byId.get(parentId)?.parentId
    }
  }

  return byId
}

function geometryForNode(layout, node) {
  return layout?.nodes?.[node.id] ?? defaultCanvasNodeGeometry(node.index)
}

function absoluteGeometry(id, byId, layout, cache) {
  const cached = cache.get(id)
  if (cached) return cached
  const node = byId.get(id)
  const geometry = geometryForNode(layout, node)
  const parent = node.parentId
    ? absoluteGeometry(node.parentId, byId, layout, cache)
    : null
  const absolute = {
    height: geometry.height,
    width: geometry.width,
    x: geometry.x + (parent?.x ?? 0),
    y: geometry.y + (parent?.y ?? 0),
  }
  cache.set(id, absolute)
  return absolute
}

function hasSelectedAncestor(node, selected, byId) {
  let parentId = node.parentId
  while (parentId) {
    if (selected.has(parentId)) return true
    parentId = byId.get(parentId)?.parentId
  }
  return false
}

function isDescendantOf(id, ancestorIds, byId) {
  let currentId = id
  while (currentId) {
    if (ancestorIds.has(currentId)) return true
    currentId = byId.get(currentId)?.parentId
  }
  return false
}

export function resolveCanvasReparenting({
  layout,
  nodeIds,
  nodes,
  parentId = null,
}) {
  const byId = readNodes(nodes)
  if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
    throw new TypeError("Canvas hierarchy nodeIds must not be empty")
  }
  const selected = new Set(
    nodeIds.map((id, index) => readNodeId(id, `nodeIds.${index}`))
  )
  for (const id of selected) {
    if (!byId.has(id)) {
      throw new TypeError(`Canvas hierarchy Node ${id} was not found`)
    }
  }

  const targetParentId =
    parentId === undefined || parentId === null
      ? null
      : readNodeId(parentId, "parentId")
  if (targetParentId && !byId.has(targetParentId)) {
    throw new TypeError(
      `Canvas hierarchy parent Node ${targetParentId} was not found`
    )
  }

  const movedNodes = [...selected]
    .map((id) => byId.get(id))
    .filter((node) => !hasSelectedAncestor(node, selected, byId))
    .sort((left, right) => left.index - right.index)
  const movedNodeIds = movedNodes.map((node) => node.id)
  const movedRoots = new Set(movedNodeIds)
  if (targetParentId && isDescendantOf(targetParentId, movedRoots, byId)) {
    throw new TypeError(
      "Canvas hierarchy parent must not be a moved Node or its descendant"
    )
  }

  const absoluteCache = new Map()
  const targetAbsolute = targetParentId
    ? absoluteGeometry(targetParentId, byId, layout, absoluteCache)
    : { x: 0, y: 0 }
  const geometries = Object.fromEntries(
    movedNodes.map((node) => {
      const absolute = absoluteGeometry(node.id, byId, layout, absoluteCache)
      return [
        node.id,
        {
          height: absolute.height,
          width: absolute.width,
          x: absolute.x - targetAbsolute.x,
          y: absolute.y - targetAbsolute.y,
        },
      ]
    })
  )

  return {
    geometries,
    movedNodeIds,
    parentId: targetParentId,
  }
}
