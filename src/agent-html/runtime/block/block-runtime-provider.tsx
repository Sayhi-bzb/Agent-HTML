import * as React from "react"

import type {
  AgentHtmlBlockDropIndicator,
  AgentHtmlBlockRuntimeState,
} from "@/agent-html/runtime/block/types"

type AgentHtmlBlockRuntimeContextValue = AgentHtmlBlockRuntimeState & {
  clearIndicator: () => void
  getBlockElement: (path: string) => HTMLElement | null
  getBlockElements: () => HTMLElement[]
  getHoveredBlockElement: () => HTMLElement | null
  getVisibleBlockRects: () => DOMRect[]
  registerBlockElement: (
    path: string,
    element: HTMLElement | null
  ) => () => void
  setActivePath: (path: string | null) => void
  setHoveredPath: (path: string | null) => void
  setIndicator: (indicator: AgentHtmlBlockDropIndicator | null) => void
}

const AgentHtmlBlockRuntimeContext =
  React.createContext<AgentHtmlBlockRuntimeContextValue | null>(null)

export function AgentHtmlBlockRuntimeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const elementsRef = React.useRef(new Map<string, HTMLElement>())
  const [hoveredPath, setHoveredPath] = React.useState<string | null>(null)
  const [activePath, setActivePath] = React.useState<string | null>(null)
  const [indicator, setIndicator] =
    React.useState<AgentHtmlBlockDropIndicator | null>(null)

  const registerBlockElement = React.useCallback(
    (path: string, element: HTMLElement | null) => {
      if (element) {
        elementsRef.current.set(path, element)
      } else {
        elementsRef.current.delete(path)
      }

      return () => {
        if (elementsRef.current.get(path) === element) {
          elementsRef.current.delete(path)
        }
      }
    },
    []
  )

  const getBlockElement = React.useCallback((path: string) => {
    return elementsRef.current.get(path) ?? null
  }, [])

  const getBlockElements = React.useCallback(() => {
    return [...elementsRef.current.values()]
  }, [])

  const getHoveredBlockElement = React.useCallback(() => {
    return hoveredPath ? elementsRef.current.get(hoveredPath) ?? null : null
  }, [hoveredPath])

  const getVisibleBlockRects = React.useCallback(() => {
    return [...elementsRef.current.values()]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
  }, [])

  const clearIndicator = React.useCallback(() => {
    setIndicator(null)
  }, [])

  const value = React.useMemo<AgentHtmlBlockRuntimeContextValue>(
    () => ({
      activePath,
      clearIndicator,
      getBlockElement,
      getBlockElements,
      getHoveredBlockElement,
      getVisibleBlockRects,
      hoveredPath,
      indicator,
      registerBlockElement,
      setActivePath,
      setHoveredPath,
      setIndicator,
    }),
    [
      activePath,
      clearIndicator,
      getBlockElement,
      getBlockElements,
      getHoveredBlockElement,
      getVisibleBlockRects,
      hoveredPath,
      indicator,
      registerBlockElement,
    ]
  )

  return (
    <AgentHtmlBlockRuntimeContext value={value}>
      {children}
    </AgentHtmlBlockRuntimeContext>
  )
}

export function useAgentHtmlBlockRuntime() {
  const context = React.useContext(AgentHtmlBlockRuntimeContext)

  if (!context) {
    throw new Error(
      "useAgentHtmlBlockRuntime must be used inside AgentHtmlBlockRuntimeProvider"
    )
  }

  return context
}
