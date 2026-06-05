import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { extractBlockSource, resolveBlockImplementationPath } from "./source.mjs"

describe("React Canvas source helpers", () => {
  it("extracts a selected Block source slice", () => {
    const source = `
      <Artifact title="Demo">
        <Block id="summary" title="Summary">
          <p>Summary</p>
        </Block>
        <Block id="next-steps">Next</Block>
      </Artifact>
    `

    expect(extractBlockSource(source, "summary")).toContain('<Block id="summary" title="Summary">')
    expect(extractBlockSource(source, "summary")).toContain("</Block>")
  })

  it("returns null for a missing Block", () => {
    expect(extractBlockSource("<Block id=\"summary\">Summary</Block>", "missing")).toBeNull()
  })

  it("resolves split artifact block implementation files", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))
    await fs.mkdir(path.join(root, ".agent-html", "artifacts", "demo"), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(root, ".agent-html", "artifacts", "demo", "summary.block.tsx"),
      "export function SummaryBlock() { return null }"
    )

    await expect(
      resolveBlockImplementationPath({
        blockId: "summary",
        filePath: ".agent-html/artifacts/demo.agent.tsx",
        root,
      })
    ).resolves.toBe(".agent-html/artifacts/demo/summary.block.tsx")
  })

  it("resolves split example block implementation files", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))
    await fs.mkdir(path.join(root, ".agent-html", "examples", "example"), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(root, ".agent-html", "examples", "example", "brief.block.tsx"),
      "export function BriefBlock() { return null }"
    )

    await expect(
      resolveBlockImplementationPath({
        blockId: "brief",
        filePath: ".agent-html/examples/example.agent.tsx",
        root,
      })
    ).resolves.toBe(".agent-html/examples/example/brief.block.tsx")
  })

  it("returns null when no split implementation exists", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))

    await expect(
      resolveBlockImplementationPath({
        blockId: "summary",
        filePath: ".agent-html/artifacts/demo.agent.tsx",
        root,
      })
    ).resolves.toBeNull()
  })

  it("does not resolve unsafe block paths", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-source-"))

    await expect(
      resolveBlockImplementationPath({
        blockId: "../summary",
        filePath: ".agent-html/artifacts/demo.agent.tsx",
        root,
      })
    ).resolves.toBeNull()
  })
})
