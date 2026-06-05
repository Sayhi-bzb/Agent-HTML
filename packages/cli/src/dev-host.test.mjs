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
        filePath: ".agent-html/artifacts/project-visual-explainer.agent.tsx",
      })

      const removedRender = await fetch(`${url}/__agent-html/render`)
      expect(removedRender.status).toBe(404)

      const removedShell = await fetch(`${url}/__agent-html/host-shell`)
      expect(removedShell.status).toBe(404)

      const removedClient = await fetch(`${url}/client.js`)
      expect(removedClient.status).toBe(404)

      const removedStyles = await fetch(`${url}/styles.css`)
      expect(removedStyles.status).toBe(404)

      const hostClient = await fetch(`${url}/__agent-html/host.js`).then((response) =>
        response.text()
      )
      expect(hostClient).toContain("ReactCanvasHostApp")
      expect(hostClient).toContain("ReactCanvasSidebar")
      expect(hostClient).toContain("SidebarMenuSkeleton")
      expect(hostClient).toContain("ReactCanvasThemeEditor")
      expect(hostClient).toContain("publishCanvasMessageHost")
      expect(hostClient).toContain("FloatingPrompt")
      expect(hostClient).toContain("Reset preview")
      expect(hostClient).toContain("react-canvas-theme-editor-preview")
      expect(hostClient).toContain("formatBlockPrompt")
      expect(hostClient).not.toContain("agent-html:action")
      expect(hostClient).not.toContain("WindowChromeFrame")
      expect(hostClient).not.toContain("DocumentTabRail")
      expect(hostClient).not.toContain("@/app")
      expect(hostClient).not.toContain("@/ui")
      expect(hostClient).not.toContain("apps/agent-html-app")
      expect(hostClient).not.toContain("@/agent-html/runtime/ui")
      expect(hostClient).not.toContain("renderAgentHtml")
      expect(hostClient).not.toContain("renderInteractiveAgentHtml")

      const removedBundle = await fetch(`${url}/__agent-html/client-bundle`)
      expect(removedBundle.status).toBe(404)

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

      const blockSourceUrl = new URL(`${url}/__agent-html/block-source`)
      blockSourceUrl.searchParams.set(
        "filePath",
        ".agent-html/examples/example.agent.tsx"
      )
      blockSourceUrl.searchParams.set("blockId", "brief")
      const blockSource = await fetch(blockSourceUrl).then((response) =>
        response.json()
      )
      expect(blockSource.selectedSource).toContain('<Block id="brief"')
      expect(blockSource.implementationPath).toBe(
        ".agent-html/examples/example/brief.block.tsx"
      )
      expect(blockSource.implementationSource).toContain("BriefBlock")

      const bundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      bundleUrl.searchParams.set(
        "filePath",
        ".agent-html/artifacts/project-visual-explainer.agent.tsx"
      )
      const bundle = await fetch(bundleUrl).then((response) => response.text())
      expect(bundle).toContain("function mount")
      expect(bundle).toContain("agent-html-artifact")

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
