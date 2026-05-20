/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { readRepoSource } from "./cli-test-helpers"

describe("gallery alignment", () => {
  it("keeps gallery docs and product copy aligned with gallery.md", async () => {
    const [
      gallerySpec,
      blueprint,
      docsArchitecture,
      docsWeb,
      commandContract,
      runtimeApp,
    ] = await Promise.all([
      readRepoSource("docs", "spec", "gallery.md"),
      readRepoSource("blueprint", "architecture-design", "architecture.md"),
      readRepoSource("docs", "architecture", "architecture.md"),
      readRepoSource("docs-web", "content", "docs", "index.mdx"),
      readRepoSource("packages", "ahtml", "src", "cli", "command-contract.mjs"),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-template",
        "src",
        "app.tsx",
      ),
    ])

    expect(gallerySpec).toContain("独立顶栏")
    expect(gallerySpec).toContain("组件展柜")
    expect(gallerySpec).toContain("select styleReference")
    expect(gallerySpec).toContain("reset draft to persisted state")
    expect(gallerySpec).toContain("/__ahtml/gallery/save")

    expect(blueprint).toContain("左侧配置页与右侧组件画廊预览")
    expect(docsArchitecture).toContain("左侧配置器与右侧组件画廊")
    expect(docsWeb).toContain("style configuration page and component gallery")
    expect(commandContract).toContain(
      "Open the style configuration page and component gallery.",
    )

    expect(runtimeApp).toContain('data-gallery-frame="header"')
    expect(runtimeApp).toContain('data-gallery-frame="controls"')
    expect(runtimeApp).toContain('data-gallery-frame="preview"')
    expect(runtimeApp).toContain('value="controls"')
    expect(runtimeApp).toContain('value="preview"')
    expect(runtimeApp).toContain('value="components"')
    expect(runtimeApp).toContain("<Button")
    expect(runtimeApp).toContain("<Select")
    expect(runtimeApp).toContain("<Accordion")
    expect(runtimeApp).toContain("Reset Draft")
    expect(runtimeApp).toContain("Save Current Style")
    expect(runtimeApp).toContain("Component gallery workbench")
    expect(runtimeApp).toContain('value="full"')
  })
})
