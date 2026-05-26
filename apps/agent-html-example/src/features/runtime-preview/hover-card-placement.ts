export type RectLike = {
  bottom: number
  left: number
  right: number
  top: number
}

export type SizeLike = {
  height: number
  width: number
}

export type HoverCardPlacement = {
  left: number
  side: HoverCardSide
  top: number
}

export type HoverCardSide = "bottom" | "left" | "right" | "top"

export type HoverCardCandidate = HoverCardPlacement

export function unionRects(rects: RectLike[]): RectLike | null {
  if (rects.length === 0) {
    return null
  }

  return rects.reduce<RectLike>(
    (acc, rect) => ({
      bottom: Math.max(acc.bottom, rect.bottom),
      left: Math.min(acc.left, rect.left),
      right: Math.max(acc.right, rect.right),
      top: Math.min(acc.top, rect.top),
    }),
    rects[0]
  )
}

function clamp(value: number, min: number, max: number) {
  return Math.min(Math.max(value, min), max)
}

function fitsHorizontally(left: number, width: number, viewport: RectLike, margin: number) {
  return left >= viewport.left + margin && left + width <= viewport.right - margin
}

function fitsVertically(top: number, height: number, viewport: RectLike, margin: number) {
  return top >= viewport.top + margin && top + height <= viewport.bottom - margin
}

function rectFromPlacement(candidate: HoverCardCandidate, cardSize: SizeLike): RectLike {
  return {
    bottom: candidate.top + cardSize.height,
    left: candidate.left,
    right: candidate.left + cardSize.width,
    top: candidate.top,
  }
}

function intersectionArea(a: RectLike, b: RectLike) {
  const width = Math.max(0, Math.min(a.right, b.right) - Math.max(a.left, b.left))
  const height = Math.max(0, Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top))

  return width * height
}

function overflowArea(rect: RectLike, viewport: RectLike, margin: number) {
  const safeViewport = {
    bottom: viewport.bottom - margin,
    left: viewport.left + margin,
    right: viewport.right - margin,
    top: viewport.top + margin,
  }
  const overflowWidth =
    Math.max(0, safeViewport.left - rect.left) +
    Math.max(0, rect.right - safeViewport.right)
  const overflowHeight =
    Math.max(0, safeViewport.top - rect.top) +
    Math.max(0, rect.bottom - safeViewport.bottom)
  const height = rect.bottom - rect.top
  const width = rect.right - rect.left

  return overflowWidth * height + overflowHeight * width
}

function scoreCandidate({
  candidate,
  cardSize,
  contentRect,
  margin,
  previousSide,
  viewportRect,
}: {
  candidate: HoverCardCandidate
  cardSize: SizeLike
  contentRect: RectLike
  margin: number
  previousSide?: HoverCardSide
  viewportRect: RectLike
}) {
  const rect = rectFromPlacement(candidate, cardSize)
  const overlapPenalty = intersectionArea(rect, contentRect)
  const overflowPenalty = overflowArea(rect, viewportRect, margin)
  const sideBonus = candidate.side === "left" || candidate.side === "right" ? 1000 : 0
  const stabilityBonus = previousSide === candidate.side ? 500 : 0

  return sideBonus + stabilityBonus - overlapPenalty * 4 - overflowPenalty * 20
}

export function selectHoverCardPlacement({
  candidates,
  cardSize,
  contentRect,
  margin = 12,
  previousSide,
  viewportRect,
}: {
  candidates: HoverCardCandidate[]
  cardSize: SizeLike
  contentRect: RectLike
  margin?: number
  previousSide?: HoverCardSide
  viewportRect: RectLike
}): HoverCardPlacement | null {
  let best:
    | {
        candidate: HoverCardCandidate
        score: number
      }
    | null = null

  for (const candidate of candidates) {
    const score = scoreCandidate({
      candidate,
      cardSize,
      contentRect,
      margin,
      previousSide,
      viewportRect,
    })

    if (!best || score > best.score) {
      best = { candidate, score }
    }
  }

  return best?.candidate ?? null
}

export function calculateHoverCardPlacement({
  blockRect,
  cardSize,
  contentRect,
  margin = 12,
  previousSide,
  viewportRect,
}: {
  blockRect: RectLike
  cardSize: SizeLike
  contentRect: RectLike
  margin?: number
  previousSide?: HoverCardSide
  viewportRect: RectLike
}): HoverCardPlacement | null {
  const centeredTop = clamp(
    blockRect.top + (blockRect.bottom - blockRect.top) / 2 - cardSize.height / 2,
    viewportRect.top + margin,
    viewportRect.bottom - cardSize.height - margin
  )
  const candidates: HoverCardCandidate[] = [
    {
      left: blockRect.left - cardSize.width - margin,
      side: "left",
      top: centeredTop,
    },
    {
      left: blockRect.right + margin,
      side: "right",
      top: centeredTop,
    },
  ]
  const centeredLeft = clamp(
    blockRect.left + (blockRect.right - blockRect.left) / 2 - cardSize.width / 2,
    viewportRect.left + margin,
    viewportRect.right - cardSize.width - margin
  )

  candidates.push(
    {
      left: centeredLeft,
      side: "top",
      top: blockRect.top - cardSize.height - margin,
    },
    {
      left: centeredLeft,
      side: "bottom",
      top: blockRect.bottom + margin,
    }
  )

  return selectHoverCardPlacement({
    candidates: candidates.filter((candidate) => {
      if (candidate.side === "left" || candidate.side === "right") {
        return fitsHorizontally(candidate.left, cardSize.width, viewportRect, margin)
      }

      return fitsVertically(candidate.top, cardSize.height, viewportRect, margin)
    }),
    cardSize,
    contentRect,
    margin,
    previousSide,
    viewportRect,
  })
}
