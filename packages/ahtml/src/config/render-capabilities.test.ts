import { describe, expect, it } from "vitest"

import { importCliModule } from "../cli/cli-test-helpers"
import { runtimeRendererKinds } from "../cli/runtime-host/renderer/kinds"

type RenderCapabilitiesModule = {
  readonly collectRendererSpecComponentIssues: (
    component: RendererMappingComponent,
  ) => string[]
  readonly createRendererMapping: (
    components: readonly ComponentSchemaInput[],
  ) => {
    readonly version: 1
    readonly components: RendererMappingComponent[]
  }
  readonly createRuntimeElementRegistrySpec: (rendererMapping: {
    readonly components: readonly RuntimeElementRegistryComponent[]
  }) => {
    readonly version: 1
    readonly nativeElements: string[]
    readonly modules: Array<{
      readonly registryItem: string
      readonly exports: string[]
    }>
  }
  readonly createRuntimeRendererKindSpec: () => {
    readonly version: 1
    readonly kinds: string[]
  }
}

type RendererMappingComponent = {
  readonly name: string
  readonly kind: string
  readonly renderKind: string
  readonly props?: readonly { readonly name: string }[]
  readonly slots: Array<{
    readonly name: string
    readonly childNames?: string[]
    readonly children?: string[]
  }>
  readonly textMode?: string
  readonly staticProps?: Record<string, string>
  readonly propMappings?: Array<{
    readonly prop: string
    readonly target: string
  }>
  readonly root?: string
  readonly title?: string
  readonly requiredRegistryItem?: string
  readonly requiredExports?: string[]
  readonly requiredRegistryModules?: Array<{
    readonly registryItem: string
    readonly exports: string[]
  }>
  readonly label?: string
  readonly control?: string
  readonly description?: string
  readonly valueProp?: string
  readonly rootByProp?: {
    readonly prop: string
    readonly target: "tag"
    readonly map: Record<string, string>
    readonly default: string
  }
  readonly list?: string
  readonly trigger?: string
  readonly content?: string
  readonly titleContainer?: string
  readonly item?: string
  readonly itemContainer?: string
  readonly controlTrigger?: string
  readonly controlValue?: string
  readonly controlContent?: string
  readonly controlRoot?: string
  readonly controlEmpty?: string
  readonly controlList?: string
  readonly itemSlot?: string
  readonly itemValueProp?: string
  readonly itemHeadingProp?: string
}

type ComponentPropInput = {
  readonly name: string
  readonly valueKind: "boolean" | "enum" | "number" | "string" | "text"
  readonly required?: boolean
  readonly enumValues?: readonly string[]
}

type ComponentSchemaInput = {
  readonly name: string
  readonly description?: string
  readonly props: readonly ComponentPropInput[]
  readonly allowedChildren?: readonly string[]
}

type RuntimeElementRegistryComponent = Partial<RendererMappingComponent> & {
  readonly name: string
  readonly kind: string
}

describe("createRuntimeElementRegistrySpec", () => {
  it("derives native tags and shadcn exports from renderer mapping", async () => {
    const { createRuntimeElementRegistrySpec } =
      await importRenderCapabilitiesModule()
    const registrySpec = createRuntimeElementRegistrySpec({
      components: [
        {
          name: "page",
          kind: "compound",
          root: "article",
          title: "h1",
        },
        {
          name: "card",
          kind: "compound",
          requiredRegistryItem: "card",
          requiredExports: ["Card", "CardContent", "CardHeader", "CardTitle"],
          root: "Card",
          title: "CardTitle",
          titleContainer: "CardHeader",
          content: "CardContent",
        },
        {
          name: "switch",
          kind: "toggle-field",
          requiredRegistryModules: [
            {
              registryItem: "field",
              exports: [
                "Field",
                "FieldContent",
                "FieldDescription",
                "FieldLabel",
              ],
            },
            {
              registryItem: "switch",
              exports: ["Switch"],
            },
          ],
          requiredRegistryItem: "switch",
          requiredExports: ["Switch"],
          root: "Field",
          label: "FieldLabel",
          control: "Switch",
          description: "FieldDescription",
        },
        {
          name: "slider",
          kind: "slider-field",
          requiredRegistryModules: [
            {
              registryItem: "field",
              exports: [
                "Field",
                "FieldContent",
                "FieldDescription",
                "FieldLabel",
              ],
            },
            {
              registryItem: "slider",
              exports: ["Slider"],
            },
          ],
          requiredRegistryItem: "slider",
          requiredExports: ["Slider"],
          root: "Field",
          label: "FieldLabel",
          control: "Slider",
          description: "FieldDescription",
          valueProp: "value",
        },
        {
          name: "list",
          kind: "collection",
          rootByProp: {
            prop: "variant",
            target: "tag",
            map: { ordered: "ol", unordered: "ul" },
            default: "ul",
          },
          item: "li",
        },
        {
          name: "tabs",
          kind: "tabs",
          requiredRegistryItem: "tabs",
          requiredExports: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
          root: "Tabs",
          list: "TabsList",
          trigger: "TabsTrigger",
          content: "TabsContent",
        },
        {
          name: "select",
          kind: "select-overlay",
          requiredRegistryModules: [
            {
              registryItem: "field",
              exports: [
                "Field",
                "FieldContent",
                "FieldDescription",
                "FieldLabel",
                "FieldTitle",
              ],
            },
            {
              registryItem: "select",
              exports: [
                "Select",
                "SelectContent",
                "SelectGroup",
                "SelectItem",
                "SelectTrigger",
                "SelectValue",
              ],
            },
          ],
          requiredRegistryItem: "select",
          requiredExports: [
            "Select",
            "SelectContent",
            "SelectGroup",
            "SelectItem",
            "SelectTrigger",
            "SelectValue",
          ],
          root: "Field",
          label: "FieldTitle",
          control: "Select",
          controlTrigger: "SelectTrigger",
          controlValue: "SelectValue",
          controlContent: "SelectContent",
          itemContainer: "SelectGroup",
          item: "SelectItem",
          description: "FieldDescription",
        },
        {
          name: "combobox",
          kind: "combobox-input",
          requiredRegistryModules: [
            {
              registryItem: "field",
              exports: [
                "Field",
                "FieldContent",
                "FieldDescription",
                "FieldLabel",
                "FieldTitle",
              ],
            },
            {
              registryItem: "combobox",
              exports: [
                "Combobox",
                "ComboboxCollection",
                "ComboboxContent",
                "ComboboxEmpty",
                "ComboboxInput",
                "ComboboxItem",
                "ComboboxList",
              ],
            },
          ],
          requiredRegistryItem: "combobox",
          requiredExports: [
            "Combobox",
            "ComboboxCollection",
            "ComboboxContent",
            "ComboboxEmpty",
            "ComboboxInput",
            "ComboboxItem",
            "ComboboxList",
          ],
          root: "Field",
          label: "FieldTitle",
          controlRoot: "Combobox",
          control: "ComboboxInput",
          controlContent: "ComboboxContent",
          controlEmpty: "ComboboxEmpty",
          controlList: "ComboboxList",
          itemContainer: "ComboboxCollection",
          item: "ComboboxItem",
          description: "FieldDescription",
        },
      ],
    })

    expect(registrySpec).toEqual({
      version: 1,
      nativeElements: ["article", "h1", "li", "ol", "ul"],
      modules: [
        {
          registryItem: "card",
          exports: ["Card", "CardContent", "CardHeader", "CardTitle"],
        },
        {
          registryItem: "combobox",
          exports: [
            "Combobox",
            "ComboboxCollection",
            "ComboboxContent",
            "ComboboxEmpty",
            "ComboboxInput",
            "ComboboxItem",
            "ComboboxList",
          ],
        },
        {
          registryItem: "field",
          exports: [
            "Field",
            "FieldContent",
            "FieldDescription",
            "FieldLabel",
            "FieldTitle",
          ],
        },
        {
          registryItem: "select",
          exports: [
            "Select",
            "SelectContent",
            "SelectGroup",
            "SelectItem",
            "SelectTrigger",
            "SelectValue",
          ],
        },
        {
          registryItem: "slider",
          exports: ["Slider"],
        },
        {
          registryItem: "switch",
          exports: ["Switch"],
        },
        {
          registryItem: "tabs",
          exports: ["Tabs", "TabsContent", "TabsList", "TabsTrigger"],
        },
      ],
    })
  })

  it("fails when renderer mapping references an unbacked shadcn export", async () => {
    const { createRuntimeElementRegistrySpec } =
      await importRenderCapabilitiesModule()
    expect(() =>
      createRuntimeElementRegistrySpec({
        components: [
          {
            name: "card",
            kind: "compound",
            requiredRegistryItem: "card",
            requiredExports: ["Card", "CardContent", "CardTitle"],
            root: "Card",
            title: "CardTitle",
            titleContainer: "CardHeader",
            content: "CardContent",
          },
        ],
      }),
    ).toThrow(
      'Renderer element "CardHeader" is not backed by a required registry export.',
    )
  })

  it("adds explicit childNames for renderer slot selection", async () => {
    const { collectRendererSpecComponentIssues, createRendererMapping } =
      await importRenderCapabilitiesModule()
    const rendererMapping = createRendererMapping([
      {
        name: "list",
        props: [
          { name: "variant", valueKind: "enum", enumValues: ["ordered"] },
        ],
        allowedChildren: ["item"],
      },
      {
        name: "item",
        props: [],
        allowedChildren: ["#text"],
      },
      {
        name: "tabs",
        props: [],
        allowedChildren: ["tab"],
      },
      {
        name: "table",
        props: [],
        allowedChildren: ["row"],
      },
      {
        name: "row",
        props: [],
        allowedChildren: ["cell"],
      },
      {
        name: "cell",
        props: [],
        allowedChildren: ["#text"],
      },
      {
        name: "tab",
        props: [
          { name: "value", valueKind: "string", required: true },
          { name: "label", valueKind: "string", required: true },
        ],
        allowedChildren: ["card"],
      },
      {
        name: "accordion",
        props: [],
        allowedChildren: ["accordion-item"],
      },
      {
        name: "accordion-item",
        props: [
          { name: "value", valueKind: "string", required: true },
          { name: "title", valueKind: "string", required: true },
        ],
        allowedChildren: ["#text"],
      },
      {
        name: "card",
        props: [{ name: "title", valueKind: "string" }],
        allowedChildren: ["#text"],
      },
    ])

    const list = rendererMapping.components.find(
      (component) => component.name === "list",
    )
    const itemSlot = list?.slots.find((slot) => slot.name === "item")
    expect(itemSlot?.childNames).toEqual(["item"])
    expect(itemSlot?.children).toEqual(["text"])

    const tabs = rendererMapping.components.find(
      (component) => component.name === "tabs",
    )
    const tabSlot = tabs?.slots.find((slot) => slot.name === "tab")
    expect(tabSlot?.childNames).toEqual(["tab"])
    expect(tabSlot?.children).toEqual(["card"])
    expect(tabs?.itemValueProp).toBe("value")
    expect(tabs?.itemHeadingProp).toBe("label")
    expect(tabs?.staticProps).toBeUndefined()

    const table = rendererMapping.components.find(
      (component) => component.name === "table",
    )
    expect(table?.staticProps).toBeUndefined()

    const accordion = rendererMapping.components.find(
      (component) => component.name === "accordion",
    )
    expect(accordion?.staticProps).toEqual({ type: "multiple" })

    for (const component of rendererMapping.components) {
      expect(collectRendererSpecComponentIssues(component)).toEqual([])
    }
  })

  it("keeps runtime renderer kind template in sync with shared kind definitions", async () => {
    const { createRuntimeRendererKindSpec } = await importRenderCapabilitiesModule()
    expect(createRuntimeRendererKindSpec().kinds).toEqual(
      [...runtimeRendererKinds].sort(),
    )
  })

  it("carries explicit prose text semantics for multiline content renderers", async () => {
    const { createRendererMapping } = await importRenderCapabilitiesModule()
    const rendererMapping = createRendererMapping([
      {
        name: "page",
        props: [{ name: "title", valueKind: "string" }],
        allowedChildren: ["card", "alert", "#text"],
      },
      {
        name: "alert",
        props: [
          { name: "title", valueKind: "string" },
          {
            name: "variant",
            valueKind: "enum",
            enumValues: ["default", "destructive"],
          },
        ],
        allowedChildren: ["#text"],
      },
      {
        name: "card",
        props: [{ name: "title", valueKind: "string" }],
        allowedChildren: ["#text"],
      },
      {
        name: "badge",
        props: [],
        allowedChildren: ["#text"],
      },
      {
        name: "list",
        props: [
          { name: "variant", valueKind: "enum", enumValues: ["unordered"] },
        ],
        allowedChildren: ["item"],
      },
      {
        name: "item",
        props: [],
        allowedChildren: ["#text"],
      },
    ])

    expect(
      Object.fromEntries(
        rendererMapping.components.map((component) => [
          component.name,
          component.textMode,
        ]),
      ),
    ).toMatchObject({
      page: "prose",
      alert: "prose",
      card: "prose",
      badge: "prose",
      list: "prose",
    })
  })

  it("keeps alert and badge renderer mappings aligned to variant-only runtime props", async () => {
    const { createRendererMapping } = await importRenderCapabilitiesModule()
    const rendererMapping = createRendererMapping([
      {
        name: "alert",
        props: [
          { name: "title", valueKind: "string" },
          {
            name: "variant",
            valueKind: "enum",
            enumValues: ["default", "destructive"],
          },
        ],
        allowedChildren: ["#text"],
      },
      {
        name: "badge",
        props: [
          {
            name: "variant",
            valueKind: "enum",
            enumValues: [
              "default",
              "secondary",
              "destructive",
              "outline",
              "ghost",
              "link",
            ],
          },
        ],
        allowedChildren: ["#text"],
      },
    ])
    const alert = rendererMapping.components.find(
      (component) => component.name === "alert",
    )
    const badge = rendererMapping.components.find(
      (component) => component.name === "badge",
    )

    expect(alert?.propMappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "variant",
          target: "variant",
        }),
      ]),
    )
    expect(badge?.propMappings).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          prop: "variant",
          target: "variant",
        }),
      ]),
    )
  })
})

async function importRenderCapabilitiesModule(): Promise<RenderCapabilitiesModule> {
  return importCliModule<RenderCapabilitiesModule>("..", "config", "render-capabilities.mjs")
}
