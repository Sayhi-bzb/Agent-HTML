import { CANVAS_LAYOUT_VERSION } from "@agent-html/kernel"
import type {
  CanvasLayoutDocument,
  CanvasNodeGeometry,
} from "@agent-html/kernel"
import type {
  CanvasDefinition,
  CanvasEdgeIntent,
  CanvasIntentRuntime,
  CanvasNodeIntent,
} from "@agent-html/react"

export type ResolvedCanvasNode = CanvasNodeIntent &
  CanvasNodeGeometry & {
    order: number
  }

export type CanvasStoreSnapshot = {
  canvas: CanvasDefinition | null
  edges: CanvasEdgeIntent[]
  nodes: ResolvedCanvasNode[]
}

export type CanvasStore = {
  getLayout: () => CanvasLayoutDocument
  getSnapshot: () => CanvasStoreSnapshot
  hydrateLayout: (layout: CanvasLayoutDocument) => void
  runtime: CanvasIntentRuntime
  setNodeGeometry: (id: string, geometry: CanvasNodeGeometry) => void
  setNodeTarget: (id: string, target: HTMLElement | null) => void
  subscribe: (listener: () => void) => () => void
}

const defaultNodeWidth = 320
const defaultNodeHeight = 180
const defaultNodeGap = 48
const defaultColumns = 4

function defaultGeometry(order: number): CanvasNodeGeometry {
  return {
    height: defaultNodeHeight,
    width: defaultNodeWidth,
    x: (order % defaultColumns) * (defaultNodeWidth + defaultNodeGap),
    y:
      Math.floor(order / defaultColumns) * (defaultNodeHeight + defaultNodeGap),
  }
}

function sourceGeometry(
  node: CanvasNodeIntent,
  order: number
): CanvasNodeGeometry {
  const fallback = defaultGeometry(order)
  return {
    height: node.height ?? fallback.height,
    width: node.width ?? fallback.width,
    x: node.x ?? fallback.x,
    y: node.y ?? fallback.y,
  }
}

function sortResolvedNodes(nodes: ResolvedCanvasNode[]) {
  const byId = new Map(nodes.map((node) => [node.id, node]))
  const depth = (node: ResolvedCanvasNode) => {
    let value = 0
    let parentId = node.parentId
    const visited = new Set<string>()
    while (parentId && !visited.has(parentId)) {
      visited.add(parentId)
      const parent = byId.get(parentId)
      if (!parent) break
      value += 1
      parentId = parent.parentId
    }
    return value
  }
  return nodes.sort(
    (left, right) => depth(left) - depth(right) || left.order - right.order
  )
}

export function createCanvasStore(): CanvasStore {
  let canvas: CanvasDefinition | null = null
  let layout: CanvasLayoutDocument = {
    nodes: {},
    version: CANVAS_LAYOUT_VERSION,
  }
  let nextOrder = 0
  let snapshot: CanvasStoreSnapshot = { canvas, edges: [], nodes: [] }
  const nodes = new Map<string, CanvasNodeIntent & { order: number }>()
  const edges = new Map<string, CanvasEdgeIntent>()
  const targets = new Map<string, HTMLElement>()
  const listeners = new Set<() => void>()
  const targetListeners = new Set<() => void>()
  const nodeRemovalTokens = new Map<string, symbol>()
  const edgeRemovalTokens = new Map<string, symbol>()

  const rebuild = () => {
    snapshot = {
      canvas,
      edges: [...edges.values()],
      nodes: sortResolvedNodes(
        [...nodes.values()].map((node) => ({
          ...node,
          ...(layout.nodes[node.id] ?? sourceGeometry(node, node.order)),
        }))
      ),
    }
    listeners.forEach((listener) => listener())
  }

  const runtime: CanvasIntentRuntime = {
    getNodeTarget: (id) => targets.get(id) ?? null,
    removeEdge(id) {
      const token = Symbol(id)
      edgeRemovalTokens.set(id, token)
      queueMicrotask(() => {
        if (edgeRemovalTokens.get(id) !== token) return
        edgeRemovalTokens.delete(id)
        if (edges.delete(id)) rebuild()
      })
    },
    removeNode(id) {
      const token = Symbol(id)
      nodeRemovalTokens.set(id, token)
      queueMicrotask(() => {
        if (nodeRemovalTokens.get(id) !== token) return
        nodeRemovalTokens.delete(id)
        if (nodes.delete(id)) rebuild()
      })
    },
    setCanvas(definition) {
      canvas = definition
      rebuild()
    },
    subscribeTargets(listener) {
      targetListeners.add(listener)
      return () => targetListeners.delete(listener)
    },
    upsertEdge(edge) {
      edgeRemovalTokens.delete(edge.id)
      edges.set(edge.id, edge)
      rebuild()
    },
    upsertNode(node) {
      nodeRemovalTokens.delete(node.id)
      const current = nodes.get(node.id)
      nodes.set(node.id, {
        ...node,
        order: current?.order ?? nextOrder++,
      })
      rebuild()
    },
  }

  return {
    getLayout() {
      const activeNodes = Object.fromEntries(
        snapshot.nodes.map((node) => [
          node.id,
          {
            height: node.height,
            width: node.width,
            x: node.x,
            y: node.y,
          },
        ])
      )
      return { nodes: activeNodes, version: CANVAS_LAYOUT_VERSION }
    },
    getSnapshot: () => snapshot,
    hydrateLayout(nextLayout) {
      layout = {
        nodes: Object.fromEntries(
          Object.entries(nextLayout.nodes).map(([id, geometry]) => [
            id,
            { ...geometry },
          ])
        ),
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
    },
    runtime,
    setNodeGeometry(id, geometry) {
      if (!nodes.has(id)) return
      layout = {
        nodes: {
          ...layout.nodes,
          [id]: { ...geometry },
        },
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
    },
    setNodeTarget(id, target) {
      if (target) targets.set(id, target)
      else targets.delete(id)
      targetListeners.forEach((listener) => listener())
    },
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
