import { createElement, type ElementType, type ReactNode } from "react"

import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/gallery/preview/agent-html/ast/types"
import {
  ClusterRuntime,
  GridRuntime,
  PageRuntime,
  StackRuntime,
} from "@/gallery/preview/agent-html/render/layout-runtime"
import { previewComponentRuntime } from "@/gallery/preview/agent-html/render/component-runtime"

function renderNode(node: AgentHtmlNode, key: string): ReactNode {
  if (node.type === "text") {
    return node.value
  }

  return renderElement(node, key)
}

function renderChildren(children: AgentHtmlNode[]) {
  return children.map((child, index) => renderNode(child, `${index}`))
}

function hasChildren(tag: AgentHtmlElementNode["tag"]) {
  return !(
    tag === "Progress" ||
    tag === "Separator"
  )
}

function renderElement(node: AgentHtmlElementNode, key: string): ReactNode {
  const children = renderChildren(node.children)

  if (node.tag === "Page") {
    return (
      <PageRuntime gap={node.attrs.gap} key={key}>
        {children}
      </PageRuntime>
    )
  }

  if (node.tag === "Stack") {
    return (
      <StackRuntime gap={node.attrs.gap} key={key}>
        {children}
      </StackRuntime>
    )
  }

  if (node.tag === "Cluster") {
    return (
      <ClusterRuntime
        gap={node.attrs.gap}
        justify={node.attrs.justify}
        key={key}
        wrap={node.attrs.wrap}
      >
        {children}
      </ClusterRuntime>
    )
  }

  if (node.tag === "Grid") {
    return (
      <GridRuntime columns={node.attrs.columns} gap={node.attrs.gap} key={key}>
        {children}
      </GridRuntime>
    )
  }

  if (
    node.tag === "AspectRatio" ||
    node.tag === "Carousel" ||
    node.tag === "CarouselContent" ||
    node.tag === "CarouselItem" ||
    node.tag === "CarouselPrevious" ||
    node.tag === "CarouselNext" ||
    node.tag === "Chart" ||
    node.tag === "ChartSeries" ||
    node.tag === "ChartTooltip" ||
    node.tag === "Icon"
  ) {
    throw new Error(`Unsupported render tag: ${node.tag}`)
  }

  const Component =
    previewComponentRuntime[
      node.tag as keyof typeof previewComponentRuntime
    ] as ElementType

  if (!Component) {
    throw new Error(`Unknown render tag: ${node.tag}`)
  }

  if (!hasChildren(node.tag)) {
    return createElement(Component, { key, ...node.attrs })
  }

  return createElement(Component, { key, ...node.attrs }, ...children)
}

export function renderAgentHtml(document: AgentHtmlDocument) {
  return renderElement(document.root, "root")
}
