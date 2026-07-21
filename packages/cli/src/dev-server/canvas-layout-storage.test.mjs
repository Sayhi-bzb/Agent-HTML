import fs from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { createTestTempDir } from "../../../../config/test-temp.mjs"
import {
  canvasLayoutShardFormat,
  patchStoredCanvasLayout,
  readStoredCanvasLayout,
  writeStoredCanvasLayout,
} from "./canvas-layout-storage.mjs"

function geometry(index) {
  return { height: 100, width: 200, x: index * 20, y: index * -10 }
}

describe("Canvas layout storage", () => {
  it("keeps small layouts as the readable colocated document", async () => {
    const root = await createTestTempDir("canvas-layout-monolithic")
    const layoutPath = path.join(root, "demo.layout.json")
    const layout = {
      nodes: { a: geometry(1) },
      viewport: { x: 10, y: -20, zoom: 0.8 },
      version: 2,
    }

    await expect(
      writeStoredCanvasLayout({ layout, layoutPath, shardThreshold: 2 })
    ).resolves.toMatchObject({ storage: "monolithic" })
    await expect(readStoredCanvasLayout(layoutPath)).resolves.toMatchObject({
      layout,
      storage: "monolithic",
    })
    expect(JSON.parse(await fs.readFile(layoutPath, "utf8"))).toEqual(layout)
  })

  it("writes large layouts as an atomic manifest and Node-ID shards", async () => {
    const root = await createTestTempDir("canvas-layout-sharded")
    const layoutPath = path.join(root, "demo.layout.json")
    const layout = {
      nodes: { a: geometry(1), b: geometry(2), c: geometry(3) },
      viewport: { x: -40, y: 60, zoom: 0.5 },
      version: 2,
    }

    await expect(
      writeStoredCanvasLayout({ layout, layoutPath, shardThreshold: 2 })
    ).resolves.toMatchObject({ storage: "sharded" })
    const manifest = JSON.parse(await fs.readFile(layoutPath, "utf8"))
    expect(manifest).toMatchObject({
      format: canvasLayoutShardFormat,
      nodeCount: 3,
      viewport: layout.viewport,
      version: 2,
    })
    expect(Object.keys(manifest.shards).length).toBeGreaterThan(0)
    await expect(readStoredCanvasLayout(layoutPath)).resolves.toMatchObject({
      layout,
      storage: "sharded",
    })
  })

  it("copy-on-write patches only affected sharded generations", async () => {
    const root = await createTestTempDir("canvas-layout-patch")
    const layoutPath = path.join(root, "demo.layout.json")
    const layout = {
      nodes: Object.fromEntries(
        Array.from({ length: 20 }, (_, index) => [
          `node-${index}`,
          geometry(index),
        ])
      ),
      version: 1,
    }
    await writeStoredCanvasLayout({
      layout,
      layoutPath,
      shardCount: 4,
      shardThreshold: 2,
    })
    const before = JSON.parse(await fs.readFile(layoutPath, "utf8"))

    await patchStoredCanvasLayout({
      layoutPath,
      nodes: { "node-7": { ...geometry(7), x: 999 } },
      shardCount: 4,
      shardThreshold: 2,
    })

    const after = JSON.parse(await fs.readFile(layoutPath, "utf8"))
    const changedShardKeys = Object.keys(after.shards).filter(
      (key) => after.shards[key] !== before.shards[key]
    )
    expect(changedShardKeys).toHaveLength(1)
    expect(
      (await readStoredCanvasLayout(layoutPath)).layout.nodes["node-7"].x
    ).toBe(999)
  })

  it("patches a sharded viewport without rewriting Node shards", async () => {
    const root = await createTestTempDir("canvas-layout-viewport-patch")
    const layoutPath = path.join(root, "demo.layout.json")
    await writeStoredCanvasLayout({
      layout: {
        nodes: { a: geometry(1), b: geometry(2) },
        version: 2,
      },
      layoutPath,
      shardCount: 4,
      shardThreshold: 2,
    })
    const before = JSON.parse(await fs.readFile(layoutPath, "utf8"))
    const viewport = { x: 80, y: -32, zoom: 1.25 }

    await patchStoredCanvasLayout({ layoutPath, nodes: {}, viewport })

    const after = JSON.parse(await fs.readFile(layoutPath, "utf8"))
    expect(after.shards).toEqual(before.shards)
    expect(after.viewport).toEqual(viewport)
    await expect(readStoredCanvasLayout(layoutPath)).resolves.toMatchObject({
      layout: { viewport },
    })
  })

  it("removes monolithic layout records through Node tombstones", async () => {
    const root = await createTestTempDir("canvas-layout-remove-monolithic")
    const layoutPath = path.join(root, "demo.layout.json")
    await writeStoredCanvasLayout({
      layout: {
        nodes: { a: geometry(1), b: geometry(2) },
        version: 1,
      },
      layoutPath,
      shardThreshold: 3,
    })

    await expect(
      patchStoredCanvasLayout({
        layoutPath,
        nodes: {},
        removedNodeIds: ["a"],
        shardThreshold: 3,
      })
    ).resolves.toMatchObject({
      removedNodeIds: ["a"],
      storage: "monolithic",
    })
    await expect(readStoredCanvasLayout(layoutPath)).resolves.toMatchObject({
      layout: { nodes: { b: geometry(2) }, version: 2 },
    })
  })

  it("removes sharded records and collects unreferenced generations", async () => {
    const root = await createTestTempDir("canvas-layout-remove-sharded")
    const layoutPath = path.join(root, "demo.layout.json")
    const nodes = Object.fromEntries(
      Array.from({ length: 20 }, (_, index) => [
        `node-${index}`,
        geometry(index),
      ])
    )
    await writeStoredCanvasLayout({
      layout: { nodes, version: 1 },
      layoutPath,
      shardCount: 4,
      shardThreshold: 2,
    })
    const before = JSON.parse(await fs.readFile(layoutPath, "utf8"))

    await patchStoredCanvasLayout({
      layoutPath,
      nodes: Object.fromEntries(
        Object.entries(nodes)
          .filter(([id]) => id !== "node-7")
          .map(([id, value]) => [id, { ...value, x: value.x + 1 }])
      ),
      removedNodeIds: ["node-7"],
      shardCount: 4,
      shardThreshold: 2,
    })

    const after = JSON.parse(await fs.readFile(layoutPath, "utf8"))
    const generations = (
      await fs.readdir(layoutPath.replace(/\.json$/, ".data"), {
        withFileTypes: true,
      })
    )
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort()
    expect(new Set(Object.values(before.shards)).size).toBe(1)
    expect(generations).toEqual([...new Set(Object.values(after.shards))])
    expect(generations).not.toContain(Object.values(before.shards)[0])
    expect(after.nodeCount).toBe(19)
    await expect(readStoredCanvasLayout(layoutPath)).resolves.toMatchObject({
      layout: {
        nodes: expect.not.objectContaining({ "node-7": expect.anything() }),
      },
    })
  })
})
