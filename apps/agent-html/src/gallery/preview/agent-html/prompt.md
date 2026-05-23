# Gallery Preview DSL

## Contract

- Output only Gallery Preview DSL.
- Use JSX-like XML tags with `PascalCase`.
- Root must be `<Page>`.
- Attribute values must be quoted scalars.
  Example: `gap="md"`, `columns="2"`, `value="82"`.
- Do not use `class`, `className`, `style`, imports, fragments, hooks, JS expressions, or raw HTML.
- Do not use unknown tags or unknown attrs.
- Do not put bare text directly under `Page`, `Stack`, `Cluster`, or `Grid`.

## Defaults

- `Page gap="md"`
- `Stack gap="md"`
- `Cluster gap="md" justify="start" wrap="true"`
- `Grid columns="2" gap="md"`
- `Alert variant="default"`
- `Card size="default"`
- `Carousel orientation="horizontal"`
- `Separator orientation="horizontal"`
- `Tabs orientation="horizontal"`
- `ChartTooltip hideLabel="false"`

## Layout

- `Page:title=string, gap?="xs|sm|md|lg" -> Layout | UI`
- `Stack:gap?="xs|sm|md|lg" -> Layout | UI`
- `Cluster:gap?="xs|sm|md|lg", justify?="start|center|end|between", wrap?="true|false" -> Layout | UI`
- `Grid:columns?="1|2|3|4", gap?="xs|sm|md|lg" -> Layout | UI`

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

- `Chart:type="area|bar" -> ChartSeries+, ChartTooltip?`
- `ChartSeries:key=string, label?=string`
- `ChartTooltip:hideLabel?="true|false" -> none`

- `Icon:name=string -> none`

## Canonical Example

```xml
<Page title="Gallery Preview" gap="lg">
  <Stack gap="lg">
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
            <Stack gap="sm">
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

    <Grid columns="2" gap="md">
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
    </Grid>
  </Stack>
</Page>
```

## Never

- No `<div>`, `<p>`, `<span>`, `<img>`, or raw HTML tags.
- No `class`, `className`, or `style`.
- No JSX expressions like `{50}` or `{16 / 9}`.
- No unknown tags.
- No `TabsPanel`.
- No bare text under `Page`, `Stack`, `Cluster`, or `Grid`.
