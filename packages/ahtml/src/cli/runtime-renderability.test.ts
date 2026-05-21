import type { ComponentSchema } from "@agent-html/core"
import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"
import type {
  AgentDocument,
  RendererSpecComponent,
  RuntimeVerificationState,
} from "./runtime-host/renderer/types"

type RuntimeVerificationDataComponent = {
  name: string
  renderKind?: string
  props?: string[]
  slots?: Array<{
    name: string
    props?: string[]
    children?: string[]
    childNames?: string[]
  }>
}

type RuntimeRenderSchema = {
  components?: readonly ComponentSchema[]
  verificationData?: {
    components: RuntimeVerificationDataComponent[]
  }
  rendererMapping?: {
    components: RendererSpecComponent[]
  }
}

type AgentComponentNode = Extract<AgentDocument["components"][number], { type: "component" }>
type AgentTextNode = Extract<AgentComponentNode["children"][number], { type: "text" }>

describe("createRuntimeRenderDiagnostics", () => {
  it("returns structured diagnostics for runtime renderer drift before SSR", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([
        componentNode("card", { title: "Summary" }, [textNode("Body")]),
      ]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("card", "compound", ["title"], [
              slot("children", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("card", {
              kind: "primitive",
              renderKind: "compound",
              component: "Card",
              root: "Card",
              slots: [slot("children", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("card", "compound", ["title"], [
              slot("children", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("card", {
              kind: "compound",
              renderKind: "compound",
              root: "Card",
              slots: [slot("children", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-renderer-mapping-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining("card kind"),
      }),
      expect.objectContaining({
        code: "runtime-renderer-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining(
          "Kind mismatch: card kind: primitive expected compound",
        ),
      }),
    ])
  })

  it("returns structured diagnostics for renderer mapping field drift", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", [], [slot("tab", ["text"])]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemValueProp: "slug",
              itemHeadingProp: "heading",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", [], [slot("tab", ["text"])]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemValueProp: "value",
              itemHeadingProp: "label",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-renderer-mapping-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining("itemValueProp"),
      }),
    ])
  })

  it("returns structured diagnostics for missing kind-required renderer mapping fields", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", [], [slot("tab", ["text"])]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemHeadingProp: "label",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", [], [slot("tab", ["text"])]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemValueProp: "value",
              itemHeadingProp: "label",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-renderer-mapping-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining(
          'Missing required field "itemValueProp"',
        ),
      }),
    ])
  })

  it("treats schema verification data as the canonical expected snapshot", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", [], [slot("tab", ["text"])]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemValueProp: "value",
              itemHeadingProp: "label",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        components: [
          {
            name: "tabs",
            description: "Tabs",
            props: [],
            allowedChildren: ["tab"],
          },
        ],
        verificationData: {
          components: [
            verificationComponent("tabs", "tabs", ["default"], [
              slot("tab", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("tabs", {
              kind: "tabs",
              renderKind: "tabs",
              root: "Tabs",
              list: "TabsList",
              trigger: "TabsTrigger",
              content: "TabsContent",
              itemSlot: "tab",
              itemValueProp: "value",
              itemHeadingProp: "label",
              slots: [slot("tab", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-verification-data-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining("tabs props"),
      }),
    ])
  })

  it("returns structured diagnostics for slot metadata drift beyond slot names", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("list", "collection", [], [
              slot("item", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("list", {
              kind: "collection",
              renderKind: "collection",
              root: "ul",
              item: "li",
              itemSlot: "item",
              childMode: "inline",
              slots: [slot("item", ["text"], ["entry"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("list", "collection", [], [
              slot("item", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("list", {
              kind: "collection",
              renderKind: "collection",
              root: "ul",
              item: "li",
              itemSlot: "item",
              childMode: "inline",
              slots: [slot("item", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-renderer-mapping-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining('"childNames":["entry"]'),
      }),
    ])
  })

  it("returns structured diagnostics for renderer scalar field drift such as textMode", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("card", "compound", ["title"], [
              slot("children", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("card", {
              kind: "compound",
              renderKind: "compound",
              root: "Card",
              title: "CardTitle",
              titleProp: "title",
              content: "CardContent",
              childMode: "block",
              textMode: "preformatted",
              slots: [slot("children", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("card", "compound", ["title"], [
              slot("children", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("card", {
              kind: "compound",
              renderKind: "compound",
              root: "Card",
              title: "CardTitle",
              titleProp: "title",
              content: "CardContent",
              childMode: "block",
              textMode: "prose",
              slots: [slot("children", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([
      expect.objectContaining({
        code: "runtime-renderer-mapping-parity",
        path: "/runtime",
        severity: "error",
        message: expect.stringContaining("textMode"),
      }),
    ])
  })

  it("does not report structural slot children as missing renderer components", async () => {
    const { createRuntimeRenderDiagnostics } =
      await importRuntimeRenderabilityModule()
    const diagnostics = createRuntimeRenderDiagnostics({
      document: createDocument([
        componentNode("table", {}, [
          componentNode("row", {}, [
            componentNode("cell", {}, [textNode("Name")]),
          ]),
        ]),
        componentNode("list", {}, [
          componentNode("item", {}, [textNode("First")]),
        ]),
      ]),
      runtimeVerificationState: createRuntimeVerificationState({
        verificationData: {
          components: [
            verificationComponent("table", "table", [], [slot("row", ["cell"])]),
            verificationComponent("list", "collection", [], [
              slot("item", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            rendererComponent("table", {
              kind: "table",
              renderKind: "table",
              root: "Table",
              header: "TableHeader",
              body: "TableBody",
              row: "TableRow",
              headerCell: "TableHead",
              bodyCell: "TableCell",
              rowSlot: "row",
              cellSlot: "cell",
              slots: [slot("row", ["cell"])],
            }),
            rendererComponent("list", {
              kind: "collection",
              renderKind: "collection",
              root: "ul",
              item: "li",
              itemSlot: "item",
              childMode: "inline",
              slots: [slot("item", ["text"])],
            }),
          ],
        },
      }),
      schema: createSchema({
        verificationData: {
          components: [
            verificationComponent("table", "table", [], [slot("row", ["cell"])]),
            verificationComponent("list", "collection", [], [
              slot("item", ["text"]),
            ]),
          ],
        },
        rendererMapping: {
          components: [
            rendererComponent("table", {
              kind: "table",
              renderKind: "table",
              root: "Table",
              header: "TableHeader",
              body: "TableBody",
              row: "TableRow",
              headerCell: "TableHead",
              bodyCell: "TableCell",
              rowSlot: "row",
              cellSlot: "cell",
              slots: [slot("row", ["cell"])],
            }),
            rendererComponent("list", {
              kind: "collection",
              renderKind: "collection",
              root: "ul",
              item: "li",
              itemSlot: "item",
              childMode: "inline",
              slots: [slot("item", ["text"])],
            }),
          ],
        },
      }),
    })

    expect(diagnostics).toEqual([])
  })
})

function createDocument(components: AgentDocument["components"]): AgentDocument {
  return {
    meta: {
      artifactProfileReference: "shadcn-default",
      artifactProfile: {
        id: "shadcn-default",
        globalStyle: {
          tokenSets: {
            light: emptyColorTokenSet(),
            dark: emptyColorTokenSet(),
          },
          radiusScale: {
            base: "",
            sm: "",
            md: "",
            lg: "",
            xl: "",
            "2xl": "",
            "3xl": "",
            "4xl": "",
          },
          typography: {
            fontSans: "",
            fontHeading: "",
            fontSerif: "",
            fontMono: "",
            letterSpacing: "",
            spacing: "",
            shadowColor: "",
            shadowOpacity: "",
            shadowBlur: "",
            shadowSpread: "",
            shadowOffsetX: "",
            shadowOffsetY: "",
          },
          cssVariableMap: {
            background: "",
            foreground: "",
            card: "",
            cardForeground: "",
            popover: "",
            popoverForeground: "",
            primary: "",
            primaryForeground: "",
            secondary: "",
            secondaryForeground: "",
            muted: "",
            mutedForeground: "",
            accent: "",
            accentForeground: "",
            destructive: "",
            destructiveForeground: "",
            border: "",
            input: "",
            ring: "",
            chart1: "",
            chart2: "",
            chart3: "",
            chart4: "",
            chart5: "",
            sidebar: "",
            sidebarForeground: "",
            sidebarPrimary: "",
            sidebarPrimaryForeground: "",
            sidebarAccent: "",
            sidebarAccentForeground: "",
            sidebarBorder: "",
            sidebarRing: "",
            radius: "",
            fontSans: "",
            fontHeading: "",
            fontSerif: "",
            fontMono: "",
            letterSpacing: "",
            spacing: "",
            shadowColor: "",
            shadowOpacity: "",
            shadowBlur: "",
            shadowSpread: "",
            shadowOffsetX: "",
            shadowOffsetY: "",
          },
        },
        globalLayout: {
          frame: {
            pageMaxWidth: "",
            pagePaddingInline: "",
            pagePaddingBlockStart: "",
            pagePaddingBlockEnd: "",
            frameMaxWidth: "",
          },
          measure: {
            prose: "",
            wide: "",
            full: "",
          },
          rhythm: {
            pageGap: "",
            stackGap: "",
            clusterGap: "",
            splitGap: "",
            gridGap: "",
            switcherGap: "",
          },
          density: {
            default: "balanced",
            compact: 1,
            balanced: 1,
            relaxed: 1,
          },
          partition: {
            splitMinColumnWidth: "",
            gridMinColumnWidth: "",
            switcherMinChildWidth: "",
          },
          reflow: {
            splitAutoFlow: "auto-fit",
            gridAutoFlow: "auto-fit",
            clusterWrap: "wrap",
            switcherWrap: "wrap",
            clusterJustify: "flex-start",
            switcherJustify: "flex-start",
          },
        },
        componentStyle: {},
        componentLayout: {
          page: {
            gap: "",
            measure: "wide",
          },
          stack: {
            gap: "",
            density: "balanced",
            measure: "full",
          },
          cluster: {
            gap: "",
            density: "balanced",
            wrap: "wrap",
            justify: "flex-start",
          },
          split: {
            gap: "",
            density: "balanced",
            minColumnWidth: "",
            autoFlow: "auto-fit",
          },
          grid: {
            gap: "",
            density: "balanced",
            minColumnWidth: "",
            autoFlow: "auto-fit",
          },
          switcher: {
            gap: "",
            density: "balanced",
            minChildWidth: "",
            wrap: "wrap",
            justify: "flex-start",
          },
          frame: {
            maxWidth: "",
            measure: "wide",
          },
        },
      },
    },
    components,
  }
}

function emptyColorTokenSet() {
  return {
    background: "",
    foreground: "",
    card: "",
    cardForeground: "",
    popover: "",
    popoverForeground: "",
    primary: "",
    primaryForeground: "",
    secondary: "",
    secondaryForeground: "",
    muted: "",
    mutedForeground: "",
    accent: "",
    accentForeground: "",
    destructive: "",
    destructiveForeground: "",
    border: "",
    input: "",
    ring: "",
    chart1: "",
    chart2: "",
    chart3: "",
    chart4: "",
    chart5: "",
    sidebar: "",
    sidebarForeground: "",
    sidebarPrimary: "",
    sidebarPrimaryForeground: "",
    sidebarAccent: "",
    sidebarAccentForeground: "",
    sidebarBorder: "",
    sidebarRing: "",
  }
}

function textNode(value: string): AgentTextNode {
  return {
    type: "text",
    value,
  }
}

function componentNode(
  name: string,
  props: Record<string, string>,
  children: Array<AgentComponentNode | AgentTextNode>,
): AgentComponentNode {
  return {
    type: "component",
    name,
    props,
    children,
  }
}

function slot(
  name: string,
  children: string[],
  childNames?: string[],
): NonNullable<RuntimeVerificationDataComponent["slots"]>[number] &
  RendererSpecComponent["slots"][number] {
  return {
    name,
    children,
    ...(childNames ? { childNames } : {}),
  }
}

function verificationComponent(
  name: string,
  renderKind: string,
  props: string[],
  slots: NonNullable<RuntimeVerificationDataComponent["slots"]>,
): RuntimeVerificationDataComponent {
  return {
    name,
    renderKind,
    props,
    slots,
  }
}

function rendererComponent(
  name: string,
  component: Omit<RendererSpecComponent, "name">,
): RendererSpecComponent {
  return {
    name,
    ...component,
  }
}

function createRuntimeVerificationState(input: {
  verificationData: {
    components: RuntimeVerificationDataComponent[]
  }
  rendererMapping: RuntimeVerificationState["rendererMapping"]
}): RuntimeVerificationState & {
  verificationData: {
    components: RuntimeVerificationDataComponent[]
  }
} {
  return input
}

function createSchema(input: RuntimeRenderSchema): RuntimeRenderSchema {
  return input
}

async function importRuntimeRenderabilityModule() {
  return importCliModule<{
    readonly createRuntimeRenderDiagnostics: (input: {
      readonly document: AgentDocument
      readonly runtimeVerificationState: RuntimeVerificationState & {
        verificationData: {
          components: RuntimeVerificationDataComponent[]
        }
      }
      readonly schema: RuntimeRenderSchema
    }) => Array<{
      readonly code: string
      readonly path: string
      readonly severity: string
      readonly message: string
    }>
  }>("runtime-renderability.mjs")
}
