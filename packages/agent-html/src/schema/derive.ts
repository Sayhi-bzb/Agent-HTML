import type { AgentHtmlTag } from "@/agent-html/ast/types"
import type {
  AgentHtmlAttrContract,
  AgentHtmlComponentContract,
  AgentHtmlComponentRole,
  AgentHtmlComponentRuntime,
} from "@/agent-html/schema/component-contract"

function isPromptAttr(attr: AgentHtmlAttrContract) {
  return attr.prompt !== false
}

function formatAttr(name: string, attr: AgentHtmlAttrContract) {
  const requiredMarker = attr.required ? "" : "?"

  if (attr.values && attr.values.length > 0) {
    return `${name}${requiredMarker}="${attr.values.join("|")}"`
  }

  return `${name}${requiredMarker}=${attr.type}`
}

const layoutSpecialTags = new Set<AgentHtmlTag>([
  "Page",
  "Section",
  "Stack",
  "Cluster",
  "Grid",
])

const specialRendererTags = new Set<AgentHtmlTag>(["Chart", "Icon"])

const dataOnlyTags = new Set<AgentHtmlTag>([
  "ChartSeries",
  "ChartRow",
  "ChartTooltip",
])

const componentDependencies: Partial<Record<AgentHtmlTag, readonly AgentHtmlTag[]>> = {
  Accordion: ["AccordionItem", "AccordionTrigger", "AccordionContent"],
  Alert: ["AlertTitle", "AlertDescription", "AlertAction", "Icon"],
  Badge: ["Icon"],
  Button: ["Icon"],
  Card: [
    "CardHeader",
    "CardTitle",
    "CardDescription",
    "CardAction",
    "CardContent",
    "CardFooter",
  ],
  Carousel: [
    "CarouselContent",
    "CarouselItem",
    "CarouselPrevious",
    "CarouselNext",
  ],
  Chart: ["ChartSeries", "ChartRow", "ChartTooltip"],
  Kanban: ["KanbanColumn", "KanbanItem"],
  Table: [
    "TableCaption",
    "TableHeader",
    "TableBody",
    "TableFooter",
    "TableRow",
    "TableHead",
    "TableCell",
  ],
  Tabs: ["TabsList", "TabsTrigger", "TabsContent"],
  Timeline: [
    "TimelineItem",
    "TimelineTitle",
    "TimelineDescription",
    "TimelineContent",
  ],
}

export function resolveComponentRole(
  contract: AgentHtmlComponentContract
): AgentHtmlComponentRole {
  if (contract.role) {
    return contract.role
  }

  if (contract.kind === "layout") {
    return "layout"
  }

  if (dataOnlyTags.has(contract.tag)) {
    return "data"
  }

  if (contract.market) {
    return "component"
  }

  if (contract.tag === "Icon" || contract.tag === "Text") {
    return "utility"
  }

  return "part"
}

export function resolveComponentRuntime(
  contract: AgentHtmlComponentContract
): AgentHtmlComponentRuntime {
  if (contract.runtime) {
    return contract.runtime
  }

  if (layoutSpecialTags.has(contract.tag)) {
    return "layout-special"
  }

  if (specialRendererTags.has(contract.tag)) {
    return "special-renderer"
  }

  if (dataOnlyTags.has(contract.tag)) {
    return "data-only"
  }

  return "component-map"
}

export function deriveLayoutTags(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return new Set<AgentHtmlTag>(
    contracts
      .filter((contract) => contract.kind === "layout")
      .map((contract) => contract.tag)
  )
}

export function deriveAllTags(contracts: readonly AgentHtmlComponentContract[]) {
  return new Set<AgentHtmlTag>(contracts.map((contract) => contract.tag))
}

export function deriveAllowedAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .filter((contract) => contract.attrs)
      .map((contract) => [contract.tag, Object.keys(contract.attrs ?? {})])
  ) as Partial<Record<AgentHtmlTag, string[]>>
}

export function deriveRequiredAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .map((contract) => [
        contract.tag,
        Object.entries(contract.attrs ?? {})
          .filter(([, attr]) => attr.required === true)
          .map(([name]) => name),
      ])
      .filter(([, attrs]) => attrs.length > 0)
  ) as Partial<Record<AgentHtmlTag, string[]>>
}

export function deriveDefaultAttrs(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return Object.fromEntries(
    contracts
      .map((contract) => [
        contract.tag,
        Object.fromEntries(
          Object.entries(contract.attrs ?? {})
            .filter(([, attr]) => attr.defaultValue !== undefined)
            .map(([name, attr]) => [name, attr.defaultValue])
        ),
      ])
      .filter(([, attrs]) => Object.keys(attrs).length > 0)
  ) as Partial<Record<AgentHtmlTag, Record<string, string>>>
}

export function derivePromptGrammarLines(
  contracts: readonly AgentHtmlComponentContract[],
  kind: "layout" | "ui"
) {
  return contracts
    .filter((contract) => contract.kind === kind)
    .map((contract) => {
      if (contract.promptSignature) {
        return `- \`${contract.promptSignature} -> ${contract.children.grammar}\``
      }

      const attrs = Object.entries(contract.attrs ?? {})
        .filter(([, attr]) => isPromptAttr(attr))
        .map(([name, attr]) => formatAttr(name, attr))
      const attrText = attrs.length > 0 ? `:${attrs.join(", ")}` : ""

      return `- \`${contract.tag}${attrText} -> ${contract.children.grammar}\``
    })
}

export function deriveMarketComponents(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return contracts.flatMap((contract) => {
    if (!contract.market) {
      return []
    }

    return [{
      attrs: contract.attrs ?? {},
      market: contract.market,
      role: resolveComponentRole(contract),
      runtime: resolveComponentRuntime(contract),
      tag: contract.tag,
    }]
  })
}

export function deriveRuntimeBoundary(
  contracts: readonly AgentHtmlComponentContract[]
) {
  return contracts.map((contract) => ({
    role: resolveComponentRole(contract),
    runtime: resolveComponentRuntime(contract),
    tag: contract.tag,
  }))
}

export function createEnabledComponentRegistry(
  contracts: readonly AgentHtmlComponentContract[],
  enabledMarketTags: ReadonlySet<AgentHtmlTag>
) {
  const enabledTags = new Set<AgentHtmlTag>()

  for (const contract of contracts) {
    const role = resolveComponentRole(contract)

    if (role === "layout" || role === "utility") {
      enabledTags.add(contract.tag)
      continue
    }

    if (role === "component" && enabledMarketTags.has(contract.tag)) {
      enabledTags.add(contract.tag)
      for (const dependency of componentDependencies[contract.tag] ?? []) {
        enabledTags.add(dependency)
      }
    }
  }

  return contracts.filter((contract) => enabledTags.has(contract.tag))
}
