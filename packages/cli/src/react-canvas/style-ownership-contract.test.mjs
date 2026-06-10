import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  filesMatching,
  filesMatchingAny,
  readSource,
  root,
} from "./test-contract-helpers.mjs"

const artifactFixedFormatLayoutExceptions = [
  "agent-html/artifacts/nasa-artemis-ii/crew-manifest.block.tsx",
  "agent-html/artifacts/nasa-artemis-ii/lunar-flyby.block.tsx",
  "agent-html/artifacts/nasa-artemis-ii/mission-route.block.tsx",
  "agent-html/artifacts/nasa-artemis-ii/orion-window.block.tsx",
  "agent-html/artifacts/nasa-artemis-ii/system-ignition.block.tsx",
  "agent-html/artifacts/tokyo-three-speeds/density-layer.block.tsx",
  "agent-html/artifacts/tokyo-three-speeds/header.block.tsx",
  "agent-html/artifacts/tokyo-three-speeds/quiet-layer.block.tsx",
  "agent-html/artifacts/tokyo-three-speeds/route-console.block.tsx",
]

describe("React Canvas style ownership contract", { timeout: 15000 }, () => {
  it("keeps React Canvas surfaces from bypassing local primitives", () => {
    const primitiveBypass = /<(?:button|input|table|thead|tbody|tr|th|td)\b/

    expect(filesMatching("agent-html/artifacts", primitiveBypass)).toEqual([])
    expect(filesMatching("agent-html/examples", primitiveBypass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", primitiveBypass)).toEqual([])
  })

  it("keeps artifact source on semantic token classes", () => {
    const rawArtifactVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl)|text-(?:[3-9]xl|[1-9][0-9]xl)|font-\w+|tracking-\w+|\[[^\]]+\])/

    expect(filesMatching("agent-html/artifacts", rawArtifactVisualClass)).toEqual(
      artifactFixedFormatLayoutExceptions
    )
    expect(
      filesMatchingAny(
        [
          "agent-html/components/code-block.tsx",
          "agent-html/components/data-table.tsx",
          "agent-html/components/kanban.tsx",
        ],
        rawArtifactVisualClass
      )
    ).toEqual([])
    expect(filesMatching("agent-html/examples", rawArtifactVisualClass)).toEqual([])
  })

  it("keeps host and workspace style ownership boundaries", () => {
    const rawSurfaceVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl))/
    const textSelectionOverride = /selection:(?:bg|text)-/

    expect(filesMatching("packages/cli/src/host", rawSurfaceVisualClass)).toEqual([])
    expect(filesMatching("agent-html", textSelectionOverride)).toEqual([])
    expect(filesMatching("packages/cli/src/host", textSelectionOverride)).toEqual([])
    expect(filesMatching("agent-html/theme", /"--sidebar(?:-[\w-]+)?"/)).toEqual(
      []
    )
  })

  it("keeps shadcn and TypeScript aliases scoped to their owners", () => {
    const rootComponents = JSON.parse(readSource("components.json"))
    const playgroundComponents = JSON.parse(
      readSource("agent-html/components.json")
    )
    const playgroundStyles = readSource("agent-html/styles/index.css")
    const playgroundBaseStyles = readSource("agent-html/styles/base.css")
    const playgroundTailwindTokens = readSource(
      "agent-html/styles/tokens/tailwind.css"
    )
    const playgroundFoundationTokens = readSource(
      "agent-html/styles/tokens/foundation.css"
    )
    const playgroundArtifactTokens = readSource(
      "agent-html/styles/tokens/features/artifact.css"
    )
    const playgroundHostTokens = readSource(
      "agent-html/styles/tokens/features/host.css"
    )
    const playgroundContentTokens = readSource(
      "agent-html/styles/tokens/features/content.css"
    )
    const playgroundCodeBlockTokens = readSource(
      "agent-html/styles/tokens/features/code-block.css"
    )
    const playgroundTokenImports = readSource(
      "agent-html/styles/tokens/index.css"
    )
    const playgroundThemeEditorTokens = readSource(
      "agent-html/styles/tokens/features/theme-editor.css"
    )
    const playgroundArtifactInternal = readSource(
      "agent-html/styles/internal/artifact.css"
    )
    const playgroundCodeBlockInternal = readSource(
      "agent-html/styles/internal/code-block.css"
    )
    const playgroundHostInternal = readSource(
      "agent-html/styles/internal/host.css"
    )
    const playgroundHostSurfaceInternal = readSource(
      "agent-html/styles/internal/host/surface.css"
    )
    const playgroundHostFloatingPromptInternal = readSource(
      "agent-html/styles/internal/host/floating-prompt.css"
    )
    const playgroundContent = readSource("agent-html/styles/public/content.css")
    const playgroundThemeEditorInternal = readSource(
      "agent-html/styles/internal/theme-editor.css"
    )
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
    const reactCanvasTsconfig = JSON.parse(
      readSource("config/tsconfig/tsconfig.react-canvas.json")
    )

    expect(rootComponents.tailwind.css).toBe("agent-html/styles/index.css")
    expect(rootComponents.aliases.ui).toBe("@/ui")
    expect(existsSync(join(root, "agent-html", "components.json"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "tsconfig.json"))).toBe(true)
    expect(playgroundComponents.tailwind.css).toBe("styles/index.css")
    expect(playgroundComponents.aliases.components).toBe("@/components")
    expect(playgroundComponents.aliases.ui).toBe("@/components/ui")
    expect(existsSync(join(root, "agent-html", "styles.css"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "content.css"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "theme.css"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "features"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "public"))).toBe(true)
    expect(
      existsSync(join(root, "agent-html", "styles", "tokens", "features"))
    ).toBe(true)
    expect(
      existsSync(join(root, "agent-html", "styles", "tokens", "artifact.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "tokens", "content.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "tokens", "code-block.css"))
    ).toBe(false)
    expect(
      existsSync(join(root, "agent-html", "styles", "tokens", "host.css"))
    ).toBe(false)
    expect(
      existsSync(
        join(root, "agent-html", "styles", "tokens", "theme-editor.css")
      )
    ).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "use"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "system"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "bridge"))).toBe(false)
    expect(playgroundStyles).toContain('@import "tailwindcss"')
    expect(playgroundStyles).toContain('@import "tw-animate-css"')
    expect(playgroundStyles).toContain('@import "shadcn/tailwind.css"')
    expect(playgroundStyles).toContain('@import "@fontsource-variable/geist"')
    expect(playgroundStyles).toContain('@import "./tokens/index.css"')
    expect(playgroundStyles).toContain('@import "./tokens/tailwind.css"')
    expect(playgroundStyles).toContain('@import "./public/content.css"')
    expect(playgroundStyles).toContain('@import "./internal/code-block.css"')
    expect(playgroundStyles).toContain('@import "./internal/artifact.css"')
    expect(playgroundStyles).toContain('@import "./internal/host.css"')
    expect(playgroundStyles).toContain('@import "./internal/theme-editor.css"')
    expect(playgroundBaseStyles).toContain("::selection")
    expect(playgroundBaseStyles).toContain(
      "background: var(--agent-html-text-selection-background)"
    )
    expect(playgroundBaseStyles).toContain(
      "color: var(--agent-html-text-selection-foreground)"
    )
    expect(playgroundTailwindTokens).toContain("--font-sans: var(--font-sans)")
    expect(playgroundTailwindTokens).toContain("--font-mono: var(--font-mono)")
    expect(playgroundTailwindTokens).toContain(
      "--font-heading: var(--font-heading)"
    )
    expect(playgroundTailwindTokens).toContain("--color-background")
    expect(playgroundTailwindTokens).toContain(
      "--color-success: var(--success)"
    )
    expect(playgroundTailwindTokens).toContain("--color-sidebar")
    expect(playgroundTokenImports).toContain('@import "./features/artifact.css"')
    expect(playgroundTokenImports).toContain('@import "./features/host.css"')
    expect(playgroundTokenImports).toContain('@import "./features/content.css"')
    expect(playgroundTokenImports).toContain('@import "./features/code-block.css"')
    expect(playgroundTokenImports).toContain(
      '@import "./features/theme-editor.css"'
    )
    expect(playgroundTailwindTokens).toContain("--radius-lg: var(--radius)")
    expect(playgroundFoundationTokens).toContain("--font-sans")
    expect(playgroundFoundationTokens).toContain("--success")
    expect(playgroundFoundationTokens).toContain("--warning")
    expect(playgroundFoundationTokens).toContain("--info")
    expect(playgroundFoundationTokens).toContain("--font-heading")
    expect(playgroundFoundationTokens).not.toContain("--font-sans-source")
    expect(playgroundFoundationTokens).not.toContain("--font-heading-source")
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-color\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-opacity\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-x\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-y\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-blur\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-spread\s*:/)
    expect(playgroundFoundationTokens).toContain(
      "--agent-html-text-selection-background"
    )
    expect(playgroundFoundationTokens).toContain(
      "--agent-html-text-selection-foreground"
    )
    expect(playgroundFoundationTokens).toContain("--radius: 0.625rem")
    expect(playgroundFoundationTokens).not.toContain("--radius-base")
    expect(playgroundArtifactTokens).toContain("--canvas-artifact-max-width")
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-background"
    )
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-foreground"
    )
    expect(playgroundHostTokens).toContain("--canvas-surface-padding-inline")
    expect(playgroundHostTokens).toContain("--canvas-floating-prompt-width")
    expect(playgroundHostTokens).toContain("--canvas-sidebar-font-size-body")
    expect(playgroundHostTokens).not.toContain(
      "--canvas-block-highlight-radius"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-floating-prompt-backdrop-blur"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-artifact-skeleton-max-width"
    )
    expect(playgroundHostTokens).not.toContain("--canvas-block-action-shadow")
    expect(playgroundHostTokens).not.toContain("--canvas-sidebar-select-padding")
    expect(playgroundHostTokens).not.toContain(
      "--canvas-sidebar-select-item-padding-block"
    )
    expect(playgroundContentTokens).toContain("--canvas-content-gap-md")
    expect(playgroundContentTokens).not.toContain("--canvas-content-diff")
    expect(playgroundCodeBlockTokens).toContain(
      "--canvas-code-block-diff-add: var(--success)"
    )
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-panel-radius"
    )
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-panel-border"
    )
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-icon-box-radius"
    )
    expect(playgroundThemeEditorTokens).toContain(
      "--canvas-theme-editor-popover-width-lg"
    )
    expect(playgroundArtifactInternal).toContain(".agent-html-artifact")
    expect(playgroundCodeBlockInternal).toContain(".canvas-code-block")
    expect(playgroundHostInternal).toContain('@import "./host/surface.css"')
    expect(playgroundHostInternal).toContain(
      '@import "./host/floating-prompt.css"'
    )
    expect(playgroundHostSurfaceInternal).toContain(".canvas-surface-frame")
    expect(playgroundHostFloatingPromptInternal).toContain(
      ".canvas-floating-prompt"
    )
    expect(playgroundHostInternal).not.toContain(
      ".canvas-floating-prompt-composer"
    )
    expect(playgroundContent).toContain(".canvas-stack-md")
    expect(playgroundContent).toContain(".canvas-content-panel")
    expect(playgroundContent).toContain(".canvas-text-body")
    expect(playgroundThemeEditorInternal).toContain(
      ".canvas-theme-editor-popover-button"
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
    expect(reactCanvasTsconfig.compilerOptions.paths["@/app/*"]).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/*"]
    ).toEqual(["./agent-html/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/theme/*"]
    ).toEqual(["./agent-html/theme/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths[
        "#agent-html-playground/components/ui/*"
      ]
    ).toEqual(["./agent-html/components/ui/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/ui/*"]
    ).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["@agent-html-playground/*"]
    ).toBeUndefined()
  })
})
