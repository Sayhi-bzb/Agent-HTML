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
        "runtime-host",
        "features",
        "gallery",
        "app.tsx",
      ),
    ])

    expect(gallerySpec).toContain("独立顶栏")
    expect(gallerySpec).toContain("组件展柜")
    expect(gallerySpec).toContain("artifact profile 的选择、编辑、保存与预览")
    expect(gallerySpec).toContain("reset draft to persisted state")
    expect(gallerySpec).toContain("/__ahtml/gallery/save")

    expect(blueprint).toContain("左侧配置页与右侧组件画廊预览")
    expect(docsArchitecture).toContain("左侧配置器与右侧组件画廊")
    expect(docsWeb).toContain(
      "artifact profile gallery and component preview workbench",
    )
    expect(commandContract).toContain(
      "Open the artifact profile gallery and component preview workbench.",
    )

    expect(runtimeApp).toContain('data-gallery-frame="header"')
    expect(runtimeApp).toContain('data-gallery-frame="controls"')
    expect(runtimeApp).toContain('data-gallery-frame="preview"')
    expect(runtimeApp).toContain('value="controls"')
    expect(runtimeApp).toContain('value="preview"')
    expect(runtimeApp).toContain('value="components"')
    expect(runtimeApp).toContain("<Button")
    expect(runtimeApp).toContain("<Popover")
    expect(runtimeApp).toContain("<Accordion")
    expect(runtimeApp).toContain("Reset")
    expect(runtimeApp).toContain("Save Profile")
    expect(runtimeApp).toContain('aria-label="Preview theme"')
    expect(runtimeApp).toContain("Preset chooser")
    expect(runtimeApp).toContain("<GalleryPreviewMeta")
    expect(runtimeApp).toContain("Gallery")
    expect(runtimeApp).toContain("Fullscreen")
    expect(runtimeApp).toContain('data-theme-mode={previewThemeMode}')
    expect(runtimeApp).toContain("GalleryExamplesPreviewContainer")
    expect(runtimeApp).toContain("More previews")
    expect(runtimeApp).toContain("Color Palette")
    expect(runtimeApp).toContain("Full component gallery")
    expect(runtimeApp).toContain("Inspector")
    expect(runtimeApp).toContain("Inspecting")
    expect(runtimeApp).toContain("DropdownMenu")
    expect(runtimeApp).toContain("<AccordionTrigger>Radius</AccordionTrigger>")
    expect(runtimeApp).toContain("<AccordionTrigger>Treatments</AccordionTrigger>")
    expect(runtimeApp).toContain("ahtml-gallery-token-row")
    expect(runtimeApp).toContain('<AccordionTrigger>{section.title}</AccordionTrigger>')
    expect(runtimeApp).toContain('title: "Primary"')
    expect(runtimeApp).toContain('title: "Border & Input"')
    expect(runtimeApp).toContain("ahtml-gallery-color-popover")
    expect(runtimeApp).toContain('value="dashboard"')
    expect(runtimeApp).toContain('value="mail"')
    expect(runtimeApp).toContain('value="colors"')
    expect(runtimeApp).toContain('setPreviewMode("selection")')
    expect(runtimeApp).toContain("Press Esc to release")
    expect(runtimeApp).toContain("ahtml-gallery-inspector-outline")
    expect(runtimeApp).toContain("Click to pin the current component")
    expect(runtimeApp).toContain('target.dataset.ahtmlPath')
    expect(runtimeApp).toContain('target.dataset.ahtmlRenderKind')
    expect(runtimeApp).toContain('target.dataset.ahtmlSource')
    expect(runtimeApp).toContain('label="Render"')
    expect(runtimeApp).toContain('label="Source"')
    expect(runtimeApp).toContain('label="Path"')
  })
})
