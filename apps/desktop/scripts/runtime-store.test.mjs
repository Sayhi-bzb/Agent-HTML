import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  createRuntimeFingerprint,
  createRuntimeManifest,
  isRuntimeBundleReady,
  publishCurrentRuntime,
  readCurrentRuntime,
  runtimeBundlePaths,
  runtimeDataRoot,
  runtimeStorePaths,
  withRuntimeBuildLock,
} from "./runtime-store.mjs"

const temporaryRoots = []

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      fs.rm(root, { force: true, recursive: true })
    )
  )
})

async function temporaryRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-store-test-"))
  temporaryRoots.push(root)
  return root
}

describe("runtime store paths", () => {
  it("uses the Desktop local-data directory and supports an explicit override", () => {
    expect(
      runtimeDataRoot({
        environment: { LOCALAPPDATA: "C:\\Local" },
        homeDirectory: "C:\\Users\\demo",
        platform: "win32",
      })
    ).toBe(path.join("C:\\Local", "dev.ahtml.desktop", "runtime"))
    expect(
      runtimeDataRoot({
        environment: { AHTML_RUNTIME_HOME: "D:\\runtime-store" },
        platform: "win32",
      })
    ).toBe(path.resolve("D:\\runtime-store"))
  })

  it("derives immutable roots from a content fingerprint", () => {
    const fingerprint = createRuntimeFingerprint({
      bundleFingerprint: "bundle",
      nodeFingerprint: "node",
      target: "target",
    })
    expect(fingerprint).toMatch(/^[a-f\d]{64}$/)
    expect(
      createRuntimeFingerprint({
        bundleFingerprint: "changed",
        nodeFingerprint: "node",
        target: "target",
      })
    ).not.toBe(fingerprint)
  })
})

describe("runtime publication", () => {
  it("publishes and reads one atomic current selection", async () => {
    const root = await temporaryRoot()
    const paths = runtimeStorePaths({
      environment: { AHTML_RUNTIME_HOME: root },
    })
    const fingerprint = "a".repeat(64)

    await publishCurrentRuntime(paths, {
      fingerprint,
      selectedAt: "2026-01-01T00:00:00.000Z",
      target: "target",
    })

    await expect(readCurrentRuntime(paths)).resolves.toMatchObject({
      fingerprint,
      schemaVersion: 1,
      target: "target",
    })

    const nextFingerprint = "c".repeat(64)
    await publishCurrentRuntime(paths, {
      fingerprint: nextFingerprint,
      selectedAt: "2026-01-02T00:00:00.000Z",
      target: "target",
    })
    await expect(readCurrentRuntime(paths)).resolves.toMatchObject({
      fingerprint: nextFingerprint,
      previousFingerprint: fingerprint,
    })
  })

  it("accepts only a complete versioned immutable bundle", async () => {
    const root = await temporaryRoot()
    const fingerprint = "b".repeat(64)
    const nodeFileName = process.platform === "win32" ? "node.exe" : "node"
    const bundle = runtimeBundlePaths(root, nodeFileName)
    await Promise.all([
      fs.mkdir(path.dirname(bundle.cliEntry), { recursive: true }),
      fs.mkdir(path.dirname(bundle.nodeEntry), { recursive: true }),
      fs.mkdir(path.dirname(bundle.reactManifest), { recursive: true }),
      fs.mkdir(path.dirname(bundle.templateEntry), { recursive: true }),
    ])
    await Promise.all([
      fs.writeFile(bundle.cliEntry, ""),
      fs.writeFile(bundle.nodeEntry, ""),
      fs.writeFile(bundle.reactManifest, "{}"),
      fs.writeFile(bundle.templateEntry, ""),
      fs.writeFile(
        bundle.manifestPath,
        JSON.stringify(
          createRuntimeManifest({
            browserEntries: ["react"],
            builtAt: "2026-01-01T00:00:00.000Z",
            canvasDependencies: ["react"],
            cliVersion: "1.0.0",
            dependencyContractDigest: "contract",
            dependencyContractVersion: 2,
            dependencyClosureHash: "closure",
            fingerprint,
            nodeFileName,
            nodeVersion: process.version,
            platform: process.platform,
            reactVersion: "1.0.0",
            styleEntries: [],
            target: "target",
          })
        )
      ),
    ])

    await expect(
      isRuntimeBundleReady({ fingerprint, nodeFileName, root })
    ).resolves.toBe(true)
  })

  it("serializes concurrent builders", async () => {
    const root = await temporaryRoot()
    const lockPath = path.join(root, "locks", "runtime")
    const events = []

    await Promise.all([
      withRuntimeBuildLock(lockPath, async () => {
        events.push("first:start")
        await new Promise((resolve) => setTimeout(resolve, 40))
        events.push("first:end")
      }),
      new Promise((resolve) => setTimeout(resolve, 5)).then(() =>
        withRuntimeBuildLock(lockPath, async () => {
          events.push("second")
        })
      ),
    ])

    expect(events).toEqual(["first:start", "first:end", "second"])
  })

  it("does not reclaim a newly created lock before its owner is written", async () => {
    const root = await temporaryRoot()
    const lockPath = path.join(root, "locks", "runtime")
    await fs.mkdir(lockPath, { recursive: true })

    await expect(
      withRuntimeBuildLock(lockPath, async () => {}, {
        pollMs: 5,
        timeoutMs: 20,
      })
    ).rejects.toThrow("Timed out waiting for runtime build lock")
    await expect(fs.stat(lockPath)).resolves.toBeDefined()
  })
})
