import * as React from "react"
import { createPortal } from "react-dom"
import type { ReactNode } from "react"

export type CanvasDefinition = {
  id: string
  title?: string
}

export type CanvasNodeIntent = {
  height?: number
  id: string
  index?: string
  parentId?: string
  title?: string
  type?: string
  width?: number
  x?: number
  y?: number
}

export type CanvasEdgeIntent = {
  id: string
  source: string
  target: string
  type?: string
}

export type CanvasIntentRuntime = {
  getNodeTarget: (id: string) => HTMLElement | null
  removeEdge: (id: string) => void
  removeNode: (id: string) => void
  setCanvas: (definition: CanvasDefinition | null) => void
  subscribeTargets: (listener: () => void) => () => void
  upsertEdge: (edge: CanvasEdgeIntent) => void
  upsertNode: (node: CanvasNodeIntent) => void
}

const CanvasIntentRuntimeContext =
  React.createContext<CanvasIntentRuntime | null>(null)

export function CanvasIntentProvider({
  children,
  runtime,
}: {
  children?: ReactNode
  runtime: CanvasIntentRuntime
}) {
  return (
    <CanvasIntentRuntimeContext.Provider value={runtime}>
      {children}
    </CanvasIntentRuntimeContext.Provider>
  )
}

export type CanvasProps = CanvasDefinition & {
  children?: ReactNode
}

export function Canvas({ children, id, title }: CanvasProps) {
  const runtime = React.useContext(CanvasIntentRuntimeContext)

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.setCanvas({ id, title })
    return () => runtime.setCanvas(null)
  }, [id, runtime, title])

  if (!runtime) {
    return <div className="agent-html-canvas">{children}</div>
  }

  return <div hidden>{children}</div>
}

export type NodeProps = CanvasNodeIntent & {
  children?: ReactNode
}

export function Node({
  children,
  height,
  id,
  index,
  parentId,
  title,
  type,
  width,
  x,
  y,
}: NodeProps) {
  const runtime = React.useContext(CanvasIntentRuntimeContext)

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.upsertNode({
      height,
      id,
      index,
      parentId,
      title,
      type,
      width,
      x,
      y,
    })
    return () => runtime.removeNode(id)
  }, [height, id, index, parentId, runtime, title, type, width, x, y])

  const target = React.useSyncExternalStore(
    runtime?.subscribeTargets ?? emptySubscribe,
    () => runtime?.getNodeTarget(id) ?? null,
    () => null
  )

  if (!runtime) {
    return <>{children}</>
  }

  return target ? createPortal(children, target) : null
}

export type EdgeProps = CanvasEdgeIntent

export function Edge({ id, source, target, type }: EdgeProps) {
  const runtime = React.useContext(CanvasIntentRuntimeContext)

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.upsertEdge({ id, source, target, type })
    return () => runtime.removeEdge(id)
  }, [id, runtime, source, target, type])

  return null
}

function emptySubscribe() {
  return () => {}
}
