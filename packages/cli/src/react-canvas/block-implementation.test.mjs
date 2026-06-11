import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { resolveBlockImplementationPath } from "./block-implementation.mjs"

describe("React Canvas block implementation lookup", () => {
  it("resolves split artifact block implementation files", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))
    await fs.mkdir(path.join(root, "agent-html", "artifacts", "demo"), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "summary.block.tsx"),
      "export function SummaryBlock() { return null }"
    )

    await expect(
      resolveBlockImplementationPath({
        blockId: "summary",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        root,
      })
    ).resolves.toBe("agent-html/artifacts/demo/summary.block.tsx")
  })

  it("returns null when no split implementation exists", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))

    await expect(
      resolveBlockImplementationPath({
        blockId: "summary",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        root,
      })
    ).resolves.toBeNull()
  })

  it("does not resolve unsafe block ids", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))

    await expect(
      resolveBlockImplementationPath({
        blockId: "../summary",
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        root,
      })
    ).resolves.toBeNull()
  })

  it("does not resolve legacy agent entry suffixes", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))
    await fs.mkdir(path.join(root, "agent-html", "artifacts", "demo"), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "summary.block.tsx"),
      "export function SummaryBlock() { return null }"
    )

    await expect(
      resolveBlockImplementationPath({
        blockId: "summary",
        filePath: "agent-html/artifacts/demo.agent.tsx",
        root,
      })
    ).resolves.toBeNull()
  })
})
