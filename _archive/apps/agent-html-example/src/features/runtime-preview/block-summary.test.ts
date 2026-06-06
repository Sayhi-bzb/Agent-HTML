import { describe, expect, it } from "vitest"

import type { AgentHtmlElementNode } from "@/agent-html/ast/types"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import {
  createAgentHtmlBlockSummaryMap,
  summarizeAgentHtmlBlock,
} from "@example/features/runtime-preview/block-summary"

describe("block summary", () => {
  it("keeps explicit block boundaries and omits layout wrappers", () => {
    const document = parseAgentHtml(`<Cell title="Summary">
  <Stack>
    <Block>
      <Stack>
        <Text variant="lead">A longer title that should not leak.</Text>
        <Text>Another line.</Text>
      </Stack>
    </Block>
  </Stack>
</Cell>`)

    expect(
      summarizeAgentHtmlBlock(
        ((document.root.children[0] as AgentHtmlElementNode)
          .children[0] as AgentHtmlElementNode)
      )
    ).toBe(
      [
        "<Block>",
        "  <Text>...</Text>",
        "  <Text>...</Text>",
        "</Block>",
      ].join("\n")
    )
  })

  it("summarizes chart anatomy without attrs or values", () => {
    const document = parseAgentHtml(`<Cell title="Summary">
  <Stack>
    <Block>
      <Stack>
        <Chart type="bar">
          <ChartSeries key="ahtml" label="AHTML" />
          <ChartSeries key="html" label="HTML" />
          <ChartRow label="Source tokens" ahtml="3600" html="19871" />
          <ChartTooltip hideLabel="false" />
        </Chart>
      </Stack>
    </Block>
  </Stack>
</Cell>`)

    expect(createAgentHtmlBlockSummaryMap(document)["/Cell/Stack[0]/Block[0]"]).toBe(
      [
        "<Block>",
        "  <Chart>",
        "    <ChartSeries/>",
        "    <ChartSeries/>",
        "    <ChartRow/>",
        "    <ChartTooltip/>",
        "  </Chart>",
        "</Block>",
      ].join("\n")
    )
  })

  it("omits component text when an element has child components", () => {
    const document = parseAgentHtml(`<Cell title="Summary">
  <Stack>
    <Block>
      <Stack>
        <Button label="Save">
          Save changes
          <Icon name="Check" />
        </Button>
      </Stack>
    </Block>
  </Stack>
</Cell>`)

    expect(createAgentHtmlBlockSummaryMap(document)["/Cell/Stack[0]/Block[0]"]).toBe(
      ["<Block>", "  <Button>", "    <Icon/>", "  </Button>", "</Block>"].join("\n")
    )
  })

  it("truncates long summaries before rendering overflow", () => {
    const document = parseAgentHtml(`<Cell title="Summary">
  <Stack>
    <Block>
      <Stack>
        <Text>One</Text>
        <Text>Two</Text>
        <Text>Three</Text>
        <Text>Four</Text>
        <Text>Five</Text>
        <Text>Six</Text>
        <Text>Seven</Text>
        <Text>Eight</Text>
        <Text>Nine</Text>
        <Text>Ten</Text>
        <Image src="https://example.com/a.png" alt="Eleven" />
      </Stack>
    </Block>
  </Stack>
</Cell>`)
    const summary = createAgentHtmlBlockSummaryMap(document)[
      "/Cell/Stack[0]/Block[0]"
    ]
    const lines = summary.split("\n")

    expect(lines).toHaveLength(10)
    expect(lines.at(-1)).toBe("...")
    expect(summary).not.toContain("<Image/>")
  })

  it("only creates summaries for explicit blocks", () => {
    const document = parseAgentHtml(`<Cell title="Summary">
  <Stack>
    <Block><Text>Only block</Text></Block>
  </Stack>
</Cell>`)
    const summaries = createAgentHtmlBlockSummaryMap(document)

    expect(Object.keys(summaries)).toEqual(["/Cell/Stack[0]/Block[0]"])
  })
})
