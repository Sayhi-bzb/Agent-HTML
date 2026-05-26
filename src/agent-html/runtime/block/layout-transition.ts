export type AgentHtmlBlockLayoutRect = {
  height: number
  left: number
  top: number
  width: number
}

export type AgentHtmlBlockLayoutSnapshot = {
  motionKey: string
  path: string
  rect: AgentHtmlBlockLayoutRect
}

export type AgentHtmlBlockLayoutTransition = {
  deltaX: number
  deltaY: number
  scaleX: number
  scaleY: number
}

export type AgentHtmlBlockLayoutKeyframe = {
  transform: string
  transformOrigin: "top left"
}

const minDelta = 0.5

function isUniqueMotionKey(
  motionKey: string,
  snapshots: readonly AgentHtmlBlockLayoutSnapshot[]
) {
  return (
    motionKey.length > 0 &&
    snapshots.filter((snapshot) => snapshot.motionKey === motionKey).length === 1
  )
}

function findPreviousSnapshot(
  snapshot: AgentHtmlBlockLayoutSnapshot,
  previous: readonly AgentHtmlBlockLayoutSnapshot[],
  next: readonly AgentHtmlBlockLayoutSnapshot[]
) {
  if (
    isUniqueMotionKey(snapshot.motionKey, next) &&
    isUniqueMotionKey(snapshot.motionKey, previous)
  ) {
    return previous.find((candidate) => candidate.motionKey === snapshot.motionKey)
  }

  return previous.find((candidate) => candidate.path === snapshot.path)
}

export function getAgentHtmlBlockLayoutTransition({
  next,
  previous,
}: {
  next: AgentHtmlBlockLayoutSnapshot
  previous: AgentHtmlBlockLayoutSnapshot
}): AgentHtmlBlockLayoutTransition | null {
  if (next.rect.width <= 0 || next.rect.height <= 0) {
    return null
  }

  const deltaX = previous.rect.left - next.rect.left
  const deltaY = previous.rect.top - next.rect.top
  const scaleX = previous.rect.width / next.rect.width
  const scaleY = previous.rect.height / next.rect.height
  const hasDelta =
    Math.abs(deltaX) >= minDelta ||
    Math.abs(deltaY) >= minDelta ||
    Math.abs(scaleX - 1) >= 0.01 ||
    Math.abs(scaleY - 1) >= 0.01

  if (!hasDelta) {
    return null
  }

  return {
    deltaX,
    deltaY,
    scaleX,
    scaleY,
  }
}

export function getAgentHtmlBlockLayoutTransitions({
  next,
  previous,
}: {
  next: readonly AgentHtmlBlockLayoutSnapshot[]
  previous: readonly AgentHtmlBlockLayoutSnapshot[]
}) {
  const transitions = new Map<string, AgentHtmlBlockLayoutTransition>()

  for (const nextSnapshot of next) {
    const previousSnapshot = findPreviousSnapshot(
      nextSnapshot,
      previous,
      next
    )

    if (!previousSnapshot) {
      continue
    }

    const transition = getAgentHtmlBlockLayoutTransition({
      next: nextSnapshot,
      previous: previousSnapshot,
    })

    if (transition) {
      transitions.set(nextSnapshot.path, transition)
    }
  }

  return transitions
}

export function getAgentHtmlBlockLayoutKeyframes(
  transition: AgentHtmlBlockLayoutTransition
): [AgentHtmlBlockLayoutKeyframe, AgentHtmlBlockLayoutKeyframe] {
  return [
    {
      transform: `translate(${transition.deltaX}px, ${transition.deltaY}px) scale(${transition.scaleX}, ${transition.scaleY})`,
      transformOrigin: "top left",
    },
    {
      transform: "translate(0, 0) scale(1, 1)",
      transformOrigin: "top left",
    },
  ]
}
