import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { fingerprintFileEntries } from "./runtime-prepare-cache.mjs"

export const RUNTIME_MANIFEST_VERSION = 2
export const RUNTIME_PROTOCOL_VERSION = 1
export const RUNTIME_SELECTION_VERSION = 1
export const DESKTOP_IDENTIFIER = "dev.ahtml.desktop"

export function runtimeDataRoot({
  environment = process.env,
  homeDirectory = os.homedir(),
  platform = process.platform,
} = {}) {
  if (environment.AHTML_RUNTIME_HOME) {
    return path.resolve(environment.AHTML_RUNTIME_HOME)
  }

  if (platform === "win32") {
    const localAppData =
      environment.LOCALAPPDATA || path.join(homeDirectory, "AppData", "Local")
    return path.join(localAppData, DESKTOP_IDENTIFIER, "runtime")
  }
  if (platform === "darwin") {
    return path.join(
      homeDirectory,
      "Library",
      "Application Support",
      DESKTOP_IDENTIFIER,
      "runtime"
    )
  }

  const dataHome =
    environment.XDG_DATA_HOME || path.join(homeDirectory, ".local", "share")
  return path.join(dataHome, DESKTOP_IDENTIFIER, "runtime")
}

export function runtimeStorePaths(options = {}) {
  const root = runtimeDataRoot(options)
  return {
    currentPath: path.join(root, "current.json"),
    inputStatePath: path.join(root, "input-state.json"),
    locksRoot: path.join(root, "locks"),
    root,
    runtimesRoot: path.join(root, "runtimes"),
    stagingRoot: path.join(root, "staging"),
  }
}

export function createRuntimeFingerprint({
  bundleFingerprint,
  nodeFingerprint,
  target,
}) {
  return fingerprintFileEntries(
    [
      { digest: bundleFingerprint, path: "bundle" },
      { digest: nodeFingerprint, path: "node" },
    ],
    { manifestVersion: RUNTIME_MANIFEST_VERSION, target }
  )
}

export function runtimeBundleRoot(paths, fingerprint) {
  assertFingerprint(fingerprint)
  return path.join(paths.runtimesRoot, fingerprint)
}

export function runtimeBundlePaths(root, nodeFileName) {
  return {
    cliEntry: path.join(root, "node_modules", "agent-html", "bin", "agent-html.mjs"),
    manifestPath: path.join(root, "runtime-manifest.json"),
    nodeEntry: path.join(root, "bin", nodeFileName),
    reactManifest: path.join(
      root,
      "node_modules",
      "@agent-html",
      "react",
      "package.json"
    ),
    templateEntry: path.join(
      root,
      "node_modules",
      "agent-html",
      "template",
      "agent-html",
      "AGENTS.md"
    ),
  }
}

export function createRuntimeManifest({
  browserEntries,
  builtAt,
  cliVersion,
  canvasDependencies,
  dependencyContractDigest,
  dependencyContractVersion,
  dependencyClosureHash,
  fingerprint,
  nodeFileName,
  nodeVersion,
  platform,
  reactVersion,
  styleEntries,
  target,
}) {
  assertFingerprint(fingerprint)
  return {
    schemaVersion: RUNTIME_MANIFEST_VERSION,
    runtimeProtocolVersion: RUNTIME_PROTOCOL_VERSION,
    fingerprint,
    target,
    platform,
    nodeVersion,
    dependencyClosureHash,
    dependencyContractVersion,
    dependencyContractDigest,
    canvasDependencies,
    browserEntries,
    styleEntries,
    nodeEntry: `bin/${nodeFileName}`,
    cliEntry: "node_modules/agent-html/bin/agent-html.mjs",
    workspaceTemplate: "node_modules/agent-html/template/agent-html",
    cliVersion,
    reactVersion,
    builtAt,
  }
}

export function validateRuntimeManifest(manifest, expectedFingerprint) {
  if (
    manifest?.schemaVersion !== RUNTIME_MANIFEST_VERSION ||
    manifest?.runtimeProtocolVersion !== RUNTIME_PROTOCOL_VERSION
  ) {
    return false
  }
  if (manifest.fingerprint !== expectedFingerprint) return false
  if (
    !Number.isInteger(manifest.dependencyContractVersion) ||
    typeof manifest.dependencyContractDigest !== "string" ||
    !Array.isArray(manifest.canvasDependencies) ||
    !Array.isArray(manifest.browserEntries) ||
    !Array.isArray(manifest.styleEntries)
  ) {
    return false
  }
  if (!isSafeRelativePath(manifest.nodeEntry)) return false
  if (!isSafeRelativePath(manifest.cliEntry)) return false
  if (!isSafeRelativePath(manifest.workspaceTemplate)) return false
  return true
}

export async function isRuntimeBundleReady({
  fingerprint,
  nodeFileName,
  root,
}) {
  try {
    const manifest = JSON.parse(
      await fs.readFile(path.join(root, "runtime-manifest.json"), "utf8")
    )
    if (!validateRuntimeManifest(manifest, fingerprint)) return false

    const bundle = runtimeBundlePaths(root, nodeFileName)
    await Promise.all([
      fs.access(bundle.cliEntry),
      fs.access(bundle.nodeEntry),
      fs.access(bundle.reactManifest),
      fs.access(bundle.templateEntry),
    ])
    return true
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return false
    throw error
  }
}

export async function publishCurrentRuntime(paths, selection) {
  assertFingerprint(selection.fingerprint)
  const current = await readCurrentRuntime(paths)
  const previousFingerprint =
    current && current.fingerprint !== selection.fingerprint
      ? current.fingerprint
      : current?.previousFingerprint
  await writeJsonAtomic(paths.currentPath, {
    schemaVersion: RUNTIME_SELECTION_VERSION,
    fingerprint: selection.fingerprint,
    ...(previousFingerprint ? { previousFingerprint } : {}),
    target: selection.target,
    selectedAt: selection.selectedAt,
  })
}

export async function readCurrentRuntime(paths) {
  try {
    const selection = JSON.parse(await fs.readFile(paths.currentPath, "utf8"))
    if (
      selection?.schemaVersion !== RUNTIME_SELECTION_VERSION ||
      !isFingerprint(selection.fingerprint) ||
      (selection.previousFingerprint !== undefined &&
        !isFingerprint(selection.previousFingerprint))
    ) {
      return null
    }
    return selection
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return null
    throw error
  }
}

export async function writeJsonAtomic(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.tmp`
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`)
    await renameWithRetries(temporaryPath, filePath)
  } finally {
    await fs.rm(temporaryPath, { force: true })
  }
}

export async function renameWithRetries(sourcePath, targetPath) {
  const retryableCodes = new Set(["EBUSY", "EEXIST", "ENOTEMPTY", "EPERM"])

  for (let attempt = 0; ; attempt += 1) {
    try {
      await fs.rename(sourcePath, targetPath)
      return
    } catch (error) {
      if (
        process.platform !== "win32" ||
        !retryableCodes.has(error?.code) ||
        attempt >= 11
      ) {
        throw error
      }
      await new Promise((resolve) =>
        setTimeout(resolve, Math.min(100 * 2 ** attempt, 1_000))
      )
    }
  }
}

export async function withRuntimeBuildLock(
  lockPath,
  callback,
  { onStaleOwner, pollMs = 250, timeoutMs = 5 * 60_000 } = {}
) {
  const deadline = Date.now() + timeoutMs
  await fs.mkdir(path.dirname(lockPath), { recursive: true })

  while (true) {
    try {
      await fs.mkdir(lockPath)
      await fs.writeFile(
        path.join(lockPath, "owner.json"),
        `${JSON.stringify({ pid: process.pid, startedAt: new Date().toISOString() })}\n`
      )
      break
    } catch (error) {
      if (error?.code !== "EEXIST") throw error
      const owner = await readLockOwner(lockPath)
      if (!(await lockOwnerIsActive(lockPath, owner))) {
        await onStaleOwner?.(owner)
        await fs.rm(lockPath, { force: true, recursive: true })
        continue
      }
      if (Date.now() >= deadline) {
        throw new Error(`Timed out waiting for runtime build lock: ${lockPath}`)
      }
      await new Promise((resolve) => setTimeout(resolve, pollMs))
    }
  }

  const childPids = new Set()
  const temporaryPaths = new Set()
  const writeOwner = () =>
    fs.writeFile(
      path.join(lockPath, "owner.json"),
      `${JSON.stringify({
        childPids: [...childPids],
        pid: process.pid,
        startedAt: new Date().toISOString(),
        temporaryPaths: [...temporaryPaths],
      })}\n`
    )
  const lease = {
    async registerChild(pid) {
      childPids.add(pid)
      await writeOwner()
    },
    async unregisterChild(pid) {
      childPids.delete(pid)
      await writeOwner()
    },
    async registerTemporaryPath(temporaryPath) {
      temporaryPaths.add(temporaryPath)
      await writeOwner()
    },
    async unregisterTemporaryPath(temporaryPath) {
      temporaryPaths.delete(temporaryPath)
      await writeOwner()
    },
  }

  try {
    return await callback(lease)
  } finally {
    await fs.rm(lockPath, { force: true, recursive: true })
  }
}

async function readLockOwner(lockPath) {
  try {
    return JSON.parse(
      await fs.readFile(path.join(lockPath, "owner.json"), "utf8")
    )
  } catch (error) {
    if (error?.code === "ENOENT" || error instanceof SyntaxError) return null
    throw error
  }
}

async function lockOwnerIsActive(lockPath, owner) {
  if (!Number.isInteger(owner?.pid) || owner.pid <= 0) {
    const stat = await fs.stat(lockPath).catch((statError) => {
      if (statError?.code === "ENOENT") return null
      throw statError
    })
    return Boolean(stat && Date.now() - stat.mtimeMs < 30_000)
  }
  try {
    process.kill(owner.pid, 0)
    return true
  } catch (error) {
    return error?.code !== "ESRCH"
  }
}

function isSafeRelativePath(value) {
  if (typeof value !== "string" || !value) return false
  const normalized = value.replaceAll("\\", "/")
  return (
    !path.posix.isAbsolute(normalized) &&
    !normalized.split("/").some((segment) => segment === "..")
  )
}

function isFingerprint(value) {
  return typeof value === "string" && /^[a-f\d]{64}$/.test(value)
}

function assertFingerprint(value) {
  if (!isFingerprint(value)) {
    throw new Error(`Invalid runtime fingerprint: ${value}`)
  }
}
