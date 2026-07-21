import { Position, type Node as FlowNode, type NodeChange } from "@xyflow/react"

import { createCanvasStore } from "./canvas-store"
import type {
  CanvasStore,
  CanvasStoreSnapshot,
  ResolvedCanvasNode,
} from "./canvas-store"

export type CanvasFlowNodeData = {
  persistLayout: () => void
  requestPersistLayout: () => void
  store: CanvasStore
  title?: string
}

export type CanvasFlowNode = FlowNode<CanvasFlowNodeData, "canvas-node">

const ignorePersistLayout = () => {}

export function shouldCullCanvasElements(nodeCount: number) {
  return nodeCount > 100
}

export function getOrCreateCanvasStore(
  stores: Map<string, CanvasStore>,
  filePath: string
) {
  const current = stores.get(filePath)
  if (current) return current
  const next = createCanvasStore()
  stores.set(filePath, next)
  return next
}

export function projectCanvasSnapshot(
  snapshot: CanvasStoreSnapshot,
  store: CanvasStore,
  selectedNodeIds: ReadonlySet<string>,
  persistLayout = ignorePersistLayout,
  requestPersistLayout = persistLayout
) {
  const nodeIds = new Set(snapshot.nodes.map((node) => node.id))
  const nodes: CanvasFlowNode[] = snapshot.nodes.map((node) => ({
    data: {
      persistLayout,
      requestPersistLayout,
      store,
      title: node.title,
    },
    dragHandle: ".canvas-node-drag-handle",
    height: node.height,
    handles: [
      {
        height: 7,
        id: "default",
        position: Position.Left,
        type: "target",
        width: 7,
        x: -3.5,
        y: node.height / 2 - 3.5,
      },
      {
        height: 7,
        id: "default",
        position: Position.Right,
        type: "source",
        width: 7,
        x: node.width - 3.5,
        y: node.height / 2 - 3.5,
      },
    ],
    id: node.id,
    parentId: node.parentId,
    position: { x: node.x, y: node.y },
    selected: selectedNodeIds.has(node.id),
    type: "canvas-node",
    width: node.width,
  }))
  const edges = snapshot.edges
    .filter((edge) => nodeIds.has(edge.source) && nodeIds.has(edge.target))
    .map((edge) => ({
      id: edge.id,
      source: edge.source,
      sourceHandle: "default",
      target: edge.target,
      targetHandle: "default",
      type: edge.type ?? "smoothstep",
    }))

  return { edges, nodes }
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
