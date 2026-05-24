import * as React from "react"

type PreviewCardComponent = React.ComponentType

type MasonryItemLayout = {
  height: number
  width: number
  x: number
  y: number
}

type MasonryMetrics = {
  columnCount: number
  columnWidth: number
  gap: number
  padding: number
}

const MAX_COLUMNS = 4
const MIN_COLUMN_WIDTH = 320

function arraysEqual(left: number[], right: number[]) {
  return (
    left.length === right.length &&
    left.every((value, index) => value === right[index])
  )
}

function getMasonryMetrics(element: HTMLDivElement): MasonryMetrics {
  const styles = window.getComputedStyle(element)
  const padding = Number.parseFloat(styles.paddingLeft) || 0
  const totalWidth = element.clientWidth
  const innerWidth = Math.max(totalWidth - padding * 2, 0)
  const gap = padding
  const columnCount = Math.max(
    1,
    Math.min(
      MAX_COLUMNS,
      Math.floor((innerWidth + gap) / (MIN_COLUMN_WIDTH + gap)) || 1
    )
  )
  const columnWidth =
    columnCount > 0
      ? Math.max((innerWidth - gap * (columnCount - 1)) / columnCount, 0)
      : 0

  return {
    columnCount,
    columnWidth,
    gap,
    padding,
  }
}

function getMasonryLayout({
  heights,
  metrics,
}: {
  heights: number[]
  metrics: MasonryMetrics
}) {
  const columnHeights = new Array(metrics.columnCount).fill(0)
  const items: MasonryItemLayout[] = heights.map((height) => {
    let targetColumnIndex = 0

    for (let index = 1; index < columnHeights.length; index += 1) {
      if (columnHeights[index] < columnHeights[targetColumnIndex]) {
        targetColumnIndex = index
      }
    }

    const layout = {
      height,
      width: metrics.columnWidth,
      x:
        metrics.padding +
        targetColumnIndex * (metrics.columnWidth + metrics.gap),
      y: metrics.padding + columnHeights[targetColumnIndex],
    }

    columnHeights[targetColumnIndex] += height + metrics.gap

    return layout
  })

  const tallestColumn = Math.max(...columnHeights, 0)
  const height =
    tallestColumn > 0
      ? metrics.padding * 2 + tallestColumn - metrics.gap
      : metrics.padding * 2

  return {
    height,
    items,
  }
}

export function PreviewMasonry({
  cards,
}: {
  cards: readonly PreviewCardComponent[]
}) {
  const containerRef = React.useRef<HTMLDivElement | null>(null)
  const itemRefs = React.useRef<Array<HTMLDivElement | null>>([])
  const [metrics, setMetrics] = React.useState<MasonryMetrics>({
    columnCount: 1,
    columnWidth: 0,
    gap: 0,
    padding: 0,
  })
  const [heights, setHeights] = React.useState<number[]>([])

  React.useLayoutEffect(() => {
    const container = containerRef.current
    if (!container) {
      return
    }

    const updateMetrics = () => {
      const nextMetrics = getMasonryMetrics(container)

      setMetrics((currentMetrics) =>
        currentMetrics.columnCount === nextMetrics.columnCount &&
        currentMetrics.columnWidth === nextMetrics.columnWidth &&
        currentMetrics.gap === nextMetrics.gap &&
        currentMetrics.padding === nextMetrics.padding
          ? currentMetrics
          : nextMetrics
      )
    }

    updateMetrics()

    const resizeObserver = new ResizeObserver(() => {
      updateMetrics()
    })

    resizeObserver.observe(container)

    return () => {
      resizeObserver.disconnect()
    }
  }, [])

  React.useLayoutEffect(() => {
    const nodes = itemRefs.current
      .slice(0, cards.length)
      .filter((node): node is HTMLDivElement => node !== null)
    if (nodes.length === 0) {
      return
    }

    const updateHeights = () => {
      const nextHeights = itemRefs.current.slice(0, cards.length).map((node) => {
        if (!node) {
          return 0
        }

        return Math.ceil(node.getBoundingClientRect().height)
      })

      setHeights((currentHeights) =>
        arraysEqual(currentHeights, nextHeights) ? currentHeights : nextHeights
      )
    }

    updateHeights()

    const resizeObserver = new ResizeObserver(() => {
      updateHeights()
    })

    nodes.forEach((node) => resizeObserver.observe(node))

    return () => {
      resizeObserver.disconnect()
    }
  }, [cards, metrics.columnWidth])

  const layout = React.useMemo(() => {
    if (metrics.columnWidth <= 0 || heights.length !== cards.length) {
      return null
    }

    if (heights.some((height) => height <= 0)) {
      return null
    }

    return getMasonryLayout({
      heights,
      metrics,
    })
  }, [cards.length, heights, metrics])

  const fallbackColumns =
    metrics.columnCount > 1
      ? {
          gridTemplateColumns: `repeat(${metrics.columnCount}, minmax(0, 1fr))`,
        }
      : undefined

  return (
    <div
      ref={containerRef}
      className={
        "relative p-[var(--space-2)] " +
        (layout ? "" : "grid gap-[var(--space-2)]")
      }
      style={
        layout
          ? { height: `${layout.height}px` }
          : fallbackColumns
      }
    >
      {cards.map((PreviewCard, index) => {
        const itemLayout = layout?.items[index]

        return (
          <div
            key={PreviewCard.name}
            ref={(node) => {
              itemRefs.current[index] = node
            }}
            className={layout ? "absolute top-0 left-0 will-change-transform" : ""}
            style={
              itemLayout
                ? {
                    transform: `translate(${itemLayout.x}px, ${itemLayout.y}px)`,
                    width: `${itemLayout.width}px`,
                  }
                : metrics.columnWidth > 0
                  ? { width: `${metrics.columnWidth}px` }
                  : undefined
            }
          >
            <PreviewCard />
          </div>
        )
      })}
    </div>
  )
}
