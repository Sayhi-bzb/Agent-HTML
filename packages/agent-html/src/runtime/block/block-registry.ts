import * as React from "react"

import type { AgentHtmlInteractionUnit } from "@/agent-html/interaction/types"
import type { AgentHtmlBlockIntentCandidate } from "@/agent-html/runtime/block/drag-intent"
import type { AgentHtmlBlockLayoutSnapshot } from "@/agent-html/runtime/block/layout-transition"

type AgentHtmlBlockRuntimeIdentity = {
  motionKey: string
  path: string
}

export function useAgentHtmlBlockRegistry() {
  const elementsRef = React.useRef(new Map<string, HTMLElement>())
  const overlayElementRef = React.useRef<HTMLElement | null>(null)
  const previewsRef = React.useRef(new Map<string, React.ReactNode>())
  const unitsRef = React.useRef(new Map<string, AgentHtmlInteractionUnit>())

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

  const registerBlockPreview = React.useCallback(
    (path: string, preview: React.ReactNode) => {
      previewsRef.current.set(path, preview)

      return () => {
        if (previewsRef.current.get(path) === preview) {
          previewsRef.current.delete(path)
        }
      }
    },
    []
  )

  const getBlockPreview = React.useCallback((path: string) => {
    return previewsRef.current.get(path)
  }, [])

  const registerBlockUnit = React.useCallback(
    (path: string, unit: AgentHtmlInteractionUnit) => {
      unitsRef.current.set(path, unit)

      return () => {
        if (unitsRef.current.get(path) === unit) {
          unitsRef.current.delete(path)
        }
      }
    },
    []
  )

  const getBlockUnit = React.useCallback((path: string) => {
    return unitsRef.current.get(path)
  }, [])

  const registerOverlayElement = React.useCallback(
    (element: HTMLElement | null) => {
      overlayElementRef.current = element

      return () => {
        if (overlayElementRef.current === element) {
          overlayElementRef.current = null
        }
      }
    },
    []
  )

  const getOverlayElement = React.useCallback(() => {
    return overlayElementRef.current
  }, [])

  const findPathByMotionKey = React.useCallback((motionKey: string) => {
    return [...unitsRef.current.entries()].find(
      ([, unit]) => unit.motionKey === motionKey
    )?.[0]
  }, [])

  const getHoveredBlockElement = React.useCallback(
    (hoveredBlock: AgentHtmlBlockRuntimeIdentity | null) => {
      if (!hoveredBlock) {
        return null
      }

      const currentPath =
        findPathByMotionKey(hoveredBlock.motionKey) ?? hoveredBlock.path

      return elementsRef.current.get(currentPath) ?? null
    },
    [findPathByMotionKey]
  )

  const getVisibleBlockRects = React.useCallback(() => {
    return [...elementsRef.current.values()]
      .map((element) => element.getBoundingClientRect())
      .filter((rect) => rect.width > 0 && rect.height > 0)
  }, [])

  const captureDragCandidates = React.useCallback(() => {
    return [...elementsRef.current.entries()].map<AgentHtmlBlockIntentCandidate>(
      ([path, element]) => {
        const rect = element.getBoundingClientRect()

        return {
          role: unitsRef.current.get(path)?.role,
          path,
          rect: {
            bottom: rect.bottom,
            height: rect.height,
            left: rect.left,
            right: rect.right,
            top: rect.top,
            width: rect.width,
          },
        }
      }
    )
  }, [])

  const snapshotLayouts = React.useCallback((): AgentHtmlBlockLayoutSnapshot[] => {
    return [...elementsRef.current.entries()]
      .map(([path, element]) => {
        const rect = element.getBoundingClientRect()
        const unit = unitsRef.current.get(path)

        return {
          motionKey: unit?.motionKey ?? path,
          path,
          rect: {
            height: rect.height,
            left: rect.left,
            top: rect.top,
            width: rect.width,
          },
        }
      })
      .filter((snapshot) => snapshot.rect.width > 0 && snapshot.rect.height > 0)
  }, [])

  return {
    captureDragCandidates,
    findPathByMotionKey,
    getBlockElement,
    getBlockElements,
    getBlockPreview,
    getBlockUnit,
    getHoveredBlockElement,
    getOverlayElement,
    getVisibleBlockRects,
    registerBlockElement,
    registerBlockPreview,
    registerBlockUnit,
    registerOverlayElement,
    snapshotLayouts,
  }
}

export type AgentHtmlBlockRegistry = ReturnType<
  typeof useAgentHtmlBlockRegistry
>
