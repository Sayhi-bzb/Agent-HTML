import { describe, expect, it } from "vitest"

import { inferAgentHtmlInteractionUnits } from "@/agent-html/interaction/infer-interaction-units"
import { parseAgentHtml } from "@/agent-html/parse/parse-agent-html"

const edgeCases = [
  {
    title: "baseline report sections",
    expected: { blocks: 4, groups: 1, internal: 0 },
    source: `<Page title="baseline">
  <Section>
    <Stack>
      <Stack>
        <Text variant="h2">Data becomes UI</Text>
        <Text variant="muted">Charts render from declarative series and rows.</Text>
        <Grid columns="2">
          <Stack>
            <Text variant="h3">Bar chart</Text>
            <Text variant="muted">Token cost by authoring surface.</Text>
            <Chart type="bar"><ChartSeries key="ahtml" /><ChartRow label="Source" ahtml="3600" /></Chart>
          </Stack>
          <Stack>
            <Text variant="h3">Line chart</Text>
            <Text variant="muted">Structure grows without exposing internals.</Text>
            <Chart type="area"><ChartSeries key="ahtml" /><ChartRow label="Hero" ahtml="24" /></Chart>
          </Stack>
        </Grid>
      </Stack>
    </Stack>
  </Section>
</Page>`,
  },
  {
    title: "wrapper-depth stress",
    expected: { blocks: 5, groups: 1, internal: 0 },
    source: `<Page title="depth">
  <Section>
    <Stack>
      <Stack>
        <Stack>
          <Stack>
            <Text variant="h2">Deep wrapper title</Text>
            <Text variant="muted">Only content-bearing leaves should be interactive.</Text>
            <Grid columns="3">
              <Stack><Text variant="h3">One</Text><Alert><AlertTitle>Alpha</AlertTitle></Alert></Stack>
              <Stack><Text variant="h3">Two</Text><Table><TableBody><TableRow><TableCell>Beta</TableCell></TableRow></TableBody></Table></Stack>
              <Stack><Text variant="h3">Three</Text><CodeBlock language="json">{ "ok": true }</CodeBlock></Stack>
            </Grid>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  </Section>
</Page>`,
  },
  {
    title: "component anatomy",
    expected: { blocks: 4, groups: 2, internal: 3 },
    source: `<Page title="component anatomy">
  <Section>
    <Stack>
      <Text variant="h2">Interactive widgets</Text>
      <Grid columns="2">
        <Card>
          <CardHeader><CardTitle>Card header</CardTitle><CardDescription>Header anatomy.</CardDescription></CardHeader>
          <CardContent>
            <Stack><Text variant="h3">Internal card stack</Text><Text variant="muted">Should be internal, not draggable.</Text></Stack>
          </CardContent>
        </Card>
        <Stack>
          <Text variant="h3">Tabs wrapper</Text>
          <Tabs defaultValue="one">
            <TabsList><TabsTrigger value="one">One</TabsTrigger></TabsList>
            <TabsContent value="one"><Stack><Text variant="small">Internal tab layout.</Text><Badge>Do not split</Badge></Stack></TabsContent>
          </Tabs>
        </Stack>
      </Grid>
      <Accordion type="single">
        <AccordionItem value="a"><AccordionTrigger>Accordion</AccordionTrigger><AccordionContent><Stack><Alert><AlertTitle>Internal accordion stack</AlertTitle></Alert></Stack></AccordionContent></AccordionItem>
      </Accordion>
    </Stack>
  </Section>
</Page>`,
  },
  {
    title: "mixed direct content",
    expected: { blocks: 6, groups: 1, internal: 0 },
    source: `<Page title="mixed">
  <Section>
    <Stack>
      <Text variant="h2">Release notes</Text>
      <Text variant="muted">A flat stack has multiple direct content nodes.</Text>
      <Separator />
      <Alert><AlertTitle>Risk accepted</AlertTitle><AlertDescription>Visible as one block.</AlertDescription></Alert>
      <Cluster><Badge>Parser</Badge><Badge>Validator</Badge><Badge>Renderer</Badge></Cluster>
      <Grid columns="2">
        <Stack><Text variant="h3">Left</Text><Image src="/left.png" alt="left" /></Stack>
        <Stack><Text variant="h3">Right</Text><Image src="/right.png" alt="right" /></Stack>
      </Grid>
    </Stack>
  </Section>
</Page>`,
  },
  {
    title: "data-heavy primitive",
    expected: { blocks: 3, groups: 1, internal: 0 },
    source: `<Page title="data">
  <Section>
    <Stack>
      <Text variant="h2">Revenue model</Text>
      <Grid columns="2">
        <Stack>
          <Text variant="h3">Series chart</Text>
          <Chart type="bar">
            <ChartSeries key="free" label="Free" />
            <ChartSeries key="pro" label="Pro" />
            <ChartSeries key="team" label="Team" />
            <ChartRow label="Q1" free="12" pro="24" team="9" />
            <ChartRow label="Q2" free="16" pro="31" team="14" />
            <ChartTooltip hideLabel="false" />
          </Chart>
        </Stack>
        <Stack>
          <Text variant="h3">Dense table</Text>
          <Table><TableHeader><TableRow><TableHead>Plan</TableHead><TableHead>MRR</TableHead></TableRow></TableHeader><TableBody><TableRow><TableCell>Pro</TableCell><TableCell>31</TableCell></TableRow></TableBody></Table>
        </Stack>
      </Grid>
    </Stack>
  </Section>
</Page>`,
  },
  {
    title: "grid inside grid",
    expected: { blocks: 5, groups: 2, internal: 1 },
    source: `<Page title="grid">
  <Section>
    <Stack>
      <Text variant="h2">Dashboard shell</Text>
      <Grid columns="2">
        <Stack>
          <Text variant="h3">Primary column</Text>
          <Grid columns="2">
            <Stack><Text variant="h3">CPU</Text><Progress value="72" /></Stack>
            <Stack><Text variant="h3">Memory</Text><Progress value="58" /></Stack>
          </Grid>
        </Stack>
        <Stack>
          <Text variant="h3">Secondary column</Text>
          <Timeline><TimelineItem><TimelineTitle>Deploy</TimelineTitle><TimelineContent><Stack><Text variant="small">Internal timeline stack.</Text></Stack></TimelineContent></TimelineItem></Timeline>
        </Stack>
      </Grid>
    </Stack>
  </Section>
</Page>`,
  },
]

describe("inferAgentHtmlInteractionUnits", () => {
  it.each(edgeCases)("infers edge case: $title", ({ expected, source }) => {
    const document = parseAgentHtml(source)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.diagnostics).toMatchObject({
      ok: true,
      blockGroupOverlap: [],
      blockInternalOverlap: [],
      duplicateBlocks: [],
      groupInternalOverlap: [],
      nestedBlocks: [],
    })
    expect(result.blocks).toHaveLength(expected.blocks)
    expect(result.groups).toHaveLength(expected.groups)
    expect(result.internal).toHaveLength(expected.internal)
  })

  it("lifts direct group content without exposing chart data children", () => {
    const document = parseAgentHtml(edgeCases[4].source)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.blocks.some((unit) => unit.tag === "ChartRow")).toBe(false)
    expect(result.blocks.some((unit) => unit.tag === "ChartSeries")).toBe(false)
    expect(result.blocks.some((unit) => unit.tag === "Text")).toBe(true)
  })

  it("keeps component anatomy layouts internal", () => {
    const document = parseAgentHtml(edgeCases[2].source)
    const result = inferAgentHtmlInteractionUnits(document)

    expect(result.internal.map((unit) => unit.tag)).toEqual([
      "Stack",
      "Stack",
      "Stack",
    ])
  })
})
