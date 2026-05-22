Accordion:type="single" | "multiple"
├── AccordionItem:disabled=0/1
│   ├── AccordionTrigger
│   └── AccordionContent
└── AccordionItem
    ├── AccordionTrigger
    └── AccordionContent


Alert:variant="default" | "destructive"
├── Icon
├── AlertTitle
├── AlertDescription
└── AlertAction

AspectRatio:ratio=number

Badge:variant="default" | "secondary" | "destructive" | "outline" | "ghost" | "link"
Badge:Icon

Card:size="default" | "sm"
├── CardHeader
│   ├── CardTitle
│   ├── CardDescription
│   └── CardAction
├── CardContent
└── CardFooter

Carousel:orientation="vertical" | "horizontal"
├── CarouselContent
│   ├── CarouselItem
│   └── CarouselItem
├── CarouselPrevious
└── CarouselNext

Progress:value=number

Separator:orientation="horizontal" | "vertical"

Table
├── TableCaption
├── TableHeader
│   └── TableRow
│       ├── TableHead
│       └── TableHead
├── TableBody
│   ├── TableRow
│   │   ├── TableCell
│   │   └── TableCell
│   └── TableRow
│       ├── TableCell
│       └── TableCell
└── TableFooter

Tabs:orientation="horizontal" | "vertical"
├── TabsList
│   ├── TabsTrigger:disabled=0/1
│   └── TabsTrigger:Icon
├── TabsContent
└── TabsContent

ChartContainer:config={ key: { label?: ReactNode, color?: string } }
├── ChartStyle
├── ResponsiveContainer
│   └── Recharts children
└── ChartTooltip
    └── ChartTooltipContent:hideLabel=0/1