import { describe, expect, it } from "vitest"
import path from "node:path"
import { pathToFileURL } from "node:url"

import {
  BLOCKED_AGENT_FACING_PROP_NAMES,
  GENERATED_COMPONENT_SCHEMA_FACTS,
  getAllowedPropNames,
  getComponentPropSchema,
  getComponentSchema,
  isStandardComponentName,
  RESOLVED_STANDARD_COMPONENT_SCHEMAS,
  STANDARD_COMPONENT_NAMES,
  STANDARD_COMPONENT_SCHEMAS,
  TEXT_CHILD,
  VALIDATED_STANDARD_COMPONENT_SCHEMAS,
} from "./component-schema"

describe("standard component schema", () => {
  it("includes exactly the MVP standard components", () => {
    expect(STANDARD_COMPONENT_NAMES).toEqual([
      "page",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "alert",
      "card",
      "separator",
      "badge",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "option",
      "table",
      "row",
      "cell",
      "list",
      "item",
      "tabs",
      "tab",
      "accordion",
      "accordion-item",
    ])
    expect(VALIDATED_STANDARD_COMPONENT_SCHEMAS).toHaveLength(31)
  })

  it("keeps runtime verification data aligned for current runtime-defined components", async () => {
    const runtimeContractModule = (await import(
      pathToFileURL(
        path.join(
          process.cwd(),
          "packages",
          "ahtml",
          "src/config/runtime-contract.mjs",
        ),
      ).href
    )) as {
      readonly createRuntimeContract: (
        components: typeof STANDARD_COMPONENT_SCHEMAS,
      ) => {
        readonly renderableAgentComponents: readonly string[]
        readonly verificationData: {
          readonly components: readonly {
            readonly name: string
            readonly renderKind: string
            readonly behavior?: Record<string, unknown>
            readonly slots: readonly { readonly name: string }[]
          }[]
        }
      }
    }
    const runtimeContract = runtimeContractModule.createRuntimeContract(
      STANDARD_COMPONENT_SCHEMAS,
    )
    const runtimeVerificationNames = runtimeContract.verificationData.components.map(
      (component) => component.name,
    )

    expect([...runtimeContract.renderableAgentComponents].sort()).toEqual(
      [...STANDARD_COMPONENT_NAMES].sort(),
    )
    expect(runtimeVerificationNames).toEqual([
      "page",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "alert",
      "card",
      "separator",
      "badge",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
    ])
    expect(
      Object.fromEntries(
        runtimeContract.verificationData.components.map((component) => [
          component.name,
          component.slots.map((slot) => slot.name),
        ]),
      ),
    ).toEqual({
      cluster: ["children"],
      frame: ["children"],
      grid: ["children"],
      split: ["children"],
      stack: ["children"],
      switcher: ["children"],
      accordion: ["accordion-item"],
      alert: ["children"],
      badge: ["children"],
      card: ["children"],
      checkbox: ["children"],
      slider: ["children"],
      combobox: ["option"],
      input: ["children"],
      list: ["item"],
      page: ["children"],
      progress: ["children"],
      "radio-group": ["option"],
      separator: ["children"],
      select: ["option"],
      switch: ["children"],
      table: ["row", "cell"],
      textarea: ["children"],
      "toggle-group": ["option"],
      tabs: ["tabs-list", "tabs-trigger", "tabs-content"],
    })
    expect(
      Object.fromEntries(
        runtimeContract.verificationData.components.map((component) => [
          component.name,
          component.renderKind,
        ]),
      ),
    ).toEqual({
      cluster: "layout-cluster",
      frame: "layout-frame",
      grid: "layout-grid",
      split: "layout-split",
      stack: "layout-stack",
      switcher: "layout-switcher",
      accordion: "accordion",
      alert: "compound",
      badge: "primitive",
      card: "compound",
      checkbox: "toggle-field",
      slider: "slider-field",
      combobox: "combobox-input",
      input: "text-field",
      list: "collection",
      page: "compound",
      progress: "primitive",
      "radio-group": "choice-group",
      separator: "primitive",
      select: "select-overlay",
      switch: "toggle-field",
      table: "table",
      textarea: "text-field",
      "toggle-group": "choice-inline",
      tabs: "tabs",
    })
    expect(
      Object.fromEntries(
        runtimeContract.verificationData.components
          .filter((component) => component.behavior)
          .map((component) => [component.name, component.behavior]),
      ),
    ).toEqual({
      accordion: {
        model: "explicit-default-state",
        runtimeOwner: "renderer",
        stateBridge: "accordion-state",
        multiValueDelimiter: ",",
      },
      progress: {
        model: "determinate-progress",
        runtimeOwner: "managed-ui",
        forwardedProps: ["value"],
        visualStateProp: "value",
      },
      slider: {
        model: "single-thumb-slider",
        runtimeOwner: "managed-ui",
        forwardedProps: ["value"],
        visualStateProp: "value",
      },
    })
  })

  it("keeps generated shadcn introspection available as draft facts", () => {
    const buttonFacts = GENERATED_COMPONENT_SCHEMA_FACTS.find(
      (item) => item.registryName === "button",
    )
    const cardFacts = GENERATED_COMPONENT_SCHEMA_FACTS.find(
      (item) => item.registryName === "card",
    )

    expect(buttonFacts?.exports).toContain("Button")
    expect(buttonFacts?.slots).toContain("button")
    expect(buttonFacts?.variantProps?.variant).toContain("default")
    expect(buttonFacts?.blockedProps).toContain("className")
    expect(cardFacts?.slots).toContain("card-header")
  })

  it("keeps resolved schema metadata separate from the public component surface", () => {
    const alertResolved = RESOLVED_STANDARD_COMPONENT_SCHEMAS.find(
      (item) => item.name === "alert",
    )
    const selectResolved = RESOLVED_STANDARD_COMPONENT_SCHEMAS.find(
      (item) => item.name === "select",
    )

    expect(alertResolved?.semanticProps.map((prop) => prop.name)).toEqual([
      "title",
      "tone",
    ])
    expect(alertResolved?.legacyPublicProps?.map((prop) => prop.name)).toEqual([
      "tone",
    ])
    expect(alertResolved?.rawCandidateProps).toEqual([
      {
        name: "variant",
        valueKind: "enum",
        description: "Raw candidate prop from shadcn component facts.",
        enumValues: ["default", "destructive"],
        exposureState: "raw-candidate",
        exposed: true,
      },
    ])
    expect(alertResolved?.blockedPropNames).toContain("className")
    expect(selectResolved?.rawCandidateProps).toEqual([
      {
        name: "size",
        valueKind: "enum",
        description: "Raw candidate prop from shadcn component facts.",
        enumValues: ["sm", "default"],
        exposureState: "raw-candidate",
        exposed: false,
      },
    ])
    expect(getComponentSchema("badge")?.props.map((prop) => prop.name)).toEqual([
      "tone",
      "variant",
    ])
    expect(selectResolved?.props.map((prop) => prop.name)).toEqual([
      "label",
      "value",
      "description",
    ])
  })

  it("describes agent-facing props without implementation leakage", () => {
    const allPropNames = STANDARD_COMPONENT_SCHEMAS.flatMap((item) =>
      item.props.map((prop) => prop.name),
    )

    expect(allPropNames).toEqual([
      "title",
      "title",
      "tone",
      "variant",
      "title",
      "tone",
      "variant",
      "value",
      "label",
      "value",
      "description",
      "label",
      "value",
      "description",
      "label",
      "checked",
      "description",
      "label",
      "checked",
      "description",
      "label",
      "value",
      "description",
      "label",
      "value",
      "description",
      "label",
      "value",
      "description",
      "label",
      "value",
      "description",
      "label",
      "value",
      "description",
      "value",
      "label",
      "kind",
      "variant",
      "default",
      "value",
      "label",
      "mode",
      "default",
      "value",
      "title",
    ])

    for (const blockedName of BLOCKED_AGENT_FACING_PROP_NAMES) {
      expect(allPropNames).not.toContain(blockedName)
    }
  })

  it("defines the MVP component nesting constraints", () => {
    expect(getComponentSchema("page")?.allowedChildren).toEqual([
      "stack",
      "frame",
      "alert",
      "card",
      "separator",
      "table",
      "list",
      "tabs",
      "accordion",
    ])
    expect(getComponentSchema("stack")?.props).toEqual([])
    expect(getComponentSchema("cluster")?.props).toEqual([])
    expect(getComponentSchema("split")?.props).toEqual([])
    expect(getComponentSchema("grid")?.props).toEqual([])
    expect(getComponentSchema("switcher")?.props).toEqual([])
    expect(getComponentSchema("frame")?.props).toEqual([])
    expect(getComponentSchema("stack")?.allowedChildren).toEqual([
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      TEXT_CHILD,
    ])
    expect(getComponentSchema("alert")?.allowedChildren).toEqual([TEXT_CHILD])
    expect(getComponentSchema("card")?.allowedChildren).toEqual([
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      TEXT_CHILD,
    ])
    expect(getComponentSchema("separator")?.allowedChildren).toEqual([])
    expect(getComponentSchema("badge")?.allowedChildren).toEqual([TEXT_CHILD])
    expect(getComponentSchema("progress")?.allowedChildren).toEqual([])
    expect(getComponentSchema("input")?.allowedChildren).toEqual([])
    expect(getComponentSchema("textarea")?.allowedChildren).toEqual([])
    expect(getComponentSchema("checkbox")?.allowedChildren).toEqual([])
    expect(getComponentSchema("switch")?.allowedChildren).toEqual([])
    expect(getComponentSchema("slider")?.allowedChildren).toEqual([])
    expect(getComponentSchema("combobox")?.allowedChildren).toEqual(["option"])
    expect(getComponentSchema("radio-group")?.allowedChildren).toEqual([
      "option",
    ])
    expect(getComponentSchema("toggle-group")?.allowedChildren).toEqual([
      "option",
    ])
    expect(getComponentSchema("select")?.allowedChildren).toEqual(["option"])
    expect(getComponentSchema("option")?.allowedChildren).toEqual([TEXT_CHILD])
    expect(getComponentSchema("table")?.allowedChildren).toEqual(["row"])
    expect(getComponentSchema("row")?.allowedChildren).toEqual(["cell"])
    expect(getComponentSchema("cell")?.allowedChildren).toEqual([TEXT_CHILD])
    expect(getComponentSchema("list")?.allowedChildren).toEqual(["item"])
    expect(getComponentSchema("tabs")?.allowedChildren).toEqual(["tab"])
    expect(getComponentSchema("tab")?.allowedChildren).toEqual([
      "alert",
      "card",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
    ])
    expect(getComponentSchema("accordion")?.allowedChildren).toEqual([
      "accordion-item",
    ])
    expect(getComponentSchema("accordion-item")?.allowedChildren).toEqual([
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      TEXT_CHILD,
    ])
    for (const layoutName of [
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
    ] as const) {
      expect(getAllowedPropNames(getComponentSchema(layoutName)!)).not.toContain(
        "gap",
      )
      expect(getAllowedPropNames(getComponentSchema(layoutName)!)).not.toContain(
        "ratio",
      )
      expect(getAllowedPropNames(getComponentSchema(layoutName)!)).not.toContain(
        "columns",
      )
      expect(getAllowedPropNames(getComponentSchema(layoutName)!)).not.toContain(
        "breakpoint",
      )
      expect(getAllowedPropNames(getComponentSchema(layoutName)!)).not.toContain(
        "max-width",
      )
    }
    expect(getComponentSchema("choice-group")).toBeUndefined()
  })

  it("looks up standard components and props", () => {
    const row = getComponentSchema("row")

    expect(isStandardComponentName("card")).toBe(true)
    expect(isStandardComponentName("script")).toBe(false)
    expect(isStandardComponentName("option")).toBe(true)
    expect(row).toBeDefined()
    expect(row ? getAllowedPropNames(row) : []).toEqual(["kind"])
    expect(row ? getComponentPropSchema(row, "kind")?.enumValues : []).toEqual([
      "header",
      "body",
    ])
    expect(getComponentSchema("slider-control")).toBeUndefined()
  })
})
