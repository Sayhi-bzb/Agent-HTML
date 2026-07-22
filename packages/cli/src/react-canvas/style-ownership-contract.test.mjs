import { describe, expect, it } from "vitest"

import { validateBlockImplementation } from "@agent-html/kernel/validate"

import {
  filesMatching,
  implementationFilesUnder,
  readSource,
} from "./test-contract-helpers.mjs"

describe("React Canvas style ownership contract", { timeout: 15000 }, () => {
  it("keeps React Canvas surfaces from bypassing local primitives", () => {
    const primitiveBypass = /<(?:button|input|table|thead|tbody|tr|th|td)\b/

    expect(filesMatching("agent-html/artifacts", primitiveBypass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", primitiveBypass)).toEqual([])
  })

  it("keeps artifact source on semantic token classes", () => {
    const issues = implementationFilesUnder("agent-html/artifacts")
      .filter((filePath) => filePath.endsWith(".tsx"))
      .flatMap((filePath) =>
        validateBlockImplementation({
          filePath,
          source: readSource(filePath),
        })
      )
      .filter((issue) => issue.category === "style")

    expect(issues).toEqual([])
  })

  it("keeps host and workspace style ownership boundaries", () => {
    const rawSurfaceVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl))/
    const textSelectionOverride = /selection:(?:bg|text)-/

    expect(
      filesMatching("packages/cli/src/host", rawSurfaceVisualClass)
    ).toEqual([])
    expect(filesMatching("agent-html", textSelectionOverride)).toEqual([])
    expect(
      filesMatching("packages/cli/src/host", textSelectionOverride)
    ).toEqual([])
    expect(
      filesMatching("agent-html/theme", /"--sidebar(?:-[\w-]+)?"/)
    ).toEqual([])

    const hostSurface = readSource("packages/cli/src/host/styles/surface.css")
    const workspaceSplitView = readSource(
      "packages/cli/src/host/styles/workspace-split-view.css"
    )
    const themeEditor = readSource(
      "packages/cli/src/host/styles/theme-editor.css"
    )
    expect(hostSurface).not.toContain("--canvas-host-sidebar")
    expect(hostSurface).toContain("background: var(--background)")
    expect(hostSurface).toContain("color: var(--foreground)")
    expect(workspaceSplitView).toContain(
      ".workspace-split-view__pane-footer"
    )
    expect(workspaceSplitView).not.toContain("border-inline-end")
    expect(themeEditor).toMatch(
      /\.appearance-surface__reset-preview\s*\{[^}]*width: 100%;[^}]*justify-content: flex-start;/
    )
    expect(themeEditor).not.toContain("appearance-surface__clean-status")
  })

  it("keeps shadcn and TypeScript aliases scoped to their owners", () => {
    const rootComponents = JSON.parse(readSource("components.json"))
    const playgroundComponents = JSON.parse(
      readSource("agent-html/components.json")
    )
    const reactCanvasTsconfig = JSON.parse(
      readSource("config/tsconfig/tsconfig.react-canvas.json")
    )

    expect(rootComponents.tailwind.css).toBe("agent-html/styles/index.css")
    expect(rootComponents.aliases.ui).toBe("@/ui")
    expect(playgroundComponents.tailwind.css).toBe("styles/index.css")
    expect(playgroundComponents.aliases.components).toBe("@/components")
    expect(playgroundComponents.aliases.ui).toBe("@/components/ui")
    expect(reactCanvasTsconfig.compilerOptions.paths["@/app/*"]).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/*"]
    ).toEqual(["./agent-html/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths[
        "#agent-html-playground/theme/*"
      ]
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
