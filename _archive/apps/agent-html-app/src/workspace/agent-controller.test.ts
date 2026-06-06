import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const controllerPath = fileURLToPath(
  new URL("./agent-controller.ts", import.meta.url)
)
const controllerSource = readFileSync(controllerPath, "utf8")

describe("workspace agent delivery presence", () => {
  it("keeps delivery status text out of visible pet messages", () => {
    expect(controllerSource).not.toContain("Sent to Codex.")
    expect(controllerSource).not.toContain("Sending request to Codex.")
    expect(controllerSource).toContain('label: "starting turn"')
    expect(controllerSource).toContain('status: "sent"')
    expect(controllerSource).toContain('if (agentDeliveryState.status === "sent")')
    expect(controllerSource).toContain("return undefined")
  })
})
