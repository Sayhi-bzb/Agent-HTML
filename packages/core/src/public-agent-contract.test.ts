import { describe, expect, it } from "vitest"

import {
  BLOCKED_AGENT_FACING_PROP_NAMES,
} from "./component-schema"
import {
  createPublicAgentContract,
  createPublicRenderConfigContract,
  createPublicSafetyPolicy,
  formatForbiddenPolicy,
} from "./public-agent-contract"

describe("public agent contract", () => {
  it("exposes the validated public component contract", () => {
    const contract = createPublicAgentContract()
    const alert = contract.components.find((component) => component.name === "alert")
    const badge = contract.components.find((component) => component.name === "badge")
    const stack = contract.components.find((component) => component.name === "stack")
    const frame = contract.components.find((component) => component.name === "frame")
    const select = contract.components.find(
      (component) => component.name === "select",
    )

    expect(contract.forbidden).toBe(contract.safetyPolicy.forbidden)
    expect(contract.renderConfig.keys).toEqual(["style-ref"])
    expect(contract.renderConfig.defaults).toEqual({
      "style-ref": "report-default",
    })
    expect(contract.renderConfig.model).toBe("document-style-config-reference")
    expect(contract.renderConfig.keys).toEqual(["style-ref"])
    expect(alert?.props.map((prop) => prop.name)).toEqual(["title", "variant"])
    expect(badge?.props.map((prop) => prop.name)).toEqual(["variant"])
    expect(stack?.props).toEqual([])
    expect(frame?.props).toEqual([])
    expect(stack?.allowedChildren).toContain("cluster")
    expect(frame?.allowedChildren).toContain("card")
    expect(select?.props.map((prop) => prop.name)).not.toContain("size")
  })

  it("builds safety policy from blocked names and shared categories", () => {
    const safetyPolicy = createPublicSafetyPolicy()

    expect(safetyPolicy.blockedNames).toBe(BLOCKED_AGENT_FACING_PROP_NAMES)
    expect(safetyPolicy.forbidden).toBe(
      formatForbiddenPolicy(BLOCKED_AGENT_FACING_PROP_NAMES),
    )
    expect(safetyPolicy.forbidden).toContain("className")
    expect(safetyPolicy.forbidden).toContain("unknown attrs")
  })

  it("creates a render config contract from the published config values", () => {
    expect(createPublicRenderConfigContract()).toEqual({
      defaults: {
        "style-ref": "report-default",
      },
      keys: ["style-ref"],
      values: {
        "style-ref": ["report-default", "ops-compact", "review-dense"],
      },
      model: "document-style-config-reference",
    })
  })
})
