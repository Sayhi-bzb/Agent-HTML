import { type Node as FlowNode, type NodeChange } from "@xyflow/react"

import { createCanvasStore } from "./canvas-store"
import type { PersistCanvasLayoutNodes } from "./canvas-layout-persister"
import type {
  CanvasStore,
  CanvasStoreSnapshot,
  ResolvedCanvasNode,
} from "./canvas-store"

export type CanvasFlowNodeData = {
  contentInteractive: boolean
  persistLayout: PersistCanvasLayoutNodes
  requestPersistLayout: PersistCanvasLayoutNodes
  store: CanvasStore
}

export type CanvasFlowNode = FlowNode<CanvasFlowNodeData, "canvas-node">

const ignorePersistLayout: PersistCanvasLayoutNodes = () => {}

export function shouldCullCanvasElements(nodeCount: number) {
  return nodeCount > 100
}

export function getOrCreateCanvasStore(
  stores: Map<string, CanvasStore>,
  filePath: string
) {
  const current = stores.get(filePath)
  if (current) return current
  const next = createCanvasStore(filePath)
  stores.set(filePath, next)
  return next
}

export function projectCanvasSnapshot(
  snapshot: CanvasStoreSnapshot,
  store: CanvasStore,
  selectedNodeIds: ReadonlySet<string>,
  persistLayout: PersistCanvasLayoutNodes = ignorePersistLayout,
  requestPersistLayout = persistLayout,
  contentInteractive = false
) {
  const nodes: CanvasFlowNode[] = snapshot.nodes.map((node) => ({
    data: {
      contentInteractive,
      persistLayout,
      requestPersistLayout,
      store,
    },
    dragHandle: ".canvas-node-hit-layer",
    height: node.height,
    id: node.id,
    parentId: node.parentId,
    position: { x: node.x, y: node.y },
    selected: selectedNodeIds.has(node.id),
    style: contentInteractive ? { pointerEvents: "all" } : undefined,
    type: "canvas-node",
    width: node.width,
  }))
  return { nodes }
}

function resolvedGeometry(node: ResolvedCanvasNode) {
  return {
    height: node.height,
    width: node.width,
    x: node.x,
    y: node.y,
  }
}

export function applyCanvasNodeChanges({
  changes,
  snapshot,
  store,
}: {
  changes: NodeChange<CanvasFlowNode>[]
  snapshot: CanvasStoreSnapshot
  store: CanvasStore
}) {
  const nodes = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const changedGeometry = new Map<string, ReturnType<typeof resolvedGeometry>>()

  for (const change of changes) {
    if (change.type === "position" && change.position) {
      const node = nodes.get(change.id)
      if (!node) continue
      changedGeometry.set(change.id, {
        ...(changedGeometry.get(change.id) ?? resolvedGeometry(node)),
        x: change.position.x,
        y: change.position.y,
      })
    }

    if (change.type === "dimensions" && change.dimensions) {
      const node = nodes.get(change.id)
      if (!node) continue
      changedGeometry.set(change.id, {
        ...(changedGeometry.get(change.id) ?? resolvedGeometry(node)),
        height: change.dimensions.height,
        width: change.dimensions.width,
      })
    }
  }

  for (const [id, geometry] of changedGeometry) {
    store.setNodeGeometry(id, geometry)
  }
}

export function moveCanvasNodes({
  dx,
  dy,
  nodeIds,
  snapshot,
  store,
}: {
  dx: number
  dy: number
  nodeIds: ReadonlySet<string>
  snapshot: CanvasStoreSnapshot
  store: CanvasStore
}) {
  const byId = new Map(snapshot.nodes.map((node) => [node.id, node]))
  const movedNodeIds = [...nodeIds].filter((id) => {
    let parentId = byId.get(id)?.parentId
    while (parentId) {
      if (nodeIds.has(parentId)) return false
      parentId = byId.get(parentId)?.parentId
    }
    return byId.has(id)
  })
  store.setNodeGeometries(
    Object.fromEntries(
      movedNodeIds.map((id) => {
        const node = byId.get(id)!
        return [
          id,
          {
            height: node.height,
            width: node.width,
            x: node.x + dx,
            y: node.y + dy,
          },
        ]
      })
    )
  )
  return movedNodeIds
}
