import * as React from "react"

export type TableOfContentsItem = {
  id: string
  title: string
  depth?: number
}

export type UseScrollSpyOptions = {
  root?: Element | null
  /** Top offset in px. Headings above this line count as passed. */
  rootMargin?: string
}

function parseTopOffset(rootMargin: string): number {
  const top = rootMargin.trim().split(/\s+/)[0] ?? "0px"
  const value = Number.parseFloat(top)

  if (Number.isNaN(value)) {
    return 0
  }

  return Math.abs(value)
}

function getActiveIdFromScrollPosition(
  ids: string[],
  root: Element | null,
  offset: number
): string | undefined {
  if (ids.length === 0) {
    return undefined
  }

  const rootTop = root?.getBoundingClientRect().top ?? 0
  let activeId: string | undefined = ids[0]

  for (const id of ids) {
    const element = document.getElementById(id)
    if (!element) {
      continue
    }

    const top = element.getBoundingClientRect().top - rootTop

    if (top <= offset) {
      activeId = id
    }
  }

  return activeId
}

export function useScrollSpy(
  ids: string[],
  options: UseScrollSpyOptions = {}
): string | undefined {
  const { root = null, rootMargin = "0px 0px -80% 0px" } = options
  const [activeId, setActiveId] = React.useState<string | undefined>(ids[0])
  const offset = parseTopOffset(rootMargin)

  React.useEffect(() => {
    if (ids.length === 0) {
      setActiveId(undefined)
      return
    }

    let frame = 0

    const update = () => {
      const nextActiveId = getActiveIdFromScrollPosition(ids, root, offset)

      if (nextActiveId) {
        setActiveId(nextActiveId)
      }
    }

    const scheduleUpdate = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(update)
    }

    update()

    const scrollTarget = root ?? window
    scrollTarget.addEventListener("scroll", scheduleUpdate, { passive: true })
    window.addEventListener("resize", scheduleUpdate, { passive: true })

    return () => {
      cancelAnimationFrame(frame)
      scrollTarget.removeEventListener("scroll", scheduleUpdate)
      window.removeEventListener("resize", scheduleUpdate)
    }
  }, [ids, root, offset])

  return activeId
}
