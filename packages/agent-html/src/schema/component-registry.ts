import { defineAgentHtmlComponent } from "@/agent-html/schema/component-contract"

export const agentHtmlComponentRegistry = [
  defineAgentHtmlComponent({
    tag: "Cell",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    attrs: {
      title: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "Block | Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Block",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Section",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    attrs: {
      width: {
        type: "enum",
        values: ["full", "content", "reader"],
        defaultValue: "content",
        prompt: true,
      },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Stack",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Cluster",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    attrs: {
      justify: {
        type: "enum",
        values: ["start", "center", "end", "between"],
        defaultValue: "start",
        prompt: true,
      },
      wrap: {
        type: "boolean",
        values: ["true", "false"],
        defaultValue: "true",
        prompt: true,
      },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Grid",
    kind: "layout",
    role: "layout",
    runtime: "layout-special",
    attrs: {
      columns: {
        type: "enum",
        values: ["1", "2", "3", "4"],
        defaultValue: "2",
        prompt: true,
      },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Accordion",
    kind: "ui",
    role: "component",
    market: {
      title: "Accordion",
      summary: "Collapsed disclosure sections for dense supporting content.",
      category: "content",
      configurableAttrs: ["type"],
      insertTemplate: `<Accordion type="single">
  <AccordionItem value="item-1">
    <AccordionTrigger>Section</AccordionTrigger>
    <AccordionContent>Details go here.</AccordionContent>
  </AccordionItem>
</Accordion>`,
      previewExample: `<Accordion type="single">
  <AccordionItem value="item-1">
    <AccordionTrigger>Shipping window</AccordionTrigger>
    <AccordionContent>Orders ship within two business days.</AccordionContent>
  </AccordionItem>
</Accordion>`,
    },
    attrs: {
      type: {
        type: "enum",
        values: ["single", "multiple"],
        prompt: true,
      },
    },
    children: { grammar: "AccordionItem+" },
  }),
  defineAgentHtmlComponent({
    tag: "AccordionItem",
    kind: "ui",
    attrs: {
      value: { type: "string", prompt: true },
      disabled: {
        type: "boolean",
        values: ["true", "false"],
        prompt: true,
      },
    },
    children: { grammar: "AccordionTrigger, AccordionContent" },
  }),
  defineAgentHtmlComponent({
    tag: "AccordionTrigger",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "AccordionContent",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Alert",
    kind: "ui",
    role: "component",
    market: {
      title: "Alert",
      summary: "Status message with optional title, description, action, and icon.",
      category: "feedback",
      configurableAttrs: ["variant"],
      insertTemplate: `<Alert variant="default">
  <AlertTitle>Status update</AlertTitle>
  <AlertDescription>Important context goes here.</AlertDescription>
</Alert>`,
      previewExample: `<Alert variant="default">
  <AlertTitle>Build complete</AlertTitle>
  <AlertDescription>The preview is ready to review.</AlertDescription>
</Alert>`,
    },
    attrs: {
      variant: {
        type: "enum",
        values: ["default", "destructive"],
        defaultValue: "default",
        prompt: true,
      },
    },
    children: { grammar: "Icon?, AlertTitle?, AlertDescription?, AlertAction?" },
  }),
  defineAgentHtmlComponent({
    tag: "AlertTitle",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "AlertDescription",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "AlertAction",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "AspectRatio",
    kind: "ui",
    role: "component",
    market: {
      title: "Aspect Ratio",
      summary: "Fixed-ratio frame for media or composed preview content.",
      category: "media",
      configurableAttrs: ["ratio"],
      insertTemplate: `<AspectRatio ratio="1.777">
  <Text>Media preview</Text>
</AspectRatio>`,
      previewExample: `<AspectRatio ratio="1.777">
  <Image src="/images/gallery-preview.jpg" alt="Gallery preview" fit="cover" />
</AspectRatio>`,
    },
    attrs: {
      ratio: { type: "number", required: true, prompt: true },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Badge",
    kind: "ui",
    role: "component",
    market: {
      title: "Badge",
      summary: "Compact label for status, category, or metadata.",
      category: "display",
      configurableAttrs: ["variant"],
      insertTemplate: `<Badge variant="secondary">Label</Badge>`,
      previewExample: `<Badge variant="secondary">Preview</Badge>`,
    },
    attrs: {
      variant: {
        type: "enum",
        values: ["default", "secondary", "destructive", "outline", "ghost", "link"],
        defaultValue: "default",
        prompt: true,
      },
    },
    children: { grammar: "Text, Icon?", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Button",
    kind: "ui",
    role: "component",
    market: {
      title: "Button",
      summary: "Primary action or link with text and optional icon.",
      category: "form",
      configurableAttrs: ["variant", "href", "label"],
      insertTemplate: `<Button variant="default">Action</Button>`,
      previewExample: `<Button variant="default">Open preview</Button>`,
    },
    attrs: {
      variant: {
        type: "enum",
        values: ["default", "outline", "ghost", "destructive", "secondary", "link"],
        defaultValue: "default",
        prompt: true,
      },
      href: { type: "string", prompt: true },
      label: { type: "string", prompt: true },
    },
    children: { grammar: "Text, Icon?", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Card",
    kind: "ui",
    role: "component",
    market: {
      title: "Card",
      summary: "Framed content group with header, body, and footer regions.",
      category: "layout",
      configurableAttrs: ["size"],
      insertTemplate: `<Card>
  <CardHeader>
    <CardTitle>Title</CardTitle>
    <CardDescription>Supporting text.</CardDescription>
  </CardHeader>
  <CardContent>Content goes here.</CardContent>
</Card>`,
      previewExample: `<Card>
  <CardHeader>
    <CardTitle>Component profile</CardTitle>
    <CardDescription>Reusable surface pattern.</CardDescription>
  </CardHeader>
  <CardContent>Ready for insertion.</CardContent>
</Card>`,
    },
    attrs: {
      size: {
        type: "enum",
        values: ["default", "sm"],
        defaultValue: "default",
        prompt: true,
      },
    },
    children: { grammar: "CardHeader?, CardContent?, CardFooter?" },
  }),
  defineAgentHtmlComponent({
    tag: "CardHeader",
    kind: "ui",
    children: { grammar: "CardTitle?, CardDescription?, CardAction?" },
  }),
  defineAgentHtmlComponent({
    tag: "CardTitle",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "CardDescription",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "CardAction",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "CardContent",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "CardFooter",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Carousel",
    kind: "ui",
    role: "component",
    market: {
      title: "Carousel",
      summary: "Paged item rail for sequential previews.",
      category: "navigation",
      configurableAttrs: ["orientation"],
      insertTemplate: `<Carousel orientation="horizontal">
  <CarouselContent>
    <CarouselItem>First item</CarouselItem>
    <CarouselItem>Second item</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
      previewExample: `<Carousel orientation="horizontal">
  <CarouselContent>
    <CarouselItem>Overview</CarouselItem>
    <CarouselItem>Details</CarouselItem>
  </CarouselContent>
  <CarouselPrevious />
  <CarouselNext />
</Carousel>`,
    },
    attrs: {
      orientation: {
        type: "enum",
        values: ["horizontal", "vertical"],
        defaultValue: "horizontal",
        prompt: true,
      },
    },
    children: { grammar: "CarouselContent, CarouselPrevious?, CarouselNext?" },
  }),
  defineAgentHtmlComponent({
    tag: "CarouselContent",
    kind: "ui",
    children: { grammar: "CarouselItem+" },
  }),
  defineAgentHtmlComponent({
    tag: "CarouselItem",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "CarouselPrevious",
    kind: "ui",
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "CarouselNext",
    kind: "ui",
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Progress",
    kind: "ui",
    role: "component",
    market: {
      title: "Progress",
      summary: "Linear completion indicator for bounded status.",
      category: "feedback",
      configurableAttrs: ["value"],
      insertTemplate: `<Progress value="50" />`,
      previewExample: `<Progress value="72" />`,
    },
    attrs: {
      value: { type: "number", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Separator",
    kind: "ui",
    role: "component",
    market: {
      title: "Separator",
      summary: "Visual divider for grouping nearby content.",
      category: "layout",
      configurableAttrs: ["orientation"],
      insertTemplate: `<Separator orientation="horizontal" />`,
      previewExample: `<Separator orientation="horizontal" />`,
    },
    attrs: {
      orientation: {
        type: "enum",
        values: ["horizontal", "vertical"],
        defaultValue: "horizontal",
        prompt: true,
      },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Table",
    kind: "ui",
    role: "component",
    market: {
      title: "Table",
      summary: "Structured rows and columns for comparison data.",
      category: "data",
      insertTemplate: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Name</TableHead>
      <TableHead>Status</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Item</TableCell>
      <TableCell>Ready</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
      previewExample: `<Table>
  <TableHeader>
    <TableRow>
      <TableHead>Component</TableHead>
      <TableHead>State</TableHead>
    </TableRow>
  </TableHeader>
  <TableBody>
    <TableRow>
      <TableCell>Card</TableCell>
      <TableCell>Available</TableCell>
    </TableRow>
  </TableBody>
</Table>`,
    },
    children: { grammar: "TableCaption?, TableHeader?, TableBody?, TableFooter?" },
  }),
  defineAgentHtmlComponent({
    tag: "TableCaption",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "TableHeader",
    kind: "ui",
    children: { grammar: "TableRow+" },
  }),
  defineAgentHtmlComponent({
    tag: "TableBody",
    kind: "ui",
    children: { grammar: "TableRow+" },
  }),
  defineAgentHtmlComponent({
    tag: "TableFooter",
    kind: "ui",
    children: { grammar: "TableRow+" },
  }),
  defineAgentHtmlComponent({
    tag: "TableRow",
    kind: "ui",
    children: { grammar: "TableHead+ | TableCell+" },
  }),
  defineAgentHtmlComponent({
    tag: "TableHead",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "TableCell",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Tabs",
    kind: "ui",
    role: "component",
    market: {
      title: "Tabs",
      summary: "Switchable content panels sharing one local context.",
      category: "navigation",
      configurableAttrs: ["orientation", "defaultValue"],
      insertTemplate: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Overview content.</TabsContent>
  <TabsContent value="details">Details content.</TabsContent>
</Tabs>`,
      previewExample: `<Tabs defaultValue="overview">
  <TabsList>
    <TabsTrigger value="overview">Overview</TabsTrigger>
    <TabsTrigger value="details">Details</TabsTrigger>
  </TabsList>
  <TabsContent value="overview">Component summary.</TabsContent>
  <TabsContent value="details">Configuration notes.</TabsContent>
</Tabs>`,
    },
    attrs: {
      orientation: {
        type: "enum",
        values: ["horizontal", "vertical"],
        defaultValue: "horizontal",
        prompt: true,
      },
      defaultValue: { type: "string", prompt: true },
    },
    children: { grammar: "TabsList, TabsContent+" },
  }),
  defineAgentHtmlComponent({
    tag: "TabsList",
    kind: "ui",
    children: { grammar: "TabsTrigger+" },
  }),
  defineAgentHtmlComponent({
    tag: "TabsTrigger",
    kind: "ui",
    attrs: {
      value: { type: "string", required: true, prompt: true },
      disabled: {
        type: "boolean",
        values: ["true", "false"],
        prompt: true,
      },
    },
    children: { grammar: "Text, Icon?", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "TabsContent",
    kind: "ui",
    attrs: {
      value: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Timeline",
    kind: "ui",
    role: "component",
    market: {
      title: "Timeline",
      summary: "Ordered milestone list with optional metadata and content.",
      category: "content",
      insertTemplate: `<Timeline>
  <TimelineItem>
    <TimelineTitle>Milestone</TimelineTitle>
    <TimelineDescription>What happened.</TimelineDescription>
  </TimelineItem>
</Timeline>`,
      previewExample: `<Timeline>
  <TimelineItem status="complete" meta="Today">
    <TimelineTitle>Registered</TimelineTitle>
    <TimelineDescription>Component is available in the catalog.</TimelineDescription>
  </TimelineItem>
</Timeline>`,
    },
    children: { grammar: "TimelineItem+" },
  }),
  defineAgentHtmlComponent({
    tag: "TimelineItem",
    kind: "ui",
    attrs: {
      icon: { type: "string", prompt: true },
      status: {
        type: "enum",
        values: ["default", "complete", "current", "muted"],
        defaultValue: "default",
        prompt: true,
      },
      meta: { type: "string", prompt: true },
    },
    children: { grammar: "TimelineTitle, TimelineDescription?, TimelineContent?" },
  }),
  defineAgentHtmlComponent({
    tag: "TimelineTitle",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "TimelineDescription",
    kind: "ui",
    children: { grammar: "Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "TimelineContent",
    kind: "ui",
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Chart",
    kind: "ui",
    role: "component",
    runtime: "special-renderer",
    market: {
      title: "Chart",
      summary: "Small area or bar chart backed by series and row data.",
      category: "data",
      configurableAttrs: ["type"],
      insertTemplate: `<Chart type="bar">
  <ChartSeries key="value" label="Value" />
  <ChartRow label="A" value="12" />
  <ChartRow label="B" value="18" />
  <ChartTooltip />
</Chart>`,
      previewExample: `<Chart type="bar">
  <ChartSeries key="usage" label="Usage" />
  <ChartRow label="Cards" usage="12" />
  <ChartRow label="Tabs" usage="8" />
  <ChartTooltip />
</Chart>`,
    },
    attrs: {
      type: {
        type: "enum",
        values: ["area", "bar"],
        required: true,
        prompt: true,
      },
    },
    children: { grammar: "ChartSeries+, ChartRow+, ChartTooltip?" },
  }),
  defineAgentHtmlComponent({
    tag: "ChartSeries",
    kind: "ui",
    role: "data",
    runtime: "data-only",
    attrs: {
      key: { type: "string", required: true, prompt: true },
      label: { type: "string", prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "ChartRow",
    kind: "ui",
    role: "data",
    runtime: "data-only",
    promptSignature: "ChartRow:label=string, [series key]=number",
    attrs: {
      label: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "ChartTooltip",
    kind: "ui",
    role: "data",
    runtime: "data-only",
    attrs: {
      hideLabel: {
        type: "boolean",
        values: ["true", "false"],
        defaultValue: "false",
        prompt: true,
      },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "CodeBlock",
    kind: "ui",
    role: "component",
    market: {
      title: "Code Block",
      summary: "Syntax-highlighted code sample with optional title.",
      category: "content",
      configurableAttrs: ["language", "title"],
      insertTemplate: `<CodeBlock language="tsx" title="Example">
const message = "Hello";
</CodeBlock>`,
      previewExample: `<CodeBlock language="tsx" title="Component">
export function Example() {
  return "Ready";
}
</CodeBlock>`,
    },
    attrs: {
      language: {
        type: "enum",
        values: ["ahtml", "html", "tsx", "jsx", "ts", "js", "json", "bash"],
        required: true,
        prompt: true,
      },
      title: { type: "string", prompt: true },
    },
    children: { grammar: "raw code text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Icon",
    kind: "ui",
    role: "utility",
    runtime: "special-renderer",
    attrs: {
      name: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Image",
    kind: "ui",
    role: "component",
    market: {
      title: "Image",
      summary: "Responsive image with alt text and fit behavior.",
      category: "media",
      configurableAttrs: ["src", "alt", "fit"],
      insertTemplate: `<Image src="/images/preview.jpg" alt="Preview image" fit="cover" />`,
      previewExample: `<Image src="/images/gallery-preview.jpg" alt="Gallery preview" fit="cover" />`,
    },
    attrs: {
      src: { type: "string", required: true, prompt: true },
      alt: { type: "string", required: true, prompt: true },
      fit: {
        type: "enum",
        values: ["cover", "contain"],
        prompt: true,
      },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Kanban",
    kind: "ui",
    role: "component",
    market: {
      title: "Kanban",
      summary: "Column board for grouped tasks or workflow states.",
      category: "data",
      insertTemplate: `<Kanban>
  <KanbanColumn value="todo" title="Todo">
    <KanbanItem value="first">First task</KanbanItem>
  </KanbanColumn>
</Kanban>`,
      previewExample: `<Kanban>
  <KanbanColumn value="ready" title="Ready">
    <KanbanItem value="card">Component card</KanbanItem>
  </KanbanColumn>
</Kanban>`,
    },
    children: { grammar: "KanbanColumn+" },
  }),
  defineAgentHtmlComponent({
    tag: "KanbanColumn",
    kind: "ui",
    attrs: {
      value: { type: "string", required: true, prompt: true },
      title: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "KanbanItem+" },
  }),
  defineAgentHtmlComponent({
    tag: "KanbanItem",
    kind: "ui",
    attrs: {
      value: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "Layout | UI | Text", text: true },
  }),
  defineAgentHtmlComponent({
    tag: "Text",
    kind: "ui",
    role: "utility",
    attrs: {
      variant: {
        type: "enum",
        values: ["h1", "h2", "h3", "h4", "p", "lead", "large", "small", "muted", "inline-code"],
        prompt: true,
      },
    },
    children: { grammar: "Text", text: true },
  }),
] as const
