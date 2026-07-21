import fs from "node:fs/promises"
import path from "node:path"

import {
  analyzeBlockImplementationSource,
  analyzeReactCanvasArtifact,
} from "../react-canvas/guard.mjs"
import {
  discoverReactArtifacts,
  discoverReactImplementationSources,
  workspaceRelativePath,
} from "../react-canvas/paths.mjs"
import { collectStaticArtifactMetadata } from "../react-canvas/block-tags.mjs"
import { readTextFile } from "../react-canvas/workspace-file.mjs"

export const artifactsUpdatedEventName = "agent-html:artifacts-updated"

function sortByFilePath(left, right) {
  return left.filePath.localeCompare(right.filePath)
}

function artifactLabelFromFilePath(filePath) {
  const fileName = filePath.split(/[\\/]/).at(-1) ?? filePath
  return fileName.endsWith(".artifact.tsx")
    ? fileName.slice(0, -".artifact.tsx".length)
    : fileName
}

function normalizePath(filePath) {
  return path.resolve(filePath)
}

function isMissingFileError(error) {
  return error && (error.code === "ENOENT" || error.code === "ENOTDIR")
}

function createEmptySnapshot() {
  return {
    artifacts: [],
    guardIssues: [],
    status: "checking",
    version: 0,
  }
}

function snapshotContentEquals(left, right) {
  return (
    JSON.stringify({
      artifacts: left.artifacts,
      guardIssues: left.guardIssues,
    }) ===
    JSON.stringify({
      artifacts: right.artifacts,
      guardIssues: right.guardIssues,
    })
  )
}

export function createArtifactRegistry({ root, vite }) {
  const workspaceRoot = path.join(path.resolve(root), "agent-html")
  const artifactsRoot = path.join(workspaceRoot, "artifacts")
  const artifacts = new Map()
  const artifactIssues = new Map()
  const blockIssues = new Map()
  const pendingPaths = new Set()
  let snapshot = createEmptySnapshot()
  let refreshPromise = null
  let debounceTimer = null
  let closed = false

  function isArtifactEntry(filePath) {
    const absolutePath = normalizePath(filePath)

    return (
      absolutePath.startsWith(`${artifactsRoot}${path.sep}`) &&
      path.basename(absolutePath).endsWith(".artifact.tsx")
    )
  }

  function isImplementationSource(filePath) {
    const absolutePath = normalizePath(filePath)

    return (
      absolutePath.endsWith(".tsx") &&
      !absolutePath.endsWith(".artifact.tsx") &&
      absolutePath.startsWith(`${artifactsRoot}${path.sep}`)
    )
  }

  function publishSnapshot({ broadcast = true, reason }) {
    const guardIssues = [
      ...artifactIssues.values(),
      ...blockIssues.values(),
    ].flat()

    const nextSnapshot = {
      artifacts: [...artifacts.values()].sort(sortByFilePath),
      guardIssues,
      status: "ready",
      version: snapshot.version + 1,
    }
    const preserveVersion =
      !broadcast && snapshotContentEquals(snapshot, nextSnapshot)

    snapshot = {
      ...nextSnapshot,
      version: preserveVersion ? snapshot.version : nextSnapshot.version,
    }

    if (broadcast) {
      vite.ws.send({
        event: artifactsUpdatedEventName,
        type: "custom",
        data: {
          reason,
          version: snapshot.version,
        },
      })
    }
  }

  async function indexArtifact(filePath) {
    const absolutePath = normalizePath(filePath)
    let source

    try {
      source = await readTextFile(absolutePath)
    } catch (error) {
      if (isMissingFileError(error)) {
        artifacts.delete(absolutePath)
        artifactIssues.delete(absolutePath)
        return
      }

      throw error
    }

    const relativePath = workspaceRelativePath(root, absolutePath)
    const metadata = collectStaticArtifactMetadata(source)
    artifacts.set(absolutePath, {
      blocks: metadata.blocks,
      filePath: relativePath,
      title: metadata.title ?? artifactLabelFromFilePath(relativePath),
    })
    artifactIssues.set(
      absolutePath,
      analyzeReactCanvasArtifact({
        filePath: absolutePath,
        relativePath,
        source,
      })
    )
  }

  async function indexImplementationSource(filePath) {
    const absolutePath = normalizePath(filePath)
    let source

    try {
      source = await readTextFile(absolutePath)
    } catch (error) {
      if (isMissingFileError(error)) {
        blockIssues.delete(absolutePath)
        return
      }

      throw error
    }

    blockIssues.set(
      absolutePath,
      analyzeBlockImplementationSource({
        relativePath: workspaceRelativePath(root, absolutePath),
        source,
      })
    )
  }

  async function refreshAll({ broadcast = true, reason }) {
    snapshot = {
      ...snapshot,
      status: "checking",
    }

    const [artifactPaths, blockImplementationPaths] = await Promise.all([
      discoverReactArtifacts(root),
      discoverReactImplementationSources(root),
    ])

    artifacts.clear()
    artifactIssues.clear()
    blockIssues.clear()

    await Promise.all([
      ...artifactPaths.map(indexArtifact),
      ...blockImplementationPaths.map(indexImplementationSource),
    ])

    publishSnapshot({ broadcast, reason })
  }

  async function refreshChangedPaths({ paths, reason }) {
    if (paths.length === 0) {
      return
    }

    await Promise.all(
      paths.map(async (filePath) => {
        const absolutePath = normalizePath(filePath)

        if (isArtifactEntry(absolutePath)) {
          await indexArtifact(absolutePath)
          return
        }

        if (isImplementationSource(absolutePath)) {
          await indexImplementationSource(absolutePath)
        }
      })
    )

    publishSnapshot({ reason })
  }

  function queueRefresh({ filePath, reason }) {
    if (closed) {
      return
    }

    pendingPaths.add(filePath)
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      const paths = [...pendingPaths]
      pendingPaths.clear()
      refreshPromise = (refreshPromise ?? Promise.resolve())
        .catch(() => {})
        .then(() => refreshChangedPaths({ paths, reason }))
        .catch((error) => {
          console.error("[agent-html] artifact registry refresh failed", error)
        })
        .finally(() => {
          refreshPromise = null
        })
    }, 50)
  }

  function watch() {
    vite.watcher.add([
      path.join(artifactsRoot, "**", "*.artifact.tsx"),
      path.join(artifactsRoot, "**", "*.tsx"),
    ])

    const handleChange = (filePath) => {
      if (!isArtifactEntry(filePath) && !isImplementationSource(filePath)) {
        return
      }

      queueRefresh({
        filePath,
        reason: "file-change",
      })
    }

    vite.watcher.on("add", handleChange)
    vite.watcher.on("change", handleChange)
    vite.watcher.on("unlink", handleChange)

    return () => {
      vite.watcher.off("add", handleChange)
      vite.watcher.off("change", handleChange)
      vite.watcher.off("unlink", handleChange)
    }
  }

  let unwatch = null

  return {
    async close() {
      closed = true
      clearTimeout(debounceTimer)
      unwatch?.()
      await refreshPromise
    },
    getSnapshot() {
      return snapshot
    },
    async refresh({ broadcast = true, reason = "manual" } = {}) {
      await refreshAll({ broadcast, reason })
    },
    async start() {
      await refreshAll({ reason: "initial" })
      unwatch = watch()
    },
  }
}
