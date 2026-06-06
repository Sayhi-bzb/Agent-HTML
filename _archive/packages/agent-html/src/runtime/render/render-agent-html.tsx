import {
  createElement,
  type ElementType,
  type ReactNode,
} from "react"

import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/agent-html/ast/types"
import { agentHtmlChildPath } from "@/agent-html/ast/paths"
import type { AgentHtmlInteractionUnits } from "@/agent-html/interaction/types"
import type { AgentHtmlInteractionUnit } from "@/agent-html/interaction/types"
import {
  agentHtmlBlockWrapperClassName,
} from "@/agent-html/runtime/block"
import { LazyChartRuntime } from "@/agent-html/runtime/render/lazy-chart-runtime"
import { IconRuntime } from "@/agent-html/runtime/render/icon-runtime"
import {
  BlockRuntime,
  CellRuntime,
  ClusterRuntime,
  GridRuntime,
  SectionRuntime,
  StackRuntime,
} from "@/agent-html/runtime/render/layout-runtime"
import { previewComponentRuntime } from "@/agent-html/runtime/render/component-runtime"

export type RenderAgentHtmlOptions = {
  highlightBlocks?: boolean
  interactionUnits?: AgentHtmlInteractionUnits
  renderBlockWrapper?: (props: {
    children: ReactNode
    className: string
    key: string
    path: string
    unit: AgentHtmlInteractionUnit
  }) => ReactNode
}

type RenderContext = {
  blockUnitByPath: ReadonlyMap<string, AgentHtmlInteractionUnit>
  highlightBlocks: boolean
  renderBlockWrapper?: RenderAgentHtmlOptions["renderBlockWrapper"]
}

function renderNode(
  node: AgentHtmlNode,
  key: string,
  path: string,
  context: RenderContext
): ReactNode {
  if (node.type === "text") {
    return node.value
  }

  return renderElement(node, key, path, context)
}

function renderChildren(
  children: AgentHtmlNode[],
  parentPath: string,
  context: RenderContext
) {
  const childCounts = new Map<string, number>()

  return children.map((child, index) => {
    if (child.type === "text") {
      return renderNode(child, `${index}`, `${parentPath}/#text[${index}]`, context)
    }

    const count = childCounts.get(child.tag) ?? 0
    childCounts.set(child.tag, count + 1)
    return renderNode(
      child,
      `${index}`,
      agentHtmlChildPath(parentPath, child.tag, count),
      context
    )
  })
}

function hasChildren(tag: AgentHtmlElementNode["tag"]) {
  return !(
    tag === "Progress" ||
    tag === "Separator" ||
    tag === "CarouselPrevious" ||
    tag === "CarouselNext" ||
    tag === "Image"
  )
}

function wrapInteractionBlock(
  rendered: ReactNode,
  key: string,
  path: string,
  context: RenderContext
) {
  const unit = context.blockUnitByPath.get(path)

  if (!context.highlightBlocks || !unit) {
    return rendered
  }

  if (context.renderBlockWrapper) {
    return context.renderBlockWrapper({
      children: rendered,
      className: "",
      key: unit.motionKey,
      path,
      unit,
    })
  }

  return (
    <div
      className={agentHtmlBlockWrapperClassName}
      data-agent-html-block="true"
      data-agent-html-block-path={path}
      key={key}
    >
      {rendered}
    </div>
  )
}

function renderElement(
  node: AgentHtmlElementNode,
  key: string,
  path: string,
  context: RenderContext
): ReactNode {
  let rendered: ReactNode

  if (node.tag === "Cell") {
    const children = renderChildren(node.children, path, context)
    rendered = <CellRuntime key={key}>{children}</CellRuntime>
    return rendered
  }

  if (node.tag === "Block") {
    const children = renderChildren(node.children, path, context)
    rendered = <BlockRuntime key={key}>{children}</BlockRuntime>
    return wrapInteractionBlock(rendered, key, path, context)
  }

  if (node.tag === "Section") {
    const children = renderChildren(node.children, path, context)
    rendered = (
      <SectionRuntime key={key} width={node.attrs.width}>
        {children}
      </SectionRuntime>
    )
    return rendered
  }

  if (node.tag === "Stack") {
    const children = renderChildren(node.children, path, context)
    rendered = <StackRuntime key={key}>{children}</StackRuntime>
    return rendered
  }

  if (node.tag === "Cluster") {
    const children = renderChildren(node.children, path, context)
    rendered = (
      <ClusterRuntime
        justify={node.attrs.justify}
        key={key}
        wrap={node.attrs.wrap}
      >
        {children}
      </ClusterRuntime>
    )
    return rendered
  }

  if (node.tag === "Grid") {
    const children = renderChildren(node.children, path, context)
    rendered = (
      <GridRuntime columns={node.attrs.columns} key={key}>
        {children}
      </GridRuntime>
    )
    return rendered
  }

  if (
    node.tag === "ChartSeries" ||
    node.tag === "ChartRow" ||
    node.tag === "ChartTooltip"
  ) {
    throw new Error(`Unsupported render tag: ${node.tag}`)
  }

  if (node.tag === "Icon") {
    rendered = <IconRuntime key={key} name={node.attrs.name} />
    return rendered
  }

  if (node.tag === "Chart") {
    rendered = <LazyChartRuntime key={key} node={node} />
    return rendered
  }

  const Component =
    previewComponentRuntime[
      node.tag as keyof typeof previewComponentRuntime
    ] as ElementType

  if (!Component) {
    throw new Error(`Unknown render tag: ${node.tag}`)
  }

  if (!hasChildren(node.tag)) {
    rendered = createElement(Component, { key, ...node.attrs })
    return rendered
  }

  const children = renderChildren(node.children, path, context)
  rendered = createElement(Component, { key, ...node.attrs }, ...children)
  return rendered
}

export function renderAgentHtml(
  document: AgentHtmlDocument,
  options: RenderAgentHtmlOptions = {}
) {
  const context = {
    blockUnitByPath: new Map(
      options.interactionUnits?.blocks.map((unit) => [unit.path, unit]) ?? []
    ),
    highlightBlocks: options.highlightBlocks === true,
    renderBlockWrapper: options.renderBlockWrapper,
  }

  return renderElement(document.root, "root", `/${document.root.tag}`, context)
}


