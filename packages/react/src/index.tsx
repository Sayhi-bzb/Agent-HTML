import * as React from "react"
import type { ReactNode, RefObject } from "react"

import {
  canvasDomAttributes,
  canvasInteractionEventName,
  normalizeArtifactDefinition,
} from "@agent-html/kernel"
import type {
  ArtifactDefinition,
  ArtifactInteractionSnapshot,
  ArtifactStateChange,
  ArtifactStateChangeInput,
  ArtifactStateChangeKind,
} from "@agent-html/kernel"

export { Canvas, CanvasIntentProvider, Edge, Node } from "./canvas"
export type {
  CanvasDefinition,
  CanvasEdgeIntent,
  CanvasIntentRuntime,
  CanvasNodeIntent,
  CanvasProps,
  EdgeProps,
  NodeProps,
} from "./canvas"

export type {
  ArtifactBlockDefinition,
  ArtifactDefinition,
  ArtifactInteractionSnapshot,
  ArtifactStateChange,
  ArtifactStateChangeInput,
  ArtifactStateChangeKind,
} from "@agent-html/kernel"

export const artifactInteractionEventName = canvasInteractionEventName

export type ArtifactInteractionRuntime = {
  emitChange: (change: ArtifactStateChangeInput) => void
  getSnapshot: (blockId?: string) => ArtifactInteractionSnapshot
}

const emptyInteractionSnapshot: ArtifactInteractionSnapshot = {
  currentState: {},
  recentChanges: [],
}

const noopInteractionRuntime: ArtifactInteractionRuntime = {
  emitChange: dispatchArtifactStateChange,
  getSnapshot: () => emptyInteractionSnapshot,
}

const ArtifactInteractionContext =
  React.createContext<ArtifactInteractionRuntime>(noopInteractionRuntime)

export type ArtifactProps = {
  children?: ReactNode
  title: string
}

export type BlockProps = {
  children?: ReactNode
  id: string
  title?: string
}

export type ArtifactBlockComponentMap = Record<string, React.ComponentType>

export function createArtifactStateChange(
  change: ArtifactStateChangeInput
): ArtifactStateChange {
  return {
    ...change,
    timestamp: change.timestamp ?? Date.now(),
  }
}

export function dispatchArtifactStateChange(change: ArtifactStateChangeInput) {
  const detail = createArtifactStateChange(change)

  if (typeof window === "undefined") {
    return detail
  }

  window.dispatchEvent(
    new CustomEvent<ArtifactStateChange>(artifactInteractionEventName, {
      detail,
    })
  )

  return detail
}

export function InteractionProvider({
  children,
  onChange,
}: {
  children?: ReactNode
  onChange?: (change: ArtifactStateChange) => void
}) {
  const snapshotsRef = React.useRef(
    new Map<string, ArtifactInteractionSnapshot>()
  )

  const emitChange = React.useCallback(
    (input: ArtifactStateChangeInput) => {
      const change = createArtifactStateChange(input)
      const key = change.blockId ?? ""
      const previous = snapshotsRef.current.get(key) ?? {
        blockId: change.blockId,
        currentState: {},
        recentChanges: [],
      }

      snapshotsRef.current.set(key, {
        blockId: change.blockId,
        currentState: {
          ...previous.currentState,
          [change.controlId]: change.after,
        },
        recentChanges: [...previous.recentChanges, change].slice(-20),
      })

      onChange?.(change)
      dispatchArtifactStateChange(change)
    },
    [onChange]
  )

  const getSnapshot = React.useCallback((blockId?: string) => {
    return snapshotsRef.current.get(blockId ?? "") ?? emptyInteractionSnapshot
  }, [])

  const runtime = React.useMemo(
    () => ({
      emitChange,
      getSnapshot,
    }),
    [emitChange, getSnapshot]
  )

  return (
    <ArtifactInteractionContext.Provider value={runtime}>
      {children}
    </ArtifactInteractionContext.Provider>
  )
}

export function useArtifactInteraction() {
  return React.useContext(ArtifactInteractionContext)
}

export function findNearestBlockId(element: Element | null | undefined) {
  return (
    element
      ?.closest("[data-agent-html-block='true']")
      ?.getAttribute("data-agent-html-block-id") ?? undefined
  )
}

export function useNearestBlockId<T extends Element>(ref: RefObject<T | null>) {
  const [blockId, setBlockId] = React.useState<string | undefined>()

  React.useLayoutEffect(() => {
    setBlockId(findNearestBlockId(ref.current))
  })

  return blockId
}

export function useEmitArtifactStateChange({
  blockId,
  elementRef,
}: {
  blockId?: string
  elementRef?: RefObject<Element | null>
} = {}) {
  const runtime = useArtifactInteraction()

  return React.useCallback(
    (
      change: Omit<ArtifactStateChangeInput, "blockId"> & { blockId?: string }
    ) => {
      runtime.emitChange({
        ...change,
        blockId:
          change.blockId ?? blockId ?? findNearestBlockId(elementRef?.current),
      })
    },
    [blockId, elementRef, runtime]
  )
}

export function useInstrumentedValueChange<T>({
  blockId,
  component,
  controlId,
  elementRef,
  kind = "set",
  label,
  onChange,
  semantic,
  value,
}: {
  blockId?: string
  component: string
  controlId: string
  elementRef?: RefObject<Element | null>
  kind?: ArtifactStateChangeKind
  label?: string
  onChange?: (value: T) => void
  semantic?: string
  value: T
}) {
  const emitChange = useEmitArtifactStateChange({ blockId, elementRef })
  const previousValueRef = React.useRef(value)

  React.useEffect(() => {
    previousValueRef.current = value
  }, [value])

  return React.useCallback(
    (nextValue: T) => {
      const before = previousValueRef.current
      previousValueRef.current = nextValue
      onChange?.(nextValue)
      emitChange({
        after: nextValue,
        before,
        component,
        controlId,
        kind,
        label,
        semantic,
      })
    },
    [component, controlId, emitChange, kind, label, onChange, semantic]
  )
}

export const useInstrumentedCheckedChange = useInstrumentedValueChange

export function Artifact({ children, title }: ArtifactProps) {
  return (
    <main
      {...{
        [canvasDomAttributes.artifact]: "true",
        [canvasDomAttributes.artifactTitle]: title,
      }}
      className="agent-html-artifact"
    >
      {children}
    </main>
  )
}

export function Block({ children, id, title }: BlockProps) {
  return (
    <section
      id={id}
      {...{
        [canvasDomAttributes.block]: "true",
        [canvasDomAttributes.blockId]: id,
        [canvasDomAttributes.blockTitle]: title ?? id,
      }}
    >
      {children}
    </section>
  )
}

export function defineArtifact(definition: ArtifactDefinition) {
  const normalizedDefinition = normalizeArtifactDefinition(definition)

  return function DefinedArtifact({
    components = {},
  }: {
    components?: ArtifactBlockComponentMap
  } = {}) {
    return (
      <Artifact title={normalizedDefinition.title}>
        {normalizedDefinition.blocks.map(({ id, title }) => {
          const Component = components[id]

          return (
            <Block id={id} key={id} title={title}>
              {Component ? <Component /> : null}
            </Block>
          )
        })}
      </Artifact>
    )
  }
}
