import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  NodeResizer,
  ReactFlow,
  type NodeProps,
  type OnNodesChange,
  type ReactFlowInstance,
  type ResizeParams,
  useReactFlow,
  useViewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import * as React from "react"
import { CanvasIntentProvider } from "@agent-html/react"
import {
  CircleHelpIcon,
  Maximize2Icon,
  MinusIcon,
  PlusIcon,
} from "lucide-react"
import {
  Popover,
  PopoverTrigger,
} from "#agent-html-playground/components/ui/popover"

import { canvasBundleUrl, fetchCanvasLayout } from "../api/api"
import { HostButton } from "../ui/button"
import { HostPopoverContent } from "../ui/popover"
import { createCanvasInspectionPublisher } from "./canvas-inspection-publisher"
import { createLayoutPersister } from "./canvas-layout-persister"
import {
  applyCanvasNodeChanges,
  getOrCreateCanvasStore,
  moveCanvasNodes,
  projectCanvasSnapshot,
  shouldCullCanvasElements,
  type CanvasFlowNode,
} from "./canvas-flow-model"
import {
  isCanvasShortcutBlocked,
  resolveCanvasShortcut,
} from "./canvas-shortcuts"
import {
  createCanvasWheelPanController,
  isCanvasSpaceKey,
  isCanvasWheelPanBlocked,
  shouldActivateCanvasSpacePan,
  type CanvasWheelPanController,
} from "./canvas-pan"
import type { CanvasStore } from "./canvas-store"

type CanvasModule = {
  default: React.ComponentType
}

const canvasNodeTypes = {
  "canvas-node": CanvasNodeShell,
}

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
      requestPersistLayout([id])
    },
    [id, requestPersistLayout, store]
  )
  const finishResize = React.useCallback(
    (_event: unknown, geometry: ResizeParams) => {
      store.setNodeGeometry(id, geometry)
      persistLayout([id])
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
      <HostButton
        aria-keyshortcuts="Enter ArrowUp ArrowDown ArrowLeft ArrowRight"
        aria-label={`Select and move ${title ?? id}. Use arrow keys; hold Shift for ten pixels.`}
        className="canvas-node-drag-handle"
        title={title ?? id}
        type="button"
        variant="ghost"
      >
        <span>{title ?? id}</span>
      </HostButton>
      <div
        className="canvas-node-content nodrag nowheel nopan"
        ref={setTarget}
      />
    </div>
  )
}

const canvasFitViewPadding = 0.18
const canvasMinZoom = 0.08
const canvasMaxZoom = 2

function canvasViewportAnimationDuration() {
  return window.matchMedia?.("(prefers-reduced-motion: reduce)").matches
    ? 0
    : 180
}

function CanvasViewportControls({
  helpOpen,
  onHelpOpenChange,
}: {
  helpOpen: boolean
  onHelpOpenChange: (open: boolean) => void
}) {
  const { fitView, zoomIn, zoomOut, zoomTo } = useReactFlow<CanvasFlowNode>()
  const { zoom } = useViewport()
  const duration = canvasViewportAnimationDuration()
  const zoomPercent = Math.round(zoom * 100)

  return (
    <Controls
      aria-label="Canvas viewport controls"
      orientation="horizontal"
      position="bottom-right"
      showFitView={false}
      showInteractive={false}
      showZoom={false}
    >
      <ControlButton
        aria-label="Zoom out"
        disabled={zoom <= canvasMinZoom}
        onClick={() => void zoomOut({ duration })}
        title="Zoom out (−)"
      >
        <MinusIcon />
      </ControlButton>
      <ControlButton
        aria-label={`Zoom ${zoomPercent}%. Reset to 100%`}
        className="canvas-zoom-value"
        onClick={() => void zoomTo(1, { duration })}
        title="Reset zoom to 100% (0)"
      >
        {zoomPercent}%
      </ControlButton>
      <ControlButton
        aria-label="Zoom in"
        disabled={zoom >= canvasMaxZoom}
        onClick={() => void zoomIn({ duration })}
        title="Zoom in (+)"
      >
        <PlusIcon />
      </ControlButton>
      <ControlButton
        aria-label="Fit all Nodes"
        onClick={() =>
          void fitView({ duration, padding: canvasFitViewPadding })
        }
        title="Fit all Nodes (1)"
      >
        <Maximize2Icon />
      </ControlButton>
      <Popover onOpenChange={onHelpOpenChange} open={helpOpen}>
        <PopoverTrigger asChild>
          <ControlButton
            aria-label="Canvas keyboard shortcuts"
            title="Keyboard shortcuts (?)"
          >
            <CircleHelpIcon />
          </ControlButton>
        </PopoverTrigger>
        <HostPopoverContent
          align="end"
          className="canvas-shortcut-help"
          side="top"
        >
          <strong>Canvas shortcuts</strong>
          <dl>
            <div>
              <dt>Zoom</dt>
              <dd>+ / −</dd>
            </div>
            <div>
              <dt>100%</dt>
              <dd>0</dd>
            </div>
            <div>
              <dt>Fit all / selection</dt>
              <dd>1 / 2</dd>
            </div>
            <div>
              <dt>Pan</dt>
              <dd>Space + drag</dd>
            </div>
            <div>
              <dt>Select all</dt>
              <dd>Ctrl/⌘ A</dd>
            </div>
            <div>
              <dt>Move 1 / 10 px</dt>
              <dd>Arrow / Shift + Arrow</dd>
            </div>
            <div>
              <dt>Clear selection</dt>
              <dd>Esc</dd>
            </div>
          </dl>
        </HostPopoverContent>
      </Popover>
    </Controls>
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
  const reactFlowRef = React.useRef<ReactFlowInstance<CanvasFlowNode> | null>(
    null
  )
  const wheelPanControllerRef = React.useRef<CanvasWheelPanController | null>(
    null
  )
  const [reactFlowElement, setReactFlowElement] =
    React.useState<HTMLDivElement | null>(null)
  const [spacePanActive, setSpacePanActive] = React.useState(false)
  const [selectedNodeIds, setSelectedNodeIds] = React.useState<Set<string>>(
    () => new Set()
  )
  const [shortcutHelpOpen, setShortcutHelpOpen] = React.useState(false)
  const persister = React.useMemo(
    () => createLayoutPersister({ filePath, onPersistError, store }),
    [filePath, onPersistError, store]
  )
  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        !shouldActivateCanvasSpacePan({
          altKey: event.altKey,
          code: event.code,
          ctrlKey: event.ctrlKey,
          isComposing: event.isComposing,
          key: event.key,
          metaKey: event.metaKey,
          target: event.target,
        })
      )
        return
      event.preventDefault()
      setSpacePanActive(true)
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isCanvasSpaceKey(event)) setSpacePanActive(false)
    }
    const resetSpacePan = () => setSpacePanActive(false)

    window.addEventListener("keydown", handleKeyDown, true)
    window.addEventListener("keyup", handleKeyUp, true)
    window.addEventListener("blur", resetSpacePan)
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("keyup", handleKeyUp, true)
      window.removeEventListener("blur", resetSpacePan)
    }
  }, [])
  React.useEffect(() => {
    if (!reactFlowElement) return
    const controller = createCanvasWheelPanController({
      applyViewport: (viewport) => {
        void reactFlowRef.current?.setViewport(viewport)
      },
      cancelFrame: (handle) => window.cancelAnimationFrame(handle),
      cancelGestureEnd: (handle) => window.clearTimeout(handle),
      getViewport: () =>
        reactFlowRef.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 },
      onGestureEnd: (viewport) => persister.commitViewport(viewport),
      requestFrame: (callback) => window.requestAnimationFrame(callback),
      scheduleGestureEnd: (callback, delay) =>
        window.setTimeout(callback, delay),
    })
    wheelPanControllerRef.current = controller
    const handleWheel = (event: WheelEvent) => {
      if (
        event.ctrlKey ||
        event.metaKey ||
        isCanvasWheelPanBlocked(event.target)
      ) {
        controller.finish()
        return
      }
      if (!controller.pan(event.deltaX, event.deltaY, event.deltaMode)) return
      event.preventDefault()
      event.stopImmediatePropagation()
    }

    reactFlowElement.addEventListener("wheel", handleWheel, {
      capture: true,
      passive: false,
    })
    return () => {
      reactFlowElement.removeEventListener("wheel", handleWheel, true)
      controller.dispose()
      if (wheelPanControllerRef.current === controller) {
        wheelPanControllerRef.current = null
      }
    }
  }, [persister, reactFlowElement])
  const inspectionPublisher = React.useMemo(
    () => createCanvasInspectionPublisher({ store }),
    [store]
  )
  React.useEffect(() => () => persister.dispose(), [persister])
  React.useEffect(
    () => () => inspectionPublisher.dispose(),
    [inspectionPublisher]
  )
  React.useEffect(() => {
    if (!snapshot.canvas) return
    persister.reconcile()
    inspectionPublisher.request()
  }, [inspectionPublisher, persister, snapshot])
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
        persister.commit(
          changes.flatMap((change) =>
            (change.type === "position" && change.dragging === false) ||
            (change.type === "dimensions" && change.resizing === false)
              ? [change.id]
              : []
          )
        )
      }
    },
    [persister, snapshot, store]
  )
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (isCanvasShortcutBlocked(event.target)) return
      const action = resolveCanvasShortcut({
        altKey: event.altKey,
        ctrlKey: event.ctrlKey,
        isComposing: event.nativeEvent.isComposing,
        key: event.key,
        metaKey: event.metaKey,
        shiftKey: event.shiftKey,
      })
      if (!action) return

      const instance = reactFlowRef.current
      if (
        !instance &&
        [
          "fit-all",
          "fit-selection",
          "zoom-in",
          "zoom-out",
          "zoom-reset",
        ].includes(action.type)
      )
        return

      event.preventDefault()
      event.stopPropagation()

      if (action.type === "clear-selection") {
        setSelectedNodeIds(new Set())
        setShortcutHelpOpen(false)
        return
      }
      if (action.type === "select-all") {
        setSelectedNodeIds(new Set(snapshot.nodes.map((node) => node.id)))
        return
      }
      if (action.type === "open-shortcuts") {
        setShortcutHelpOpen(true)
        return
      }
      if (action.type === "move") {
        const focusedNodeId =
          event.target instanceof Element
            ? event.target.closest(".react-flow__node")?.getAttribute("data-id")
            : null
        const movingNodeIds =
          focusedNodeId && !selectedNodeIds.has(focusedNodeId)
            ? new Set([focusedNodeId])
            : selectedNodeIds
        if (movingNodeIds.size === 0) return
        if (movingNodeIds !== selectedNodeIds) {
          setSelectedNodeIds(movingNodeIds)
        }
        const movedNodeIds = moveCanvasNodes({
          dx: action.dx,
          dy: action.dy,
          nodeIds: movingNodeIds,
          snapshot,
          store,
        })
        persister.commit(movedNodeIds)
        return
      }

      const duration = canvasViewportAnimationDuration()
      if (action.type === "zoom-in") {
        void instance!.zoomIn({ duration })
      } else if (action.type === "zoom-out") {
        void instance!.zoomOut({ duration })
      } else if (action.type === "zoom-reset") {
        void instance!.zoomTo(1, { duration })
      } else if (action.type === "fit-all") {
        void instance!.fitView({ duration, padding: canvasFitViewPadding })
      } else if (selectedNodeIds.size > 0) {
        void instance!.fitView({
          duration,
          nodes: [...selectedNodeIds].map((id) => ({ id })),
          padding: canvasFitViewPadding,
        })
      }
    },
    [persister, selectedNodeIds, snapshot, store]
  )
  const initialViewport = snapshot.viewport
    ? {
        ...snapshot.viewport,
        zoom: Math.min(
          canvasMaxZoom,
          Math.max(canvasMinZoom, snapshot.viewport.zoom)
        ),
      }
    : undefined

  return (
    <div
      className="canvas-workspace"
      data-node-count={snapshot.nodes.length}
      data-space-pan={spacePanActive ? "" : undefined}
      data-testid="canvas-workspace"
      onKeyDown={onKeyDown}
    >
      <CanvasIntentProvider runtime={store.runtime}>
        <Source />
      </CanvasIntentProvider>
      {snapshot.canvas ? (
        <ReactFlow<CanvasFlowNode>
          aria-label="Infinite Canvas"
          defaultViewport={initialViewport}
          deleteKeyCode={null}
          elementsSelectable
          fitView={!initialViewport}
          fitViewOptions={{ padding: 0.18 }}
          maxZoom={canvasMaxZoom}
          minZoom={canvasMinZoom}
          multiSelectionKeyCode="Shift"
          nodeTypes={canvasNodeTypes}
          nodes={projection.nodes}
          nodesDraggable={!spacePanActive}
          nodesFocusable={false}
          onInit={(instance) => {
            reactFlowRef.current = instance
          }}
          onMoveEnd={(_event, viewport) => {
            if (wheelPanControllerRef.current?.isActive()) return
            persister.commitViewport(viewport)
          }}
          onNodeDragStop={(_event, node) => persister.commit([node.id])}
          onNodesChange={onNodesChange}
          onlyRenderVisibleElements={shouldCullCanvasElements(
            snapshot.nodes.length
          )}
          panActivationKeyCode={null}
          panOnDrag={spacePanActive ? [0, 1] : [1]}
          ref={setReactFlowElement}
          selectionKeyCode={null}
          selectionOnDrag
          tabIndex={0}
          zoomOnDoubleClick={false}
          zoomOnScroll={false}
        >
          <Background
            color="var(--canvas-grid-dot)"
            gap={24}
            size={1.25}
            variant={BackgroundVariant.Dots}
          />
          <CanvasViewportControls
            helpOpen={shortcutHelpOpen}
            onHelpOpenChange={setShortcutHelpOpen}
          />
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
        key={activeFilePath}
        onPersistError={handlePersistError}
        store={store}
      />
    </main>
  )
}
