import {
  Background,
  BackgroundVariant,
  Controls,
  Handle,
  NodeResizer,
  Position,
  ReactFlow,
  type NodeProps,
  type OnNodesChange,
  type ResizeParams,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import * as React from "react"
import { CanvasIntentProvider } from "@agent-html/react"

import {
  canvasBundleUrl,
  fetchCanvasLayout,
  saveCanvasLayout,
} from "../api/api"
import {
  applyCanvasNodeChanges,
  getOrCreateCanvasStore,
  projectCanvasSnapshot,
  shouldCullCanvasElements,
  type CanvasFlowNode,
} from "./canvas-flow-model"
import type { CanvasStore } from "./canvas-store"

type CanvasModule = {
  default: React.ComponentType
}

const canvasNodeTypes = {
  "canvas-node": CanvasNodeShell,
}

const ignoreEdgeChanges = () => {}

function useCanvasStoreSnapshot(store: CanvasStore) {
  return React.useSyncExternalStore(
    store.subscribe,
    store.getSnapshot,
    store.getSnapshot
  )
}

function CanvasNodeShell({ data, id, selected }: NodeProps<CanvasFlowNode>) {
  const { persistLayout, requestPersistLayout, store, title } = data
  const setTarget = React.useCallback(
    (target: HTMLDivElement | null) => store.setNodeTarget(id, target),
    [id, store]
  )
  const setGeometry = React.useCallback(
    (_event: unknown, geometry: ResizeParams) => {
      store.setNodeGeometry(id, geometry)
      requestPersistLayout()
    },
    [id, requestPersistLayout, store]
  )
  const finishResize = React.useCallback(
    (_event: unknown, geometry: ResizeParams) => {
      store.setNodeGeometry(id, geometry)
      persistLayout()
    },
    [id, persistLayout, store]
  )

  return (
    <div
      className="canvas-node-shell"
      data-selected={selected ? "" : undefined}
    >
      <NodeResizer
        isVisible={selected}
        minHeight={40}
        minWidth={80}
        onResize={setGeometry}
        onResizeEnd={finishResize}
      />
      <div className="canvas-node-drag-handle" title={title ?? id}>
        <span>{title ?? id}</span>
      </div>
      <div
        className="canvas-node-content nodrag nowheel nopan"
        ref={setTarget}
      />
      <Handle
        className="canvas-node-handle"
        id="default"
        position={Position.Left}
        type="target"
      />
      <Handle
        className="canvas-node-handle"
        id="default"
        position={Position.Right}
        type="source"
      />
    </div>
  )
}

function useCanvasModule({
  filePath,
  version,
}: {
  filePath: string | null
  version: number
}) {
  const requestKey = filePath ? `${filePath}:${version}` : null
  const [state, setState] = React.useState<{
    component: React.ComponentType | null
    error: string | null
    requestKey: string
  }>({ component: null, error: null, requestKey: "" })

  React.useEffect(() => {
    if (!filePath || !requestKey) return
    let current = true
    void import(/* @vite-ignore */ canvasBundleUrl(filePath, version))
      .then((module: CanvasModule) => {
        if (!current) return
        if (typeof module.default !== "function") {
          throw new Error(`Canvas ${filePath} does not export a component`)
        }
        setState({ component: module.default, error: null, requestKey })
      })
      .catch((error: unknown) => {
        if (!current) return
        setState({
          component: null,
          error: error instanceof Error ? error.message : String(error),
          requestKey,
        })
      })

    return () => {
      current = false
    }
  }, [filePath, requestKey, version])

  if (!requestKey) return { component: null, error: null, loading: false }
  if (state.requestKey !== requestKey) {
    return { component: null, error: null, loading: true }
  }
  return { ...state, loading: false }
}

function createLayoutPersister({
  filePath,
  onPersistError,
  store,
}: {
  filePath: string
  onPersistError: (error: string | null) => void
  store: CanvasStore
}) {
  let saveQueue = Promise.resolve()
  let timer: ReturnType<typeof setTimeout> | null = null
  const persist = () => {
    const layout = store.getLayout()
    saveQueue = saveQueue
      .catch(() => undefined)
      .then(() => saveCanvasLayout({ filePath, layout }))
      .then(
        () => onPersistError(null),
        (error: unknown) =>
          onPersistError(error instanceof Error ? error.message : String(error))
      )
  }

  return {
    commit() {
      if (timer) clearTimeout(timer)
      timer = null
      persist()
    },
    dispose() {
      if (timer) clearTimeout(timer)
      timer = null
    },
    request() {
      if (timer) clearTimeout(timer)
      timer = setTimeout(() => {
        timer = null
        persist()
      }, 120)
    },
  }
}

function CanvasWorkspace({
  component: Source,
  filePath,
  onPersistError,
  store,
}: {
  component: React.ComponentType
  filePath: string
  onPersistError: (error: string | null) => void
  store: CanvasStore
}) {
  const snapshot = useCanvasStoreSnapshot(store)
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const persister = React.useMemo(
    () => createLayoutPersister({ filePath, onPersistError, store }),
    [filePath, onPersistError, store]
  )
  React.useEffect(() => () => persister.dispose(), [persister])
  const projection = React.useMemo(
    () =>
      projectCanvasSnapshot(
        snapshot,
        store,
        selectedNodeIds,
        persister.commit,
        persister.request
      ),
    [persister, selectedNodeIds, snapshot, store]
  )
  const onNodesChange = React.useCallback<OnNodesChange<CanvasFlowNode>>(
    (changes) => {
      applyCanvasNodeChanges({ changes, snapshot, store })
      const selectionChanges = changes.filter(
        (change) => change.type === "select"
      )
      if (selectionChanges.length > 0) {
        setSelectedNodeIds((current) => {
          const next = new Set(current)
          for (const change of selectionChanges) {
            if (change.type !== "select") continue
            if (change.selected) next.add(change.id)
            else next.delete(change.id)
          }
          return next
        })
      }
      if (
        changes.some(
          (change) =>
            (change.type === "position" && change.dragging === false) ||
            (change.type === "dimensions" && change.resizing === false)
        )
      ) {
        persister.commit()
      }
    },
    [persister, snapshot, store]
  )

  return (
    <div
      className="canvas-workspace"
      data-edge-count={snapshot.edges.length}
      data-node-count={snapshot.nodes.length}
      data-projected-edge-count={projection.edges.length}
      data-testid="canvas-workspace"
    >
      <CanvasIntentProvider runtime={store.runtime}>
        <Source />
      </CanvasIntentProvider>
      {snapshot.canvas ? (
        <ReactFlow<CanvasFlowNode>
          deleteKeyCode={null}
          edges={projection.edges}
          elementsSelectable
          fitView
          fitViewOptions={{ padding: 0.18 }}
          minZoom={0.08}
          nodeTypes={canvasNodeTypes}
          nodes={projection.nodes}
          nodesConnectable={false}
          nodesDraggable
          onEdgesChange={ignoreEdgeChanges}
          onNodeDragStop={persister.commit}
          onNodesChange={onNodesChange}
          onlyRenderVisibleElements={shouldCullCanvasElements(
            snapshot.nodes.length
          )}
          panOnDrag
          selectionOnDrag
          zoomOnDoubleClick={false}
        >
          <Background
            color="var(--canvas-grid-dot)"
            gap={24}
            size={1.25}
            variant={BackgroundVariant.Dots}
          />
          <Controls position="bottom-right" showInteractive={false} />
        </ReactFlow>
      ) : null}
    </div>
  )
}

export function CanvasSurface({
  activeFilePath,
  canvasCount,
  canvasRegistryVersion,
  canvasesLoading,
  loadError,
}: {
  activeFilePath: string | null
  canvasCount: number
  canvasRegistryVersion: number
  canvasesLoading: boolean
  loadError: string | null
}) {
  const [stores] = React.useState(() => new Map<string, CanvasStore>())
  const [layoutState, setLayoutState] = React.useState<{
    error: string | null
    filePath: string | null
    ready: boolean
  }>({ error: null, filePath: null, ready: false })
  const [persistState, setPersistState] = React.useState<{
    error: string | null
    filePath: string
  } | null>(null)
  const store = React.useMemo(() => {
    if (!activeFilePath) return null
    return getOrCreateCanvasStore(stores, activeFilePath)
  }, [activeFilePath, stores])
  const handlePersistError = React.useCallback(
    (error: string | null) => {
      if (activeFilePath) setPersistState({ error, filePath: activeFilePath })
    },
    [activeFilePath]
  )
  const moduleState = useCanvasModule({
    filePath: activeFilePath,
    version: canvasRegistryVersion,
  })

  React.useEffect(() => {
    if (!activeFilePath || !store) return
    let current = true

    void fetchCanvasLayout(activeFilePath).then(
      ({ layout }) => {
        if (!current) return
        store.hydrateLayout(layout)
        setLayoutState({ error: null, filePath: activeFilePath, ready: true })
      },
      (error: unknown) => {
        if (!current) return
        setLayoutState({
          error: error instanceof Error ? error.message : String(error),
          filePath: activeFilePath,
          ready: false,
        })
      }
    )

    return () => {
      current = false
    }
  }, [activeFilePath, store])

  const layoutMatches = layoutState.filePath === activeFilePath
  const layoutReady = layoutMatches && layoutState.ready
  const layoutError = layoutMatches ? layoutState.error : null
  const persistError =
    persistState?.filePath === activeFilePath ? persistState.error : null

  if (
    canvasesLoading ||
    moduleState.loading ||
    (activeFilePath && !layoutReady && !layoutError)
  ) {
    return <main className="canvas-surface-status">Loading Canvas…</main>
  }
  if (loadError || layoutError || moduleState.error) {
    return (
      <main className="canvas-surface-status canvas-surface-status--error">
        <strong>Canvas unavailable</strong>
        <span>{loadError ?? layoutError ?? moduleState.error}</span>
      </main>
    )
  }
  if (!activeFilePath || !store || !moduleState.component) {
    return (
      <main className="canvas-surface-status">
        <strong>
          {canvasCount === 0 ? "No Canvas yet" : "Select a Canvas"}
        </strong>
        <span>
          {canvasCount === 0
            ? "Add a .canvas.tsx file under agent-html/canvases."
            : "Choose a Canvas from the workspace navigation."}
        </span>
      </main>
    )
  }

  return (
    <main className="canvas-surface-root canvas-surface-root--infinite">
      {persistError ? (
        <div className="canvas-persist-error" role="status">
          Layout save failed: {persistError}
        </div>
      ) : null}
      <CanvasWorkspace
        component={moduleState.component}
        filePath={activeFilePath}
        onPersistError={handlePersistError}
        store={store}
      />
    </main>
  )
}
