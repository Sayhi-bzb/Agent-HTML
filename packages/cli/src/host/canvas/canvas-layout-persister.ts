import { saveCanvasLayoutPatch } from "../api/api"
import type { CanvasViewport } from "@agent-html/kernel"
import type { CanvasStore } from "./canvas-store"

export type PersistCanvasLayoutNodes = (nodeIds: readonly string[]) => void

export function createLayoutPersister({
  delay = 120,
  filePath,
  onPersistError,
  save = saveCanvasLayoutPatch,
  store,
}: {
  delay?: number
  filePath: string
  onPersistError: (error: string | null) => void
  save?: typeof saveCanvasLayoutPatch
  store: CanvasStore
}) {
  let saveQueue = Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | null = null
  const pendingNodeIds = new Set<string>()
  const pendingRemovedNodeIds = new Set<string>()
  let pendingViewport: CanvasViewport | undefined

  const markPending = (nodeIds: readonly string[]) => {
    for (const nodeId of nodeIds) pendingNodeIds.add(nodeId)
  }

  const persist = () => {
    const nodeIds = [...pendingNodeIds]
    pendingNodeIds.clear()
    const activeNodeIds = new Set(
      store.getSnapshot().nodes.map((node) => node.id)
    )
    const removedNodeIds = [
      ...new Set([...pendingRemovedNodeIds, ...store.getLayoutNodeIds()]),
    ].filter((nodeId) => !activeNodeIds.has(nodeId))
    pendingRemovedNodeIds.clear()
    const layout = store.getLayout()
    const viewport = pendingViewport
    pendingViewport = undefined
    const nodes = Object.fromEntries(
      nodeIds.flatMap((nodeId) => {
        const geometry = layout.nodes[nodeId]
        return geometry ? [[nodeId, geometry]] : []
      })
    )
    if (
      Object.keys(nodes).length === 0 &&
      removedNodeIds.length === 0 &&
      !viewport
    )
      return

    saveQueue = saveQueue
      .catch(() => undefined)
      .then(() =>
        save({
          filePath,
          nodes,
          removedNodeIds,
          ...(viewport ? { viewport } : {}),
        })
      )
      .then(
        () => {
          const activeAfterSave = new Set(
            store.getSnapshot().nodes.map((node) => node.id)
          )
          const committedRemovals = removedNodeIds.filter(
            (nodeId) => !activeAfterSave.has(nodeId)
          )
          const reappearedNodeIds = removedNodeIds.filter((nodeId) =>
            activeAfterSave.has(nodeId)
          )
          store.removeLayoutNodes(committedRemovals)
          if (reappearedNodeIds.length > 0) {
            markPending(reappearedNodeIds)
            persist()
          }
          onPersistError(null)
        },
        (error: unknown) => {
          markPending(nodeIds)
          for (const nodeId of removedNodeIds) {
            pendingRemovedNodeIds.add(nodeId)
          }
          pendingViewport =
            pendingViewport ?? store.getSnapshot().viewport ?? viewport
          onPersistError(error instanceof Error ? error.message : String(error))
        }
      )
  }

  return {
    commit(nodeIds: readonly string[]) {
      markPending(nodeIds)
      if (timer) clearTimeout(timer)
      timer = null
      persist()
    },
    commitViewport(viewport: CanvasViewport) {
      store.setViewport(viewport)
      pendingViewport = viewport
      if (timer) clearTimeout(timer)
      timer = null
      persist()
    },
    dispose() {
      if (timer) clearTimeout(timer)
      timer = null
    },
    request(nodeIds: readonly string[]) {
      markPending(nodeIds)
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        persist()
      }, delay)
    },
    reconcile() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        persist()
      }, delay)
    },
  }
}
