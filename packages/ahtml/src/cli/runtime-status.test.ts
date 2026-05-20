/// <reference types="node" />
// @vitest-environment node

import { mkdtemp } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { vi } from "vitest"

import { afterEach, describe, expect, it } from "vitest"

import { importCliModule, removeTempDir } from "./cli-test-helpers"

const tempDirs: string[] = []

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()

    if (dir) {
      await removeTempDir(dir)
    }
  }
})

describe("withRuntimeBuildLock", () => {
  it("serializes concurrent runtime build critical sections", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-runtime-"))
    tempDirs.push(tempDir)
    const { getRuntimePaths } = await importCliModule<{
      readonly getRuntimePaths: (
        env?: NodeJS.ProcessEnv,
      ) => {
        readonly runtimeRoot: string
      }
    }>("runtime-paths.mjs")
    const { withRuntimeBuildLock } = await importCliModule<{
      readonly withRuntimeBuildLock: <T>(
        paths: { readonly runtimeRoot: string },
        action: () => Promise<T>,
      ) => Promise<T>
    }>("runtime-status.mjs")
    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: tempDir,
    })
    const timeline: string[] = []
    let activeCount = 0
    let maxActiveCount = 0

    await Promise.all([
      withRuntimeBuildLock(runtimePaths, async () => {
        timeline.push("first:start")
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        await new Promise((resolve) => setTimeout(resolve, 120))
        activeCount -= 1
        timeline.push("first:end")
      }),
      withRuntimeBuildLock(runtimePaths, async () => {
        timeline.push("second:start")
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        activeCount -= 1
        timeline.push("second:end")
      }),
    ])

    expect(maxActiveCount).toBe(1)
    expect(timeline).toHaveLength(4)
    expect(timeline).toContain("first:start")
    expect(timeline).toContain("first:end")
    expect(timeline).toContain("second:start")
    expect(timeline).toContain("second:end")
  })

  it("serializes setup bootstrap through the same runtime build lock", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-runtime-"))
    tempDirs.push(tempDir)
    const { getRuntimePaths } = await importCliModule<{
      readonly getRuntimePaths: (
        env?: NodeJS.ProcessEnv,
      ) => {
        readonly runtimeRoot: string
      }
    }>("runtime-paths.mjs")
    const runtimeStatusModule = await importCliModule<{
      readonly bootstrapManagedRuntimeWithLock: (options: {
        readonly bootstrap?: (options: {
          readonly packageVersion: string
        }) => Promise<unknown>
        readonly packageRoot: string
        readonly packageVersion: string
        readonly paths: { readonly runtimeRoot: string }
        readonly schema: Record<string, unknown>
        readonly setup: Record<string, unknown>
      }) => Promise<unknown>
    }>("runtime-status.mjs")

    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: tempDir,
    })
    const timeline: string[] = []
    let activeCount = 0
    let maxActiveCount = 0
    const planQueue = [
      { label: "first", delayMs: 120 },
      { label: "second", delayMs: 0 },
    ]
    const bootstrapSpy = vi.fn(async ({ packageVersion }: { packageVersion: string }) => {
        const nextPlan = planQueue.shift()
        if (!nextPlan) {
          throw new Error("Missing bootstrap plan entry.")
        }

        timeline.push(`${nextPlan.label}:start`)
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        await new Promise((resolve) => setTimeout(resolve, nextPlan.delayMs))
        activeCount -= 1
        timeline.push(`${nextPlan.label}:end`)
        return {
          packageVersion,
        }
      })
    const guardedBootstrap = (label: string, delayMs: number) =>
      runtimeStatusModule.bootstrapManagedRuntimeWithLock({
        bootstrap: bootstrapSpy,
        packageRoot: process.cwd(),
        packageVersion: `${label}-test`,
        paths: runtimePaths,
        schema: {},
        setup: {
          componentSource: "test",
          components: [],
          preset: "custom",
        },
      })

    await Promise.all([
      guardedBootstrap("first", 120),
      guardedBootstrap("second", 0),
    ])

    expect(bootstrapSpy).toHaveBeenCalledTimes(2)
    expect(maxActiveCount).toBe(1)
    expect(timeline).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ])
  })
})
