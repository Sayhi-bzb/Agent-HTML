export type TocLinkMetrics = {
  x: number
  top: number
  bottom: number
}

export function normalizeDepth(depth: number): number {
  if (depth <= 1) {
    return depth + 2
  }

  return depth
}

export function getDepthOffset(depth: number): number {
  const level = normalizeDepth(depth)

  if (level <= 2) {
    return 8
  }

  if (level === 3) {
    return 16
  }

  return 24
}

export function getDepthPadding(depth: number): number {
  const level = normalizeDepth(depth)

  if (level <= 2) {
    return 20
  }

  if (level === 3) {
    return 32
  }

  return 44
}

export function measureLinkMetrics(anchor: HTMLAnchorElement): {
  top: number
  bottom: number
} {
  const styles = getComputedStyle(anchor)

  return {
    top: anchor.offsetTop + Number.parseFloat(styles.paddingTop),
    bottom:
      anchor.offsetTop +
      anchor.clientHeight -
      Number.parseFloat(styles.paddingBottom),
  }
}

export function buildTocPath(metrics: TocLinkMetrics[]): string {
  if (metrics.length === 0) {
    return ""
  }

  let path = ""
  let previousX = 0
  let previousBottom = 0

  for (let index = 0; index < metrics.length; index += 1) {
    const { x, top, bottom } = metrics[index]

    if (index === 0) {
      path += `M ${x} ${top} L ${x} ${bottom}`
    } else {
      path += ` C ${previousX} ${top - 4} ${x} ${previousBottom + 4} ${x} ${top} L ${x} ${bottom}`
    }

    previousX = x
    previousBottom = bottom
  }

  return path
}
