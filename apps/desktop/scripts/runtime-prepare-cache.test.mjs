import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach, describe, expect, it } from "vitest"

import {
  PREPARE_STATE_VERSION,
  decidePreparation,
  fingerprintFileEntries,
  fingerprintFiles,
  hashFile,
  hashFiles,
  isRuntimeInput,
  legacyRuntimeFingerprintMetadata,
  readPrepareState,
  runtimeFingerprintMetadata,
  withCompatibleBundleFingerprint,
} from "./runtime-prepare-cache.mjs"

const temporaryRoots = []

afterEach(async () => {
  await Promise.all(
    temporaryRoots.splice(0).map((root) =>
      fs.rm(root, { force: true, recursive: true })
    )
  )
})

async function createTemporaryRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-cache-test-"))
  temporaryRoots.push(root)
  return root
}

describe("runtime input selection", () => {
  it("tracks published sources and template inputs", () => {
    expect(isRuntimeInput("package-lock.json")).toBe(true)
    expect(isRuntimeInput("agent-html/components/ui/button.tsx")).toBe(true)
    expect(isRuntimeInput("packages/react/src/index.tsx")).toBe(true)
    expect(isRuntimeInput("packages/cli/src/index.mjs")).toBe(true)
    expect(isRuntimeInput("packages/cli/scripts/prepare-template.mjs")).toBe(true)
    expect(isRuntimeInput("apps/desktop/runtime/package.json")).toBe(true)
    expect(isRuntimeInput("apps/desktop/scripts/runtime-builder.mjs")).toBe(true)
  })

  it("ignores derived and test-only files", () => {
    expect(isRuntimeInput("agent-html/node_modules/example/index.js")).toBe(false)
    expect(isRuntimeInput("packages/react/src/index.test.tsx")).toBe(false)
    expect(isRuntimeInput("packages/cli/src/index.test.mjs")).toBe(false)
    expect(isRuntimeInput("packages/cli/agent-html-0.2.1.tgz")).toBe(false)
  })
})

describe("runtime content fingerprints", () => {
  const workspaceTrueUserAgent =
    "npm/10.9.3 node/v22.20.0 win32 x64 workspaces/true"
  const workspaceFalseUserAgent =
    "npm/10.9.3 node/v22.20.0 win32 x64 workspaces/false"

  it("is order independent and changes with contents or membership", async () => {
    const root = await createTemporaryRoot()
    await fs.writeFile(path.join(root, "a.txt"), "alpha")
    await fs.writeFile(path.join(root, "b.txt"), "beta")

    const initial = await hashFiles(root, ["b.txt", "a.txt"])
    expect(await hashFiles(root, ["a.txt", "b.txt"])).toBe(initial)

    await fs.writeFile(path.join(root, "a.txt"), "changed")
    expect(await hashFiles(root, ["a.txt", "b.txt"])).not.toBe(initial)
    expect(await hashFiles(root, ["b.txt"])).not.toBe(initial)
  })

  it("reuses cached file digests while preserving the fingerprint", async () => {
    const root = await createTemporaryRoot()
    await fs.writeFile(path.join(root, "input.txt"), "content")

    const initial = await fingerprintFiles(root, ["input.txt"])
    const cached = await fingerprintFiles(root, ["input.txt"], {}, initial.files)

    expect(cached).toEqual(initial)
  })

  it("compares standalone files independently of their names", async () => {
    const root = await createTemporaryRoot()
    const sourcePath = path.join(root, "node.exe")
    const targetPath = path.join(root, "runtime-sidecar.exe")
    await fs.writeFile(sourcePath, "same binary")
    await fs.writeFile(targetPath, "same binary")

    expect(await hashFile(sourcePath)).toBe(await hashFile(targetPath))
  })

  it("ignores npm workspace invocation context", () => {
    const environment = {
      arch: "x64",
      nodeVersion: "v22.20.0",
      platform: "win32",
    }

    expect(
      runtimeFingerprintMetadata({
        ...environment,
        npmUserAgent: workspaceTrueUserAgent,
      })
    ).toEqual(
      runtimeFingerprintMetadata({
        ...environment,
        npmUserAgent: workspaceFalseUserAgent,
      })
    )
  })

  it("recognizes both legacy workspace fingerprints", () => {
    const files = [{ path: "input.txt", digest: "content" }]
    const environment = {
      arch: "x64",
      npmUserAgent: workspaceFalseUserAgent,
      platform: "win32",
    }
    const legacyFingerprints = legacyRuntimeFingerprintMetadata(
      environment
    ).map((metadata) => fingerprintFileEntries(files, metadata))

    const workspaceTrueFingerprint = fingerprintFileEntries(files, {
      arch: "x64",
      npm: workspaceTrueUserAgent,
      platform: "win32",
      version: PREPARE_STATE_VERSION,
    })
    const workspaceFalseFingerprint = fingerprintFileEntries(files, {
      arch: "x64",
      npm: workspaceFalseUserAgent,
      platform: "win32",
      version: PREPARE_STATE_VERSION,
    })

    expect(legacyFingerprints).toContain(workspaceTrueFingerprint)
    expect(legacyFingerprints).toContain(workspaceFalseFingerprint)
  })

  it("migrates a legacy fingerprint without rebuilding complete outputs", () => {
    const legacyFingerprint = "legacy"
    const bundleFingerprint = "stable"
    const state = withCompatibleBundleFingerprint(
      {
        version: PREPARE_STATE_VERSION,
        bundleFingerprint: legacyFingerprint,
        nodeFingerprint: "node",
        target: "target",
      },
      bundleFingerprint,
      [legacyFingerprint]
    )

    expect(state.bundleFingerprint).toBe(bundleFingerprint)
    expect(
      decidePreparation({
        bundleFingerprint,
        bundleOutputsReady: true,
        force: false,
        nodeFingerprint: "node",
        nodeOutputFingerprint: "node",
        state,
        target: "target",
      })
    ).toEqual({ prepareBundle: false, prepareNode: false })
  })
})

describe("runtime preparation decisions", () => {
  const currentState = {
    version: PREPARE_STATE_VERSION,
    bundleFingerprint: "bundle",
    nodeFingerprint: "node",
    target: "target",
  }

  it("reuses complete matching outputs", () => {
    expect(
      decidePreparation({
        bundleFingerprint: "bundle",
        bundleOutputsReady: true,
        force: false,
        nodeFingerprint: "node",
        nodeOutputFingerprint: "node",
        state: currentState,
        target: "target",
      })
    ).toEqual({ prepareBundle: false, prepareNode: false })
  })

  it("rebuilds stale and forced outputs independently", () => {
    expect(
      decidePreparation({
        bundleFingerprint: "changed",
        bundleOutputsReady: true,
        force: false,
        nodeFingerprint: "node",
        nodeOutputFingerprint: "node",
        state: currentState,
        target: "target",
      })
    ).toEqual({ prepareBundle: true, prepareNode: false })

    expect(
      decidePreparation({
        bundleFingerprint: "bundle",
        bundleOutputsReady: true,
        force: true,
        nodeFingerprint: "node",
        nodeOutputFingerprint: "node",
        state: currentState,
        target: "target",
      })
    ).toEqual({ prepareBundle: true, prepareNode: true })
  })

  it("rebuilds missing outputs and target-specific node artifacts", () => {
    expect(
      decidePreparation({
        bundleFingerprint: "bundle",
        bundleOutputsReady: false,
        force: false,
        nodeFingerprint: "node",
        nodeOutputFingerprint: null,
        state: currentState,
        target: "target",
      })
    ).toEqual({ prepareBundle: true, prepareNode: true })

    expect(
      decidePreparation({
        bundleFingerprint: "bundle",
        bundleOutputsReady: true,
        force: false,
        nodeFingerprint: "node",
        nodeOutputFingerprint: "node",
        state: currentState,
        target: "other-target",
      })
    ).toEqual({ prepareBundle: false, prepareNode: true })
  })

  it("treats missing and malformed state as a cache miss", async () => {
    const root = await createTemporaryRoot()
    const statePath = path.join(root, "state.json")
    expect(await readPrepareState(statePath)).toBeNull()

    await fs.writeFile(statePath, "not json")
    expect(await readPrepareState(statePath)).toBeNull()
  })
})
