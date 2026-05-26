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

  it("releases a single-child grid after moving a column away", () => {
    const document = parseAgentHtml(`<Page title="Release">
  <Stack>
    <Grid columns="2">
      <Text>A</Text>
      <Text>B</Text>
    </Grid>
    <Text>C</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Grid[0]/Text[0]",
      intent: { type: "after", targetPath: "/Page/Stack[0]/Text[0]" },
    })
    const serialized = serializeAgentHtml(next)

    expect(serialized).not.toContain("<Grid")
    expect(serialized).toContain(
      `<Text>B</Text>\n    <Text>C</Text>\n    <Text>A</Text>`
    )
  })

  it("updates grid columns after moving one child out of a larger grid", () => {
    const document = parseAgentHtml(`<Page title="Release">
  <Stack>
    <Grid columns="3">
      <Text>A</Text>
      <Text>B</Text>
      <Text>C</Text>
    </Grid>
    <Text>D</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Grid[0]/Text[0]",
      intent: { type: "after", targetPath: "/Page/Stack[0]/Text[0]" },
    })
    const serialized = serializeAgentHtml(next)

    expect(serialized).toContain(`<Grid columns="2">`)
    expect(serialized).toContain(`<Text>B</Text>\n      <Text>C</Text>`)
  })

  it("keeps equivalent same-grid column drops as no-op", () => {
    const source = `<Page title="Noop">
  <Stack>
    <Grid columns="2">
      <Text>A</Text>
      <Text>B</Text>
    </Grid>
  </Stack>
</Page>
`
    const document = parseAgentHtml(source)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Grid[0]/Text[0]",
      intent: {
        type: "column-before",
        targetPath: "/Page/Stack[0]/Grid[0]/Text[1]",
      },
    })

    expect(serializeAgentHtml(next)).toBe(source)
  })

  it("removes empty layout containers after a drop", () => {
    const document = parseAgentHtml(`<Page title="Empty">
  <Stack>
    <Stack>
      <Text>A</Text>
    </Stack>
    <Text>B</Text>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Stack[0]/Text[0]",
      intent: { type: "after", targetPath: "/Page/Stack[0]/Text[0]" },
    })
    const serialized = serializeAgentHtml(next)

    expect(serialized).not.toContain(`    <Stack>\n    </Stack>`)
    expect(serialized).toContain(`<Text>B</Text>\n    <Text>A</Text>`)
  })

  it("moves inside a grid item stack instead of adding a grid column", () => {
    const document = parseAgentHtml(`<Page title="Grid item">
  <Stack>
    <Text>Outside</Text>
    <Grid columns="2">
      <Stack>
        <Text>A</Text>
      </Stack>
      <Stack>
        <Text>B</Text>
      </Stack>
    </Grid>
  </Stack>
</Page>`)

    const next = applyAgentHtmlDropIntent(document, {
      sourcePath: "/Page/Stack[0]/Text[0]",
      intent: { type: "inside", targetPath: "/Page/Stack[0]/Grid[0]/Stack[0]" },
    })
    const serialized = serializeAgentHtml(next)

    expect(serialized).toContain(`<Grid columns="2">`)
    expect(serialized).toContain(
      `<Stack>\n        <Text>A</Text>\n        <Text>Outside</Text>\n      </Stack>`
    )
    expect(serialized).not.toContain(`<Grid columns="3">`)
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
