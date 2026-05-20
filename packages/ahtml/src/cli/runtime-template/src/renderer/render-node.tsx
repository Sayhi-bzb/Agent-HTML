import React from "react"

import { createLayoutRenderer } from "./render-layout-node"
import { type RendererKind, runtimeRendererKinds } from "./kinds"
import type {
  AgentComponentNode,
  AgentNode,
  RendererPath,
  RendererSpecComponent,
  RendererTextMode,
} from "./types"
import { createUiRenderer } from "./render-ui-node"

export function createRendererNode(
  rendererSpecByName: Map<string, RendererSpecComponent>,
  componentTreatments: Record<string, string> = {},
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
  ) {
    const treatment = componentTreatments[node.name]
    const className = mergeClassNames(
      rendererSpec.rootClassName,
      treatment ? componentTreatmentClassNames[treatment] : undefined,
    )

    return {
      "data-agent-html-component": node.name,
      ...(treatment ? { "data-ahtml-treatment": treatment } : {}),
      ...(className ? { className } : {}),
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

const componentTreatmentClassNames: Record<string, string> = {
  "ops-alert": "border border-border/80 bg-card/95 shadow-sm",
  "ops-badge": "uppercase tracking-[0.18em] text-[0.65rem]",
  "ops-card": "rounded-xl border-border/80 shadow-sm",
  "ops-field": "gap-2 [&_input]:h-9 [&_textarea]:min-h-28",
  "ops-table":
    "[&_td]:py-2 [&_th]:py-2 [&_th]:text-[0.68rem] [&_th]:uppercase [&_th]:tracking-[0.2em]",
  "ops-tabs":
    "gap-4 [&_[data-slot=tabs-list]]:mb-1 [&_button]:h-8 [&_button]:text-xs [&_button]:tracking-[0.1em]",
  "report-alert":
    "border-l-4 border-l-primary/70 shadow-sm [&_[data-slot=alert-description]]:max-w-[66ch]",
  "report-badge": "uppercase tracking-[0.14em] self-start",
  "report-card":
    "rounded-[1.6rem] border-border/70 bg-card/96 shadow-[0_20px_70px_color-mix(in_srgb,var(--foreground)_7%,transparent)]",
  "report-field": "gap-3 [&_input]:bg-card/90 [&_textarea]:bg-card/90",
  "report-table":
    "[&_td]:align-top [&_td]:py-3 [&_th]:pb-3 [&_th]:text-xs [&_th]:uppercase [&_th]:tracking-[0.16em]",
  "report-tabs":
    "gap-5 [&_[data-slot=tabs-list]]:mb-2 [&_button]:rounded-full [&_button]:px-3.5 [&_button]:tracking-[0.02em]",
  "review-alert": "border-l-4 border-l-foreground/30 bg-muted/35",
  "review-badge": "font-semibold tracking-[0.1em] self-start",
  "review-card": "rounded-xl border-border/90",
  "review-field":
    "gap-2 [&_input]:border-border/90 [&_textarea]:border-border/90",
  "review-table": "[&_td]:align-top [&_td]:py-2 [&_th]:text-[0.72rem]",
  "review-tabs":
    "gap-4 [&_[data-slot=tabs-list]]:mb-1 [&_button]:font-medium [&_button]:tracking-[0.05em]",
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
