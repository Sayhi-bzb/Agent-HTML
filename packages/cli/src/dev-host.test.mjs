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
      expect(artifacts.artifacts).toEqual([
        {
          filePath: ".agent-html/artifacts/example.agent.tsx",
        },
      ])

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
      expect(hostClient).toContain("SidebarProvider")
      expect(hostClient).toContain("formatBlockPrompt")
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

      const bundleUrl = new URL(`${url}/__agent-html/artifact.js`)
      bundleUrl.searchParams.set(
        "filePath",
        ".agent-html/artifacts/example.agent.tsx"
      )
      const bundle = await fetch(bundleUrl).then((response) => response.text())
      expect(bundle).toContain("function mount")
      expect(bundle).toContain("Usage Dashboard")
      expect(bundle).toContain("recharts")

      const css = await fetch(`${url}/__agent-html/styles.css`).then((response) =>
        response.text()
      )
      expect(css).toContain("--primary")
      expect(css).toContain("--sidebar-primary")
      expect(css).not.toContain("--window-chrome-radius")
      expect(css).toContain(".bg-primary")
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  }, 30_000)
})
