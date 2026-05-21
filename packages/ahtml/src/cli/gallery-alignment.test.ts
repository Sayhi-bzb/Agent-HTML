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
      runtimeControls,
      runtimeControlModules,
      runtimePreview,
      runtimePreviewModules,
      runtimeAppModules,
      runtimeShared,
      runtimeSharedModules,
      runtimeStyles,
      runtimeConfig,
    ] = await Promise.all([
      readRepoSource("docs", "spec", "gallery", "gallery.md"),
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
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "features",
        "gallery",
        "controls.tsx",
      ),
      Promise.all([
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "header.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "profile-tab.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "colors-tab.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "typography-tab.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "other-tab.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "controls",
          "treatments-tab.tsx",
        ),
      ]).then((sources) => sources.join("\n")),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "features",
        "gallery",
        "preview.tsx",
      ),
      Promise.all([
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "cards.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "colors.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "custom.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "dashboard.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "mail.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "pricing.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "preview",
          "typography.tsx",
        ),
      ]).then((sources) => sources.join("\n")),
      Promise.all([
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "actions.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "hooks.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "state.tsx",
        ),
      ]).then((sources) => sources.join("\n")),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "features",
        "gallery",
        "shared",
        "index.tsx",
      ),
      Promise.all([
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "shared",
          "form-controls.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "shared",
          "chrome.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "shared",
          "preview-container.tsx",
        ),
        readRepoSource(
          "packages",
          "ahtml",
          "src",
          "cli",
          "runtime-host",
          "features",
          "gallery",
          "shared",
          "preset-option.tsx",
        ),
      ]).then((sources) => sources.join("\n")),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "features",
        "gallery",
        "styles.ts",
      ),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "features",
        "gallery",
        "config.ts",
      ),
    ])
    const runtimeGallerySource = [
      runtimeApp,
      runtimeControls,
      runtimeControlModules,
      runtimePreview,
      runtimePreviewModules,
      runtimeAppModules,
      runtimeShared,
      runtimeSharedModules,
      runtimeStyles,
      runtimeConfig,
    ].join("\n")

    expect(gallerySpec).toContain("独立顶栏")
    expect(gallerySpec).toContain("组件展柜")
    expect(gallerySpec).toContain("artifact profile 的选择、编辑、保存与预览")
    expect(gallerySpec).toContain("reset draft to persisted state")
    expect(gallerySpec).toContain("/__ahtml/gallery/save")

    expect(blueprint).toContain("左侧配置页与右侧组件画廊预览")
    expect(docsArchitecture).toContain("左侧配置器与右侧组件画廊")
    expect(docsWeb).toContain(
      "artifact profile gallery and component gallery workbench",
    )
    expect(commandContract).toContain(
      "Open the artifact profile gallery and component gallery workbench.",
    )

    expect(runtimeGallerySource).toContain('data-gallery-frame="header"')
    expect(runtimeGallerySource).toContain('data-gallery-frame="controls"')
    expect(runtimeGallerySource).toContain('data-gallery-frame="preview"')
    expect(runtimeGallerySource).toContain('value="controls"')
    expect(runtimeGallerySource).toContain('value="preview"')
    expect(runtimeGallerySource).toContain('value="components"')
    expect(runtimeGallerySource).toContain('React.useState<"controls" | "preview">(')
    expect(runtimeGallerySource).toContain('"preview"')
    expect(runtimeGallerySource).toContain("<Button")
    expect(runtimeGallerySource).toContain("<Popover")
    expect(runtimeGallerySource).toContain("<Accordion")
    expect(runtimeGallerySource).toContain("Reset")
    expect(runtimeGallerySource).toContain("Save Profile")
    expect(runtimeGallerySource).toContain('aria-label="Preview theme"')
    expect(runtimeGallerySource).toContain("Profile gallery")
    expect(runtimeGallerySource).toContain("<GalleryPreviewMeta")
    expect(runtimeGallerySource).toContain("Gallery")
    expect(runtimeGallerySource).toContain("Fullscreen")
    expect(runtimeGallerySource).toContain("data-theme-mode={previewThemeMode}")
    expect(runtimeGallerySource).toContain("GalleryExamplesPreviewContainer")
    expect(runtimeGallerySource).toContain("More galleries")
    expect(runtimeGallerySource).toContain("Color Palette")
    expect(runtimeGallerySource).toContain("Full component gallery")
    expect(runtimeGallerySource).toContain("Inspector")
    expect(runtimeGallerySource).toContain("Inspecting")
    expect(runtimeGallerySource).toContain("DropdownMenu")
    expect(runtimeGallerySource).toContain(
      "<AccordionTrigger>Radius</AccordionTrigger>",
    )
    expect(runtimeGallerySource).toContain(
      "<AccordionTrigger>Treatments</AccordionTrigger>",
    )
    expect(runtimeGallerySource).toContain("ahtml-gallery-token-row")
    expect(runtimeGallerySource).toContain(
      "<AccordionTrigger>{section.title}</AccordionTrigger>",
    )
    expect(runtimeGallerySource).toContain('title: "Primary"')
    expect(runtimeGallerySource).toContain('title: "Border & Input"')
    expect(runtimeGallerySource).toContain("ahtml-gallery-color-popover")
    expect(runtimeGallerySource).toContain('value="dashboard"')
    expect(runtimeGallerySource).toContain('value="mail"')
    expect(runtimeGallerySource).toContain('value="lightTokens"')
    expect(runtimeGallerySource).toContain('value="darkTokens"')
    expect(runtimeGallerySource).toContain('value="radius"')
    expect(runtimeGallerySource).toContain('value="treatments"')
    expect(runtimeGallerySource).toContain('setPreviewMode("selection")')
    expect(runtimeGallerySource).toContain("Press Esc to release")
    expect(runtimeGallerySource).toContain("ahtml-gallery-inspector-outline")
    expect(runtimeGallerySource).toContain("Click to pin the current component")
    expect(runtimeGallerySource).toContain("target.dataset.ahtmlPath")
    expect(runtimeGallerySource).toContain("target.dataset.ahtmlRenderKind")
    expect(runtimeGallerySource).toContain("target.dataset.ahtmlSource")
    expect(runtimeGallerySource).toContain('label="Render"')
    expect(runtimeGallerySource).toContain('label="Source"')
    expect(runtimeGallerySource).toContain('label="Path"')
    expect(runtimeGallerySource).toContain("Destination surface")
    expect(runtimeGallerySource).toContain(
      "Embedded campaign workbench preview",
    )
    expect(runtimeGallerySource).toContain(
      "Inspect the live destination before you publish.",
    )
    expect(runtimeGallerySource).toContain("Profile manager")
    expect(runtimeGallerySource).toContain("Persist")
    expect(runtimeGallerySource).toContain("Conversion Stack")
  })
})
