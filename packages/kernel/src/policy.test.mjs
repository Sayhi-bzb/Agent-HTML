import { describe, expect, it } from "vitest"

import {
  CANVAS_POLICY_VERSION,
  createCanvasDependencyCruiserConfig
} from "./policy.mjs"
import { canvasRuntimeCatalog } from "./runtime-catalog.mjs"

describe("Canvas Kernel policy", () => {
  it("targets the real Canvas workspace and keeps every rule blocking", () => {
    const config = createCanvasDependencyCruiserConfig()

    expect(config.forbidden.length).toBeGreaterThan(0)
    expect(config.forbidden.every((rule) => rule.severity === "error")).toBe(true)
    expect(new RegExp(config.forbidden[0].from.path).test("agent-html/lib/cn.ts")).toBe(
      true
    )
    expect(new RegExp(config.forbidden[0].from.path).test(".agent-html/lib/cn.ts")).toBe(
      false
    )
  })

  it("owns versioned protocol policy and runtime versions", () => {
    expect(CANVAS_POLICY_VERSION).toBe(1)
    expect(canvasRuntimeCatalog["@agent-html/react"]).toBe("0.3.0")
    expect(canvasRuntimeCatalog["lucide-react"]).toBe("^1.16.0")
  })
})
