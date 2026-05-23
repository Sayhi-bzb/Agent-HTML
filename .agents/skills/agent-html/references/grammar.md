# Agent-HTML Grammar

Source of truth lives in:

- `src/agent-html/schema/prompt.md`

Use that file when you need the full grammar.

## Core Contract

- Output only `agent-html` DSL.
- Use JSX-like XML tags with `PascalCase`.
- Root must be `<Page>`.
- Attr values must be quoted scalars.
- Do not use `class`, `className`, `style`, imports, fragments, hooks, JS expressions, or raw HTML.
- Do not use unknown tags or unknown attrs.
- Do not put bare text directly under `Page`, `Stack`, `Cluster`, or `Grid`.

## Layout

- `Page:title=string, gap?="xs|sm|md|lg"`
- `Stack:gap?="xs|sm|md|lg"`
- `Cluster:gap?="xs|sm|md|lg", justify?="start|center|end|between", wrap?="true|false"`
- `Grid:columns?="1|2|3|4", gap?="xs|sm|md|lg"`

## Supported UI Tags

- `Accordion`, `AccordionItem`, `AccordionTrigger`, `AccordionContent`
- `Alert`, `AlertTitle`, `AlertDescription`, `AlertAction`
- `AspectRatio`
- `Badge`
- `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardAction`, `CardContent`, `CardFooter`
- `Carousel`, `CarouselContent`, `CarouselItem`, `CarouselPrevious`, `CarouselNext`
- `Progress`
- `Separator`
- `Table`, `TableCaption`, `TableHeader`, `TableBody`, `TableFooter`, `TableRow`, `TableHead`, `TableCell`
- `Tabs`, `TabsList`, `TabsTrigger`, `TabsContent`
- `Chart`, `ChartSeries`, `ChartTooltip`
- `Icon`

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

## Icon

- `Icon:name=string -> none`
- Names use Lucide kebab-case names.
- Do not guess icon names. Use the icon search helper if unsure.
