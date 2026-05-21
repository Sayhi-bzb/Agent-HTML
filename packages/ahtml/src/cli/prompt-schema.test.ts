/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import {
  type CliSchemaOutput,
  importSchemaModule,
  parseJson,
  root,
  useShadcnCliHarness,
} from "./cli-test-helpers"

const { runCliWithServer } = useShadcnCliHarness()

describe("prompt and schema contracts", () => {
  it("formats an artifact-profile prompt without implementation tokens", async () => {
    const { formatPrompt, getCliSchemaOutput } = await importSchemaModule()
    const schema = await getCliSchemaOutput(root)
    const prompt = `${formatPrompt(schema)}\n`

    expect(prompt).toContain("artifact profile reference")
    expect(prompt).toContain('<meta-agent profile-ref="')
    expect(prompt).not.toContain('theme="')
    expect(prompt).not.toContain('density="')
    expect(prompt).not.toContain('width="')
    expect(prompt).toContain("alert(title? variant?=default|destructive)")
    expect(prompt).toContain(
      "badge(variant?=default|secondary|destructive|outline|ghost|link)",
    )
    expect(prompt).toContain("tabs -> tab")
    expect(prompt).toContain("row -> cell")
    expect(prompt).toContain("accordion -> accordion-item")
    expect(prompt).not.toContain("alert(title? tone?")
    expect(prompt).not.toContain("badge(tone?")
    expect(prompt).not.toContain("tabs(default?")
    expect(prompt).not.toContain("row(kind?")
    expect(prompt).not.toContain("accordion(mode?")
    expect(prompt).not.toContain("default?")
  })

  it("prints agent-facing schema without implementation props", async () => {
    const { stdout } = await runCliWithServer(["prompt", "--format", "json"])
    const schema = parseJson<CliSchemaOutput>(stdout)
    const serializedComponents = JSON.stringify(schema.components)
    const alert = schema.components.find((item) => item.name === "alert")
    const badge = schema.components.find((item) => item.name === "badge")
    const row = schema.components.find((item) => item.name === "row")
    const tabs = schema.components.find((item) => item.name === "tabs")
    const accordion = schema.components.find((item) => item.name === "accordion")
    const select = schema.components.find((item) => item.name === "select")

    expect(schema.kind).toBe("agent-html-cli-schema")
    expect(schema.components.some((item) => item.name === "page")).toBe(true)
    const tabsCapability = schema.verificationData.components.find(
      (component) => component.name === "tabs",
    )
    expect(tabsCapability).toBeDefined()
    expect(tabsCapability?.renderKind).toBe("tabs")
    expect(tabsCapability?.source).toBe("shadcn")
    const tabsContentSlot = tabsCapability?.slots.find(
      (slot) => slot.name === "tabs-content",
    )
    expect(tabsContentSlot?.children).toEqual(
      expect.arrayContaining(["card", "accordion"]),
    )

    const tabsRendererSpec = schema.rendererMapping.components.find(
      (component) => component.name === "tabs",
    )
    expect(tabsRendererSpec).toBeDefined()
    expect(tabsRendererSpec?.kind).toBe("tabs")
    expect(tabsRendererSpec?.renderKind).toBe("tabs")
    const tabRendererSlot = tabsRendererSpec?.slots.find(
      (slot) => slot.name === "tab",
    )
    expect(tabRendererSlot?.children).toEqual(
      expect.arrayContaining(["card", "accordion"]),
    )
    expect(schema.renderConfig.defaults).toEqual({
      "profile-ref": "shadcn-default",
    })
    expect(schema.renderConfig.model).toBe("artifact-profile-reference")
    expect(schema.renderConfig.keys).toEqual(["profile-ref"])
    expect(schema.renderConfig.keys).not.toContain("theme")
    expect(schema.renderConfig.keys).not.toContain("density")
    expect(schema.renderConfig.keys).not.toContain("tone")
    expect(schema.renderConfig.keys).not.toContain("width")
    expect(Object.keys(schema.renderConfig.values)).toEqual(["profile-ref"])
    expect(Object.keys(schema.renderConfig.values)).not.toContain("theme")
    expect(Object.keys(schema.renderConfig.values)).not.toContain("density")
    expect(Object.keys(schema.renderConfig.values)).not.toContain("tone")
    expect(Object.keys(schema.renderConfig.values)).not.toContain("width")
    expect(schema.renderConfig.values["profile-ref"]).toEqual([
      "shadcn-default",
    ])
    expect(serializedComponents).not.toContain('"className"')
    expect(serializedComponents).not.toContain('"style"')
    expect(alert?.props.map((prop) => prop.name)).toEqual(["title", "variant"])
    expect(badge?.props.map((prop) => prop.name)).toEqual(["variant"])
    expect(row?.props).toEqual([])
    expect(tabs?.props).toEqual([])
    expect(accordion?.props).toEqual([])
    expect(select?.props.map((prop) => prop.name)).not.toContain("size")
    expect(schema.safetyPolicy.blockedNames).toContain("className")
    expect(schema.forbidden).toBe(schema.safetyPolicy.forbidden)
  })
})
