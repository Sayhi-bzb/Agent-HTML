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
const galleryControlsModulePaths = [
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/colors-tab.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/header.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/other-tab.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/profile-tab.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/typography-tab.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/controls/types.ts",
]
const gallerySharedModulePaths = [
  "packages/ahtml/src/cli/runtime-host/features/gallery/shared/index.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/shared/form-controls.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/shared/chrome.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/shared/preview-container.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/shared/preset-option.tsx",
]
const galleryAppModulePaths = [
  "packages/ahtml/src/cli/runtime-host/features/gallery/app.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/actions.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/hooks.tsx",
  "packages/ahtml/src/cli/runtime-host/features/gallery/state.tsx",
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

async function readGalleryControlsModuleSource() {
  return (
    await Promise.all(
      galleryControlsModulePaths.map((relativePath) =>
        readRepoSource(relativePath),
      ),
    )
  ).join("\n")
}

async function readGallerySharedModuleSource() {
  return (
    await Promise.all(
      gallerySharedModulePaths.map((relativePath) =>
        readRepoSource(relativePath),
      ),
    )
  ).join("\n")
}

async function readGalleryAppModuleSource() {
  return (
    await Promise.all(
      galleryAppModulePaths.map((relativePath) => readRepoSource(relativePath)),
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
    expect(hostStylesSource).toContain("--ahtml-gallery-two-up-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-workbench-intro-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-workbench-copy-max-width")
    expect(hostStylesSource).toContain("--ahtml-gallery-workbench-header-max-width")
    expect(hostStylesSource).toContain("--ahtml-gallery-workbench-meta-min-width")
    expect(hostStylesSource).toContain("--ahtml-gallery-workbench-side-rail-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-three-up-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-triptych-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-nav-item-min-height")
    expect(hostStylesSource).toContain("--ahtml-gallery-nav-item-padding-inline")
    expect(hostStylesSource).toContain("--ahtml-gallery-custom-status-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-custom-stage-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-dashboard-lower-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-mail-shell-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-mail-shell-columns-medium")
    expect(hostStylesSource).toContain("--ahtml-gallery-pricing-lower-columns")
    expect(hostStylesSource).toContain("--ahtml-gallery-showcase-grid-columns")
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
      "grid-template-columns: var(--ahtml-gallery-two-up-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-workbench-intro-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-workbench-side-rail-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-three-up-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-triptych-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-custom-status-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-custom-stage-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-dashboard-lower-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-mail-shell-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-mail-shell-columns-medium);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-pricing-lower-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-dashboard-card-columns);",
    )
    expect(galleryStylesSource).toContain(
      "grid-template-columns: var(--ahtml-gallery-showcase-grid-columns);",
    )
    expect(galleryStylesSource).toContain(
      "max-width: var(--ahtml-gallery-workbench-copy-max-width);",
    )
    expect(galleryStylesSource).toContain(
      "max-width: var(--ahtml-gallery-workbench-header-max-width);",
    )
    expect(galleryStylesSource).toContain(
      "min-width: var(--ahtml-gallery-workbench-meta-min-width);",
    )
    expect(galleryStylesSource).toContain(
      "min-height: var(--ahtml-gallery-nav-item-min-height);",
    )
    expect(galleryStylesSource).toContain(
      "padding: 0 var(--ahtml-gallery-nav-item-padding-inline);",
    )
    expect(hostStylesSource).not.toContain("--ahtml-gallery-cards-workbench-columns")
    expect(hostStylesSource).not.toContain("--ahtml-gallery-cards-split-columns")
    expect(hostStylesSource).not.toContain("--ahtml-gallery-pricing-columns")
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

  it("keeps gallery controls.tsx as an orchestrator while tab modules live in controls modules", async () => {
    const [controlsSource, controlsModuleSource] = await Promise.all([
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
      readGalleryControlsModuleSource(),
    ])

    expect(controlsSource).toContain('from "./controls/header"')
    expect(controlsSource).toContain('from "./controls/profile-tab"')
    expect(controlsSource).toContain('from "./controls/colors-tab"')
    expect(controlsSource).toContain('from "./controls/typography-tab"')
    expect(controlsSource).toContain('from "./controls/other-tab"')
    expect(controlsSource).not.toContain("function GalleryControlsHeader(")
    expect(controlsSource).not.toContain("function GalleryProfileTab(")
    expect(controlsSource).not.toContain("function GalleryColorsTab(")
    expect(controlsSource).not.toContain("function GalleryTypographyTab(")
    expect(controlsSource).not.toContain("function GalleryOtherTab(")
    expect(controlsModuleSource).toContain(
      "export function GalleryControlsHeader",
    )
    expect(controlsModuleSource).toContain("export function GalleryProfileTab")
    expect(controlsModuleSource).toContain("export function GalleryColorsTab")
    expect(controlsModuleSource).toContain(
      "export function GalleryTypographyTab",
    )
    expect(controlsModuleSource).toContain("export function GalleryOtherTab")
  })

  it("keeps gallery shared entry as a controlled export surface while shared implementations live in shared modules", async () => {
    const [sharedEntrySource, sharedModuleSource] = await Promise.all([
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
      readGallerySharedModuleSource(),
    ])

    expect(sharedEntrySource).toContain('from "./form-controls"')
    expect(sharedEntrySource).toContain('from "./chrome"')
    expect(sharedEntrySource).toContain('from "./preview-container"')
    expect(sharedEntrySource).toContain('from "./preset-option"')
    expect(sharedEntrySource).toContain('from "../helpers"')
    expect(sharedEntrySource).not.toContain("export function TokenEditor(")
    expect(sharedEntrySource).not.toContain("export function LabeledInput(")
    expect(sharedEntrySource).not.toContain("export function FontPickerField(")
    expect(sharedEntrySource).not.toContain("export function SliderInputField(")
    expect(sharedEntrySource).not.toContain("export function FieldRow(")
    expect(sharedEntrySource).not.toContain("export function GalleryPanelBody(")
    expect(sharedEntrySource).not.toContain(
      "export function GalleryPreviewMeta(",
    )
    expect(sharedEntrySource).not.toContain(
      "export function GalleryToolbarGroup(",
    )
    expect(sharedEntrySource).not.toContain(
      "export function GalleryTabsTriggerPill(",
    )
    expect(sharedEntrySource).not.toContain(
      "export function GalleryExamplesPreviewContainer(",
    )
    expect(sharedEntrySource).not.toContain(
      "export function renderPresetChooserOption(",
    )
    expect(sharedModuleSource).toContain("export function TokenEditor")
    expect(sharedModuleSource).toContain("export function LabeledInput")
    expect(sharedModuleSource).toContain("export function FontPickerField")
    expect(sharedModuleSource).toContain("export function SliderInputField")
    expect(sharedModuleSource).toContain("export function FieldRow")
    expect(sharedModuleSource).toContain("export function GalleryPanelBody")
    expect(sharedModuleSource).toContain("export function GalleryPreviewMeta")
    expect(sharedModuleSource).toContain("export function GalleryToolbarGroup")
    expect(sharedModuleSource).toContain(
      "export function GalleryTabsTriggerPill",
    )
    expect(sharedModuleSource).toContain(
      "export function GalleryExamplesPreviewContainer",
    )
    expect(sharedModuleSource).toContain(
      "export function renderPresetChooserOption",
    )
  })

  it("keeps gallery shared consumers on specific shared modules instead of a single shared monolith import", async () => {
    const galleryFeatureSource = (
      await Promise.all([
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
          "preview.tsx",
        ),
        ...[
          "cards.tsx",
          "colors.tsx",
          "custom.tsx",
          "dashboard.tsx",
          "mail.tsx",
          "pricing.tsx",
          "typography.tsx",
        ].map((fileName) =>
          readRepoSource(
            "packages",
            "ahtml",
            "src",
            "cli",
            "runtime-host",
            "features",
            "gallery",
            "preview",
            fileName,
          ),
        ),
        ...[
          "colors-tab.tsx",
          "header.tsx",
          "other-tab.tsx",
          "profile-tab.tsx",
          "typography-tab.tsx",
        ].map((fileName) =>
          readRepoSource(
            "packages",
            "ahtml",
            "src",
            "cli",
            "runtime-host",
            "features",
            "gallery",
            "controls",
            fileName,
          ),
        ),
      ])
    ).join("\n")

    expect(galleryFeatureSource).not.toContain('from "./shared"')
    expect(galleryFeatureSource).not.toContain('from "../shared"')
    expect(galleryFeatureSource).toContain('from "./shared/chrome"')
    expect(galleryFeatureSource).toContain(
      'from "./shared/preview-container"',
    )
    expect(galleryFeatureSource).toContain('from "../shared/chrome"')
    expect(galleryFeatureSource).toContain('from "../shared/form-controls"')
    expect(galleryFeatureSource).toContain('from "../shared/preset-option"')
  })

  it("keeps gallery app.tsx as an orchestrator while state, actions, and effects live in dedicated modules", async () => {
    const [appSource, appModuleSource] = await Promise.all([
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
      readGalleryAppModuleSource(),
    ])

    expect(appSource).toContain('from "./hooks"')
    expect(appSource).toContain("useGalleryAppController({")
    expect(appSource).not.toContain('from "./actions"')
    expect(appSource).not.toContain('from "./state"')
    expect(appSource).not.toContain("useGalleryWorkbenchState({")
    expect(appSource).not.toContain("useGalleryDerivedState({")
    expect(appSource).not.toContain("useGalleryFocusReset({")
    expect(appSource).not.toContain("const updateDraftProfile = React.useCallback(")
    expect(appSource).not.toContain("const saveProfile = React.useCallback(async () =>")
    expect(appSource).not.toContain("const selectArtifactProfileReference = React.useCallback(")
    expect(appSource).not.toContain('const [controlTab, setControlTab] =')
    expect(appSource).not.toContain(
      'const filteredArtifactProfileReferences = React.useMemo(',
    )
    expect(appSource).not.toContain("activeArtifactProfileEditorStatus={")
    expect(appSource).not.toContain("artifactProfileReference={editorState.artifactProfileReference}")
    expect(appSource).not.toContain("copyCurrentArtifactProfile={() =>")
    expect(appSource).toContain("<GalleryControlsPane {...controlsPaneProps} />")
    expect(appSource).toContain("<GalleryPreviewPane {...previewPaneProps} />")
    expect(appSource).not.toContain("setFocusedToken(null)")
    expect(appSource).not.toContain("setFocusedEditorField(null)")
    expect(appSource).not.toContain("document.addEventListener(\"fullscreenchange\"")
    expect(appSource).not.toContain("surface.addEventListener(\"pointermove\"")
    expect(appModuleSource).toContain("export function useGalleryDraftActions")
    expect(appModuleSource).toContain("export function useGalleryProfileActions")
    expect(appModuleSource).toContain("export function useHydrateGalleryState")
    expect(appModuleSource).toContain("export function usePreviewFullscreenState")
    expect(appModuleSource).toContain("export function useGalleryFocusReset")
    expect(appModuleSource).toContain("export function useGalleryInspector")
    expect(appModuleSource).toContain("export function useGalleryAppController")
    expect(appModuleSource).toContain("const controlsPaneProps: GalleryControlsPaneProps = {")
    expect(appModuleSource).toContain("const previewPaneProps: GalleryPreviewPaneProps = {")
    expect(appModuleSource).toContain("export function createInitialGalleryEditorState")
    expect(appModuleSource).toContain("export function useGalleryWorkbenchState")
    expect(appModuleSource).toContain("export function filterArtifactProfileReferences")
    expect(appModuleSource).toContain("export function describeActiveArtifactProfile")
    expect(appModuleSource).toContain("export function useGalleryDerivedState")
  })
})
