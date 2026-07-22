import { NodeResizer, type NodeProps, type ResizeParams } from "@xyflow/react"
import * as React from "react"

import { HostButton } from "../ui/button"
import {
  HostContextMenu,
  HostContextMenuContent,
  HostContextMenuGroup,
  HostContextMenuItem,
  HostContextMenuSeparator,
  HostContextMenuTrigger,
} from "../ui/context-menu"
import type { CanvasFlowNode } from "./canvas-flow-model"

export function CanvasNodeShell({
  data,
  id,
  selected,
}: NodeProps<CanvasFlowNode>) {
  const {
    contentInteractive,
    hierarchyMenuDisabled,
    hierarchyLocked,
    layerActions,
    moveToLabel,
    onChooseParent,
    onContextMenuOpen,
    onReorder,
    parentTargetState,
    persistLayout,
    requestPersistLayout,
    store,
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
  const shell = (
    <div
      className="canvas-node-shell"
      data-parent-target={parentTargetState}
      data-selected={selected ? "" : undefined}
    >
      <NodeResizer
        isVisible={selected && !contentInteractive && !hierarchyLocked}
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
  if (
    contentInteractive ||
    hierarchyMenuDisabled ||
    !moveToLabel ||
    !onChooseParent
  )
    return shell
  return (
    <HostContextMenu
      onOpenChange={(open) => {
        if (open) onContextMenuOpen?.(id)
      }}
    >
      <HostContextMenuTrigger asChild>{shell}</HostContextMenuTrigger>
      <HostContextMenuContent>
        <HostContextMenuGroup>
          <HostContextMenuItem onSelect={() => onChooseParent(id)}>
            {moveToLabel}
          </HostContextMenuItem>
        </HostContextMenuGroup>
        {layerActions && layerActions.length > 0 && onReorder ? (
          <>
            <HostContextMenuSeparator />
            <HostContextMenuGroup>
              {layerActions.map((item) => (
                <HostContextMenuItem
                  disabled={item.disabled}
                  key={item.action}
                  onSelect={() => onReorder(id, item.action)}
                >
                  {item.label}
                </HostContextMenuItem>
              ))}
            </HostContextMenuGroup>
          </>
        ) : null}
      </HostContextMenuContent>
    </HostContextMenu>
  )
}
