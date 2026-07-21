import { createHash } from "node:crypto"
import fs from "node:fs/promises"
import { createReadStream } from "node:fs"
import path from "node:path"

export const PREPARE_STATE_VERSION = 1

export function runtimeFingerprintMetadata({
  arch,
  nodeVersion,
  npmUserAgent,
  platform,
}) {
  const npm = npmUserAgent
    ?.split(/\s+/)
    .find((token) => token.startsWith("npm/"))

  return {
    arch,
    node: nodeVersion,
    npm: npm || "unknown",
    platform,
    version: PREPARE_STATE_VERSION,
  }
}

export function legacyRuntimeFingerprintMetadata({
  arch,
  npmUserAgent,
  platform,
}) {
  const userAgent = npmUserAgent || "unknown"
  const userAgents = new Set([userAgent])

  if (/\bworkspaces\/(?:true|false)\b/.test(userAgent)) {
    userAgents.add(
      userAgent.replace(/\bworkspaces\/(?:true|false)\b/, "workspaces/true")
    )
    userAgents.add(
      userAgent.replace(/\bworkspaces\/(?:true|false)\b/, "workspaces/false")
    )
  }

  return [...userAgents].map((npm) => ({
    arch,
    npm,
    platform,
    version: PREPARE_STATE_VERSION,
  }))
}

const templateExcludedSegments = new Set([
  ".git",
  ".vite",
  "build",
  "dist",
  "manifest.json",
  "node_modules",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
])

const packageSourceExtensions = new Set([
  ".css",
  ".html",
  ".mjs",
  ".mts",
  ".ts",
  ".tsx",
])

const runtimeRecipePaths = new Set([
  "apps/desktop/runtime/package.json",
  "apps/desktop/scripts/runtime-builder.mjs",
  "apps/desktop/scripts/runtime-prepare-cache.mjs",
  "apps/desktop/scripts/runtime-store.mjs",
])

function normalizeRepoPath(filePath) {
  return filePath.replaceAll("\\", "/")
}

function isTestSource(filePath) {
  return /\.(?:spec|test)\.(?:mjs|mts|ts|tsx)$/.test(filePath)
}

export function isRuntimeInput(filePath) {
  const normalized = normalizeRepoPath(filePath)

  if (normalized === "package.json" || normalized === "package-lock.json") {
    return true
  }
  if (runtimeRecipePaths.has(normalized)) return true

  if (normalized.startsWith("agent-html/")) {
    return !normalized
      .slice("agent-html/".length)
      .split("/")
      .some((segment) => templateExcludedSegments.has(segment))
  }

  if (normalized === "packages/kernel/package.json") return true
  if (normalized.startsWith("packages/kernel/src/")) {
    return !isTestSource(normalized)
  }

  if (normalized === "packages/react/package.json") return true
  if (normalized.startsWith("packages/react/src/")) {
    return !isTestSource(normalized)
  }

  if (normalized === "packages/cli/package.json") return true
  if (
    normalized === "packages/cli/scripts/prepare-template.mjs" ||
    normalized === "packages/cli/scripts/clean-template.mjs"
  ) {
    return true
  }
  if (normalized.startsWith("packages/cli/bin/")) return true
  if (normalized.startsWith("packages/cli/src/")) {
    return (
      packageSourceExtensions.has(path.extname(normalized)) &&
      !isTestSource(normalized)
    )
  }

  return false
}

async function fileContentDigest(filePath) {
  const hash = createHash("sha256")

  for await (const chunk of createReadStream(filePath)) {
    hash.update(chunk)
  }

  return hash.digest("hex")
}

function cachedDigest(previous, stat) {
  if (
    previous &&
    previous.size === stat.size &&
    previous.mtimeMs === stat.mtimeMs &&
    typeof previous.digest === "string"
  ) {
    return previous.digest
  }

  return null
}

export async function fingerprintFiles(
  root,
  filePaths,
  metadata = {},
  previousFiles = []
) {
  const previousByPath = new Map(
    previousFiles.map((entry) => [entry.path, entry])
  )
  const normalizedPaths = [...new Set(filePaths.map(normalizeRepoPath))].sort()
  const files = []

  for (const relativePath of normalizedPaths) {
    const absolutePath = path.join(root, ...relativePath.split("/"))

    try {
      const stat = await fs.stat(absolutePath)
      if (!stat.isFile()) {
        files.push({
          path: relativePath,
          digest: "not-file",
          mtimeMs: stat.mtimeMs,
          size: stat.size,
        })
        continue
      }

      files.push({
        path: relativePath,
        digest:
          cachedDigest(previousByPath.get(relativePath), stat) ||
          (await fileContentDigest(absolutePath)),
        mtimeMs: stat.mtimeMs,
        size: stat.size,
      })
    } catch (error) {
      if (error && error.code === "ENOENT") {
        files.push({
          path: relativePath,
          digest: "missing",
          mtimeMs: null,
          size: null,
        })
        continue
      }

      throw error
    }
  }

  return { files, fingerprint: fingerprintFileEntries(files, metadata) }
}

export function fingerprintFileEntries(files, metadata = {}) {
  const hash = createHash("sha256")
  hash.update(JSON.stringify(metadata))
  for (const file of files) {
    hash.update(`\0${file.path}\0${file.digest}`)
  }

  return hash.digest("hex")
}

export function withCompatibleBundleFingerprint(
  state,
  bundleFingerprint,
  compatibleFingerprints = []
) {
  if (
    state?.bundleFingerprint === bundleFingerprint ||
    compatibleFingerprints.includes(state?.bundleFingerprint)
  ) {
    return { ...state, bundleFingerprint }
  }

  return state
}

export async function hashFiles(root, filePaths, metadata = {}) {
  return (await fingerprintFiles(root, filePaths, metadata)).fingerprint
}

export async function hashFile(filePath, metadata = {}) {
  const hash = createHash("sha256")
  hash.update(JSON.stringify(metadata))
  hash.update(await fileContentDigest(filePath))
  return hash.digest("hex")
}

export async function readPrepareState(statePath) {
  try {
    return JSON.parse(await fs.readFile(statePath, "utf8"))
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.name === "SyntaxError")) {
      return null
    }

    throw error
  }
}

export function decidePreparation({
  bundleFingerprint,
  bundleOutputsReady,
  force,
  nodeFingerprint,
  nodeOutputFingerprint,
  state,
  target,
}) {
  const stateMatches =
    !force && state?.version === PREPARE_STATE_VERSION
  const targetMatches = stateMatches && state.target === target

  return {
    prepareBundle: !(
      stateMatches &&
      bundleOutputsReady &&
      state.bundleFingerprint === bundleFingerprint
    ),
    prepareNode: !(
      targetMatches &&
      nodeOutputFingerprint === nodeFingerprint &&
      state.nodeFingerprint === nodeFingerprint
    ),
  }
}
