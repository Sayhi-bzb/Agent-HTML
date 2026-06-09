import { describe, expect, it, vi } from "vitest"

import {
  ArtifactRuntimeController,
  formatArtifactRuntimeError,
} from "./artifact-runtime"
import type { ArtifactModule } from "../host-contracts"

function createElement() {
  const parent = {
    appendChild: vi.fn(),
    ownerDocument: {
      createElement: vi.fn(() => ({
        remove: vi.fn(),
      })),
    },
    replaceChildren: vi.fn(),
  } as unknown as HTMLElement

  return parent
}

function createResponse({
  body = "",
  ok = true,
  status = 200,
}: {
  body?: string
  ok?: boolean
  status?: number
} = {}) {
  return {
    ok,
    status,
    text: async () => body,
  } as Response
}

function deferred<T>() {
  let resolve!: (value: T) => void
  let reject!: (error: unknown) => void
  const promise = new Promise<T>((promiseResolve, promiseReject) => {
    resolve = promiseResolve
    reject = promiseReject
  })

  return { promise, reject, resolve }
}

function moduleWithDispose(dispose = vi.fn()): ArtifactModule {
  return {
    mount: vi.fn(() => dispose),
  }
}

describe("ArtifactRuntimeController", () => {
  it("ignores stale imports when a newer artifact is selected", async () => {
    const first = deferred<ArtifactModule>()
    const secondModule = moduleWithDispose()
    const importModule = vi
      .fn()
      .mockReturnValueOnce(first.promise)
      .mockResolvedValueOnce(secondModule)
    const controller = new ArtifactRuntimeController({ importModule })
    controller.setElement(createElement())

    const firstLoad = controller.load("agent-html/artifacts/first.artifact.tsx")
    await Promise.resolve()
    const secondLoad = controller.load("agent-html/artifacts/second.artifact.tsx")
    first.resolve(moduleWithDispose())
    await Promise.all([firstLoad, secondLoad])

    expect(controller.getSnapshot()).toMatchObject({
      mountedFilePath: "agent-html/artifacts/second.artifact.tsx",
      status: "mounted",
    })
    expect(importModule).toHaveBeenCalledTimes(2)
    expect(secondModule.mount).toHaveBeenCalledOnce()
  })

  it("does not reimport the currently mounted artifact", async () => {
    const module = moduleWithDispose()
    const importModule = vi.fn().mockResolvedValue(module)
    const onMounted = vi.fn()
    const controller = new ArtifactRuntimeController({
      importModule,
      onMounted,
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx")
    await controller.load("agent-html/artifacts/demo.artifact.tsx")

    expect(importModule).toHaveBeenCalledOnce()
    expect(module.mount).toHaveBeenCalledOnce()
    expect(onMounted).toHaveBeenCalledTimes(2)
  })

  it("mounts the next artifact before disposing the previous one", async () => {
    const events: string[] = []
    const firstModule: ArtifactModule = {
      mount: vi.fn(() => {
        events.push("mount:first")
        return () => events.push("dispose:first")
      }),
    }
    const secondModule: ArtifactModule = {
      mount: vi.fn(() => {
        events.push("mount:second")
        return () => events.push("dispose:second")
      }),
    }
    const importModule = vi
      .fn()
      .mockResolvedValueOnce(firstModule)
      .mockResolvedValueOnce(secondModule)
    const controller = new ArtifactRuntimeController({ importModule })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/first.artifact.tsx")
    await controller.load("agent-html/artifacts/second.artifact.tsx")

    expect(events).toEqual(["mount:first", "mount:second", "dispose:first"])
    expect(controller.getSnapshot()).toMatchObject({
      mountedFilePath: "agent-html/artifacts/second.artifact.tsx",
      status: "mounted",
    })
  })

  it("keeps the mounted artifact visible when the next bundle load fails", async () => {
    const firstDispose = vi.fn()
    const firstModule = moduleWithDispose(firstDispose)
    const importModule = vi
      .fn()
      .mockResolvedValueOnce(firstModule)
      .mockRejectedValueOnce(new Error("Failed to fetch dynamically imported module"))
    const controller = new ArtifactRuntimeController({
      fetchBundle: vi.fn(async () => createResponse({ ok: false, status: 503 })),
      importModule,
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/first.artifact.tsx")
    await controller.load("agent-html/artifacts/second.artifact.tsx")

    expect(firstDispose).not.toHaveBeenCalled()
    expect(controller.getSnapshot()).toMatchObject({
      mountedFilePath: "agent-html/artifacts/first.artifact.tsx",
      status: "failed",
      error: {
        kind: "transform-error",
        recoverable: true,
        statusCode: 503,
      },
    })
  })

  it("reports bundle load failures with stage context", async () => {
    const fetchBundle = vi.fn(async () => createResponse())
    const controller = new ArtifactRuntimeController({
      fetchBundle,
      importModule: vi.fn(async () => {
        throw new Error("Failed to fetch dynamically imported module")
      }),
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx")

    const error = controller.getSnapshot().error
    expect(controller.getSnapshot().status).toBe("failed")
    expect(error).toMatchObject({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      kind: "module-graph-error",
      message: "Failed to fetch dynamically imported module",
      recoverable: false,
      stage: "bundle-load",
    })
    expect(formatArtifactRuntimeError(error!)).toContain("Bundle load failed")
  })

  it("classifies preflight network failures as server unavailable", async () => {
    const controller = new ArtifactRuntimeController({
      fetchBundle: vi.fn(async () => {
        throw new Error("connect ECONNREFUSED")
      }),
      importModule: vi.fn(async () => {
        throw new Error("Failed to fetch dynamically imported module")
      }),
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx")

    expect(controller.getSnapshot().error).toMatchObject({
      kind: "server-unavailable",
      recoverable: true,
    })
  })

  it("retries a recoverable active artifact load", async () => {
    const module = moduleWithDispose()
    const importModule = vi
      .fn()
      .mockRejectedValueOnce(new Error("Failed to fetch dynamically imported module"))
      .mockResolvedValueOnce(module)
    const controller = new ArtifactRuntimeController({
      fetchBundle: vi
        .fn()
        .mockRejectedValueOnce(new Error("connect ECONNREFUSED"))
        .mockResolvedValueOnce(createResponse()),
      importModule,
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx")
    await controller.retry()

    expect(importModule).toHaveBeenCalledTimes(2)
    expect(controller.getSnapshot()).toMatchObject({
      mountedFilePath: "agent-html/artifacts/demo.artifact.tsx",
      status: "mounted",
    })
  })

  it("reuses the active registry version when retrying a recoverable load", async () => {
    const urls: string[] = []
    const controller = new ArtifactRuntimeController({
      fetchBundle: vi.fn(async () => {
        throw new Error("connect ECONNREFUSED")
      }),
      importModule: vi.fn(async (url) => {
        urls.push(url)
        throw new Error("Failed to fetch dynamically imported module")
      }),
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx", 7)
    await controller.retry()

    expect(urls).toHaveLength(2)
    expect(urls[0]).toContain("v=7")
    expect(urls[1]).toContain("v=7")
  })

  it("reloads the mounted artifact when the registry version changes", async () => {
    const importModule = vi
      .fn()
      .mockResolvedValueOnce(moduleWithDispose())
      .mockResolvedValueOnce(moduleWithDispose())
    const controller = new ArtifactRuntimeController({ importModule })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx", 1)
    await controller.load("agent-html/artifacts/demo.artifact.tsx", 2)

    expect(importModule).toHaveBeenCalledTimes(2)
    expect(importModule.mock.calls[0]?.[0]).toContain("v=1")
    expect(importModule.mock.calls[1]?.[0]).toContain("v=2")
  })

  it("does not retry module graph failures on a timer", async () => {
    vi.useFakeTimers()
    const importModule = vi.fn(async () => {
      throw new Error("Failed to fetch dynamically imported module")
    })
    const controller = new ArtifactRuntimeController({
      fetchBundle: vi.fn(async () => createResponse()),
      importModule,
    })
    controller.setElement(createElement())

    await controller.load("agent-html/artifacts/demo.artifact.tsx", 1)
    await vi.advanceTimersByTimeAsync(1000)

    expect(importModule).toHaveBeenCalledOnce()
    vi.useRealTimers()
  })
})
