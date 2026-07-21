import path from "node:path"

import {
  discoverReactCanvases,
  workspaceRelativePath,
} from "../react-canvas/paths.mjs"

export const canvasesUpdatedEventName = "agent-html:canvases-updated"

function canvasLabelFromFilePath(filePath) {
  const fileName = path.basename(filePath).replace(/\.canvas\.tsx$/, "")
  return fileName
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0]?.toUpperCase() ?? ""}${part.slice(1)}`)
    .join(" ")
}

export function canvasLayoutPathForEntry(filePath) {
  return filePath.replace(/\.canvas\.tsx$/, ".layout.json")
}

function createEmptySnapshot() {
  return {
    canvases: [],
    status: "checking",
    version: 0,
  }
}

export function createCanvasRegistry({ root, vite }) {
  const canvasesRoot = path.join(path.resolve(root), "agent-html", "canvases")
  let snapshot = createEmptySnapshot()
  let refreshPromise = null
  let debounceTimer = null
  let closed = false

  function publishSnapshot({ broadcast = true, reason }) {
    snapshot = {
      ...snapshot,
      status: "ready",
      version: snapshot.version + 1,
    }

    if (broadcast) {
      vite.ws.send({
        data: { reason, version: snapshot.version },
        event: canvasesUpdatedEventName,
        type: "custom",
      })
    }
  }

  async function refreshAll({ broadcast = true, reason }) {
    snapshot = { ...snapshot, status: "checking" }
    const entries = await discoverReactCanvases(root)
    snapshot = {
      ...snapshot,
      canvases: entries.map((entryPath) => {
        const filePath = workspaceRelativePath(root, entryPath)
        return {
          filePath,
          layoutPath: workspaceRelativePath(
            root,
            canvasLayoutPathForEntry(entryPath)
          ),
          title: canvasLabelFromFilePath(filePath),
        }
      }),
    }
    publishSnapshot({ broadcast, reason })
  }

  function isCanvasEntry(filePath) {
    const absolutePath = path.resolve(filePath)
    return (
      absolutePath.startsWith(`${canvasesRoot}${path.sep}`) &&
      absolutePath.endsWith(".canvas.tsx")
    )
  }

  function queueRefresh(reason) {
    if (closed) return
    clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      refreshPromise = (refreshPromise ?? Promise.resolve())
        .catch(() => {})
        .then(() => refreshAll({ reason }))
        .catch((error) => {
          console.error("[agent-html] canvas registry refresh failed", error)
        })
        .finally(() => {
          refreshPromise = null
        })
    }, 50)
  }

  function watch() {
    vite.watcher.add(path.join(canvasesRoot, "**", "*.canvas.tsx"))
    const handleChange = (filePath) => {
      if (isCanvasEntry(filePath)) queueRefresh("file-change")
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
