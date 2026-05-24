import { createElement, type ElementType, type ReactNode } from "react"

import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/agent-html/ast/types"
import { ChartRuntime } from "@/agent-html/runtime/render/chart-runtime"
import { IconRuntime } from "@/agent-html/runtime/render/icon-runtime"
import {
  ClusterRuntime,
  GridRuntime,
  PageRuntime,
  SectionRuntime,
  StackRuntime,
} from "@/agent-html/runtime/render/layout-runtime"
import { previewComponentRuntime } from "@/agent-html/runtime/render/component-runtime"

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
    tag === "Separator" ||
    tag === "CarouselPrevious" ||
    tag === "CarouselNext" ||
    tag === "Image"
  )
}

function renderElement(node: AgentHtmlElementNode, key: string): ReactNode {
  if (node.tag === "Page") {
    const children = renderChildren(node.children)
    return <PageRuntime key={key}>{children}</PageRuntime>
  }

  if (node.tag === "Section") {
    const children = renderChildren(node.children)
    return (
      <SectionRuntime key={key} width={node.attrs.width}>
        {children}
      </SectionRuntime>
    )
  }

  if (node.tag === "Stack") {
    const children = renderChildren(node.children)
    return <StackRuntime key={key}>{children}</StackRuntime>
  }

  if (node.tag === "Cluster") {
    const children = renderChildren(node.children)
    return (
      <ClusterRuntime
        justify={node.attrs.justify}
        key={key}
        wrap={node.attrs.wrap}
      >
        {children}
      </ClusterRuntime>
    )
  }

  if (node.tag === "Grid") {
    const children = renderChildren(node.children)
    return (
      <GridRuntime columns={node.attrs.columns} key={key}>
        {children}
      </GridRuntime>
    )
  }

  if (
    node.tag === "ChartSeries" ||
    node.tag === "ChartRow" ||
    node.tag === "ChartTooltip"
  ) {
    throw new Error(`Unsupported render tag: ${node.tag}`)
  }

  if (node.tag === "Icon") {
    return <IconRuntime key={key} name={node.attrs.name} />
  }

  if (node.tag === "Chart") {
    return <ChartRuntime key={key} node={node} />
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

  const children = renderChildren(node.children)
  return createElement(Component, { key, ...node.attrs }, ...children)
}

export function renderAgentHtml(document: AgentHtmlDocument) {
  return renderElement(document.root, "root")
}


