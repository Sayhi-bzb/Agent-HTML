import {
  Background,
  BackgroundVariant,
  ControlButton,
  Controls,
  Panel,
  ReactFlow,
  type OnNodesChange,
  type ReactFlowInstance,
  useReactFlow,
  useViewport,
} from "@xyflow/react"
import "@xyflow/react/dist/style.css"
import {
  resolveCanvasLayerOrder,
  resolveCanvasReparenting,
  type CanvasLayerAction,
} from "@agent-html/kernel"
import * as React from "react"
import { CanvasIntentProvider } from "@agent-html/react"
import { useMachine } from "@xstate/react"
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

import {
  canvasBundleUrl,
  fetchCanvasLayout,
  reorderCanvasNodes as requestCanvasReordering,
  reparentCanvasNodes as requestCanvasReparenting,
} from "../api/api"
import { useHostI18n } from "../i18n/host-i18n"
import {
  readCanvasViewport,
  writeCanvasViewport,
} from "../preferences/canvas-host-preferences"
import { HostPopoverContent } from "../ui/popover"
import { createCanvasInspectionPublisher } from "./canvas-inspection-publisher"
import {
  canvasInteractionMachine,
  canvasInteractionPhase,
  isCanvasNavigateMode,
  type CanvasTool,
} from "./canvas-interaction-machine"
import {
  canvasFocusOwnerFromTarget,
  isCanvasInteractiveTarget,
} from "./canvas-input-router"
import { createLayoutPersister } from "./canvas-layout-persister"
import { CanvasNodeShell } from "./canvas-node-shell"
import {
  applyCanvasNodeChanges,
  getOrCreateCanvasStore,
  invalidCanvasParentIds,
  moveCanvasNodes,
  projectCanvasSnapshot,
  shouldCullCanvasElements,
  type CanvasFlowNode,
} from "./canvas-flow-model"
import {
  isCanvasShortcutBlocked,
  resolveCanvasShortcut,
} from "./canvas-shortcuts"
import type { CanvasStore } from "./canvas-store"
import { CanvasToolDock } from "./canvas-tool-dock"
import {
  isCanvasSpaceKey,
  shouldActivateCanvasSpacePan,
  useCanvasPanGestures,
} from "./use-canvas-pan-gestures"

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

const canvasFitViewPadding = 0.18
const canvasMinZoom = 0.08
const canvasMaxZoom = 2
const canvasReactFlowProOptions = { hideAttribution: true }

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
              <dt>Pointer / Hand</dt>
              <dd>V / H</dd>
            </div>
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
  const { t } = useHostI18n()
  const snapshot = useCanvasStoreSnapshot(store)
  const reactFlowRef = React.useRef<ReactFlowInstance<CanvasFlowNode> | null>(
    null
  )
  const reactFlowElementRef = React.useRef<HTMLDivElement>(null)
  const [interaction, sendInteraction] = useMachine(canvasInteractionMachine)
  const navigateMode = isCanvasNavigateMode(interaction.context)
  const interactionPhase = canvasInteractionPhase(interaction.value)
  const choosingParent = interactionPhase === "choosingParent"
  const hierarchyPending = interactionPhase === "reparenting"
  const layerPending = interactionPhase === "reordering"
  const selectedNodeIds = React.useMemo(
    () => new Set(interaction.context.selectedNodeIds),
    [interaction.context.selectedNodeIds]
  )
  const reparentingNodeIds = React.useMemo(
    () => new Set(interaction.context.reparentingNodeIds),
    [interaction.context.reparentingNodeIds]
  )
  const invalidParentIds = React.useMemo(
    () =>
      invalidCanvasParentIds({
        nodeIds: reparentingNodeIds,
        nodes: snapshot.nodes,
      }),
    [reparentingNodeIds, snapshot.nodes]
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
      const focusOwner = canvasFocusOwnerFromTarget(event.target)
      if (focusOwner === "nodeContent" || focusOwner === "overlay") return
      event.preventDefault()
      sendInteraction({ type: "SPACE.DOWN" })
    }
    const handleKeyUp = (event: KeyboardEvent) => {
      if (isCanvasSpaceKey(event)) sendInteraction({ type: "SPACE.UP" })
    }
    const resetTransient = () => sendInteraction({ type: "TRANSIENT.RESET" })
    const handleVisibilityChange = () => {
      if (document.visibilityState === "hidden") resetTransient()
    }

    window.addEventListener("keydown", handleKeyDown, true)
    window.addEventListener("keyup", handleKeyUp, true)
    window.addEventListener("blur", resetTransient)
    document.addEventListener("visibilitychange", handleVisibilityChange)
    return () => {
      window.removeEventListener("keydown", handleKeyDown, true)
      window.removeEventListener("keyup", handleKeyUp, true)
      window.removeEventListener("blur", resetTransient)
      document.removeEventListener("visibilitychange", handleVisibilityChange)
    }
  }, [sendInteraction])
  const panGestureActiveRef = useCanvasPanGestures({
    applyViewport: (viewport) => {
      void reactFlowRef.current?.setViewport(viewport)
    },
    getViewport: () =>
      reactFlowRef.current?.getViewport() ?? { x: 0, y: 0, zoom: 1 },
    onGestureEnd: (viewport) => {
      sendInteraction({ type: "PHASE.END" })
      persister.commitViewport(viewport)
    },
    onGestureStart: (source) =>
      sendInteraction({ type: "PHASE.PAN.START", source }),
    panActive: navigateMode,
    target: reactFlowElementRef,
  })
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
    if (!snapshot.active) return
    persister.reconcile()
    inspectionPublisher.request()
  }, [inspectionPublisher, persister, snapshot])
  const openNodeContextMenu = React.useCallback(
    (id: string) => {
      if (selectedNodeIds.has(id)) return
      sendInteraction({ nodeIds: [id], type: "SELECTION.CHANGED" })
    },
    [selectedNodeIds, sendInteraction]
  )
  const chooseParentForNode = React.useCallback(
    (id: string) => {
      const nodeIds = selectedNodeIds.has(id) ? [...selectedNodeIds] : [id]
      if (!selectedNodeIds.has(id)) {
        sendInteraction({ nodeIds, type: "SELECTION.CHANGED" })
      }
      sendInteraction({ nodeIds, type: "HIERARCHY.CHOOSE.START" })
    },
    [selectedNodeIds, sendInteraction]
  )
  const commitParent = React.useCallback(
    async (parentId: string | null) => {
      const nodeIds = interaction.context.reparentingNodeIds
      if (
        nodeIds.length === 0 ||
        (parentId && invalidParentIds.has(parentId))
      ) {
        return
      }
      sendInteraction({ type: "HIERARCHY.COMMIT.START" })
      try {
        await persister.runExclusive(async () => {
          const preview = resolveCanvasReparenting({
            layout: store.getLayout(),
            nodeIds,
            nodes: snapshot.nodes,
            parentId,
          })
          const rollback = store.applyReparenting({
            geometries: preview.geometries,
            nodeIds: preview.movedNodeIds,
            parentId: preview.parentId,
          })
          try {
            const committed = await requestCanvasReparenting({
              filePath,
              nodeIds: preview.movedNodeIds,
              parentId: preview.parentId,
            })
            store.setNodeGeometries(committed.geometries)
          } catch (error) {
            store.restoreHierarchy(rollback)
            throw error
          }
        })
        onPersistError(null)
      } catch (error) {
        onPersistError(error instanceof Error ? error.message : String(error))
      } finally {
        sendInteraction({ type: "HIERARCHY.COMMIT.END" })
      }
    },
    [
      filePath,
      interaction.context.reparentingNodeIds,
      invalidParentIds,
      onPersistError,
      persister,
      sendInteraction,
      snapshot.nodes,
      store,
    ]
  )
  const commitLayerOrder = React.useCallback(
    async (id: string, action: CanvasLayerAction) => {
      const nodeIds = selectedNodeIds.has(id) ? [...selectedNodeIds] : [id]
      const preview = resolveCanvasLayerOrder({
        action,
        nodeIds,
        nodes: snapshot.nodes,
      })
      if (preview.groups.length === 0) return
      sendInteraction({ type: "LAYER.COMMIT.START" })
      try {
        await persister.runExclusive(async () => {
          const rollback = store.applyLayerOrder(preview.groups)
          try {
            const committed = await requestCanvasReordering({
              action,
              filePath,
              nodeIds,
            })
            if (committed.groups.length > 0) {
              store.applyLayerOrder(committed.groups)
            }
          } catch (error) {
            store.restoreLayerOrder(rollback)
            throw error
          }
        })
        onPersistError(null)
      } catch (error) {
        onPersistError(error instanceof Error ? error.message : String(error))
      } finally {
        sendInteraction({ type: "LAYER.COMMIT.END" })
      }
    },
    [
      filePath,
      onPersistError,
      persister,
      selectedNodeIds,
      sendInteraction,
      snapshot.nodes,
      store,
    ]
  )
  const layerActionsForNode = React.useCallback(
    (id: string) => {
      const nodeIds = selectedNodeIds.has(id) ? [...selectedNodeIds] : [id]
      const actions: Array<{ action: CanvasLayerAction; label: string }> = [
        { action: "bring-to-front", label: t("canvas.bringToFront") },
        { action: "bring-forward", label: t("canvas.bringForward") },
        { action: "send-backward", label: t("canvas.sendBackward") },
        { action: "send-to-back", label: t("canvas.sendToBack") },
      ]
      return actions.map((item) => ({
        ...item,
        disabled:
          resolveCanvasLayerOrder({
            action: item.action,
            nodeIds,
            nodes: snapshot.nodes,
          }).groups.length === 0,
      }))
    },
    [selectedNodeIds, snapshot.nodes, t]
  )
  const projection = React.useMemo(
    () =>
      projectCanvasSnapshot(
        snapshot,
        store,
        selectedNodeIds,
        persister.commit,
        persister.request,
        navigateMode,
        {
          disabled: navigateMode || interactionPhase !== "idle",
          invalidParentIds,
          layerActions: layerActionsForNode,
          locked: choosingParent || hierarchyPending || layerPending,
          moveToLabel: t("canvas.moveTo"),
          onChooseParent: chooseParentForNode,
          onContextMenuOpen: openNodeContextMenu,
          onReorder: commitLayerOrder,
          picking: choosingParent,
        }
      ),
    [
      chooseParentForNode,
      choosingParent,
      commitLayerOrder,
      hierarchyPending,
      interactionPhase,
      invalidParentIds,
      layerActionsForNode,
      layerPending,
      navigateMode,
      openNodeContextMenu,
      persister,
      selectedNodeIds,
      snapshot,
      store,
      t,
    ]
  )
  const onNodesChange = React.useCallback<OnNodesChange<CanvasFlowNode>>(
    (changes) => {
      applyCanvasNodeChanges({ changes, snapshot, store })
      const selectionChanges = changes.filter(
        (change) => change.type === "select"
      )
      if (selectionChanges.length > 0) {
        const next = new Set(interaction.context.selectedNodeIds)
        for (const change of selectionChanges) {
          if (change.type !== "select") continue
          if (change.selected) next.add(change.id)
          else next.delete(change.id)
        }
        sendInteraction({
          nodeIds: [...next],
          type: "SELECTION.CHANGED",
        })
      }
      if (
        changes.some(
          (change) => change.type === "dimensions" && change.resizing === true
        )
      )
        sendInteraction({ type: "PHASE.RESIZE.START" })
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
        sendInteraction({ type: "PHASE.END" })
      }
    },
    [
      interaction.context.selectedNodeIds,
      persister,
      sendInteraction,
      snapshot,
      store,
    ]
  )
  const onKeyDown = React.useCallback(
    (event: React.KeyboardEvent<HTMLDivElement>) => {
      if (hierarchyPending || layerPending) {
        event.preventDefault()
        return
      }
      if (choosingParent && event.key === "Escape") {
        event.preventDefault()
        event.stopPropagation()
        sendInteraction({ type: "HIERARCHY.CANCEL" })
        return
      }
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

      if (action.type === "tool-navigate") {
        sendInteraction({ type: "TOOL.NAVIGATE" })
        return
      }
      if (action.type === "tool-select") {
        sendInteraction({ type: "TOOL.SELECT" })
        return
      }
      if (action.type === "clear-selection") {
        sendInteraction({ nodeIds: [], type: "SELECTION.CHANGED" })
        setShortcutHelpOpen(false)
        return
      }
      if (action.type === "select-all") {
        sendInteraction({
          nodeIds: snapshot.nodes.map((node) => node.id),
          type: "SELECTION.CHANGED",
        })
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
          sendInteraction({
            nodeIds: [...movingNodeIds],
            type: "SELECTION.CHANGED",
          })
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
    [
      choosingParent,
      hierarchyPending,
      layerPending,
      persister,
      selectedNodeIds,
      sendInteraction,
      snapshot,
      store,
    ]
  )
  const selectTool = React.useCallback(
    (tool: CanvasTool) => {
      sendInteraction({
        type: tool === "select" ? "TOOL.SELECT" : "TOOL.NAVIGATE",
      })
    },
    [sendInteraction]
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
      data-canvas-region="canvas"
      data-node-count={snapshot.nodes.length}
      data-pan-active={navigateMode ? "" : undefined}
      data-phase={interactionPhase}
      data-testid="canvas-workspace"
      data-tool={interaction.context.tool}
      onBlurCapture={(event) =>
        sendInteraction({
          owner: canvasFocusOwnerFromTarget(event.relatedTarget),
          type: "FOCUS.CHANGED",
        })
      }
      onContextMenuCapture={(event) => {
        if (!choosingParent) return
        event.preventDefault()
        sendInteraction({ type: "HIERARCHY.CANCEL" })
      }}
      onFocusCapture={(event) =>
        sendInteraction({
          owner: canvasFocusOwnerFromTarget(event.target),
          type: "FOCUS.CHANGED",
        })
      }
      onKeyDown={onKeyDown}
      onLostPointerCapture={() => sendInteraction({ type: "TRANSIENT.RESET" })}
      onPointerCancel={() => sendInteraction({ type: "TRANSIENT.RESET" })}
      onPointerDownCapture={(event) => {
        const focusOwner = canvasFocusOwnerFromTarget(event.target)
        if (focusOwner === "canvas") {
          reactFlowElementRef.current?.focus({ preventScroll: true })
        }
        if (
          navigateMode &&
          focusOwner === "nodeContent" &&
          isCanvasInteractiveTarget(event.target)
        ) {
          sendInteraction({ type: "PHASE.INTERACT.START" })
        }
      }}
      onPointerUpCapture={() => {
        if (interactionPhase === "interacting") {
          sendInteraction({ type: "PHASE.END" })
        }
      }}
    >
      <CanvasIntentProvider runtime={store.runtime}>
        <Source />
      </CanvasIntentProvider>
      {snapshot.active ? (
        <ReactFlow<CanvasFlowNode>
          aria-label="Infinite Canvas"
          defaultViewport={initialViewport}
          deleteKeyCode={null}
          elementsSelectable={
            !navigateMode &&
            !choosingParent &&
            !hierarchyPending &&
            !layerPending
          }
          elevateNodesOnSelect={false}
          fitView={!initialViewport}
          fitViewOptions={{ padding: 0.18 }}
          maxZoom={canvasMaxZoom}
          minZoom={canvasMinZoom}
          multiSelectionKeyCode="Shift"
          nodeTypes={canvasNodeTypes}
          nodes={projection.nodes}
          nodesDraggable={
            !navigateMode &&
            !choosingParent &&
            !hierarchyPending &&
            !layerPending
          }
          nodesFocusable={false}
          onInit={(instance) => {
            reactFlowRef.current = instance
          }}
          onMoveStart={() => {
            if (panGestureActiveRef.current) return
            sendInteraction({ type: "PHASE.PAN.START", source: "middle" })
          }}
          onNodeClick={(_event, node) => {
            if (choosingParent) void commitParent(node.id)
          }}
          onMoveEnd={(_event, viewport) => {
            if (panGestureActiveRef.current) return
            sendInteraction({ type: "PHASE.END" })
            persister.commitViewport(viewport)
          }}
          onNodeDragStart={() => sendInteraction({ type: "PHASE.MOVE.START" })}
          onNodeDragStop={(_event, node) => {
            sendInteraction({ type: "PHASE.END" })
            persister.commit([node.id])
          }}
          onNodesChange={onNodesChange}
          onPaneClick={() => {
            if (choosingParent) void commitParent(null)
          }}
          onlyRenderVisibleElements={shouldCullCanvasElements(
            snapshot.nodes.length
          )}
          panActivationKeyCode={null}
          panOnDrag={[1]}
          proOptions={canvasReactFlowProOptions}
          ref={reactFlowElementRef}
          selectionKeyCode={null}
          selectionOnDrag={
            !navigateMode &&
            !choosingParent &&
            !hierarchyPending &&
            !layerPending
          }
          onSelectionEnd={() => sendInteraction({ type: "PHASE.END" })}
          onSelectionStart={() =>
            sendInteraction({ type: "PHASE.MARQUEE.START" })
          }
          tabIndex={0}
          zoomOnDoubleClick={false}
          zoomOnScroll={false}
          zIndexMode="manual"
        >
          <Background
            color="var(--canvas-grid-dot)"
            gap={24}
            size={1.25}
            variant={BackgroundVariant.Dots}
          />
          {choosingParent || hierarchyPending || layerPending ? (
            <Panel className="canvas-hierarchy-status" position="top-center">
              <div role="status">
                {t(
                  layerPending
                    ? "canvas.layerReordering"
                    : hierarchyPending
                      ? "canvas.reparenting"
                      : "canvas.chooseParent"
                )}
              </div>
            </Panel>
          ) : null}
          <Panel className="canvas-tool-panel" position="bottom-center">
            <CanvasToolDock
              onToolChange={selectTool}
              tool={interaction.context.tool}
            />
          </Panel>
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
      ({ layout, legacyViewport }) => {
        if (!current) return
        store.hydrateLayout(layout)
        const localViewport = readCanvasViewport(activeFilePath)
        const initialViewport = localViewport ?? legacyViewport
        store.setViewport(initialViewport)
        if (!localViewport && legacyViewport) {
          writeCanvasViewport(activeFilePath, legacyViewport)
        }
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
