import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { readSource, root } from "./test-contract-helpers.mjs"

describe("React Canvas style resource contract", { timeout: 15000 }, () => {
  it("keeps workspace style resources in their owned files", () => {
    const playgroundStyles = readSource("agent-html/styles/index.css")
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
    expect(playgroundStyles).toContain('@import "@fontsource-variable/geist"')
    expect(playgroundStyles).toContain('@import "./materials/index.css"')
    expect(playgroundStyles).toContain('@import "./kits/index.css"')
    expect(playgroundStyles).toContain('@import "./materials/tailwind.css"')
    expect(playgroundStyles).toContain('@import "./layouts/index.css"')
    expect(playgroundStyles).toContain('@import "./internal/code-block.css"')
    expect(playgroundStyles).toContain('@import "./internal/artifact.css"')
    expect(playgroundStyles).not.toContain('@import "./internal/host.css"')
    expect(playgroundStyles).not.toContain(
      '@import "./internal/theme-editor.css"'
    )
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
    expect(playgroundTailwindTokens).toContain("--color-sidebar")
    expect(playgroundTailwindTokens).toContain(
      "--color-success: var(--success)"
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
    expect(playgroundTokenImports).not.toContain('@import "./kits/artifact.css"')
    expect(playgroundKitImports).toContain('@import "./artifact.css"')
    expect(playgroundKitImports).toContain('@import "./content.css"')
    expect(playgroundKitImports).toContain('@import "./code-block.css"')
    expect(playgroundKitImports).not.toContain('@import "./host.css"')
    expect(playgroundKitImports).not.toContain(
      '@import "./theme-editor.css"'
    )
    expect(playgroundFoundationTokens).toContain("--font-sans")
    expect(playgroundFoundationTokens).toContain("--font-heading")
    expect(playgroundFoundationTokens).toContain("--success")
    expect(playgroundFoundationTokens).toContain("--warning")
    expect(playgroundFoundationTokens).toContain("--info")
    expect(playgroundFoundationTokens).toContain("/* Theme primitives */")
    expect(playgroundFoundationTokens).toContain("/* Status primitives */")
    expect(playgroundFoundationTokens).toContain("/* Chart primitives */")
    expect(playgroundFoundationTokens).toContain(
      "/* Shadcn compatibility aliases */"
    )
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
    expect(playgroundFoundationTokens).not.toContain("--canvas-artifact-max-width")
    expect(playgroundFoundationTokens).not.toContain("--canvas-floating-prompt-width")
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-color\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-opacity\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-x\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-y\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-blur\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-spread\s*:/)
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
      existsSync(join(root, "agent-html", "styles", "materials", "artifact.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "materials", "content.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "materials", "code-block.css"))
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
      '@import "./tokens/theme-editor.css"'
    )
    expect(packageHostTokens).toContain("--canvas-surface-padding-inline")
    expect(packageHostTokens).toContain("--canvas-floating-prompt-width")
    expect(packageHostTokens).toContain("--canvas-sidebar-body-font-size")
    expect(packageHostTokens).toContain(
      "--canvas-block-action-badge-offset"
    )
    expect(packageHostTokens).not.toContain(
      "--canvas-block-reply-badge-offset"
    )
    expect(packageHostTokens).not.toContain(
      "--canvas-block-highlight-radius"
    )
    expect(packageHostTokens).not.toContain(
      "--canvas-floating-prompt-backdrop-blur"
    )
    expect(packageHostTokens).not.toContain(
      "--canvas-artifact-skeleton-max-width"
    )
    expect(packageHostTokens).not.toContain("--canvas-block-action-shadow")
    expect(playgroundContentTokens).toContain("--canvas-content-gap-md")
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
    expect(packageHostStyles).toContain('@import "./styles/floating-prompt.css"')
    expect(packageHostStyles).toContain('@import "./styles/theme-editor.css"')
    expect(playgroundArtifactInternal).toContain(".agent-html-artifact")
    expect(playgroundCodeBlockInternal).toContain(".canvas-code-block")
    expect(packageHostSurfaceStyles).toContain(".canvas-surface-frame")
    expect(packageHostFloatingPromptStyles).toContain(
      ".canvas-floating-prompt"
    )
    expect(packageHostSurfaceStyles).toContain(
      "var(--canvas-surface-padding-inline)"
    )
    expect(packageHostSidebarStyles).toContain(
      "var(--canvas-sidebar-body-font-size)"
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
})
