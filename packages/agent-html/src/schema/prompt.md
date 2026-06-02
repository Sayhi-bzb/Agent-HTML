# Gallery Preview DSL

## Contract

- Output only Gallery Preview DSL.
- Use JSX-like XML tags with `PascalCase`.
- Root must be `<Cell>`.
- Attribute values must be quoted scalars.
  Example: `columns="2"`, `value="82"`.
- Do not use `class`, `className`, `style`, imports, fragments, hooks, JS expressions, or raw HTML.
- Do not use unknown tags or unknown attrs.
- Do not put bare text directly under `Cell`, `Block`, `Stack`, `Cluster`, or `Grid`.
- `Cell` must contain layout. UI must be inside `Block`.

## Defaults

- `Cluster justify="start" wrap="true"`
- `Grid columns="2"`
- `Section width="content"`
- `Alert variant="default"`
- `Card size="default"`
- `Carousel orientation="horizontal"`
- `Separator orientation="horizontal"`
- `Tabs orientation="horizontal"`
- `ChartTooltip hideLabel="false"`

## Layout

- `Cell:title=string -> Layout`
- `Block -> Layout | UI`
- `Section:width?="full|content|reader" -> Block | Layout | UI`
- `Stack -> Block | Layout | UI`
- `Cluster:justify?="start|center|end|between", wrap?="true|false" -> Block | Layout | UI`
- `Grid:columns?="1|2|3|4" -> Block | Layout | UI`

## UI

- `Accordion:type="single|multiple" -> AccordionItem+`
- `AccordionItem:value?=string, disabled?="true|false" -> AccordionTrigger, AccordionContent`
- `AccordionTrigger -> Text`
- `AccordionContent -> Layout | UI | Text`

- `Alert:variant?="default|destructive" -> Icon?, AlertTitle?, AlertDescription?, AlertAction?`
- `AlertTitle -> Text`
- `AlertDescription -> Text`
- `AlertAction -> Layout | UI | Text`

- `AspectRatio:ratio=number -> Layout | UI`

- `Badge:variant?="default|secondary|destructive|outline|ghost|link" -> Text, Icon?`

- `Button:variant?="default|outline|ghost|destructive|secondary|link", href?=string, label?=string -> Text, Icon?`

- `Card:size?="default|sm" -> CardHeader?, CardContent?, CardFooter?`
- `CardHeader -> CardTitle?, CardDescription?, CardAction?`
- `CardTitle -> Text`
- `CardDescription -> Text`
- `CardAction -> Layout | UI | Text`
- `CardContent -> Layout | UI | Text`
- `CardFooter -> Layout | UI | Text`

- `Carousel:orientation?="horizontal|vertical" -> CarouselContent, CarouselPrevious?, CarouselNext?`
- `CarouselContent -> CarouselItem+`
- `CarouselItem -> Layout | UI | Text`
- `CarouselPrevious -> none`
- `CarouselNext -> none`

- `Progress:value=number -> none`

- `Separator:orientation?="horizontal|vertical" -> none`

- `Table -> TableCaption?, TableHeader?, TableBody?, TableFooter?`
- `TableCaption -> Text`
- `TableHeader -> TableRow+`
- `TableBody -> TableRow+`
- `TableFooter -> TableRow+`
- `TableRow -> TableHead+ | TableCell+`
- `TableHead -> Text`
- `TableCell -> Layout | UI | Text`

- `Tabs:orientation?="horizontal|vertical", defaultValue?=string -> TabsList, TabsContent+`
- `TabsList -> TabsTrigger+`
- `TabsTrigger:value=string, disabled?="true|false" -> Text, Icon?`
- `TabsContent:value=string -> Layout | UI | Text`

- `Timeline -> TimelineItem+`
- `TimelineItem:icon?=string, status?="default|complete|current|muted", meta?=string -> TimelineTitle, TimelineDescription?, TimelineContent?`
- `TimelineTitle -> Text`
- `TimelineDescription -> Text`
- `TimelineContent -> Layout | UI | Text`

- `Chart:type="area|bar" -> ChartSeries+, ChartRow+, ChartTooltip?`
- `ChartSeries:key=string, label?=string`
- `ChartRow:label=string, [series key]=number -> none`
- `ChartTooltip:hideLabel?="true|false" -> none`

- `CodeBlock:language="ahtml|html|tsx|jsx|ts|js|json|bash", title?=string -> raw code text`

- `Icon:name=string -> none`
- `Image:src=string, alt=string, fit?="cover|contain" -> none`
- `Kanban -> KanbanColumn+`
- `KanbanColumn:value=string, title=string -> KanbanItem+`
- `KanbanItem:value=string -> Layout | UI | Text`
- `Text:variant?="h1|h2|h3|h4|p|lead|large|small|muted|inline-code" -> Text`

## Canonical Example

```xml
<Cell title="Gallery Preview">
  <Stack>
    <Block>
      <Section width="reader">
        <Stack>
          <Text variant="muted">Use Text for standalone copy inside layout nodes.</Text>
          <Cluster wrap="true">
            <Button>Save changes</Button>
            <Button variant="outline" href="/docs">Read docs</Button>
          </Cluster>
          <CodeBlock language="tsx" title="Example.tsx">
function Example() {
  return <div>Hello</div>
}
          </CodeBlock>
        </Stack>
      </Section>
    </Block>

    <Block>
      <Section>
        <Card>
          <CardHeader>
            <CardTitle>Controls</CardTitle>
            <CardDescription>Preview action and state tokens.</CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="publish">
              <TabsList>
                <TabsTrigger value="publish">Publish</TabsTrigger>
                <TabsTrigger value="review">Review</TabsTrigger>
              </TabsList>
              <TabsContent value="publish">
                <Stack>
                  <Badge variant="secondary">82%</Badge>
                  <Progress value="82" />
                </Stack>
              </TabsContent>
              <TabsContent value="review">
                <Alert>
                  <AlertTitle>Review queue</AlertTitle>
                  <AlertDescription>5 items remain.</AlertDescription>
                </Alert>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </Section>
    </Block>

    <Grid columns="2">
      <Block>
        <Card>
          <CardContent>
            <Accordion type="single">
              <AccordionItem value="notes">
                <AccordionTrigger>Migration notes</AccordionTrigger>
                <AccordionContent>
                  <Badge variant="outline">Pending</Badge>
                </AccordionContent>
              </AccordionItem>
            </Accordion>
          </CardContent>
        </Card>
      </Block>

      <Block>
        <Card>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Signal</TableHead>
                  <TableHead>State</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>Spacing</TableCell>
                  <TableCell>Balanced</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </Block>
    </Grid>
  </Stack>
</Cell>
```

## Never

- No `<div>`, `<p>`, `<span>`, `<img>`, or raw HTML tags.
- No `class`, `className`, or `style`.
- No JSX expressions like `{50}` or `{16 / 9}`.
- No unknown tags.
- No `TabsPanel`.
- No bare text under `Cell`, `Block`, `Stack`, `Cluster`, or `Grid`.
- No UI directly under `Cell`, `Section`, `Stack`, `Cluster`, or `Grid` unless it is inside `Block`.
