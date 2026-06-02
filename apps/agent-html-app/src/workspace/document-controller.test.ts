import { describe, expect, it } from "vitest"

import { parseAgentHtml, validateAgentHtml } from "@/agent-html"
import introduceAgentHtmlSource from "@/app/workspace/fixtures/introduce-agent-html.ahtml?raw"
import { migrateWorkspaceDocumentSource } from "@/app/workspace/document-controller"

describe("migrateWorkspaceDocumentSource", () => {
  it("wraps old direct Cell blocks in cell-level layout", () => {
    const nextSource = migrateWorkspaceDocumentSource(`<Cell title="Old">
  <Block><Text>One</Text></Block>
  <Block><Text>Two</Text></Block>
</Cell>`)

    expect(nextSource).toContain("<Cell title=\"Old\">")
    expect(nextSource).toContain("<Stack>")
    expect(nextSource?.match(/<Block>/g)).toHaveLength(2)
    expect(nextSource).toContain("<Text>One</Text>")
    expect(nextSource).toContain("<Text>Two</Text>")
    expect(validateAgentHtml(parseAgentHtml(nextSource ?? "")).ok).toBe(true)
  })

  it("wraps old direct Cell UI in a block", () => {
    const nextSource = migrateWorkspaceDocumentSource(`<Cell title="Old">
  <Card><CardContent>Direct UI</CardContent></Card>
</Cell>`)

    expect(nextSource).toContain("<Stack>")
    expect(nextSource).toContain("<Block>")
    expect(nextSource).toContain("<Card>")
    expect(validateAgentHtml(parseAgentHtml(nextSource ?? "")).ok).toBe(true)
  })

  it("leaves current Cell layout unchanged", () => {
    const source = `<Cell title="Current">
  <Stack>
    <Block><Text>Ready</Text></Block>
  </Stack>
</Cell>`

    expect(migrateWorkspaceDocumentSource(source)).toBeNull()
  })

  it("migrates the old managed English introduce example to explicit blocks", () => {
    const nextSource = migrateWorkspaceDocumentSource(`<Cell title="agent-html">
  <Block>
    <Section width="content">
      <Stack>
        <Text variant="lead">This preview is interactive. Use the page itself to feel how agent-html turns layout nodes into Notion-like blocks.</Text>
        <Separator />
        <Text variant="small">Hover any section until the left-side controls fade in.</Text>
      </Stack>
    </Section>
  </Block>
</Cell>`)

    expect(nextSource).toBe(introduceAgentHtmlSource)
    expect(nextSource?.match(/<Block>/g)?.length).toBeGreaterThan(1)
    expect(validateAgentHtml(parseAgentHtml(nextSource ?? "")).ok).toBe(true)
  })

  it("leaves the current managed English introduce example unchanged", () => {
    expect(migrateWorkspaceDocumentSource(introduceAgentHtmlSource)).toBeNull()
  })

  it("does not split ordinary valid single-block user documents", () => {
    const source = `<Cell title="User">
  <Stack>
    <Block>
      <Stack>
        <Text>Keep this as one authored block.</Text>
        <Text>It is valid user content.</Text>
      </Stack>
    </Block>
  </Stack>
</Cell>`

    expect(migrateWorkspaceDocumentSource(source)).toBeNull()
  })
})
