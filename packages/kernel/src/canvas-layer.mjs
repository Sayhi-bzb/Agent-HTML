export const canvasLayerActions = Object.freeze([
  "bring-to-front",
  "bring-forward",
  "send-backward",
  "send-to-back",
])

const canvasLayerActionSet = new Set(canvasLayerActions)

function readNodeId(value, field) {
  if (typeof value !== "string" || !value.trim()) {
    throw new TypeError(`Canvas layer ${field} must be a non-empty string`)
  }
  return value
}

function reorderSiblings(nodeIds, selectedNodeIds, action) {
  const selected = new Set(selectedNodeIds)
  const next = [...nodeIds]

  if (action === "bring-to-front") {
    return [
      ...next.filter((id) => !selected.has(id)),
      ...next.filter((id) => selected.has(id)),
    ]
  }
  if (action === "send-to-back") {
    return [
      ...next.filter((id) => selected.has(id)),
      ...next.filter((id) => !selected.has(id)),
    ]
  }
  if (action === "bring-forward") {
    for (let index = next.length - 2; index >= 0; index -= 1) {
      if (selected.has(next[index]) && !selected.has(next[index + 1])) {
        ;[next[index], next[index + 1]] = [next[index + 1], next[index]]
      }
    }
    return next
  }
  for (let index = 1; index < next.length; index += 1) {
    if (selected.has(next[index]) && !selected.has(next[index - 1])) {
      ;[next[index - 1], next[index]] = [next[index], next[index - 1]]
    }
  }
  return next
}

export function resolveCanvasLayerOrder({ action, nodeIds, nodes }) {
  if (!canvasLayerActionSet.has(action)) {
    throw new TypeError(`Unsupported Canvas layer action: ${action}`)
  }
  if (!Array.isArray(nodes)) {
    throw new TypeError("Canvas layer nodes must be an array")
  }
  if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
    throw new TypeError("Canvas layer nodeIds must not be empty")
  }

  const byId = new Map()
  nodes.forEach((node, index) => {
    if (!node || typeof node !== "object") {
      throw new TypeError(`Canvas layer nodes.${index} must be an object`)
    }
    const id = readNodeId(node.id, `nodes.${index}.id`)
    if (byId.has(id)) {
      throw new TypeError(`Canvas layer Node id ${id} must be unique`)
    }
    const parentId =
      node.parentId === undefined || node.parentId === null
        ? null
        : readNodeId(node.parentId, `nodes.${index}.parentId`)
    const siblingOrder = node.siblingOrder
    if (!Number.isInteger(siblingOrder) || siblingOrder < 0) {
      throw new TypeError(
        `Canvas layer nodes.${index}.siblingOrder must be a non-negative integer`
      )
    }
    byId.set(id, { id, index, parentId, siblingOrder })
  })

  const selected = [...new Set(nodeIds.map((id) => readNodeId(id, "nodeId")))]
  for (const id of selected) {
    if (!byId.has(id)) {
      throw new TypeError(`Canvas layer Node ${id} was not found`)
    }
  }

  const selectedByParent = new Map()
  for (const id of selected) {
    const parentId = byId.get(id).parentId
    const group = selectedByParent.get(parentId) ?? []
    group.push(id)
    selectedByParent.set(parentId, group)
  }

  const groups = []
  for (const [parentId, selectedIds] of selectedByParent) {
    const siblings = [...byId.values()]
      .filter((node) => node.parentId === parentId)
      .sort(
        (left, right) =>
          left.siblingOrder - right.siblingOrder || left.index - right.index
      )
      .map((node) => node.id)
    const reordered = reorderSiblings(siblings, selectedIds, action)
    if (reordered.some((id, index) => id !== siblings[index])) {
      groups.push({ nodeIds: reordered, parentId })
    }
  }

  return { action, groups }
}
