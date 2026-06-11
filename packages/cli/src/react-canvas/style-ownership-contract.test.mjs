import { describe, expect, it } from "vitest"

import {
  filesMatching,
  filesMatchingAny,
  readSource,
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
