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
import type { CanvasIntentRuntime, CanvasNodeIntent } from "@agent-html/react"
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

type CanvasNodeRecord = CanvasNodeIntent & {
  order: number
  siblingOrder: number
}

export type ResolvedCanvasNode = CanvasNodeRecord & CanvasNodeGeometry

export type CanvasStoreSnapshot = {
  active: boolean
  nodes: ResolvedCanvasNode[]
  viewport?: CanvasViewport
}

export type CanvasHierarchyRollback = {
  nodes: Array<{
    geometry: CanvasNodeGeometry
    id: string
    order: number
    parentId?: string
  }>
}

export type CanvasStore = {
  applyReparenting: (input: {
    geometries: Readonly<Record<string, CanvasNodeGeometry>>
    nodeIds: readonly string[]
    parentId: string | null
  }) => CanvasHierarchyRollback
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
  restoreHierarchy: (rollback: CanvasHierarchyRollback) => void
  runtime: CanvasIntentRuntime
  setNodeGeometries: (
    geometries: Readonly<Record<string, CanvasNodeGeometry>>
  ) => void
  setNodeGeometry: (id: string, geometry: CanvasNodeGeometry) => void
  setNodeTarget: (id: string, target: HTMLElement | null) => void
  setViewport: (viewport: CanvasViewport | undefined) => void
  sourceFilePath: string
  subscribe: (listener: () => void) => () => void
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

function deriveSiblingOrders(
  nodes: ReadonlyMap<string, CanvasNodeIntent & { order: number }>
) {
  const nextByParent = new Map<string | undefined, number>()
  return [...nodes.values()]
    .sort((left, right) => left.order - right.order)
    .map((node): CanvasNodeRecord => {
      const siblingOrder = nextByParent.get(node.parentId) ?? 0
      nextByParent.set(node.parentId, siblingOrder + 1)
      return { ...node, siblingOrder }
    })
}

export function createCanvasStore(sourceFilePath: string): CanvasStore {
  let active = false
  let layout: CanvasLayoutDocument = {
    nodes: {},
    version: CANVAS_LAYOUT_VERSION,
  }
  let viewport: CanvasViewport | undefined
  let nextOrder = 0
  let snapshot: CanvasStoreSnapshot = { active, nodes: [] }
  const nodes = new Map<string, CanvasNodeIntent & { order: number }>()
  const targets = new Map<string, HTMLElement>()
  const listeners = new Set<() => void>()
  const targetListeners = new Set<() => void>()
  const nodeRemovalTokens = new Map<string, symbol>()

  const rebuild = () => {
    snapshot = {
      active,
      nodes: sortResolvedNodes(
        deriveSiblingOrders(nodes).map((node) => ({
          ...node,
          ...(layout.nodes[node.id] ?? defaultCanvasNodeGeometry(node.order)),
        }))
      ),
      ...(viewport ? { viewport: { ...viewport } } : {}),
    }
    listeners.forEach((listener) => listener())
  }

  const getInspectionDocument = () =>
    createCanvasInspectionDocument({
      active: snapshot.active,
      nodes: snapshot.nodes.map((node) => ({
        height: node.height,
        id: node.id,
        ...(node.parentId ? { parentId: node.parentId } : {}),
        siblingOrder: node.siblingOrder,
        sources: [sourceFilePath],
        width: node.width,
        x: node.x,
        y: node.y,
      })),
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
      nodes: { ...layout.nodes, ...nextGeometries },
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
    setCanvasActive(nextActive) {
      active = nextActive
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
    applyReparenting({ geometries, nodeIds, parentId }) {
      const rollback: CanvasHierarchyRollback = { nodes: [] }
      for (const id of nodeIds) {
        const node = nodes.get(id)
        const nextGeometry = geometries[id]
        if (!node || !nextGeometry) {
          throw new Error(`Canvas hierarchy Node ${id} is unavailable`)
        }
        rollback.nodes.push({
          geometry: {
            ...(layout.nodes[id] ?? defaultCanvasNodeGeometry(node.order)),
          },
          id,
          order: node.order,
          ...(node.parentId ? { parentId: node.parentId } : {}),
        })
      }
      for (const id of nodeIds) {
        nodes.set(id, {
          id,
          ...(parentId ? { parentId } : {}),
          order: nextOrder++,
        })
      }
      layout = {
        nodes: { ...layout.nodes, ...geometries },
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
      return rollback
    },
    getInspectionDocument,
    getLayout() {
      return {
        nodes: Object.fromEntries(
          snapshot.nodes.map((node) => [
            node.id,
            {
              height: node.height,
              width: node.width,
              x: node.x,
              y: node.y,
            },
          ])
        ),
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
        layout = { nodes: nextNodes, version: CANVAS_LAYOUT_VERSION }
      }
    },
    restoreHierarchy(rollback) {
      const restoredGeometries: Record<string, CanvasNodeGeometry> = {}
      for (const node of rollback.nodes) {
        nodes.set(node.id, {
          id: node.id,
          ...(node.parentId ? { parentId: node.parentId } : {}),
          order: node.order,
        })
        restoredGeometries[node.id] = { ...node.geometry }
      }
      layout = {
        nodes: { ...layout.nodes, ...restoredGeometries },
        version: CANVAS_LAYOUT_VERSION,
      }
      rebuild()
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
    setViewport(nextViewport) {
      viewport = nextViewport ? { ...nextViewport } : undefined
      rebuild()
    },
    sourceFilePath,
    subscribe(listener) {
      listeners.add(listener)
      return () => listeners.delete(listener)
    },
  }
}
