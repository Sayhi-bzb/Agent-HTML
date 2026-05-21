import { resolveElement } from "../elements"
import type { RendererKind } from "../kinds"
import { applyPropMappings, getRendererPropMappings } from "../renderer-props"
import type {
  AgentComponentNode,
  RendererPath,
  RendererSpecComponent,
} from "../types"
import type { UiRenderer, UiRendererContext } from "../ui-renderer-types"
import { resolveMappedProp } from "./helpers/shared-props"
import {
  getSlotChildren,
  requireRendererSpecField,
} from "./helpers/structured-items"
import { appendRendererPath } from "./helpers/text-and-path"

export function createCollectionUiRenderers(context: UiRendererContext) {
  function renderCollectionComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(
      rendererSpec.rootByProp
        ? resolveMappedProp(
            node.props[rendererSpec.rootByProp.prop],
            rendererSpec.rootByProp.map,
            rendererSpec.rootByProp.default,
          )
        : rendererSpec.root,
    )
    const Item = resolveElement(rendererSpec.item)
    const rootProps = {
      ...context.getComponentMetadataProps(node, rendererSpec, path),
      ...applyPropMappings(node.props, getRendererPropMappings(rendererSpec)),
    }

    return (
      <Root {...rootProps}>
        {getSlotChildren(
          node,
          rendererSpec.itemSlot,
          context.rendererSpecByName,
        ).map((item, index) => (
          <Item key={index}>
            {rendererSpec.childMode === "inline"
              ? context.renderInlineChildren(
                  item,
                  appendRendererPath(path, index),
                  rendererSpec.textMode,
                )
              : context.renderChildren(
                  item,
                  appendRendererPath(path, index),
                  rendererSpec.textMode,
                )}
          </Item>
        ))}
      </Root>
    )
  }

  function renderTableComponent(
    node: AgentComponentNode,
    rendererSpec: RendererSpecComponent,
    path: RendererPath,
  ) {
    const Root = resolveElement(rendererSpec.root)
    const Header = resolveElement(rendererSpec.header)
    const Body = resolveElement(rendererSpec.body)
    const rowSlot = requireRendererSpecField(rendererSpec, "rowSlot")
    const cellSlot = requireRendererSpecField(rendererSpec, "cellSlot")
    const rows = getSlotChildren(node, rowSlot, context.rendererSpecByName)
    const headerRows = rows.length > 1 ? rows.slice(0, 1) : []
    const bodyRows = rows.length > 1 ? rows.slice(1) : rows

    return (
      <Root {...context.getComponentMetadataProps(node, rendererSpec, path)}>
        {headerRows.length > 0 ? (
          <Header>
            {headerRows.map((row, index) =>
              renderTableRow(
                row,
                index,
                rendererSpec,
                cellSlot,
                true,
                appendRendererPath(path, "header", index),
                context,
              ),
            )}
          </Header>
        ) : null}
        <Body>
          {bodyRows.map((row, index) =>
            renderTableRow(
              row,
              index,
              rendererSpec,
              cellSlot,
              false,
              appendRendererPath(path, "body", index),
              context,
            ),
          )}
        </Body>
      </Root>
    )
  }

  return {
    collection: renderCollectionComponent,
    table: renderTableComponent,
  } satisfies Partial<Record<RendererKind, UiRenderer>>
}

function renderTableRow(
  row: AgentComponentNode,
  index: number,
  rendererSpec: RendererSpecComponent,
  cellSlot: string,
  isHeader: boolean,
  path: RendererPath,
  context: UiRendererContext,
) {
  const Row = resolveElement(rendererSpec.row)
  const Cell = resolveElement(
    isHeader ? rendererSpec.headerCell : rendererSpec.bodyCell,
  )

  return (
    <Row key={index} data-agent-html-component={row.name}>
      {getSlotChildren(row, cellSlot, context.rendererSpecByName).map(
        (cell, cellIndex) => (
          <Cell key={cellIndex} data-agent-html-component={cell.name}>
            {context.renderInlineChildren(
              cell,
              appendRendererPath(path, cellIndex),
              "prose",
            )}
          </Cell>
        ),
      )}
    </Row>
  )
}
