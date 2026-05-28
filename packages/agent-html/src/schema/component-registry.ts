import { defineAgentHtmlComponent } from "@/agent-html/schema/component-contract"

export const agentHtmlComponentRegistry = [
  defineAgentHtmlComponent({
    tag: "Page",
    kind: "layout",
    attrs: {
      title: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Section",
    kind: "layout",
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
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Cluster",
    kind: "layout",
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
    attrs: {
      ratio: { type: "number", required: true, prompt: true },
    },
    children: { grammar: "Layout | UI" },
  }),
  defineAgentHtmlComponent({
    tag: "Badge",
    kind: "ui",
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
    attrs: {
      value: { type: "number", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Separator",
    kind: "ui",
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
    attrs: {
      key: { type: "string", required: true, prompt: true },
      label: { type: "string", prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "ChartRow",
    kind: "ui",
    promptSignature: "ChartRow:label=string, [series key]=number",
    attrs: {
      label: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "ChartTooltip",
    kind: "ui",
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
    attrs: {
      name: { type: "string", required: true, prompt: true },
    },
    children: { grammar: "none" },
  }),
  defineAgentHtmlComponent({
    tag: "Image",
    kind: "ui",
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
