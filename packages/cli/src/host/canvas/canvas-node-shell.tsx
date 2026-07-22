import { NodeResizer, type NodeProps, type ResizeParams } from "@xyflow/react"
import * as React from "react"

import { HostButton } from "../ui/button"
import type { CanvasFlowNode } from "./canvas-flow-model"

export function CanvasNodeShell({
  data,
  id,
  selected,
}: NodeProps<CanvasFlowNode>) {
  const {
    contentInteractive,
    persistLayout,
    requestPersistLayout,
    store,
    title,
  } = data
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
        isVisible={selected && !contentInteractive}
        minHeight={40}
        minWidth={80}
        onResize={setGeometry}
        onResizeEnd={finishResize}
      />
      {contentInteractive ? (
        <div
          className="canvas-node-drag-handle"
          data-canvas-region="node-chrome"
          title={title ?? id}
        >
          <span>{title ?? id}</span>
        </div>
      ) : (
        <HostButton
          aria-keyshortcuts="Enter ArrowUp ArrowDown ArrowLeft ArrowRight"
          aria-label={`Select and move ${title ?? id}. Use arrow keys; hold Shift for ten pixels.`}
          className="canvas-node-drag-handle"
          data-canvas-region="node-chrome"
          title={title ?? id}
          type="button"
          variant="ghost"
        >
          <span>{title ?? id}</span>
        </HostButton>
      )}
      {!contentInteractive ? (
        <div
          aria-hidden="true"
          className="canvas-node-interaction-layer"
          data-canvas-region="node-chrome"
        />
      ) : null}
      <div
        className="canvas-node-content nodrag"
        data-canvas-region="node-content"
        inert={!contentInteractive}
        ref={setTarget}
      />
    </div>
  )
}
