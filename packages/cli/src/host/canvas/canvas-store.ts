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

type CanvasStoredNode = CanvasNodeIntent & {
  order: number
  orderMarker?: HTMLElement
}

export type ResolvedCanvasNode = CanvasNodeRecord &
  CanvasNodeGeometry & { paintOrder: number }

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

export type CanvasLayerRollback = {
  groups: Array<{
    nodeIds?: string[]
    parentId: string | null
  }>
}

export type CanvasStore = {
  applyLayerOrder: (
    groups: readonly CanvasLayerOrderGroup[]
  ) => CanvasLayerRollback
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
  restoreLayerOrder: (rollback: CanvasLayerRollback) => void
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

export type CanvasLayerOrderGroup = {
  nodeIds: readonly string[]
  parentId: string | null
}

function sortResolvedNodes(nodes: ResolvedCanvasNode[]) {
  const byParent = new Map<string | null, ResolvedCanvasNode[]>()
  for (const node of nodes) {
    const parentId = node.parentId ?? null
    const siblings = byParent.get(parentId) ?? []
    siblings.push(node)
    byParent.set(parentId, siblings)
  }
  for (const siblings of byParent.values()) {
    siblings.sort(
      (left, right) =>
        left.siblingOrder - right.siblingOrder || left.order - right.order
    )
  }
  const ordered: ResolvedCanvasNode[] = []
  const visited = new Set<string>()
  const visit = (node: ResolvedCanvasNode) => {
    if (visited.has(node.id)) return
    visited.add(node.id)
    ordered.push(node)
    for (const child of byParent.get(node.id) ?? []) visit(child)
  }
  for (const root of byParent.get(null) ?? []) visit(root)
  for (const node of nodes) visit(node)
  return ordered.map((node, paintOrder) => ({ ...node, paintOrder }))
}

function deriveSiblingOrders(
  nodes: ReadonlyMap<string, CanvasStoredNode>,
  layerOrderOverrides: ReadonlyMap<string | null, readonly string[]>
) {
  const byParent = new Map<string | null, CanvasStoredNode[]>()
  for (const node of nodes.values()) {
    const parentId = node.parentId ?? null
    const siblings = byParent.get(parentId) ?? []
    siblings.push(node)
    byParent.set(parentId, siblings)
  }
  const records: CanvasNodeRecord[] = []
  for (const [parentId, siblings] of byParent) {
    siblings.sort((left, right) => {
      if (left.orderMarker && right.orderMarker) {
        const position = left.orderMarker.compareDocumentPosition(
          right.orderMarker
        )
        if (position & 4) return -1
        if (position & 2) return 1
      }
      return left.order - right.order
    })
    const override = layerOrderOverrides.get(parentId)
    if (
      override &&
      override.length === siblings.length &&
      override.every((id) => siblings.some((node) => node.id === id))
    ) {
      const byId = new Map(siblings.map((node) => [node.id, node]))
      siblings.splice(
        0,
        siblings.length,
        ...override.map((id) => byId.get(id)!)
      )
    }
    siblings.forEach((node, siblingOrder) => {
      records.push({
        id: node.id,
        order: node.order,
        ...(node.parentId ? { parentId: node.parentId } : {}),
        siblingOrder,
      })
    })
  }
  return records
}

function renderedOrderSignature(nodes: ReadonlyMap<string, CanvasStoredNode>) {
  const groups = new Map<string | null, string[]>()
  for (const node of deriveSiblingOrders(nodes, new Map())) {
    const parentId = node.parentId ?? null
    const ids = groups.get(parentId) ?? []
    ids.push(node.id)
    groups.set(parentId, ids)
  }
  return JSON.stringify(
    [...groups].sort(([left], [right]) =>
      String(left ?? "").localeCompare(String(right ?? ""))
    )
  )
}

export function createCanvasStore(sourceFilePath: string): CanvasStore {
  let active = false
  let layout: CanvasLayoutDocument = {
    nodes: {},
    version: CANVAS_LAYOUT_VERSION,
  }
  let viewport: CanvasViewport | undefined
  let nextOrder = 0
  let lastRenderedOrderSignature = "[]"
  let snapshot: CanvasStoreSnapshot = { active, nodes: [] }
  const nodes = new Map<string, CanvasStoredNode>()
  const layerOrderOverrides = new Map<string | null, string[]>()
  const targets = new Map<string, HTMLElement>()
  const listeners = new Set<() => void>()
  const targetListeners = new Set<() => void>()
  const nodeRemovalTokens = new Map<string, symbol>()

  const rebuild = () => {
    snapshot = {
      active,
      nodes: sortResolvedNodes(
        deriveSiblingOrders(nodes, layerOrderOverrides).map((node) => ({
          ...node,
          ...(layout.nodes[node.id] ?? defaultCanvasNodeGeometry(node.order)),
          paintOrder: 0,
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
        if (nodes.delete(id)) {
          lastRenderedOrderSignature = renderedOrderSignature(nodes)
          rebuild()
        }
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
    syncNodeOrder(id, orderMarker) {
      const current = nodes.get(id)
      if (!current) return
      nodes.set(id, {
        ...current,
        orderMarker: orderMarker ?? undefined,
      })
      const nextRenderedOrderSignature = renderedOrderSignature(nodes)
      if (lastRenderedOrderSignature === nextRenderedOrderSignature) return
      lastRenderedOrderSignature = nextRenderedOrderSignature
      layerOrderOverrides.clear()
      rebuild()
    },
    upsertNode(node) {
      nodeRemovalTokens.delete(node.id)
      const current = nodes.get(node.id)
      nodes.set(node.id, {
        ...node,
        order: current?.order ?? nextOrder++,
      })
      const nextRenderedOrderSignature = renderedOrderSignature(nodes)
      const renderedOrderChanged =
        lastRenderedOrderSignature !== nextRenderedOrderSignature
      if (renderedOrderChanged) layerOrderOverrides.clear()
      const unchanged =
        current && current.parentId === node.parentId && !renderedOrderChanged
      lastRenderedOrderSignature = nextRenderedOrderSignature
      if (unchanged) return
      rebuild()
    },
  }

  return {
    applyLayerOrder(groups) {
      const rollback: CanvasLayerRollback = { groups: [] }
      for (const group of groups) {
        const parentId = group.parentId ?? null
        const siblings = snapshot.nodes.filter(
          (node) => (node.parentId ?? null) === parentId
        )
        if (
          group.nodeIds.length !== siblings.length ||
          group.nodeIds.some((id) => !siblings.some((node) => node.id === id))
        ) {
          throw new Error(
            `Canvas layer group ${parentId ?? "root"} does not match active siblings`
          )
        }
        rollback.groups.push({
          nodeIds: layerOrderOverrides.get(parentId),
          parentId,
        })
        layerOrderOverrides.set(parentId, [...group.nodeIds])
      }
      rebuild()
      return rollback
    },
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
    restoreLayerOrder(rollback) {
      for (const group of rollback.groups) {
        if (group.nodeIds) {
          layerOrderOverrides.set(group.parentId, [...group.nodeIds])
        } else {
          layerOrderOverrides.delete(group.parentId)
        }
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
