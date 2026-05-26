import { describe, expect, it } from "vitest"

import { parseAgentHtml, type AgentHtmlElementNode } from "@/agent-html"
import {
  createAgentHtmlBlockSummaryMap,
  summarizeAgentHtmlBlock,
} from "@/agent-html-example/features/runtime-preview/block-summary"

describe("block summary", () => {
  it("omits layout wrappers and summarizes text content", () => {
    const document = parseAgentHtml(`<Page title="Summary">
  <Stack>
    <Text variant="lead">A longer title that should not leak.</Text>
    <Text>Another line.</Text>
  </Stack>
</Page>`)

    expect(
      summarizeAgentHtmlBlock(document.root.children[0] as AgentHtmlElementNode)
    ).toBe(
      ["<Text>...</Text>", "<Text>...</Text>"].join("\n")
    )
  })

  it("summarizes chart anatomy without attrs or values", () => {
    const document = parseAgentHtml(`<Page title="Summary">
  <Stack>
    <Chart type="bar">
      <ChartSeries key="ahtml" label="AHTML" />
      <ChartSeries key="html" label="HTML" />
      <ChartRow label="Source tokens" ahtml="3600" html="19871" />
      <ChartTooltip hideLabel="false" />
    </Chart>
  </Stack>
</Page>`)

    expect(createAgentHtmlBlockSummaryMap(document)["/Page/Stack[0]"]).toBe(
      [
        "<Chart>",
        "  <ChartSeries/>",
        "  <ChartSeries/>",
        "  <ChartRow/>",
        "  <ChartTooltip/>",
        "</Chart>",
      ].join("\n")
    )
  })

  it("omits component text when an element has child components", () => {
    const document = parseAgentHtml(`<Page title="Summary">
  <Stack>
    <Button label="Save">
      Save changes
      <Icon name="Check" />
    </Button>
  </Stack>
</Page>`)

    expect(createAgentHtmlBlockSummaryMap(document)["/Page/Stack[0]"]).toBe(
      ["<Button>", "  <Icon/>", "</Button>"].join("\n")
    )
  })

  it("truncates long summaries before rendering overflow", () => {
    const document = parseAgentHtml(`<Page title="Summary">
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
</Page>`)
    const summary = createAgentHtmlBlockSummaryMap(document)["/Page/Stack[0]"]
    const lines = summary.split("\n")

    expect(lines).toHaveLength(10)
    expect(lines.at(-1)).toBe("...")
    expect(summary).not.toContain("<Image/>")
  })
})
