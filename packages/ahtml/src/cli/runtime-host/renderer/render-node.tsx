import React from "react"

import { createLayoutRenderer } from "./render-layout-node"
import { type RendererKind, runtimeRendererKinds } from "./kinds"
import {
  resolveLayoutComponentClassName,
  resolveLayoutComponentStyle,
} from "./layout-projection"
import type {
  AgentComponentNode,
  AgentDocument,
  AgentNode,
  RendererPath,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"
import { createUiRenderer } from "./render-ui-node"

export function createRendererNode(
  rendererSpecByName: Map<string, RendererSpecComponent>,
  artifactProfile?: AgentDocument["meta"]["artifactProfile"],
) {
  function RendererNode({
    node,
    path = [0],
    textMode,
  }: {
    node: AgentNode
    path?: RendererPath
    textMode?: RendererTextMode
  }) {
    if (node.type === "text") {
      return renderTextNode(node, textMode)
    }

    const rendererSpec = rendererSpecByName.get(node.name)
    if (!rendererSpec) {
      throw new Error(`Unsupported renderer component "${node.name}".`)
    }

    return renderComponent(node, rendererSpec, path)
  }

  function renderComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const render = rendererKindHandlers[rendererSpec.kind as RendererKind]

    if (render) {
      return render(node, rendererSpec, path)
    }

    if (isRuntimeRenderableKind(rendererSpec.kind)) {
      throw new Error(
        `Registered renderer component "${rendererSpec.name}" has no renderer implementation.`,
      )
    }

    throw new Error(
      `Unsupported renderer kind "${rendererSpec.kind}" for "${rendererSpec.name}".`,
    )
  }

  function renderTextNode(
    node: Extract<AgentNode, { type: "text" }>,
    textMode: RendererTextMode = "prose",
  ) {
    return textMode === "preformatted" ? (
      <p className="m-0 whitespace-pre-wrap">{node.value}</p>
    ) : (
      <p className="m-0 whitespace-normal">{collapseTextNodeWhitespace(node.value)}</p>
    )
  }

  function getComponentMetadataProps(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const layoutStyle = resolveLayoutComponentStyle(node.name, artifactProfile)
    const layoutClassName = resolveLayoutComponentClassName(node.name)
    const className = mergeClassNames(layoutClassName ?? rendererSpec.rootClassName)

    return {
      "data-agent-html-component": node.name,
      "data-ahtml-render-kind": rendererSpec.renderKind,
      ...(rendererSpec.source ? { "data-ahtml-source": rendererSpec.source } : {}),
      "data-ahtml-path": path.map(String).join("."),
      ...(className ? { className } : {}),
      ...(layoutStyle ? { style: layoutStyle } : {}),
    }
  }

  function renderChildren(
    node: AgentComponentNode,
    path: RendererPath,
    textMode: RendererTextMode = "prose",
  ) {
    return node.children.map((child, index) => (
      <RendererNode
        key={index}
        node={child}
        path={appendRendererPath(path, index)}
        textMode={textMode}
      />
    ))
  }

  function renderInlineChildren(
    node: AgentComponentNode,
    path: RendererPath,
    textMode: RendererTextMode = "prose",
  ) {
    return node.children.map((child, index) => {
      if (child.type === "text") {
        return (
          <React.Fragment key={index}>
            {textMode === "preformatted"
              ? child.value
              : collapseTextNodeWhitespace(child.value)}
          </React.Fragment>
        )
      }

      return (
        <RendererNode
          key={index}
          node={child}
          path={appendRendererPath(path, index)}
          textMode={textMode}
        />
      )
    })
  }

  const rendererContext = {
    getComponentMetadataProps,
    renderChildren,
    renderInlineChildren,
    rendererSpecByName,
  }
  const rendererKindHandlers: Partial<
    Record<
      RendererKind,
      (
        node: AgentComponentNode,
        rendererSpec: RendererSpecComponent,
        path: RendererPath,
      ) => React.ReactNode
    >
  > = {
    ...createUiRenderer(rendererContext),
    ...createLayoutRenderer(rendererContext),
  }

  return RendererNode
}

function mergeClassNames(...values: Array<string | undefined>) {
  return values.filter(Boolean).join(" ") || undefined
}

function collapseTextNodeWhitespace(value: string) {
  return value.replace(/\s+/g, " ").trim()
}

function appendRendererPath(path: RendererPath, ...segments: Array<number | string>) {
  return [...path, ...segments]
}

function isRuntimeRenderableKind(kind: string): kind is RendererKind {
  return runtimeRendererKinds.includes(kind as RendererKind)
}
