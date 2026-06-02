import { describe, expect, it } from "vitest"

import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"

describe("inferAgentHtmlInteractionUnits", () => {
  it("uses explicit Block elements as collaboration units", () => {
    const document = parseAgentHtml(`<Cell title="Explicit">
  <Block>
    <Stack>
      <Text variant="h2">Overview</Text>
      <Grid columns="2">
        <Stack><Text>Left</Text></Stack>
        <Stack><Text>Right</Text></Stack>
      </Grid>
    </Stack>
  </Block>
  <Block>
    <Card><CardContent>Second block</CardContent></Card>
  </Block>
</Cell>`)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.diagnostics.ok).toBe(true)
    expect(result.blocks.map((unit) => unit.path)).toEqual([
      "/Cell/Block[0]",
      "/Cell/Block[1]",
    ])
    expect(result.blocks.every((unit) => unit.tag === "Block")).toBe(true)
  })

  it("does not create blocks from layouts or UI without explicit Block", () => {
    const document = parseAgentHtml(`<Cell title="No automatic blocks">
  <Stack>
    <Text variant="h2">Overview</Text>
    <Grid columns="2">
      <Stack><Text>Left</Text></Stack>
      <Stack><Text>Right</Text></Stack>
    </Grid>
  </Stack>
</Cell>`)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.diagnostics.ok).toBe(true)
    expect(result.blocks).toHaveLength(0)
  })

  it("keeps explicit Block parent metadata", () => {
    const document = parseAgentHtml(`<Cell title="Grid blocks">
  <Grid columns="2">
    <Block><Text>Left</Text></Block>
    <Block><Text>Right</Text></Block>
  </Grid>
</Cell>`)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.blocks[0]).toMatchObject({
      parentPath: "/Cell/Grid[0]",
      parentTag: "Grid",
      role: "flow-block",
      tag: "Block",
    })
  })

  it("keeps motion keys stable when the same explicit Block moves", () => {
    const before = inferAgentHtmlInteractionUnits(
      parseAgentHtml(`<Cell title="Motion">
  <Block><Text>A</Text></Block>
  <Block><Text>B</Text></Block>
</Cell>`)
    )
    const after = inferAgentHtmlInteractionUnits(
      parseAgentHtml(`<Cell title="Motion">
  <Block><Text>B</Text></Block>
  <Block><Text>A</Text></Block>
</Cell>`)
    )
    const beforeA = before.blocks.find((unit) => unit.path === "/Cell/Block[0]")
    const afterA = after.blocks.find((unit) => unit.path === "/Cell/Block[1]")

    expect(beforeA?.motionKey).toBeDefined()
    expect(afterA?.motionKey).toBe(beforeA?.motionKey)
  })
})
