import { describe, expect, it } from "vitest"

import { startDevHost } from "./server.mjs"

const token = "runtime-integration-token-with-enough-entropy"

describe("authenticated runtime server", () => {
  it("boots on a random port, authenticates the host, reports health, and stops", async () => {
    const readyLines = []
    const runtime = await startDevHost({
      args: [],
      cwd: process.cwd(),
      runtime: {
        allowShutdown: true,
        authToken: token,
        machineReadable: true,
        port: 0,
        writeLine: (line) => readyLines.push(line),
      },
    })

    try {
      expect(runtime.url).toMatch(/^http:\/\/127\.0\.0\.1:\d+$/)
      expect(runtime.bootstrapUrl).toContain("/__agent-html/runtime/session")
      expect(JSON.parse(readyLines[0])).toMatchObject({
        type: "runtime-ready",
        protocolVersion: 1,
        root: process.cwd(),
        url: runtime.url,
      })

      expect((await fetch(runtime.url)).status).toBe(401)

      const bootstrap = await fetch(runtime.bootstrapUrl, {
        redirect: "manual",
      })
      expect(bootstrap.status).toBe(303)
      const cookie = bootstrap.headers.get("set-cookie")
      expect(cookie).toContain("HttpOnly")

      const html = await fetch(runtime.url, {
        headers: { cookie },
      })
      expect(html.status).toBe(200)
      expect(await html.text()).toContain("<title>Agent-HTML</title>")

      const health = await fetch(
        `${runtime.url}/__agent-html/runtime/health`,
        { headers: { authorization: `Bearer ${token}` } }
      ).then((response) => response.json())
      expect(health).toMatchObject({
        ok: true,
        protocolVersion: 1,
        workspaceRoot: process.cwd(),
      })

      const closed = new Promise((resolve) => runtime.server.once("close", resolve))
      const shutdown = await fetch(
        `${runtime.url}/__agent-html/runtime/shutdown`,
        {
          headers: { authorization: `Bearer ${token}` },
          method: "POST",
        }
      )
      expect(shutdown.status).toBe(200)
      await closed
    } finally {
      if (runtime.server.listening) {
        await new Promise((resolve) => runtime.server.close(resolve))
      }
    }
  }, 60_000)
})
