import * as React from "react"
import { createPortal } from "react-dom"
import type { ReactNode } from "react"

export type CanvasNodeIntent = {
  id: string
  parentId?: string
}

export type CanvasIntentRuntime = {
  getNodeTarget: (id: string) => HTMLElement | null
  removeNode: (id: string) => void
  setCanvasActive: (active: boolean) => void
  subscribeTargets: (listener: () => void) => () => void
  syncNodeOrder?: (id: string, orderMarker: HTMLElement | null) => void
  upsertNode: (node: CanvasNodeIntent) => void
}

const CanvasIntentRuntimeContext =
  React.createContext<CanvasIntentRuntime | null>(null)
const ParentNodeContext = React.createContext<string | undefined>(undefined)

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

export type CanvasProps = {
  children?: ReactNode
}

export function Canvas({ children }: CanvasProps) {
  const runtime = React.useContext(CanvasIntentRuntimeContext)

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.setCanvasActive(true)
    return () => runtime.setCanvasActive(false)
  }, [runtime])

  if (!runtime) {
    return <div className="agent-html-canvas">{children}</div>
  }

  return (
    <ParentNodeContext.Provider value={undefined}>
      <div hidden>{children}</div>
    </ParentNodeContext.Provider>
  )
}

export type NodeProps = {
  children?: ReactNode
  id: string
}

export function Node({ children, id }: NodeProps) {
  const runtime = React.useContext(CanvasIntentRuntimeContext)
  const parentId = React.useContext(ParentNodeContext)
  const orderMarkerRef = React.useRef<HTMLSpanElement>(null)

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.upsertNode({ id, parentId })
    return () => runtime.removeNode(id)
  }, [id, parentId, runtime])

  React.useLayoutEffect(() => {
    if (!runtime) return
    runtime.syncNodeOrder?.(id, orderMarkerRef.current)
  })

  const target = React.useSyncExternalStore(
    runtime?.subscribeTargets ?? emptySubscribe,
    () => runtime?.getNodeTarget(id) ?? null,
    () => null
  )
  const content = (
    <ParentNodeContext.Provider value={id}>
      {children}
    </ParentNodeContext.Provider>
  )

  if (!runtime) return content
  return (
    <>
      <span hidden ref={orderMarkerRef} />
      {target ? createPortal(content, target) : null}
    </>
  )
}

function emptySubscribe() {
  return () => {}
}
