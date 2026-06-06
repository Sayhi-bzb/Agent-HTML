import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

type SchedulerModule = typeof import("./post-ready-task-scheduler")

class TestPointerEvent extends Event {
  constructor(type: string) {
    super(type)
  }
}

async function loadScheduler(): Promise<SchedulerModule> {
  vi.resetModules()
  return import("./post-ready-task-scheduler")
}

describe("post-ready task scheduler", () => {
  let eventTarget: EventTarget

  beforeEach(() => {
    vi.useFakeTimers()
    eventTarget = new EventTarget()
    vi.stubGlobal("PointerEvent", TestPointerEvent)
    vi.stubGlobal("window", {
      addEventListener: eventTarget.addEventListener.bind(eventTarget),
      cancelIdleCallback: (id: number) => globalThis.clearTimeout(id),
      dispatchEvent: eventTarget.dispatchEvent.bind(eventTarget),
      removeEventListener: eventTarget.removeEventListener.bind(eventTarget),
      requestIdleCallback: (callback: () => void) =>
        Number(globalThis.setTimeout(callback, 0)),
    })
  })

  afterEach(() => {
    vi.useRealTimers()
    vi.unstubAllGlobals()
  })

  it("runs tasks after their delay", async () => {
    const scheduler = await loadScheduler()
    const run = vi.fn()

    scheduler.schedulePostReadyTask({
      delay: 100,
      id: "task",
      priority: "visible-enhancement",
      run,
    })

    vi.advanceTimersByTime(99)
    expect(run).not.toHaveBeenCalled()

    vi.advanceTimersByTime(1)
    vi.runOnlyPendingTimers()
    expect(run).toHaveBeenCalledTimes(1)
  })

  it("cancels a pending task", async () => {
    const scheduler = await loadScheduler()
    const run = vi.fn()
    const handle = scheduler.schedulePostReadyTask({
      delay: 100,
      id: "task",
      priority: "visible-enhancement",
      run,
    })

    handle.cancel()
    vi.advanceTimersByTime(100)

    expect(run).not.toHaveBeenCalled()
  })

  it("deduplicates tasks by id", async () => {
    const scheduler = await loadScheduler()
    const firstRun = vi.fn()
    const secondRun = vi.fn()

    scheduler.schedulePostReadyTask({
      delay: 100,
      id: "task",
      priority: "visible-enhancement",
      run: firstRun,
    })
    scheduler.schedulePostReadyTask({
      delay: 50,
      id: "task",
      priority: "visible-enhancement",
      run: secondRun,
    })

    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()

    expect(firstRun).not.toHaveBeenCalled()
    expect(secondRun).toHaveBeenCalledTimes(1)
  })

  it("pauses enhancement work after first input and resumes later", async () => {
    const scheduler = await loadScheduler()
    const run = vi.fn()

    scheduler.schedulePostReadyTask({
      delay: 100,
      id: "task",
      priority: "visible-enhancement",
      run,
    })

    window.dispatchEvent(new PointerEvent("pointerdown"))
    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()
    expect(run).not.toHaveBeenCalled()

    vi.advanceTimersByTime(700)
    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()
    expect(run).toHaveBeenCalledTimes(1)
  })

  it("does not pause interaction-critical work after first input", async () => {
    const scheduler = await loadScheduler()
    const run = vi.fn()

    scheduler.schedulePostReadyTask({
      delay: 100,
      id: "task",
      priority: "interaction-critical",
      run,
    })

    window.dispatchEvent(new PointerEvent("pointerdown"))
    vi.advanceTimersByTime(100)
    vi.runOnlyPendingTimers()

    expect(run).toHaveBeenCalledTimes(1)
  })
})
