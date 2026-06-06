export type PostReadyTaskPriority =
  | "interaction-critical"
  | "visible-enhancement"
  | "ambient"

export type InteractiveReadyState = {
  hasPendingEnhancements: boolean
  isWarming: boolean
}

export type PostReadyTaskHandle = {
  cancel: () => void
}

type ScheduledPostReadyTask = {
  cancel: () => void
  delay: number
  id: string
  idleTimeout: number
  priority: PostReadyTaskPriority
  run: () => void
  state: "pending" | "timer" | "idle" | "running" | "canceled" | "completed"
  timeoutId: ReturnType<typeof globalThis.setTimeout> | null
  idleId: number | null
}

const firstInputEvents = ["pointerdown", "keydown", "wheel"] as const
const priorityRank: Record<PostReadyTaskPriority, number> = {
  "interaction-critical": 0,
  "visible-enhancement": 1,
  ambient: 2,
}
const defaultIdleTimeoutByPriority: Record<PostReadyTaskPriority, number> = {
  "interaction-critical": 500,
  "visible-enhancement": 1800,
  ambient: 2400,
}

const tasks = new Map<string, ScheduledPostReadyTask>()
const listeners = new Set<() => void>()
let currentInteractiveReadyState: InteractiveReadyState = {
  hasPendingEnhancements: false,
  isWarming: false,
}
let hasSeenFirstInput = false
let isInputCoolingDown = false
let resumeTimeoutId: ReturnType<typeof globalThis.setTimeout> | null = null
let isListeningForInput = false

function isBrowser() {
  return typeof window !== "undefined"
}

function compareTasks(
  left: ScheduledPostReadyTask,
  right: ScheduledPostReadyTask
) {
  const priorityDelta = priorityRank[left.priority] - priorityRank[right.priority]
  if (priorityDelta !== 0) {
    return priorityDelta
  }

  return left.delay - right.delay
}

function runnableTasks() {
  return [...tasks.values()]
    .filter((task) => task.state === "pending")
    .sort(compareTasks)
}

function resolveInteractiveReadyState(): InteractiveReadyState {
  const pendingTasks = [...tasks.values()].filter(
    (task) => task.state !== "canceled" && task.state !== "completed"
  )

  return {
    hasPendingEnhancements: pendingTasks.some(
      (task) => task.priority !== "interaction-critical"
    ),
    isWarming:
      pendingTasks.length > 0 ||
      (hasSeenFirstInput && isInputCoolingDown),
  }
}

function emitInteractiveReadyStateChange() {
  const nextState = resolveInteractiveReadyState()
  if (
    nextState.hasPendingEnhancements ===
      currentInteractiveReadyState.hasPendingEnhancements &&
    nextState.isWarming === currentInteractiveReadyState.isWarming
  ) {
    return
  }

  currentInteractiveReadyState = nextState
  listeners.forEach((listener) => listener())
}

function shouldPauseTask(task: ScheduledPostReadyTask) {
  return (
    isInputCoolingDown &&
    task.priority !== "interaction-critical"
  )
}

function cancelTaskTimers(task: ScheduledPostReadyTask) {
  if (task.timeoutId !== null) {
    globalThis.clearTimeout(task.timeoutId)
    task.timeoutId = null
  }

  if (task.idleId !== null && isBrowser() && "cancelIdleCallback" in window) {
    const idleCallbackWindow = window as Window & {
      cancelIdleCallback: (id: number) => void
    }
    idleCallbackWindow.cancelIdleCallback(task.idleId)
    task.idleId = null
  }
}

function runTask(task: ScheduledPostReadyTask) {
  if (task.state === "canceled" || task.state === "completed") {
    return
  }

  task.state = "running"
  tasks.delete(task.id)
  emitInteractiveReadyStateChange()

  try {
    task.run()
  } finally {
    task.state = "completed"
    emitInteractiveReadyStateChange()
  }
}

function startIdlePhase(task: ScheduledPostReadyTask) {
  if (task.state === "canceled" || task.state === "completed") {
    return
  }

  if (shouldPauseTask(task)) {
    task.state = "pending"
    emitInteractiveReadyStateChange()
    return
  }

  task.state = "idle"
  if (isBrowser() && "requestIdleCallback" in window) {
    const idleCallbackWindow = window as Window & {
      requestIdleCallback: (
        callback: () => void,
        options?: { timeout: number }
      ) => number
    }
    task.idleId = idleCallbackWindow.requestIdleCallback(
      () => {
        task.idleId = null
        runTask(task)
      },
      { timeout: task.idleTimeout }
    )
    return
  }

  runTask(task)
}

function startTimer(task: ScheduledPostReadyTask) {
  if (!isBrowser()) {
    task.state = "completed"
    tasks.delete(task.id)
    emitInteractiveReadyStateChange()
    return
  }

  if (shouldPauseTask(task)) {
    task.state = "pending"
    emitInteractiveReadyStateChange()
    return
  }

  task.state = "timer"
  task.timeoutId = globalThis.setTimeout(() => {
    task.timeoutId = null
    startIdlePhase(task)
  }, task.delay)
}

function schedulePendingTasks() {
  runnableTasks().forEach((task) => {
    startTimer(task)
  })
  emitInteractiveReadyStateChange()
}

function resumeTasksAfterInput() {
  isInputCoolingDown = false
  schedulePendingTasks()
}

function handleFirstInput() {
  hasSeenFirstInput = true
  isInputCoolingDown = true

  tasks.forEach((task) => {
    if (task.priority === "interaction-critical") {
      return
    }

    cancelTaskTimers(task)
    if (task.state !== "running" && task.state !== "completed") {
      task.state = "pending"
    }
  })

  if (resumeTimeoutId !== null) {
    globalThis.clearTimeout(resumeTimeoutId)
  }
  resumeTimeoutId = globalThis.setTimeout(() => {
    resumeTimeoutId = null
    resumeTasksAfterInput()
  }, 700)
  emitInteractiveReadyStateChange()
}

function ensureFirstInputListener() {
  if (!isBrowser() || isListeningForInput) {
    return
  }

  firstInputEvents.forEach((eventName) => {
    window.addEventListener(eventName, handleFirstInput, {
      capture: true,
      once: true,
      passive: true,
    })
  })
  isListeningForInput = true
}

export function schedulePostReadyTask({
  delay,
  id,
  idleTimeout,
  priority,
  run,
}: {
  delay: number
  id: string
  idleTimeout?: number
  priority: PostReadyTaskPriority
  run: () => void
}): PostReadyTaskHandle {
  ensureFirstInputListener()

  tasks.get(id)?.cancel()

  const task: ScheduledPostReadyTask = {
    cancel: () => {
      if (task.state === "completed" || task.state === "running") {
        return
      }

      cancelTaskTimers(task)
      task.state = "canceled"
      tasks.delete(id)
      emitInteractiveReadyStateChange()
    },
    delay,
    id,
    idleId: null,
    idleTimeout: idleTimeout ?? defaultIdleTimeoutByPriority[priority],
    priority,
    run,
    state: "pending",
    timeoutId: null,
  }

  tasks.set(id, task)
  schedulePendingTasks()

  return {
    cancel: task.cancel,
  }
}

export function getInteractiveReadyState(): InteractiveReadyState {
  return currentInteractiveReadyState
}

export function subscribeInteractiveReadyState(listener: () => void) {
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
  }
}
