import { NodeResizer, type NodeProps, type ResizeParams } from "@xyflow/react"
import * as React from "react"

import { HostButton } from "../ui/button"
import type { CanvasFlowNode } from "./canvas-flow-model"

export function CanvasNodeShell({
  data,
  id,
  selected,
}: NodeProps<CanvasFlowNode>) {
  const { contentInteractive, persistLayout, requestPersistLayout, store } =
    data
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
      {!contentInteractive ? (
        <HostButton
          aria-keyshortcuts="Enter ArrowUp ArrowDown ArrowLeft ArrowRight"
          aria-label={`Select and move ${id}. Use arrow keys; hold Shift for ten pixels.`}
          className="canvas-node-hit-layer"
          data-canvas-region="node-chrome"
          type="button"
          variant="ghost"
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
