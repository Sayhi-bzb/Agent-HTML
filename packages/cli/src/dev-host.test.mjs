import { describe, expect, it } from "vitest"

import { startDevHost } from "./dev-host.mjs"

describe("React Canvas dev host", () => {
  it("scans and renders the example artifact", async () => {
    const { server, url } = await startDevHost({
      args: ["--port", "5298"],
      cwd: process.cwd(),
    })

    try {
      const artifacts = await fetch(`${url}/__agent-html/artifacts`).then((response) =>
        response.json()
      )
      expect(artifacts.artifacts).toContainEqual({
        filePath: "agent-html/artifacts/project-visual-explainer.artifact.tsx",
      })

      const removedRender = await fetch(`${url}/__agent-html/render`)
      expect(removedRender.status).toBe(404)

      const removedShell = await fetch(`${url}/__agent-html/host-shell`)
      expect(removedShell.status).toBe(404)

      const removedClient = await fetch(`${url}/client.js`)
      expect(removedClient.status).toBe(404)

      const removedStyles = await fetch(`${url}/styles.css`)
      expect(removedStyles.status).toBe(404)

      const html = await fetch(url).then((response) => response.text())
      expect(html).toContain("/@vite/client")
      expect(html).toContain("/__agent-html/host-entry.js")

      const removedHostBundle = await fetch(`${url}/__agent-html/host.js`)
      expect(removedHostBundle.status).toBe(404)

      const hostEntry = await fetch(`${url}/__agent-html/host-entry.js`).then((response) =>
        response.text()
      )
      expect(hostEntry).toContain("packages/cli/src/host/main.tsx")

      const removedBundle = await fetch(`${url}/__agent-html/client-bundle`)
      expect(removedBundle.status).toBe(404)

      const removedBlockSource = await fetch(`${url}/__agent-html/block-source`)
      expect(removedBlockSource.status).toBe(404)

      const publicFile = await fetch(`${url}/__agent-html/public/.gitkeep`)
      expect(publicFile.status).toBe(200)

      const publicMissing = await fetch(`${url}/__agent-html/public/missing.txt`)
      expect(publicMissing.status).toBe(404)

      const publicTraversal = await fetch(`${url}/__agent-html/public/../AGENTS.md`)
      expect(publicTraversal.status).toBe(404)

      const publicEncodedTraversal = await fetch(
        `${url}/__agent-html/public/%2e%2e%2fAGENTS.md`
      )
      expect(publicEncodedTraversal.status).toBe(400)

      const blockImplementationUrl = new URL(`${url}/__agent-html/block-implementation`)
      blockImplementationUrl.searchParams.set(
        "filePath",
        "agent-html/examples/example.artifact.tsx"
      )
      blockImplementationUrl.searchParams.set("blockId", "brief")
      const blockImplementation = await fetch(blockImplementationUrl).then((response) =>
        response.json()
      )
      expect(blockImplementation.implementationPath).toBe(
        "agent-html/examples/example/brief.block.tsx"
      )
      expect(Object.keys(blockImplementation).sort()).toEqual(["implementationPath"])

      const bundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      bundleUrl.searchParams.set(
        "filePath",
        "agent-html/artifacts/project-visual-explainer.artifact.tsx"
      )
      const bundle = await fetch(bundleUrl).then((response) => response.text())
      expect(bundle).toContain("function mount")
      expect(bundle).toContain("import.meta.hot")
      expect(bundle).toContain(
        "/agent-html/artifacts/project-visual-explainer.artifact.tsx"
      )

      const appSourceBundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      appSourceBundleUrl.searchParams.set("filePath", "package.json")
      const appSourceBundle = await fetch(appSourceBundleUrl)
      expect(appSourceBundle.status).toBe(400)

      const appSourceBlockUrl = new URL(`${url}/__agent-html/block-implementation`)
      appSourceBlockUrl.searchParams.set("filePath", "package.json")
      appSourceBlockUrl.searchParams.set("blockId", "summary")
      const appSourceBlock = await fetch(appSourceBlockUrl)
      expect(appSourceBlock.status).toBe(400)

      const css = await fetch(`${url}/__agent-html/styles.css`).then((response) =>
        response.text()
      )
      expect(css).toContain("--primary")
      expect(css).toContain("--sidebar-primary")
      expect(css).not.toContain("--window-chrome-radius")
      expect(css).toContain(".bg-primary")
      expect(css).toContain(".bg-sidebar")
      expect(css).toContain("--canvas-artifact-max-width")
      expect(css).toContain("--canvas-artifact-skeleton-max-width")
      expect(css).toContain("--canvas-artifact-block-gap")
      expect(css).toContain("--canvas-surface-padding-inline")
      expect(css).toContain("--canvas-toolbar-inset-block-start")
      expect(css).toContain("--canvas-block-action-offset")
      expect(css).toContain("--canvas-floating-prompt-width")
      expect(css).toContain("--canvas-content-gap-md")
      expect(css).toContain("--canvas-content-panel-padding-md")
      expect(css).toContain("--canvas-content-body-font-size")
      expect(css).toContain("--canvas-theme-editor-popover-width-lg")
      expect(css).toContain(".agent-html-artifact")
      expect(css).toContain(".canvas-surface-frame")
      expect(css).toContain(".canvas-artifact-skeleton")
      expect(css).toContain(".canvas-block-action")
      expect(css).toContain(".canvas-floating-prompt")
      expect(css).toContain(".canvas-content-panel")
      expect(css).toContain(".canvas-text-body")
      expect(css).toContain(".canvas-theme-editor-option")
      expect(css).toContain(".text-popover-foreground")
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  }, 30_000)
})
