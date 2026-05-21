/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { importCliModule, readRepoSource } from "./cli-test-helpers"

const coreBoundaryEntrypoints = [
  "packages/ahtml/src/cli/schema.mjs",
  "packages/ahtml/src/cli/validate.mjs",
]
const managedRuntimeSourcePaths = [
  "packages/ahtml/src/cli/index.mjs",
  "packages/ahtml/src/cli/runtime-build.mjs",
  "packages/ahtml/src/cli/runtime-paths.mjs",
  "packages/ahtml/src/cli/runtime-status.mjs",
  "packages/ahtml/src/cli/runtime-bootstrap/index.mjs",
]
const forbiddenCoreBoundaryPatterns = [
  /from\s+["']vite["']/,
  /from\s+["']@vitejs\/plugin-react["']/,
  /\bcreateServer\b/,
  /components\/ui/,
  /\btailwind\b/i,
]

const gallerySceneStylePaths = [
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/base.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/cards.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/colors.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/custom.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/dashboard.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/mail.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/pricing.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/responsive.ts",
  "packages/ahtml/src/cli/runtime-host/features/gallery/styles/typography.ts",
]
const galleryPreviewScenePaths = [
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/cards.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/colors.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/custom.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/dashboard.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/mail.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/pricing.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/typography.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/preview/types.ts",
]

async function readGallerySceneStyleSource() {
  return (
    await Promise.all(
      gallerySceneStylePaths.map((relativePath) =>
        readRepoSource(relativePath),
      ),
    )
  ).join("\n")
}

async function readGalleryPreviewSceneSource() {
  return (
    await Promise.all(
      galleryPreviewScenePaths.map((relativePath) =>
        readRepoSource(relativePath),
      ),
    )
  ).join("\n")
}

describe("code governance sync blocks", () => {
  it("keeps schema and validate on the published core boundary", async () => {
    for (const relativePath of coreBoundaryEntrypoints) {
      const source = await readRepoSource(relativePath)

      expect(source).toContain("@agent-html/core")
      expect(source).not.toContain("../config/internal-core-bridge.mjs")
      expect(source).not.toContain("module-loader.mjs")
      expect(source).not.toContain("loadCoreModule")

      for (const pattern of forbiddenCoreBoundaryPatterns) {
        expect(source).not.toMatch(pattern)
      }
    }
  })

  it("keeps managed runtime logic out of project-local scaffold mode", async () => {
    const commandModule = await importCliModule<{
      readonly commandMetadata: Record<string, { readonly usage: string }>
    }>("command-contract.mjs")
    const managedRuntimeSource = (
      await Promise.all(
        managedRuntimeSourcePaths.map((relativePath) =>
          readRepoSource(relativePath),
        ),
      )
    ).join("\n")

    expect(commandModule.commandMetadata).not.toHaveProperty("init")
    expect(managedRuntimeSource).not.toContain("agent-html.project.json")
    expect(managedRuntimeSource).not.toContain("--local-project")
    expect(managedRuntimeSource).not.toContain("--scaffold")
    expect(managedRuntimeSource).not.toContain("--apply")
    const commandUsage = Object.values(commandModule.commandMetadata)
      .map((definition) => definition.usage)
      .join("\n")

    expect(commandUsage).not.toContain("--template")
    expect(managedRuntimeSource).not.toContain("src/cli/scaffold.mjs")
  })

  it("keeps public docs off the removed init command", async () => {
    const publicDocsPaths = [
      "README.md",
      ".agents/skills/ahtml/SKILL.md",
      ".agents/skills/ahtml/references/install.md",
      ".agents/skills/ahtml/references/debug.md",
    ]
    const publicDocsSource = (
      await Promise.all(
        publicDocsPaths.map((relativePath) => readRepoSource(relativePath)),
      )
    ).join("\n")

    expect(publicDocsSource).not.toContain("ahtml init")
    expect(publicDocsSource).not.toContain("init --dry-run")
    expect(publicDocsSource).not.toContain("init --scaffold")
  })

  it("keeps runtime host sources outside runtime orchestration modules", async () => {
    const runtimeModuleSource = (
      await Promise.all(
        managedRuntimeSourcePaths.map((relativePath) =>
          readRepoSource(relativePath),
        ),
      )
    ).join("\n")

    expect(runtimeModuleSource).not.toContain("const appTsxSource")
    expect(runtimeModuleSource).not.toContain("const stylesSource")
    expect(runtimeModuleSource).not.toContain("function Card(")
    expect(runtimeModuleSource).toContain("runtime-host")
  })

  it("keeps runtime-host typecheck inside the default build gates", async () => {
    const [rootPackageJsonSource, ahtmlPackageJsonSource] = await Promise.all([
      readRepoSource("package.json"),
      readRepoSource("packages", "ahtml", "package.json"),
    ])

    expect(rootPackageJsonSource).toContain(
      '"build": "tsc -b packages/core/tsconfig.json packages/ahtml/tsconfig.json && npm --workspace @agent-html/ahtml run check:runtime-host"',
    )
    expect(ahtmlPackageJsonSource).toContain(
      '"build": "tsc -p tsconfig.json && npm run check:runtime-host"',
    )
    expect(ahtmlPackageJsonSource).toContain(
      '"check:runtime-host": "tsc -p tsconfig.runtime-host.json"',
    )
  })

  it("keeps runtime-host ui source limited to explicit overrides while runtime baseline stays on fixtures", async () => {
    const [
      runtimeHostSliderSource,
      runtimeManagedUiSource,
      runtimeTsconfigSource,
    ] = await Promise.all([
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "components",
        "ui",
        "slider.tsx",
      ),
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-managed-ui.mjs",
      ),
      readRepoSource("packages", "ahtml", "tsconfig.runtime-host.json"),
    ])

    expect(runtimeHostSliderSource).toContain("controlId")
    expect(runtimeManagedUiSource).toContain(
      "const managedRuntimeUiBundleSourceDir = path.join(",
    )
    expect(runtimeManagedUiSource).toContain('"verify-pack",')
    expect(runtimeManagedUiSource).toContain('"shadcn-test-fixtures",')
    expect(runtimeManagedUiSource).toContain(
      '"runtime-host/components/ui override registry must match explicit managed overrides only."',
    )
    expect(runtimeTsconfigSource).toContain('"@/components/ui/slider": [')
    expect(runtimeTsconfigSource).toContain(
      '"../../scripts/verify-pack/shadcn-test-fixtures/components/ui/*"',
    )
  })

  it("keeps page-level gallery grid policy centralized in host-styles tokens", async () => {
    const [hostStylesSource, galleryStylesSource] = await Promise.all([
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "host-styles.tsx",
      ),
      readGallerySceneStyleSource(),
    ])

    expect(hostStylesSource).toContain("--ahtml-gallery-preset-stats-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-color-popover-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-inspector-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-dashboard-card-columns")
    expect(hostStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-preset-stats-columns);",
    )
    expect(hostStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-color-popover-columns);",
    )
    expect(hostStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-inspector-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-dashboard-card-columns);",
    )
  })

  it("keeps gallery micro spacing and surface padding on shared runtime host tokens", async () => {
    const [hostStylesSource, galleryStylesSource] = await Promise.all([
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "host-styles.tsx",
      ),
      readGallerySceneStyleSource(),
    ])

    expect(hostStylesSource).toContain("--ahtml-space-2xs")
    expect(hostStylesSource).toContain("--ahtml-space-xs")
    expect(hostStylesSource).toContain("--ahtml-space-sm")
    expect(hostStylesSource).toContain("--ahtml-space-md")
    expect(hostStylesSource).toContain("--ahtml-space-lg")
    expect(hostStylesSource).toContain("--ahtml-surface-padding-sm")
    expect(hostStylesSource).toContain("--ahtml-surface-padding-md")

    expect(galleryStylesSource).toContain("gap: var(--ahtml-space-2xs);")
    expect(galleryStylesSource).toContain("gap: var(--ahtml-space-xs);")
    expect(galleryStylesSource).toContain("gap: var(--ahtml-space-sm);")
    expect(galleryStylesSource).toContain("gap: var(--ahtml-space-md);")
    expect(galleryStylesSource).toContain("gap: var(--ahtml-space-lg);")
    expect(galleryStylesSource).toContain(
      "padding: var(--ahtml-surface-padding-sm);",
    )
    expect(galleryStylesSource).toContain(
      "padding: var(--ahtml-surface-padding-md);",
    )

    const forbiddenLiteralPatterns = [
      /gap:\s+0\.35rem;/,
      /gap:\s+0\.45rem;/,
      /gap:\s+0\.5rem;/,
      /gap:\s+0\.55rem;/,
      /gap:\s+0\.7rem;/,
      /padding:\s+0\.8rem;/,
      /padding:\s+0\.9rem;/,
    ]

    for (const pattern of forbiddenLiteralPatterns) {
      expect(galleryStylesSource).not.toMatch(pattern)
    }
  })

  it("keeps gallery shell and toolbar frame ownership in host-styles", async () => {
    const [hostStylesSource, galleryStylesSource] = await Promise.all([
      readRepoSource(
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "host-styles.tsx",
      ),
      readGallerySceneStyleSource(),
    ])

    const sharedShellSelectors = [
      ".ahtml-gallery-page-header",
      ".ahtml-gallery-page-brand",
      ".ahtml-gallery-header-actions",
      ".ahtml-gallery-mobile-tabs",
      ".ahtml-gallery-main",
      ".ahtml-gallery-sidebar",
      ".ahtml-gallery-divider",
      ".ahtml-gallery-sidebar-inner",
      ".ahtml-gallery-control-header",
      ".ahtml-gallery-control-header-row",
      ".ahtml-gallery-preset-rail",
      ".ahtml-gallery-preset-popover",
      ".ahtml-gallery-preset-option",
      ".ahtml-gallery-preset-footnote",
      ".ahtml-gallery-toolbar",
      ".ahtml-gallery-toolbar-copy",
      ".ahtml-gallery-toolbar-label",
      ".ahtml-gallery-pill-tabs",
      ".ahtml-gallery-tabs-trigger-pill",
      ".ahtml-gallery-pill-scroll",
      ".ahtml-gallery-control-body",
      ".ahtml-gallery-control-filter-bar",
      ".ahtml-gallery-control-filter-field",
      ".ahtml-gallery-filter-pill",
      ".ahtml-gallery-preview-toolbar",
      ".ahtml-gallery-toolbar-group",
      ".ahtml-gallery-preview-shell",
      ".ahtml-gallery-preview-modebar",
      ".ahtml-gallery-preview-stage",
      ".ahtml-gallery-stage-toolbar",
      ".ahtml-gallery-stage-toolbar-inset",
      ".ahtml-gallery-control-sections",
      ".ahtml-gallery-panel-body",
      ".ahtml-gallery-stack",
      ".ahtml-gallery-control-row",
      ".ahtml-gallery-field-row",
      ".ahtml-gallery-control-copy",
      ".ahtml-gallery-control-label",
      ".ahtml-gallery-control-description",
      ".ahtml-gallery-control-input-wrap",
      ".ahtml-gallery-control-input",
      ".ahtml-gallery-control-readout",
      ".ahtml-gallery-slider-field",
      ".ahtml-gallery-font-picker-trigger",
      ".ahtml-gallery-font-picker-popover",
      ".ahtml-gallery-token-row",
      ".ahtml-gallery-token-copy",
      ".ahtml-gallery-color-popover",
      ".ahtml-gallery-color-trigger",
      ".ahtml-gallery-preview-document",
      ".ahtml-gallery-stage-panel",
      ".ahtml-gallery-stage-toolbar-copy",
      ".ahtml-gallery-stage-panel-kicker",
      ".ahtml-gallery-workbench-panel",
      ".ahtml-gallery-preview-meta",
      ".ahtml-gallery-stage-frame",
      ".ahtml-gallery-preview-surface",
      ".ahtml-gallery-preview-context",
      ".ahtml-gallery-preview-canvas",
      ".ahtml-gallery-inspector-overlay",
      ".ahtml-gallery-inspector-panel",
      ".ahtml-gallery-inspector-grid",
      ".ahtml-gallery-inspector-token",
    ]

    for (const selector of sharedShellSelectors) {
      expect(hostStylesSource).toContain(selector)
      expect(galleryStylesSource).not.toMatch(
        new RegExp(`(^|\\n)\\s*\\${selector}\\s*\\{`),
      )
    }
  })

  it("keeps gallery preview.tsx as an orchestrator while preview scenes live in preview modules", async () => {
    const [previewSource, previewSceneSource] = await Promise.all([
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
      readGalleryPreviewSceneSource(),
    ])

    expect(previewSource).toContain('from "./preview/cards"')
    expect(previewSource).toContain('from "./preview/colors"')
    expect(previewSource).toContain('from "./preview/custom"')
    expect(previewSource).toContain('from "./preview/dashboard"')
    expect(previewSource).toContain('from "./preview/mail"')
    expect(previewSource).toContain('from "./preview/pricing"')
    expect(previewSource).toContain('from "./preview/typography"')
    expect(previewSource).not.toContain("function GalleryTypographyPanel(")
    expect(previewSource).not.toContain("function GalleryColorPreviewPanel(")
    expect(previewSource).not.toContain("function GalleryCustomPreviewPanel(")
    expect(previewSource).not.toContain("function GalleryCardsWorkbenchPanel(")
    expect(previewSource).not.toContain(
      "function GalleryDashboardWorkbenchPanel(",
    )
    expect(previewSource).not.toContain("function GalleryMailWorkbenchPanel(")
    expect(previewSource).not.toContain(
      "function GalleryPricingWorkbenchPanel(",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryTypographyPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryColorPreviewPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryCustomPreviewPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryCardsWorkbenchPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryDashboardWorkbenchPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryMailWorkbenchPanel",
    )
    expect(previewSceneSource).toContain(
      "export function GalleryPricingWorkbenchPanel",
    )
  })
})
