import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { readSource, root } from "./test-contract-helpers.mjs"

describe("React Canvas style resource contract", { timeout: 15000 }, () => {
  it("keeps workspace style resources in their owned files", () => {
    const playgroundStyles = readSource("agent-html/styles/index.css")
    const playgroundFoundationEntry = readSource(
      "agent-html/styles/foundation.css"
    )
    const playgroundBaseStyles = readSource("agent-html/styles/base.css")
    const playgroundTailwindTokens = readSource(
      "agent-html/styles/materials/tailwind.css"
    )
    const playgroundFoundationTokens = readSource(
      "agent-html/styles/materials/foundation.css"
    )
    const playgroundTokenImports = readSource(
      "agent-html/styles/materials/index.css"
    )
    const playgroundKitImports = readSource("agent-html/styles/kits/index.css")

    expect(existsSync(join(root, "agent-html", "components.json"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "tsconfig.json"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "styles.css"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "content.css"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "theme.css"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "kits"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "styles", "layouts"))).toBe(true)
    expect(
      existsSync(join(root, "agent-html", "styles", "materials", "kits"))
    ).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "use"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "system"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "bridge"))).toBe(false)

    expect(playgroundStyles).toContain('@import "tailwindcss"')
    expect(playgroundStyles).toContain('@import "tw-animate-css"')
    expect(playgroundStyles).toContain('@import "shadcn/tailwind.css"')
    expect(playgroundStyles).toContain('@import "./foundation.css"')
    expect(playgroundStyles).not.toContain(
      '@import "@fontsource-variable/geist"'
    )
    expect(playgroundStyles).not.toContain('@import "./materials/index.css"')
    expect(playgroundFoundationEntry).toContain(
      '@import "@fontsource-variable/geist"'
    )
    expect(playgroundFoundationEntry).toContain(
      '@import "./materials/index.css"'
    )
    expect(playgroundStyles).toContain('@import "./kits/index.css"')
    expect(playgroundStyles).toContain('@import "./materials/tailwind.css"')
    expect(playgroundStyles).toContain('@import "./layouts/index.css"')
    expect(playgroundStyles).toContain('@import "./internal/code-block.css"')
    expect(playgroundStyles).toContain('@import "./internal/artifact.css"')
    expect(playgroundStyles).not.toContain('@import "./internal/host.css"')
    expect(playgroundStyles).not.toContain(
      '@import "./internal/theme-editor.css"'
    )
    expect(playgroundStyles).not.toContain("--chart-background")
    expect(playgroundStyles).not.toContain("--color-chart-background")
    expect(playgroundStyles).not.toMatch(/--chart-[\w-]+\s*:/)
    expect(playgroundStyles).not.toMatch(/--color-chart-[\w-]+\s*:/)
    expect(playgroundStyles).not.toMatch(/oklch\(/)
    expect(playgroundBaseStyles).toContain("::selection")
    expect(playgroundBaseStyles).toContain(
      "background: var(--canvas-text-selection-background)"
    )
    expect(playgroundBaseStyles).toContain(
      "color: var(--canvas-text-selection-foreground)"
    )
    expect(playgroundTailwindTokens).toContain("--font-sans: var(--font-sans)")
    expect(playgroundTailwindTokens).toContain("--font-mono: var(--font-mono)")
    expect(playgroundTailwindTokens).toContain(
      "--font-heading: var(--font-heading)"
    )
    expect(playgroundTailwindTokens).toContain("--color-background")
    expect(playgroundTailwindTokens).toContain("--color-canvas-host-sidebar")
    expect(playgroundTailwindTokens).toContain(
      "--color-success: var(--success)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-background: var(--chart-background)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-foreground: var(--chart-foreground)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-foreground-muted: var(--chart-foreground-muted)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-crosshair: var(--chart-crosshair)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-grid: var(--chart-grid)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-tooltip-background: var(--chart-tooltip-background)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-marker-background: var(--chart-marker-background)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--color-chart-label: var(--chart-label)"
    )
    expect(playgroundTailwindTokens).toContain("--radius-lg: var(--radius)")
    expect(playgroundTailwindTokens).not.toContain(
      "--spacing-canvas-block-action-badge-offset"
    )
    expect(playgroundTailwindTokens).not.toContain(
      "--spacing-canvas-block-reply-badge-offset"
    )
    expect(playgroundTailwindTokens).not.toMatch(/oklch\(/)
    expect(playgroundTailwindTokens).not.toMatch(/rgb\(/)
    expect(playgroundTailwindTokens).not.toMatch(/#[0-9A-Fa-f]{3,8}/)
    expect(playgroundTailwindTokens).not.toMatch(/color-mix\(/)
    expect(playgroundTailwindTokens).not.toMatch(/\b\d*\.?\d+rem\b/)
    expect(playgroundTailwindTokens).not.toMatch(/\b\d*\.?\d+px\b/)
    expect(playgroundTailwindTokens).not.toMatch(/\b\d*\.?\d+%\b/)
    expect(playgroundTailwindTokens).toMatch(
      /--radius-sm:\s*calc\(var\(--radius\) \* 0\.6\)/
    )
    expect(playgroundTokenImports).toContain('@import "./foundation.css"')
    expect(playgroundTokenImports).not.toContain(
      '@import "./kits/artifact.css"'
    )
    expect(playgroundKitImports).toContain('@import "./artifact.css"')
    expect(playgroundKitImports).toContain('@import "./content.css"')
    expect(playgroundKitImports).toContain('@import "./code-block.css"')
    expect(playgroundKitImports).not.toContain('@import "./host.css"')
    expect(playgroundKitImports).not.toContain('@import "./theme-editor.css"')
    expect(playgroundFoundationTokens).toContain("--font-sans")
    expect(playgroundFoundationTokens).toContain("--font-size-2xs: 0.6875rem")
    expect(playgroundFoundationTokens).toContain("--font-size-xs: 0.75rem")
    expect(playgroundFoundationTokens).toContain("--font-size-sm: 0.8125rem")
    expect(playgroundFoundationTokens).toContain("--font-size-body: 0.875rem")
    expect(playgroundFoundationTokens).toContain("--font-size-base: 1rem")
    expect(playgroundFoundationTokens).toContain("--font-size-lg: 1.125rem")
    expect(playgroundFoundationTokens).toContain("--font-size-xl: 1.25rem")
    expect(playgroundFoundationTokens).toContain("--font-size-2xl: 1.5rem")
    expect(playgroundFoundationTokens).toContain("--line-height-2xs: 1rem")
    expect(playgroundFoundationTokens).toContain("--line-height-xs: 1rem")
    expect(playgroundFoundationTokens).toContain("--line-height-sm: 1.25rem")
    expect(playgroundFoundationTokens).toContain(
      "--line-height-body: 1.3125rem"
    )
    expect(playgroundFoundationTokens).toContain("--line-height-base: 1.5rem")
    expect(playgroundFoundationTokens).toContain("--line-height-lg: 1.5rem")
    expect(playgroundFoundationTokens).toContain("--line-height-xl: 1.75rem")
    expect(playgroundFoundationTokens).toContain("--line-height-2xl: 2rem")
    expect(playgroundTailwindTokens).toContain(
      "--text-2xs: var(--font-size-2xs)"
    )
    expect(playgroundTailwindTokens).toContain("--text-sm: var(--font-size-sm)")
    expect(playgroundTailwindTokens).toContain(
      "--text-base: var(--font-size-base)"
    )
    expect(playgroundTailwindTokens).toContain(
      "--text-2xl--line-height: var(--line-height-2xl)"
    )
    expect(playgroundFoundationTokens).toContain("--font-heading")
    expect(playgroundFoundationTokens).toContain("--success")
    expect(playgroundFoundationTokens).toContain("--warning")
    expect(playgroundFoundationTokens).toContain("--info")
    expect(playgroundFoundationTokens).toContain("--chart-background")
    expect(playgroundFoundationTokens).toContain("--chart-foreground")
    expect(playgroundFoundationTokens).toContain("--chart-foreground-muted")
    expect(playgroundFoundationTokens).toContain("--chart-line-primary")
    expect(playgroundFoundationTokens).toContain("--chart-line-secondary")
    expect(playgroundFoundationTokens).toContain("--chart-crosshair")
    expect(playgroundFoundationTokens).toContain("--chart-grid")
    expect(playgroundFoundationTokens).toContain("--chart-brush-border")
    expect(playgroundFoundationTokens).toContain("--chart-tooltip-background")
    expect(playgroundFoundationTokens).toContain("--chart-marker-background")
    expect(playgroundFoundationTokens).toContain("--chart-ring-background")
    expect(playgroundFoundationTokens).toContain("--chart-label")
    expect(playgroundFoundationTokens).toContain("/* Theme primitives */")
    expect(playgroundFoundationTokens).toContain("/* Status primitives */")
    expect(playgroundFoundationTokens).toContain("/* Chart primitives */")
    expect(playgroundFoundationTokens).not.toContain("--canvas-host-sidebar")
    expect(playgroundFoundationTokens).toContain(
      "/* Canvas base affordances */"
    )
    expect(playgroundFoundationTokens).toContain("--radius: 0.625rem")
    expect(playgroundFoundationTokens).toContain(
      "--canvas-text-selection-background"
    )
    expect(playgroundFoundationTokens).toContain(
      "--canvas-text-selection-foreground"
    )
    expect(playgroundFoundationTokens).not.toContain("--font-sans-source")
    expect(playgroundFoundationTokens).not.toContain("--font-heading-source")
    expect(playgroundFoundationTokens).not.toContain("--radius-base")
    expect(playgroundFoundationTokens).not.toContain("--canvas-content-gap")
    expect(playgroundFoundationTokens).not.toContain(
      "--canvas-artifact-max-width"
    )
    expect(playgroundFoundationTokens).not.toContain(
      "--canvas-floating-prompt-width"
    )
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-color\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-opacity\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-x\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-y\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-blur\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-spread\s*:/)
  })

  it("assigns viewport scrolling and coarse-pointer targets to host owners", () => {
    const playgroundBaseStyles = readSource("agent-html/styles/base.css")
    const canvasHostApp = readSource("packages/cli/src/host/app.tsx")
    const packageHostSurfaceStyles = readSource(
      "packages/cli/src/host/styles/surface.css"
    )
    const packageHostBlockOverlayStyles = readSource(
      "packages/cli/src/host/styles/block-overlay.css"
    )
    const packageHostTokens = readSource(
      "packages/cli/src/host/styles/tokens/host.css"
    )
    expect(playgroundBaseStyles).toContain("overscroll-behavior: none")
    expect(canvasHostApp).toContain('className="canvas-host-workspace"')
    expect(packageHostSurfaceStyles).toMatch(
      /\.canvas-host-workspace\s*\{[^}]*height: 100%;[^}]*min-width: 0;[^}]*min-height: 0;[^}]*overflow: hidden;/
    )
    expect(packageHostSurfaceStyles).toContain(
      '.canvas-surface-scroll [data-slot="scroll-area-viewport"]'
    )
    expect(packageHostSurfaceStyles).toMatch(
      /\.canvas-surface-scroll \[data-slot="scroll-area-viewport"\] > div\s*\{[^}]*display: block !important;[^}]*min-width: 0 !important;[^}]*width: 100%;[^}]*\}/
    )
    expect(packageHostSurfaceStyles).toContain("overscroll-behavior: none")
    expect(packageHostSurfaceStyles).toMatch(
      /\.canvas-host-status\s*\{[^}]*max-width: var\(--canvas-artifact-max-width\);[^}]*min-width: 0;/
    )
    expect(packageHostSurfaceStyles).toContain(
      ".canvas-host-status-description"
    )
    expect(packageHostSurfaceStyles).toContain("overflow-wrap: anywhere")
    expect(packageHostSurfaceStyles).not.toContain("100svh")
    expect(packageHostTokens).toContain(
      "--canvas-host-touch-target-min: 2.75rem"
    )
    expect(packageHostBlockOverlayStyles).toContain(
      "@media (any-pointer: coarse)"
    )
    expect(packageHostBlockOverlayStyles).toContain("opacity: 1")
    expect(playgroundBaseStyles).not.toContain("touch-action:")
    expect(packageHostSurfaceStyles).not.toContain("touch-action:")
  })

  it("shares product brand roles without exposing host chrome to Canvas", () => {
    const brandStyles = readSource("packages/cli/src/shared/brand.css")
    const packageHostStyles = readSource("packages/cli/src/host/styles.css")
    const packageHostSidebarStyles = readSource(
      "packages/cli/src/host/styles/sidebar.css"
    )
    const packageHostTokens = readSource(
      "packages/cli/src/host/styles/tokens/host.css"
    )
    const playgroundFoundationEntry = readSource(
      "agent-html/styles/foundation.css"
    )
    const playgroundSidebarPrimitive = readSource(
      "agent-html/components/ui/sidebar.tsx"
    )
    const desktopStyles = readSource("apps/desktop/src/styles.css")

    expect(packageHostStyles).not.toContain('@import "../shared/brand.css"')
    expect(brandStyles).toContain(
      "--agent-html-brand-font-family: var(--font-sans)"
    )
    expect(brandStyles).toContain(
      "--agent-html-brand-font-size: var(--font-size-base)"
    )
    expect(brandStyles).toContain("--agent-html-brand-font-weight: 600")
    expect(brandStyles).toContain(
      "--agent-html-brand-line-height: var(--line-height-base)"
    )
    expect(brandStyles).toContain(
      "--agent-html-brand-letter-spacing: var(--tracking-normal)"
    )
    expect(brandStyles).toContain("--agent-html-brand-icon-size: 1.25rem")
    expect(brandStyles).toContain("--agent-html-brand-gap: 0.5rem")
    expect(desktopStyles).toContain(
      "font-family: var(--agent-html-brand-font-family)"
    )
    expect(desktopStyles).toContain("font-size: clamp(2rem, 5vw, 3rem)")
    expect(desktopStyles).toContain(
      "font-weight: var(--agent-html-brand-font-weight)"
    )
    expect(desktopStyles).toContain(
      "letter-spacing: var(--agent-html-brand-letter-spacing)"
    )
    expect(desktopStyles).toContain("line-height: 1")
    expect(desktopStyles).toContain("height: 0.9em")
    expect(desktopStyles).toContain("gap: var(--agent-html-brand-gap)")
    expect(packageHostSidebarStyles).not.toContain("--agent-html-brand-")
    expect(packageHostTokens).not.toContain("--canvas-sidebar-title-font-size")
    expect(packageHostTokens).toContain(
      "--canvas-host-caption-font-size: var(--font-size-xs)"
    )
    expect(packageHostTokens).toContain(
      "--canvas-host-body-font-size: var(--font-size-sm)"
    )
    expect(packageHostTokens).toContain(
      "--canvas-host-micro-font-size: var(--font-size-2xs)"
    )
    expect(playgroundFoundationEntry).not.toContain("--agent-html-brand-")
    expect(playgroundSidebarPrimitive).toContain("data-active:font-medium")
    expect(playgroundSidebarPrimitive).toMatch(
      /sidebarMenuButtonVariants = cva\([\s\S]*?\btext-sm\b/
    )
    expect(playgroundSidebarPrimitive).not.toContain(
      "data-active:font-semibold"
    )
  })

  it("keeps material kits and internal styles scoped", () => {
    const playgroundArtifactTokens = readSource(
      "agent-html/styles/kits/artifact.css"
    )
    const playgroundContentTokens = readSource(
      "agent-html/styles/kits/content.css"
    )
    const playgroundCodeBlockTokens = readSource(
      "agent-html/styles/kits/code-block.css"
    )
    const packageHostStyles = readSource("packages/cli/src/host/styles.css")
    const packageHostTokenImports = readSource(
      "packages/cli/src/host/styles/tokens.css"
    )
    const packageHostTokens = readSource(
      "packages/cli/src/host/styles/tokens/host.css"
    )
    const packageHostThemeEditorTokens = readSource(
      "packages/cli/src/host/styles/tokens/theme-editor.css"
    )
    const packageCanvasChromeTokens = readSource(
      "packages/cli/src/host/styles/tokens/canvas-chrome.css"
    )
    const playgroundArtifactInternal = readSource(
      "agent-html/styles/internal/artifact.css"
    )
    const playgroundCodeBlockInternal = readSource(
      "agent-html/styles/internal/code-block.css"
    )
    const packageHostSurfaceStyles = readSource(
      "packages/cli/src/host/styles/surface.css"
    )
    const packageHostSidebarStyles = readSource(
      "packages/cli/src/host/styles/sidebar.css"
    )
    const packageHostBlockOverlayStyles = readSource(
      "packages/cli/src/host/styles/block-overlay.css"
    )
    const packageHostFloatingPromptStyles = readSource(
      "packages/cli/src/host/styles/floating-prompt.css"
    )
    const playgroundContent = readSource("agent-html/styles/layouts/index.css")
    const playgroundComposition = readSource(
      "agent-html/styles/layouts/composition.css"
    )

    expect(
      existsSync(
        join(root, "agent-html", "styles", "materials", "artifact.css")
      )
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "materials", "content.css"))
    ).toBe(false)
    expect(
      existsSync(
        join(root, "agent-html", "styles", "materials", "code-block.css")
      )
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "materials", "host.css"))
    ).toBe(false)
    expect(
      existsSync(
        join(root, "agent-html", "styles", "materials", "theme-editor.css")
      )
    ).toBe(false)
    expect(
      existsSync(
        join(root, "agent-html", "styles", "materials", "kits", "host.css")
      )
    ).toBe(false)
    expect(
      existsSync(
        join(
          root,
          "agent-html",
          "styles",
          "materials",
          "kits",
          "theme-editor.css"
        )
      )
    ).toBe(false)
    expect(playgroundArtifactTokens).toContain("--canvas-artifact-max-width")
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-background"
    )
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-foreground"
    )
    expect(packageHostTokenImports).toContain('@import "./tokens/host.css"')
    expect(packageHostTokenImports).toContain(
      '@import "./tokens/canvas-chrome.css"'
    )
    expect(packageHostTokenImports).toContain(
      '@import "./tokens/theme-editor.css"'
    )
    expect(packageHostTokens).toContain("--canvas-surface-padding-inline")
    expect(packageHostTokens).toContain("--canvas-floating-prompt-width")
    expect(packageHostTokens).toContain("--canvas-host-body-font-size")
    expect(packageCanvasChromeTokens).toContain(
      "--canvas-host-chrome-control-size: 2rem"
    )
    expect(packageCanvasChromeTokens).toContain(
      "--canvas-host-chrome-control-size-coarse: 2.75rem"
    )
    expect(packageCanvasChromeTokens).toContain(
      "--canvas-host-chrome-surface-shadow: var(--shadow-md)"
    )
    expect(packageCanvasChromeTokens).toContain("@media (any-pointer: coarse)")
    expect(packageCanvasChromeTokens).toContain(
      "--canvas-host-node-radius: var(--radius-xl)"
    )
    expect(packageHostTokens).toContain("--canvas-block-action-badge-offset")
    expect(packageHostTokens).not.toContain("--canvas-block-reply-badge-offset")
    expect(packageHostTokens).not.toContain("--canvas-block-highlight-radius")
    expect(packageHostTokens).not.toContain(
      "--canvas-floating-prompt-backdrop-blur"
    )
    expect(packageHostTokens).not.toContain(
      "--canvas-artifact-skeleton-max-width"
    )
    expect(packageHostTokens).not.toContain("--canvas-block-action-shadow")
    expect(playgroundContentTokens).toContain("--canvas-content-gap-md")
    expect(playgroundContentTokens).toContain(
      "--canvas-content-title-font-size: var(--font-size-2xl)"
    )
    expect(playgroundContentTokens).toContain(
      "--canvas-content-heading-font-size: var(--font-size-lg)"
    )
    expect(playgroundContentTokens).toContain(
      "--canvas-content-body-font-size: var(--font-size-body)"
    )
    expect(playgroundContentTokens).toContain(
      "--canvas-content-caption-font-size: var(--font-size-xs)"
    )
    expect(playgroundContentTokens).not.toContain("--canvas-content-diff")
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-panel-radius"
    )
    expect(playgroundCodeBlockTokens).toContain(
      "--canvas-code-block-diff-add: var(--success)"
    )
    expect(packageHostThemeEditorTokens).toContain(
      "--canvas-theme-editor-popover-width-lg"
    )
    expect(
      existsSync(join(root, "agent-html", "styles", "internal", "host.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "internal", "host"))
    ).toBe(false)
    expect(
      existsSync(
        join(root, "agent-html", "styles", "internal", "theme-editor.css")
      )
    ).toBe(false)
    expect(
      existsSync(join(root, "packages", "cli", "src", "host", "styles"))
    ).toBe(true)
    expect(packageHostStyles).toContain('@import "./styles/tokens.css"')
    expect(packageHostStyles).toContain('@import "./styles/surface.css"')
    expect(packageHostStyles).toContain(
      '@import "./styles/floating-prompt.css"'
    )
    expect(packageHostStyles).toContain('@import "./styles/theme-editor.css"')
    expect(playgroundArtifactInternal).toContain(".agent-html-artifact")
    expect(playgroundCodeBlockInternal).toContain(".canvas-code-block")
    expect(packageHostSurfaceStyles).toContain(".canvas-surface-frame")
    expect(packageHostFloatingPromptStyles).toContain(".canvas-floating-prompt")
    expect(packageHostSurfaceStyles).toContain(
      "var(--canvas-surface-padding-inline)"
    )
    expect(packageHostSidebarStyles).toContain(
      "var(--canvas-host-body-font-size)"
    )
    expect(packageHostBlockOverlayStyles).toContain(
      "var(--canvas-block-highlight-border)"
    )
    expect(packageHostFloatingPromptStyles).toContain(
      "var(--canvas-floating-prompt-width)"
    )
    expect(packageHostSidebarStyles).not.toMatch(
      /(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}/
    )
    expect(packageHostStyles).not.toContain(".canvas-floating-prompt-composer")
    expect(playgroundContent).toContain('@import "./composition.css"')
    expect(playgroundComposition).toContain(".canvas-stack-md")
    expect(playgroundComposition).toContain(".canvas-content-panel")
    expect(playgroundComposition).toContain(".canvas-text-body")
  })

  it("keeps interaction and prompt style ownership out of the Workbench", () => {
    const canvasMessageStore = readSource(
      "packages/cli/src/host/prompt/canvas-message-store.ts"
    )
    const canvasHostApp = readSource("packages/cli/src/host/app.tsx")
    const canvasCodexPipeline = readSource(
      "packages/cli/src/host/pipeline/codex.ts"
    )
    const canvasInteractionStore = readSource(
      "packages/cli/src/host/interaction/interaction-store.ts"
    )
    const floatingPrompt = readSource(
      "packages/cli/src/host/prompt/floating-prompt.tsx"
    )

    expect(canvasMessageStore).toContain("CanvasMessageHostSnapshot")
    expect(canvasMessageStore).toContain("subscribeCanvasMessageHost")
    expect(canvasCodexPipeline).toContain("fetchBlockImplementation")
    expect(canvasCodexPipeline).toContain("getCanvasInteractionSnapshot")
    expect(canvasHostApp).not.toContain("useArtifactInteraction")
    expect(canvasInteractionStore).toContain("agent-html:state-change")
    expect(canvasInteractionStore).toContain("recordCanvasInteractionChange")
    expect(floatingPrompt).toContain("value: string")
    expect(floatingPrompt).toContain("onDraftChange: (draft: string) => void")
    expect(floatingPrompt).not.toContain('React.useState("")')
  })

  it("keeps Canvas spatial hit testing invisible and outside Node content", () => {
    const canvasStyles = readSource("packages/cli/src/host/styles/canvas.css")

    expect(canvasStyles).toMatch(
      /\.canvas-node-shell\s*\{[^}]*display: block;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-node-hit-layer\.canvas-host-button\s*\{[^}]*position: absolute;[^}]*background: transparent;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-node-content\s*\{[^}]*min-height: 0;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.react-flow__resize-control\.line\s*\{[^}]*z-index: 3;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.react-flow__resize-control\.handle\s*\{[^}]*z-index: 4;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.canvas-node-shell \.react-flow__resize-control\.handle\.left\s*\{[^}]*left: var\(--canvas-host-node-resize-handle-offset\);/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.canvas-node-shell \.react-flow__resize-control\.handle\.right\s*\{[^}]*left: calc\(100% - var\(--canvas-host-node-resize-handle-offset\)\);/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.canvas-node-shell \.react-flow__resize-control\.handle\.top\s*\{[^}]*top: var\(--canvas-host-node-resize-handle-offset\);/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace \.canvas-node-shell \.react-flow__resize-control\.handle\.bottom\s*\{[^}]*top: calc\(100% - var\(--canvas-host-node-resize-handle-offset\)\);/s
    )
    expect(canvasStyles).toContain(
      "width: var(--canvas-host-chrome-control-size)"
    )
    expect(canvasStyles).toContain(
      "box-shadow: var(--canvas-host-chrome-surface-shadow)"
    )
    expect(canvasStyles).toContain(
      "--xy-controls-button-border-color: transparent"
    )
    expect(canvasStyles).toMatch(
      /\.canvas-tool-dock__button\.canvas-host-button\s*\{[^}]*border: 0;[^}]*background: transparent;[^}]*box-shadow: none;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-tool-dock__button\.canvas-host-button:hover\s*\{[^}]*background: var\(--muted\);/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace\s+\.react-flow__controls\.horizontal\s+\.react-flow__controls-button\s*\{[^}]*border: 0;[^}]*border-right: 0;[^}]*background: transparent;[^}]*box-shadow: none;/s
    )
    expect(canvasStyles).toMatch(
      /\.canvas-workspace\s+\.react-flow__controls\.horizontal\s+\.react-flow__controls-button:hover\s*\{[^}]*background: var\(--muted\);/s
    )
    expect(canvasStyles).not.toMatch(/border-radius: (?:7|8|10|12)px/)
    expect(canvasStyles).not.toContain(
      "box-shadow: 0 8px 24px color-mix(in srgb, black 10%, transparent)"
    )
    expect(canvasStyles).not.toContain("backdrop-filter: blur(12px)")
  })
})
