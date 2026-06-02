import { describe, expect, it } from "vitest"

import { applyAgentHtmlDropIntent } from "@/agent-html/edit/apply-drop-intent"
import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { serializeAgentHtml } from "@/agent-html/ast/serialize-agent-html"

describe("applyAgentHtmlDropIntent", () => {
  it("moves an explicit block after a sibling", () => {
    const document = parseAgentHtml(`<Cell title="Move">
  <Block><Text>A</Text></Block>
  <Block><Text>B</Text></Block>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Block[0]",
      intent: { type: "after", targetPath: "/Cell/Block[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n    <Text>B</Text>\n  </Block>\n  <Block>\n    <Text>A</Text>`
    )
  })

  it("moves an explicit block before a sibling", () => {
    const document = parseAgentHtml(`<Cell title="Move">
  <Block><Text>A</Text></Block>
  <Block><Text>B</Text></Block>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Block[1]",
      intent: { type: "before", targetPath: "/Cell/Block[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n    <Text>B</Text>\n  </Block>\n  <Block>\n    <Text>A</Text>`
    )
  })

  it("moves an explicit block inside a layout target", () => {
    const document = parseAgentHtml(`<Cell title="Inside">
  <Block><Text>A</Text></Block>
  <Grid columns="2">
    <Block><Text>B</Text></Block>
  </Grid>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Block[0]",
      intent: { type: "inside", targetPath: "/Cell/Grid[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Grid columns="2">\n    <Block>\n      <Text>B</Text>\n    </Block>\n    <Block>\n      <Text>A</Text>`
    )
  })

  it("creates a grid around explicit blocks for column placement", () => {
    const document = parseAgentHtml(`<Cell title="Columns">
  <Block><Text>A</Text></Block>
  <Block><Text>B</Text></Block>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Block[0]",
      intent: { type: "column-after", targetPath: "/Cell/Block[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(`<Grid columns="2">`)
  })

  it("rejects moving a block into itself", () => {
    const document = parseAgentHtml(`<Cell title="Invalid">
  <Block>
    <Stack><Text>A</Text></Stack>
  </Block>
</Cell>`)

    expect(() =>
      applyAgentHtmlDropIntent(document, {
        sourcePath: "/Cell/Block[0]",
        intent: { type: "inside", targetPath: "/Cell/Block[0]/Stack[0]" },
      })
    ).toThrow("Cannot move a block into itself")
  })

  it("works with interaction units from explicit blocks", () => {
    const document = parseAgentHtml(`<Cell title="Integration">
  <Block><Text>A</Text></Block>
  <Block><Text>B</Text></Block>
</Cell>`)
    const units = inferAgentHtmlInteractionUnits(document)
    const [source, target] = units.blocks

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: source.path,
      intent: { type: "after", targetPath: target.path },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n    <Text>B</Text>\n  </Block>\n  <Block>\n    <Text>A</Text>`
    )
  })
})
