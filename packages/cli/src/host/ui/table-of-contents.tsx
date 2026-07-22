"use client"

import * as React from "react"
import { ListTree } from "lucide-react"

import { Separator } from "#agent-html-playground/components/ui/separator"
import { type TableOfContentsItem as TocItemData } from "./use-table-of-contents"
import {
  buildTocPath,
  getDepthOffset,
  getDepthPadding,
  measureLinkMetrics,
  type TocLinkMetrics,
} from "./toc-path"

function cn(...classes: (false | null | string | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}

type TableOfContentsContextValue = {
  items: TocItemData[]
  activeId?: string
  activeIndex: number
  onItemClick?: (id: string) => void
}

const TableOfContentsContext =
  React.createContext<TableOfContentsContextValue | null>(null)

const tableOfContentsStyles = {
  shell: "relative pl-1",
  header:
    "mb-3 flex items-center gap-2 font-mono text-2xs tracking-wide text-muted-foreground uppercase",
  icon: "size-3.5 shrink-0",
  separator: "mb-3 opacity-30",
  track: "text-muted-foreground/25",
  activeTrack: "text-foreground",
  item: "relative z-[1] block w-fit scroll-m-4 rounded-sm py-1 pr-2 text-sm transition-colors focus-visible:outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50",
  itemActive: "text-foreground",
  itemTrail: "text-foreground",
  itemIdle: "text-muted-foreground/60 hover:text-muted-foreground",
}

function useTableOfContentsContext() {
  const context = React.useContext(TableOfContentsContext)
  if (!context) {
    throw new Error(
      "TableOfContents components must be used within TableOfContents"
    )
  }
  return context
}

type TableOfContentsProps = React.ComponentProps<"nav"> & {
  items: TocItemData[]
  activeId?: string
  onItemClick?: (id: string) => void
}

function TableOfContents({
  items,
  activeId,
  onItemClick,
  className,
  children,
  ...props
}: TableOfContentsProps) {
  const activeIndex = activeId
    ? items.findIndex((item) => item.id === activeId)
    : -1

  const contextValue = React.useMemo(
    () => ({
      items,
      activeId,
      activeIndex,
      onItemClick,
    }),
    [items, activeId, activeIndex, onItemClick]
  )

  return (
    <TableOfContentsContext.Provider value={contextValue}>
      <nav
        aria-label="Table of contents"
        className={cn("relative w-full", className)}
        {...props}
      >
        {children ?? <TableOfContentsContent />}
      </nav>
    </TableOfContentsContext.Provider>
  )
}

function TableOfContentsContent() {
  return (
    <div className={tableOfContentsStyles.shell}>
      <TableOfContentsHeader />
      <Separator className={tableOfContentsStyles.separator} />
      <TableOfContentsList />
    </div>
  )
}

type TableOfContentsHeaderProps = React.ComponentProps<"div"> & {
  title?: string
}

function TableOfContentsHeader({
  title = "On this page",
  className,
  children,
  ...props
}: TableOfContentsHeaderProps) {
  return (
    <div className={cn(tableOfContentsStyles.header, className)} {...props}>
      {children ?? (
        <>
          <TableOfContentsIcon className={tableOfContentsStyles.icon} />
          <span>{title}</span>
        </>
      )}
    </div>
  )
}

function TableOfContentsIcon({ className }: { className?: string }) {
  return <ListTree aria-hidden="true" className={className} />
}

type IndicatorState = {
  path: string
  metrics: TocLinkMetrics[]
  width: number
  height: number
}

function getTocAnchor(
  container: HTMLElement,
  id: string
): HTMLAnchorElement | null {
  return container.querySelector<HTMLAnchorElement>(
    `[data-toc-id="${CSS.escape(id)}"]`
  )
}

function TableOfContentsList({
  className,
  ...props
}: React.ComponentProps<"div">) {
  const { items, activeIndex } = useTableOfContentsContext()
  const fadeId = React.useId().replace(/:/g, "")
  const fadeGradientId = `${fadeId}-toc-line-fade-gradient`
  const trackMaskId = `${fadeId}-toc-track-fade`
  const activeTrackMaskId = `${fadeId}-toc-active-track-fade`
  const containerRef = React.useRef<HTMLDivElement>(null)
  const clipRef = React.useRef<HTMLDivElement>(null)
  const [indicator, setIndicator] = React.useState<IndicatorState | null>(null)

  const measurePath = React.useCallback(() => {
    const container = containerRef.current
    if (!container || container.clientHeight === 0) {
      return
    }

    const metrics: TocLinkMetrics[] = []
    let width = 0
    let height = 0

    for (const item of items) {
      const anchor = getTocAnchor(container, item.id)

      if (!anchor) {
        continue
      }

      const { top, bottom } = measureLinkMetrics(anchor)
      const x = getDepthOffset(item.depth ?? 2) + 0.5

      width = Math.max(x + 8, width)
      height = Math.max(bottom, height)
      metrics.push({ x, top, bottom })
    }

    setIndicator({
      path: buildTocPath(metrics),
      metrics,
      width,
      height,
    })
  }, [items])

  const updateClip = React.useCallback(() => {
    const container = containerRef.current
    const clip = clipRef.current

    if (!container || !clip || activeIndex < 0) {
      return
    }

    let top = Number.POSITIVE_INFINITY
    let bottom = 0

    for (let index = 0; index <= activeIndex; index += 1) {
      const anchor = getTocAnchor(container, items[index].id)

      if (!anchor) {
        continue
      }

      const metrics = measureLinkMetrics(anchor)
      top = Math.min(top, metrics.top)
      bottom = Math.max(bottom, metrics.bottom)
    }

    if (top === Number.POSITIVE_INFINITY) {
      return
    }

    clip.style.setProperty("--toc-top", `${top}px`)
    clip.style.setProperty("--toc-height", `${bottom - top}px`)
  }, [activeIndex, items])

  React.useLayoutEffect(() => {
    measurePath()
    updateClip()

    const container = containerRef.current
    if (!container) {
      return
    }

    const resizeObserver = new ResizeObserver(() => {
      measurePath()
      updateClip()
    })

    resizeObserver.observe(container)

    return () => resizeObserver.disconnect()
  }, [measurePath, updateClip])

  React.useLayoutEffect(() => {
    updateClip()
  }, [updateClip, activeIndex, indicator])

  return (
    <div
      ref={containerRef}
      className={cn("relative flex flex-col", className)}
      {...props}
    >
      {indicator?.path ? (
        <>
          <svg
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            viewBox={`0 0 ${indicator.width} ${indicator.height}`}
            className="pointer-events-none absolute top-0 left-0 overflow-visible"
            style={{ width: indicator.width, height: indicator.height }}
          >
            <defs>
              <linearGradient
                id={fadeGradientId}
                x1="0"
                x2="0"
                y1="0"
                y2={indicator.height}
                gradientUnits="userSpaceOnUse"
              >
                <stop offset="0%" stopColor="white" stopOpacity="0" />
                <stop offset="10%" stopColor="white" stopOpacity="1" />
                <stop offset="90%" stopColor="white" stopOpacity="1" />
                <stop offset="100%" stopColor="white" stopOpacity="0" />
              </linearGradient>
              <mask
                id={trackMaskId}
                maskUnits="userSpaceOnUse"
                x="0"
                y="0"
                width={indicator.width}
                height={indicator.height}
              >
                <rect
                  width={indicator.width}
                  height={indicator.height}
                  fill={`url(#${fadeGradientId})`}
                />
              </mask>
            </defs>
            <path
              d={indicator.path}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              mask={`url(#${trackMaskId})`}
              className={tableOfContentsStyles.track}
            />
            {indicator.metrics.map((metric, index) => {
              const y = (metric.top + metric.bottom) / 2
              const isReached = activeIndex >= 0 && index <= activeIndex

              return (
                <circle
                  key={`${metric.x}-${y}`}
                  cx={metric.x}
                  cy={y}
                  r={isReached ? 2.5 : 1.75}
                  className={cn(
                    "transition-[r,color,opacity] duration-300",
                    isReached
                      ? "fill-foreground text-foreground"
                      : "fill-background stroke-current text-muted-foreground/35"
                  )}
                  strokeWidth="1"
                />
              )
            })}
          </svg>

          <div
            ref={clipRef}
            className="pointer-events-none absolute top-0 left-0"
            style={{ width: indicator.width, height: indicator.height }}
          >
            <svg
              aria-hidden="true"
              xmlns="http://www.w3.org/2000/svg"
              viewBox={`0 0 ${indicator.width} ${indicator.height}`}
              className="absolute transition-[clip-path] duration-300 ease-out"
              style={{
                width: indicator.width,
                height: indicator.height,
                clipPath:
                  "polygon(0 var(--toc-top), 100% var(--toc-top), 100% calc(var(--toc-top) + var(--toc-height)), 0 calc(var(--toc-top) + var(--toc-height)))",
              }}
            >
              <defs>
                <linearGradient
                  id={`${fadeGradientId}-active`}
                  x1="0"
                  x2="0"
                  y1="0"
                  y2={indicator.height}
                  gradientUnits="userSpaceOnUse"
                >
                  <stop offset="0%" stopColor="white" stopOpacity="0" />
                  <stop offset="10%" stopColor="white" stopOpacity="1" />
                  <stop offset="90%" stopColor="white" stopOpacity="1" />
                  <stop offset="100%" stopColor="white" stopOpacity="0" />
                </linearGradient>
                <mask
                  id={activeTrackMaskId}
                  maskUnits="userSpaceOnUse"
                  x="0"
                  y="0"
                  width={indicator.width}
                  height={indicator.height}
                >
                  <rect
                    width={indicator.width}
                    height={indicator.height}
                    fill={`url(#${fadeGradientId}-active)`}
                  />
                </mask>
              </defs>
              <path
                d={indicator.path}
                fill="none"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                mask={`url(#${activeTrackMaskId})`}
                className={tableOfContentsStyles.activeTrack}
              />
              {indicator.metrics.map((metric, index) => {
                if (activeIndex < 0 || index > activeIndex) {
                  return null
                }

                const y = (metric.top + metric.bottom) / 2

                return (
                  <circle
                    key={`${metric.x}-${y}-active`}
                    cx={metric.x}
                    cy={y}
                    r="3"
                    className="fill-background stroke-current text-foreground"
                    strokeWidth="1.5"
                  />
                )
              })}
            </svg>
          </div>
        </>
      ) : null}

      <TableOfContentsItemGroup>
        {items.map((item, index) => (
          <TableOfContentsItem key={item.id} item={item} index={index} />
        ))}
      </TableOfContentsItemGroup>
    </div>
  )
}

function TableOfContentsItemGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      role="list"
      className={cn("relative flex flex-col", className)}
      {...props}
    />
  )
}

type TableOfContentsItemProps = {
  item: TocItemData
  index: number
  className?: string
}

function TableOfContentsItem({
  item,
  index,
  className,
}: TableOfContentsItemProps) {
  const { activeId, activeIndex, onItemClick } = useTableOfContentsContext()
  const depth = item.depth ?? 2
  const isActive = item.id === activeId
  const inTrail = activeIndex >= 0 && index <= activeIndex

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault()
      onItemClick?.(item.id)

      const element = document.getElementById(item.id)
      element?.scrollIntoView({ behavior: "smooth", block: "start" })
    },
    [item.id, onItemClick]
  )

  return (
    <a
      role="listitem"
      href={`#${item.id}`}
      onClick={handleClick}
      data-toc-id={item.id}
      data-active={isActive}
      data-in-trail={inTrail}
      style={{ paddingInlineStart: getDepthPadding(depth) }}
      className={cn(
        tableOfContentsStyles.item,
        inTrail
          ? tableOfContentsStyles.itemTrail
          : tableOfContentsStyles.itemIdle,
        isActive && tableOfContentsStyles.itemActive,
        className
      )}
    >
      {item.title}
    </a>
  )
}

export {
  TableOfContents,
  TableOfContentsHeader,
  TableOfContentsIcon,
  TableOfContentsItem,
  TableOfContentsList,
}

export type { TableOfContentsItem as TocItem } from "./use-table-of-contents"

export { useScrollSpy } from "./use-table-of-contents"
