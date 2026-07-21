import {
  CANVAS_LAYOUT_VERSION,
  defaultCanvasNodeGeometry,
} from "@agent-html/kernel"
import type {
  CanvasInspectionDocument,
  CanvasLayoutDocument,
  CanvasNodeGeometry,
  CanvasViewport,
} from "@agent-html/kernel"
import type {
  CanvasDefinition,
  CanvasIntentRuntime,
  CanvasNodeIntent,
} from "@agent-html/react"
import {
  createCanvasInspectionDocument,
  inspectCanvasNode,
  inspectCanvasOverview,
  inspectCanvasViewport,
  resolveCanvasNodeSource,
} from "./canvas-inspection"
import type {
  CanvasNodeDetailInspection,
  CanvasNodeSourceReference,
  CanvasOverviewInspection,
  CanvasViewportBounds,
  CanvasViewportInspection,
} from "./canvas-inspection"

export type ResolvedCanvasNode = CanvasNodeIntent &
  CanvasNodeGeometry & {
    order: number
  }

export type CanvasStoreSnapshot = {
  canvas: CanvasDefinition | null
  nodes: ResolvedCanvasNode[]
  viewport?: CanvasViewport
}

export type CanvasStore = {
  getInspectionDocument: () => CanvasInspectionDocument
  getLayout: () => CanvasLayoutDocument
  getLayoutNodeIds: () => string[]
  getSnapshot: () => CanvasStoreSnapshot
  hydrateLayout: (layout: CanvasLayoutDocument) => void
  inspectNode: (nodeId: string) => CanvasNodeDetailInspection | null
  inspectOverview: () => CanvasOverviewInspection
  inspectViewport: (bounds: CanvasViewportBounds) => CanvasViewportInspection
  resolveNodeSource: (nodeId: string) => CanvasNodeSourceReference | null
  removeLayoutNodes: (nodeIds: readonly string[]) => void
  runtime: CanvasIntentRuntime
  setNodeGeometries: (
    geometries: Readonly<Record<string, CanvasNodeGeometry>>
  ) => void
  setNodeGeometry: (id: string, geometry: CanvasNodeGeometry) => void
  setNodeTarget: (id: string, target: HTMLElement | null) => void
  setViewport: (viewport: CanvasViewport) => void
  sourceFilePath: string
  subscribe: (listener: () => void) => () => void
}

function sourceGeometry(
  node: CanvasNodeIntent,
  order: number
): CanvasNodeGeometry {
  const fallback = defaultCanvasNodeGeometry(order)
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

export function createCanvasStore(sourceFilePath: string): CanvasStore {
  let canvas: CanvasDefinition | null = null
  let layout: CanvasLayoutDocument = {
    nodes: {},
    version: CANVAS_LAYOUT_VERSION,
  }
  let nextOrder = 0
  let snapshot: CanvasStoreSnapshot = { canvas, nodes: [] }
  const nodes = new Map<string, CanvasNodeIntent & { order: number }>()
  const targets = new Map<string, HTMLElement>()
  const listeners = new Set<() => void>()
  const targetListeners = new Set<() => void>()
  const nodeRemovalTokens = new Map<string, symbol>()

  const rebuild = () => {
    snapshot = {
      canvas,
      nodes: sortResolvedNodes(
        [...nodes.values()].map((node) => ({
          ...node,
          ...(layout.nodes[node.id] ?? sourceGeometry(node, node.order)),
        }))
      ),
      ...(layout.viewport ? { viewport: { ...layout.viewport } } : {}),
    }
    listeners.forEach((listener) => listener())
  }

  const getInspectionDocument = () =>
    createCanvasInspectionDocument({
      canvas: snapshot.canvas,
      nodes: snapshot.nodes,
      sourceFilePath,
    })

  const setNodeGeometries = (
    geometries: Readonly<Record<string, CanvasNodeGeometry>>
  ) => {
    const nextGeometries = Object.fromEntries(
      Object.entries(geometries).filter(([id]) => nodes.has(id))
    )
    if (Object.keys(nextGeometries).length === 0) return
    layout = {
      nodes: {
        ...layout.nodes,
        ...nextGeometries,
      },
      ...(layout.viewport ? { viewport: layout.viewport } : {}),
      version: CANVAS_LAYOUT_VERSION,
    }
    rebuild()
  }

  const runtime: CanvasIntentRuntime = {
    getNodeTarget: (id) => targets.get(id) ?? null,
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
    getInspectionDocument,
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
      return {
        nodes: activeNodes,
        ...(layout.viewport ? { viewport: { ...layout.viewport } } : {}),
        version: CANVAS_LAYOUT_VERSION,
      }
    },
    getLayoutNodeIds: () => Object.keys(layout.nodes),
    getSnapshot: () => snapshot,
    hydrateLayout(nextLayout) {
      layout = {
        nodes: Object.fromEntries(
          Object.entries(nextLayout.nodes).map(([id, geometry]) => [
            id,
            { ...geometry },
          ])
        ),
        ...(nextLayout.viewport
          ? { viewport: { ...nextLayout.viewport } }
          : {}),
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
    },
    inspectNode(nodeId) {
      return inspectCanvasNode(getInspectionDocument(), nodeId)
    },
    inspectOverview() {
      return inspectCanvasOverview(getInspectionDocument())
    },
    inspectViewport(bounds) {
      return inspectCanvasViewport(getInspectionDocument(), bounds)
    },
    resolveNodeSource(nodeId) {
      return resolveCanvasNodeSource(getInspectionDocument(), nodeId)
    },
    removeLayoutNodes(nodeIds) {
      const nextNodes = { ...layout.nodes }
      let changed = false
      for (const nodeId of nodeIds) {
        if (!Object.hasOwn(nextNodes, nodeId)) continue
        delete nextNodes[nodeId]
        changed = true
      }
      if (changed) {
        layout = {
          nodes: nextNodes,
          ...(layout.viewport ? { viewport: layout.viewport } : {}),
          version: CANVAS_LAYOUT_VERSION,
        }
      }
    },
    runtime,
    setNodeGeometries,
    setNodeGeometry(id, geometry) {
      setNodeGeometries({ [id]: geometry })
    },
    setNodeTarget(id, target) {
      if (target) targets.set(id, target)
      else targets.delete(id)
      targetListeners.forEach((listener) => listener())
    },
    setViewport(viewport) {
      layout = {
        ...layout,
        viewport: { ...viewport },
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
    },
    sourceFilePath,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
