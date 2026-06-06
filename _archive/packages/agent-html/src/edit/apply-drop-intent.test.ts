import { describe, expect, it } from "vitest"

import { applyAgentHtmlDropIntent } from "@/agent-html/edit/apply-drop-intent"
import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { serializeAgentHtml } from "@/agent-html/ast/serialize-agent-html"

describe("applyAgentHtmlDropIntent", () => {
  it("moves an explicit block after a sibling", () => {
    const document = parseAgentHtml(`<Cell title="Move">
  <Stack>
    <Block><Text>A</Text></Block>
    <Block><Text>B</Text></Block>
  </Stack>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Stack[0]/Block[0]",
      intent: { type: "after", targetPath: "/Cell/Stack[0]/Block[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n      <Text>B</Text>\n    </Block>\n    <Block>\n      <Text>A</Text>`
    )
  })

  it("moves an explicit block before a sibling", () => {
    const document = parseAgentHtml(`<Cell title="Move">
  <Stack>
    <Block><Text>A</Text></Block>
    <Block><Text>B</Text></Block>
  </Stack>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Stack[0]/Block[1]",
      intent: { type: "before", targetPath: "/Cell/Stack[0]/Block[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n      <Text>B</Text>\n    </Block>\n    <Block>\n      <Text>A</Text>`
    )
  })

  it("moves an explicit block inside a layout target", () => {
    const document = parseAgentHtml(`<Cell title="Inside">
  <Stack>
    <Block><Text>A</Text></Block>
    <Grid columns="2">
      <Block><Text>B</Text></Block>
    </Grid>
  </Stack>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Stack[0]/Block[0]",
      intent: { type: "inside", targetPath: "/Cell/Stack[0]/Grid[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Grid columns="2">\n      <Block>\n        <Text>B</Text>\n      </Block>\n      <Block>\n        <Text>A</Text>`
    )
  })

  it("creates a grid around explicit blocks for column placement", () => {
    const document = parseAgentHtml(`<Cell title="Columns">
  <Stack>
    <Block><Text>A</Text></Block>
    <Block><Text>B</Text></Block>
  </Stack>
</Cell>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Cell/Stack[0]/Block[0]",
      intent: { type: "column-after", targetPath: "/Cell/Stack[0]/Block[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(`<Grid columns="2">`)
  })

  it("rejects moving a block into itself", () => {
    const document = parseAgentHtml(`<Cell title="Invalid">
  <Stack>
    <Block>
      <Stack><Text>A</Text></Stack>
    </Block>
  </Stack>
</Cell>`)

    expect(() =>
      applyAgentHtmlDropIntent(document, {
        sourcePath: "/Cell/Stack[0]/Block[0]",
        intent: { type: "inside", targetPath: "/Cell/Stack[0]/Block[0]/Stack[0]" },
      })
    ).toThrow("Cannot move a block into itself")
  })

  it("works with interaction units from explicit blocks", () => {
    const document = parseAgentHtml(`<Cell title="Integration">
  <Stack>
    <Block><Text>A</Text></Block>
    <Block><Text>B</Text></Block>
  </Stack>
</Cell>`)
    const units = inferAgentHtmlInteractionUnits(document)
    const [source, target] = units.blocks

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: source.path,
      intent: { type: "after", targetPath: target.path },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Block>\n      <Text>B</Text>\n    </Block>\n    <Block>\n      <Text>A</Text>`
    )
  })
})
