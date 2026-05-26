import { describe, expect, it } from "vitest"

import { applyAgentHtmlDropIntent } from "@/agent-html/edit/apply-drop-intent"
import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"
import { serializeAgentHtml } from "@/agent-html/ast/serialize-agent-html"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"

describe("applyAgentHtmlDropIntent", () => {
  it("moves a block after a sibling", () => {
    const document = parseAgentHtml(`<Page title="Move">
  <Stack>
    <Text>A</Text>
    <Text>B</Text>
    <Text>C</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[0]",
      intent: { type: "after", targetPath: "/Page/Stack[0]/Text[2]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Text>B</Text>\n    <Text>C</Text>\n    <Text>A</Text>`
    )
  })

  it("moves a block before a sibling", () => {
    const document = parseAgentHtml(`<Page title="Move">
  <Stack>
    <Text>A</Text>
    <Text>B</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[1]",
      intent: { type: "before", targetPath: "/Page/Stack[0]/Text[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Text>B</Text>\n    <Text>A</Text>`
    )
  })

  it("moves a block inside a layout target", () => {
    const document = parseAgentHtml(`<Page title="Inside">
  <Stack>
    <Text>A</Text>
    <Stack>
      <Text>B</Text>
    </Stack>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[0]",
      intent: { type: "inside", targetPath: "/Page/Stack[0]/Stack[0]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Stack>\n      <Text>B</Text>\n      <Text>A</Text>\n    </Stack>`
    )
  })

  it("falls back to target parent for inside on non-layout targets", () => {
    const document = parseAgentHtml(`<Page title="Inside">
  <Stack>
    <Text>A</Text>
    <Text>B</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[0]",
      intent: { type: "inside", targetPath: "/Page/Stack[0]/Text[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(
      `<Text>B</Text>\n    <Text>A</Text>`
    )
  })

  it("creates a grid for column intent", () => {
    const document = parseAgentHtml(`<Page title="Columns">
  <Stack>
    <Text>A</Text>
    <Text>B</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[0]",
      intent: { type: "column-after", targetPath: "/Page/Stack[0]/Text[1]" },
    })

    expect(serializeAgentHtml(next)).toContain(`<Grid columns="2">`)
    expect(serializeAgentHtml(next)).toContain(
      `<Text>B</Text>\n      <Text>A</Text>`
    )
  })

  it("rejects moving a block into itself", () => {
    const document = parseAgentHtml(`<Page title="Invalid">
  <Stack>
    <Stack>
      <Text>A</Text>
    </Stack>
  </Stack>
</Page>`)

    expect(() =>
      applyAgentHtmlDropIntent(document, {
        sourcePath: "/Page/Stack[0]",
        intent: { type: "inside", targetPath: "/Page/Stack[0]/Stack[0]" },
      })
    ).toThrow("Cannot move a block into itself")
  })

  it("supports parse to infer to transform to serialize integration", () => {
    const document = parseAgentHtml(`<Page title="Integration">
  <Stack>
    <Stack>
      <Text variant="h2">Section</Text>
      <Grid columns="2">
        <Stack><Text>A</Text><Alert><AlertTitle>Alpha</AlertTitle></Alert></Stack>
        <Stack><Text>B</Text><Alert><AlertTitle>Beta</AlertTitle></Alert></Stack>
      </Grid>
    </Stack>
  </Stack>
</Page>`)
    const units = inferAgentHtmlInteractionUnits(document)
    const [source, target] = units.blocks

    expect(source).toBeDefined()
    expect(target).toBeDefined()

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: source.path,
      intent: { type: "after", targetPath: target.path },
    })
    const reparsed = parseAgentHtml(serializeAgentHtml(next))

    expect(validateAgentHtml(reparsed)).toMatchObject({ ok: true })
  })
})
