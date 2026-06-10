import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { readSource, root } from "./test-contract-helpers.mjs"

describe("React Canvas pipeline ownership contract", { timeout: 15000 }, () => {
  it("keeps React Canvas source helpers split by pipeline ownership", () => {
    expect(existsSync(join(root, "packages/cli/src/react-canvas/source.mjs"))).toBe(
      false
    )
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/block-tags.mjs"))
    ).toBe(true)
    expect(
      existsSync(
        join(root, "packages/cli/src/react-canvas/block-implementation.mjs")
      )
    ).toBe(true)
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/workspace-file.mjs"))
    ).toBe(true)
  })

  it("keeps example and Codex host pipelines physically separated", () => {
    const examplePipeline = readSource("packages/cli/src/host/pipeline/example.ts")
    const codexPipeline = readSource("packages/cli/src/host/pipeline/codex.ts")
    const hostApp = readSource("packages/cli/src/host/app.tsx")

    expect(examplePipeline).not.toContain("fetchCodexThreads")
    expect(examplePipeline).not.toContain("startCodexTurn")
    expect(examplePipeline).not.toContain("fetchBlockImplementation")
    expect(hostApp).not.toContain("startCodexTurn")
    expect(codexPipeline).toContain("startCodexTurn")
  })

  it("keeps the Host workbench on owner hooks instead of inline owners", () => {
    const workbenchSource = readSource("packages/cli/src/host/app.tsx")

    expect(workbenchSource).toContain("useArtifactRegistry")
    expect(workbenchSource).toContain("useCanvasPromptLifecycle")
    expect(workbenchSource).toContain("useCanvasHostPreferencesPersistence")
    expect(workbenchSource).toContain("useCanvasHostTheme")
  })
})
