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
      existsSync(join(root, "packages/cli/src/react-canvas/paths.mjs"))
    ).toBe(true)
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/block-tags.mjs"))
    ).toBe(false)
    expect(
      existsSync(
        join(root, "packages/cli/src/react-canvas/block-implementation.mjs")
      )
    ).toBe(true)
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/workspace-file.mjs"))
    ).toBe(true)
  })

  it("keeps React Canvas orchestration owners narrow and independent", () => {
    const paths = readSource("packages/cli/src/react-canvas/paths.mjs")
    const validation = readSource("packages/cli/src/react-canvas/validation.mjs")
    const prompt = readSource("packages/cli/src/react-canvas/prompt.mjs")
    const workspaceFile = readSource(
      "packages/cli/src/react-canvas/workspace-file.mjs"
    )
    const blockImplementation = readSource(
      "packages/cli/src/react-canvas/block-implementation.mjs"
    )

    expect(paths).toContain("discoverReactArtifacts")
    expect(paths).toContain("discoverReactImplementationSources")
    expect(paths).not.toContain("readTextFile")
    expect(paths).not.toContain("formatBlockPrompt")

    expect(validation).toContain('from "./paths.mjs"')
    expect(validation).toContain('from "@agent-html/kernel/validate"')
    expect(validation).toContain('from "./workspace-file.mjs"')
    expect(validation).not.toContain('from "./prompt.mjs"')
    expect(validation).not.toContain('from "../host/')

    expect(prompt).not.toContain("readTextFile")
    expect(prompt).not.toContain("readFile")
    expect(prompt).not.toContain("implementationSource")
    expect(prompt).not.toContain("selectedSource")
    expect(prompt).not.toContain("Host")

    expect(workspaceFile).toContain("readFile")
    expect(workspaceFile).not.toMatch(/\b(?:writeFile|readdir|stat|mkdir|rm)\b/)
    expect(workspaceFile).not.toContain("path.")

    expect(blockImplementation).toContain("resolveBlockImplementationPath")
    expect(blockImplementation).not.toContain("readTextFile")
    expect(blockImplementation).not.toContain("readFile")
    expect(blockImplementation).not.toContain("formatBlockPrompt")
    expect(blockImplementation).not.toContain('from "../host/')
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
