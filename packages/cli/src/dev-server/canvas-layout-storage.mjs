import { createHash, randomBytes } from "node:crypto"
import fs from "node:fs/promises"
import path from "node:path"

import {
  createEmptyCanvasLayout,
  normalizeCanvasLayout,
} from "@agent-html/kernel"

export const canvasLayoutShardFormat = "agent-html/canvas-layout-shards"
export const canvasLayoutShardStorageVersion = 1
export const defaultCanvasLayoutShardCount = 64
export const defaultCanvasLayoutShardThreshold = 4_096

const layoutWriteQueues = new Map()
const generationNamePattern = /^[a-z0-9]+-[a-f0-9]{12}$/

function generationId() {
  return `${Date.now().toString(36)}-${randomBytes(6).toString("hex")}`
}

function shardKey(nodeId, shardCount) {
  const value = createHash("sha256").update(nodeId).digest().readUInt32BE(0)
  return (value % shardCount).toString(16).padStart(2, "0")
}

function storageDirectoryForLayout(layoutPath) {
  return layoutPath.replace(/\.json$/, ".data")
}

function shardPath({ generation, key, layoutPath }) {
  return path.join(
    storageDirectoryForLayout(layoutPath),
    generation,
    `${key}.json`
  )
}

function normalizeShardManifest(value) {
  if (
    !value ||
    typeof value !== "object" ||
    Array.isArray(value) ||
    value.format !== canvasLayoutShardFormat ||
    value.version !== canvasLayoutShardStorageVersion ||
    !Number.isInteger(value.nodeCount) ||
    value.nodeCount < 0 ||
    !Number.isInteger(value.shardCount) ||
    value.shardCount <= 0 ||
    value.shardCount > 256 ||
    !value.shards ||
    typeof value.shards !== "object" ||
    Array.isArray(value.shards)
  ) {
    throw new TypeError("Canvas layout shard manifest is invalid")
  }

  const shards = {}
  for (const [key, generation] of Object.entries(value.shards)) {
    const index = Number.parseInt(key, 16)
    if (
      !/^[0-9a-f]{2}$/.test(key) ||
      index >= value.shardCount ||
      typeof generation !== "string" ||
      !generationNamePattern.test(generation)
    ) {
      throw new TypeError("Canvas layout shard manifest entry is invalid")
    }
    shards[key] = generation
  }

  return {
    format: canvasLayoutShardFormat,
    nodeCount: value.nodeCount,
    shardCount: value.shardCount,
    shards,
    version: canvasLayoutShardStorageVersion,
  }
}

function normalizeRemovedNodeIds(value = []) {
  if (
    !Array.isArray(value) ||
    value.some((nodeId) => typeof nodeId !== "string" || nodeId.length === 0)
  ) {
    throw new TypeError("Canvas layout removedNodeIds must be Node IDs")
  }
  return [...new Set(value)]
}

async function readLayoutFile(layoutPath) {
  try {
    return JSON.parse(await fs.readFile(layoutPath, "utf8"))
  } catch (error) {
    if (error?.code === "ENOENT") return null
    throw error
  }
}

async function readShard({ generation, key, layoutPath }) {
  return normalizeCanvasLayout(
    JSON.parse(
      await fs.readFile(shardPath({ generation, key, layoutPath }), "utf8")
    )
  )
}

async function readShardedLayout(layoutPath, rawManifest) {
  const manifest = normalizeShardManifest(rawManifest)
  const nodes = {}
  const shards = await Promise.all(
    Object.entries(manifest.shards).map(([key, generation]) =>
      readShard({ generation, key, layoutPath })
    )
  )
  for (const shard of shards) {
    for (const [id, geometry] of Object.entries(shard.nodes)) {
      if (nodes[id]) {
        throw new TypeError(`Canvas layout Node ${id} exists in two shards`)
      }
      nodes[id] = geometry
    }
  }
  if (Object.keys(nodes).length !== manifest.nodeCount) {
    throw new TypeError("Canvas layout shard manifest node count is stale")
  }
  return {
    layout: normalizeCanvasLayout({ nodes, version: 1 }),
    manifest,
    storage: "sharded",
  }
}

export async function readStoredCanvasLayout(layoutPath) {
  const stored = await readLayoutFile(layoutPath)
  if (!stored) {
    return {
      layout: createEmptyCanvasLayout(),
      manifest: null,
      storage: "monolithic",
    }
  }
  if (stored.format === canvasLayoutShardFormat) {
    return readShardedLayout(layoutPath, stored)
  }
  return {
    layout: normalizeCanvasLayout(stored),
    manifest: null,
    storage: "monolithic",
  }
}

async function replaceJsonFile(filePath, value) {
  const temporaryPath = `${filePath}.${process.pid}.${Date.now()}.${randomBytes(3).toString("hex")}.tmp`
  await fs.mkdir(path.dirname(filePath), { recursive: true })
  try {
    await fs.writeFile(temporaryPath, `${JSON.stringify(value, null, 2)}\n`)
    await fs.rename(temporaryPath, filePath)
  } finally {
    await fs.rm(temporaryPath, { force: true })
  }
}

async function collectGarbageGenerations(layoutPath, manifest) {
  const storageDirectory = storageDirectoryForLayout(layoutPath)
  const referencedGenerations = new Set(
    manifest ? Object.values(manifest.shards) : []
  )
  let entries
  try {
    entries = await fs.readdir(storageDirectory, { withFileTypes: true })
  } catch (error) {
    if (error?.code === "ENOENT") return 0
    throw error
  }

  const garbage = entries.filter(
    (entry) =>
      entry.isDirectory() &&
      generationNamePattern.test(entry.name) &&
      !referencedGenerations.has(entry.name)
  )
  await Promise.all(
    garbage.map((entry) =>
      fs.rm(path.join(storageDirectory, entry.name), {
        recursive: true,
      })
    )
  )
  return garbage.length
}

async function collectGarbageGenerationsBestEffort(layoutPath, manifest) {
  try {
    return await collectGarbageGenerations(layoutPath, manifest)
  } catch {
    return 0
  }
}

async function writeGeneration({ layout, layoutPath, shardCount }) {
  const generation = generationId()
  const shards = new Map()
  for (const [id, geometry] of Object.entries(layout.nodes)) {
    const key = shardKey(id, shardCount)
    const nodes = shards.get(key) ?? {}
    nodes[id] = geometry
    shards.set(key, nodes)
  }

  await Promise.all(
    [...shards].map(async ([key, nodes]) => {
      const filePath = shardPath({ generation, key, layoutPath })
      await fs.mkdir(path.dirname(filePath), { recursive: true })
      await fs.writeFile(
        filePath,
        `${JSON.stringify({ nodes, version: 1 }, null, 2)}\n`
      )
    })
  )
  return {
    format: canvasLayoutShardFormat,
    nodeCount: Object.keys(layout.nodes).length,
    shardCount,
    shards: Object.fromEntries(
      [...shards.keys()].map((key) => [key, generation])
    ),
    version: canvasLayoutShardStorageVersion,
  }
}

function queueLayoutWrite(layoutPath, operation) {
  const current = layoutWriteQueues.get(layoutPath) ?? Promise.resolve()
  const next = current.catch(() => undefined).then(operation)
  layoutWriteQueues.set(layoutPath, next)
  return next.finally(() => {
    if (layoutWriteQueues.get(layoutPath) === next) {
      layoutWriteQueues.delete(layoutPath)
    }
  })
}

async function writeStoredCanvasLayoutNow({
  layout,
  layoutPath,
  shardCount,
  shardThreshold,
}) {
  const normalized = normalizeCanvasLayout(layout)
  if (Object.keys(normalized.nodes).length < shardThreshold) {
    await replaceJsonFile(layoutPath, normalized)
    const garbageCollectedGenerations =
      await collectGarbageGenerationsBestEffort(layoutPath, null)
    return {
      garbageCollectedGenerations,
      layout: normalized,
      storage: "monolithic",
    }
  }
  const manifest = await writeGeneration({
    layout: normalized,
    layoutPath,
    shardCount,
  })
  await replaceJsonFile(layoutPath, manifest)
  const garbageCollectedGenerations = await collectGarbageGenerationsBestEffort(
    layoutPath,
    manifest
  )
  return {
    garbageCollectedGenerations,
    layout: normalized,
    storage: "sharded",
  }
}

export function writeStoredCanvasLayout({
  layout,
  layoutPath,
  shardCount = defaultCanvasLayoutShardCount,
  shardThreshold = defaultCanvasLayoutShardThreshold,
}) {
  return queueLayoutWrite(layoutPath, () =>
    writeStoredCanvasLayoutNow({
      layout,
      layoutPath,
      shardCount,
      shardThreshold,
    })
  )
}

async function patchShardedLayout({
  layoutPath,
  manifest,
  nodes,
  removedNodeIds,
}) {
  const patches = new Map()
  for (const [id, geometry] of Object.entries(nodes)) {
    const key = shardKey(id, manifest.shardCount)
    const patch = patches.get(key) ?? { nodes: {}, removedNodeIds: [] }
    patch.nodes[id] = geometry
    patches.set(key, patch)
  }
  for (const id of removedNodeIds) {
    const key = shardKey(id, manifest.shardCount)
    const patch = patches.get(key) ?? { nodes: {}, removedNodeIds: [] }
    patch.removedNodeIds.push(id)
    patches.set(key, patch)
  }

  const generation = generationId()
  const nextShards = { ...manifest.shards }
  const results = await Promise.all(
    [...patches].map(async ([key, patch]) => {
      const previousGeneration = manifest.shards[key]
      const previous = previousGeneration
        ? await readShard({
            generation: previousGeneration,
            key,
            layoutPath,
          })
        : createEmptyCanvasLayout()
      const nextNodes = { ...previous.nodes }
      for (const id of patch.removedNodeIds) {
        delete nextNodes[id]
      }
      Object.assign(nextNodes, patch.nodes)
      if (Object.keys(nextNodes).length > 0) {
        const filePath = shardPath({ generation, key, layoutPath })
        await fs.mkdir(path.dirname(filePath), { recursive: true })
        await fs.writeFile(
          filePath,
          `${JSON.stringify({ nodes: nextNodes, version: 1 }, null, 2)}\n`
        )
      }
      return {
        key,
        nodeCountDelta:
          Object.keys(nextNodes).length - Object.keys(previous.nodes).length,
        present: Object.keys(nextNodes).length > 0,
      }
    })
  )
  for (const result of results) {
    if (result.present) nextShards[result.key] = generation
    else delete nextShards[result.key]
  }

  const nextManifest = {
    ...manifest,
    nodeCount:
      manifest.nodeCount +
      results.reduce((total, result) => total + result.nodeCountDelta, 0),
    shards: nextShards,
  }
  await replaceJsonFile(layoutPath, nextManifest)
  const garbageCollectedGenerations = await collectGarbageGenerationsBestEffort(
    layoutPath,
    nextManifest
  )
  return { garbageCollectedGenerations, storage: "sharded" }
}

export function patchStoredCanvasLayout({
  layoutPath,
  nodes,
  removedNodeIds = [],
  shardCount = defaultCanvasLayoutShardCount,
  shardThreshold = defaultCanvasLayoutShardThreshold,
}) {
  return queueLayoutWrite(layoutPath, async () => {
    const patch = normalizeCanvasLayout({ nodes, version: 1 }).nodes
    const removals = normalizeRemovedNodeIds(removedNodeIds)
    const conflicts = removals.filter((nodeId) => patch[nodeId])
    if (conflicts.length > 0) {
      throw new TypeError(
        `Canvas layout patch cannot update and remove Node ${conflicts[0]}`
      )
    }
    if (Object.keys(patch).length === 0 && removals.length === 0) {
      const stored = await readLayoutFile(layoutPath)
      return {
        nodes: patch,
        removedNodeIds: removals,
        storage:
          stored?.format === canvasLayoutShardFormat ? "sharded" : "monolithic",
      }
    }
    const stored = await readLayoutFile(layoutPath)
    if (stored?.format === canvasLayoutShardFormat) {
      const manifest = normalizeShardManifest(stored)
      await patchShardedLayout({
        layoutPath,
        manifest,
        nodes: patch,
        removedNodeIds: removals,
      })
      return {
        nodes: patch,
        removedNodeIds: removals,
        storage: "sharded",
      }
    }

    const current = stored
      ? normalizeCanvasLayout(stored)
      : createEmptyCanvasLayout()
    const nextNodes = { ...current.nodes, ...patch }
    for (const nodeId of removals) delete nextNodes[nodeId]
    const result = await writeStoredCanvasLayoutNow({
      layout: {
        nodes: nextNodes,
        version: 1,
      },
      layoutPath,
      shardCount,
      shardThreshold,
    })
    return {
      nodes: patch,
      removedNodeIds: removals,
      storage: result.storage,
    }
  })
}
