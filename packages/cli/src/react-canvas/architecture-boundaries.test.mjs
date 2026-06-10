import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  filesMatching,
  implementationFilesUnder,
  readSource,
  root,
  sourceImportRecords,
} from "./test-contract-helpers.mjs"

describe("React Canvas architecture boundaries", { timeout: 15000 }, () => {
  it("keeps the CLI off app, docs, example, and legacy runtime imports", () => {
    const forbidden =
      /from\s+["'](?:apps\/|@\/app\b|@\/app\/|@\/agent-html\b|@\/agent-html\/|packages\/agent-html\/|@example\b|@example\/)|Codex app-server|__agent-html\/render|new Function|transpileModule/

    expect(filesMatching("packages/cli/src", forbidden)).toEqual([])
  })

  it("keeps the CLI host off app aliases while using local React Canvas UI primitives", () => {
    expect(filesMatching("packages/cli/src/host", /from\s+["']@\/[^"']/)).toEqual(
      []
    )
    expect(
      filesMatching(
        "packages/cli/src/host",
        /from\s+["']#agent-html-playground\/(?!(?:components\/ui|theme)\/)/
      )
    ).toEqual([])
    expect(
      filesMatching("packages/cli/src/host", /@agent-html-playground\/components\/ui\//)
    ).toEqual([])
  })

  it("keeps host feature chrome on host UI adapters", () => {
    const featureFiles = implementationFilesUnder("packages/cli/src/host").filter(
      (file) => !file.startsWith("packages/cli/src/host/ui/")
    )
    const forbiddenChromeImports =
      /#agent-html-playground\/components\/ui\/(?:alert|badge|button|input-group|skeleton)/
    const bypassingFiles = featureFiles.filter((file) =>
      forbiddenChromeImports.test(readSource(file))
    )

    expect(bypassingFiles).toEqual([])
  })

  it("keeps the React API package independent from host and workspace code", () => {
    const forbidden =
      /from\s+["'](?:packages\/cli|apps\/|@\/app\b|@\/app\/|agent-html\/|#agent-html-playground\/)/

    expect(filesMatching("packages/react/src", forbidden)).toEqual([])
  })

  it("keeps React Canvas topology layers pointed in allowed directions", () => {
    const protocolImports = sourceImportRecords("packages/react/src").filter(
      ({ target }) =>
        target.startsWith("packages/cli/") ||
        target.startsWith("agent-html/") ||
        target.startsWith("apps/") ||
        target.startsWith("_archive/")
    )
    const orchestrationImports = sourceImportRecords(
      "packages/cli/src/react-canvas"
    ).filter(
      ({ target }) =>
        target.startsWith("packages/cli/src/host/") ||
        target.startsWith("agent-html/artifacts/") ||
        target.startsWith("agent-html/examples/") ||
        target.startsWith("agent-html/components/") ||
        target.startsWith("agent-html/theme/") ||
        target.startsWith("apps/") ||
        target.startsWith("_archive/")
    )
    const hostWorkspaceBypasses = sourceImportRecords(
      "packages/cli/src/host"
    ).filter(
      ({ specifier, target }) =>
        target.startsWith("agent-html/") ||
        specifier.startsWith("@agent-html-playground/") ||
        (specifier.startsWith("#agent-html-playground/") &&
          !specifier.startsWith("#agent-html-playground/components/ui/") &&
          !specifier.startsWith("#agent-html-playground/theme/"))
    )
    const artifactLayerEscapes = [
      ...sourceImportRecords("agent-html/artifacts"),
      ...sourceImportRecords("agent-html/examples"),
    ].filter(
      ({ target }) =>
        target.startsWith("packages/") ||
        target.startsWith("apps/") ||
        target.startsWith("_archive/") ||
        target.startsWith("agent-html/public/") ||
        target.startsWith("agent-html/styles/internal/")
    )

    expect(protocolImports).toEqual([])
    expect(orchestrationImports).toEqual([])
    expect(hostWorkspaceBypasses).toEqual([])
    expect(artifactLayerEscapes).toEqual([])
  })

  it("keeps the dev server as a runtime adapter instead of an ownership layer", () => {
    const devServerImports = sourceImportRecords("packages/cli/src/dev-server")
    const forbiddenImports = devServerImports.filter(
      ({ specifier, target }) =>
        specifier === "@agent-html/react" ||
        target.startsWith("packages/react/src") ||
        target.startsWith("packages/cli/src/host/") ||
        target.startsWith("packages/cli/src/react-canvas/prompt") ||
        target.startsWith("agent-html/artifacts/") ||
        target.startsWith("agent-html/examples/") ||
        target.startsWith("agent-html/components/") ||
        target.startsWith("agent-html/theme/") ||
        target.startsWith("apps/") ||
        target.startsWith("_archive/")
    )
    const forbiddenOwnershipTerms =
      /data-agent-html-block|useArtifactInteraction|InteractionProvider|agent-html:state-change|interactionSnapshot|CanvasInteraction|className=|canvas-content-|canvas-text-|canvas-stack-/

    expect(forbiddenImports).toEqual([])
    expect(
      filesMatching("packages/cli/src/dev-server", forbiddenOwnershipTerms)
    ).toEqual([])
  })

  it("keeps the Host workbench as a pipeline owner composer", () => {
    const hostImports = sourceImportRecords("packages/cli/src/host")
    const forbiddenHostImports = hostImports.filter(
      ({ target }) => target.startsWith("packages/cli/src/dev-server/")
    )
    const workbenchImports = hostImports.filter(
      ({ file }) => file === "packages/cli/src/host/app.tsx"
    )
    const forbiddenWorkbenchImports = workbenchImports.filter(({ target }) =>
      target.startsWith("packages/cli/src/react-canvas/prompt")
    )
    const workbenchSource = readSource("packages/cli/src/host/app.tsx")
    const forbiddenWorkbenchOwnership =
      /fetchArtifacts|renameArtifact|deleteArtifact|resolveArtifactRefreshState|submitBlockPromptToPipeline|publishCanvasMessageHost|writeCanvasHostPreferences|readCanvasMessageDraft|applyCanvasTheme(?:Preset|Mode|EditorPreview)|watchCanvasSystemThemeMode/

    expect(forbiddenHostImports).toEqual([])
    expect(forbiddenWorkbenchImports).toEqual([])
    expect(workbenchSource).not.toMatch(forbiddenWorkbenchOwnership)
    expect(workbenchSource).toContain("useArtifactRegistry")
    expect(workbenchSource).toContain("useCanvasPromptLifecycle")
    expect(workbenchSource).toContain("useCanvasHostPreferencesPersistence")
    expect(workbenchSource).toContain("useCanvasHostTheme")
  })

  it("keeps apps from depending on the React Canvas CLI", () => {
    const forbidden =
      /from\s+["'](?:@agent-html\/cli|packages\/cli\/)|node\s+packages\/cli|agent-html\.mjs/

    expect(filesMatching("apps", forbidden)).toEqual([])
  })

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
})
