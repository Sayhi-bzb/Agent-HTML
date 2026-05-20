import type { ComponentSchema, GeneratedShadcnIntrospection, ResolvedComponentSchema } from "../types"

export const GENERATED_SHADCN_INTROSPECTIONS = [
  {
    "registryName": "accordion",
    "componentName": "Accordion",
    "exports": [
      "Accordion",
      "AccordionItem",
      "AccordionTrigger",
      "AccordionContent"
    ],
    "slots": [
      "accordion",
      "accordion-item",
      "accordion-trigger",
      "accordion-content"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "alert",
    "componentName": "Alert",
    "exports": [
      "Alert",
      "AlertTitle",
      "AlertDescription"
    ],
    "slots": [
      "alert",
      "alert-title",
      "alert-description"
    ],
    "variantProps": {
      "variant": [
        "default",
        "destructive"
      ]
    },
    "blockedProps": [
      "className"
    ]
  },
  {
    "registryName": "badge",
    "componentName": "Badge",
    "exports": [
      "Badge",
      "badgeVariants"
    ],
    "slots": [
      "badge"
    ],
    "variantProps": {
      "variant": [
        "default",
        "secondary",
        "destructive",
        "outline",
        "ghost",
        "link"
      ]
    },
    "blockedProps": [
      "className",
      "asChild"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "button",
    "componentName": "Button",
    "exports": [
      "Button",
      "buttonVariants"
    ],
    "slots": [
      "button"
    ],
    "variantProps": {
      "variant": [
        "default",
        "destructive",
        "outline",
        "secondary",
        "ghost",
        "link"
      ],
      "size": [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg"
      ]
    },
    "blockedProps": [
      "className",
      "asChild"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "card",
    "componentName": "Card",
    "exports": [
      "Card",
      "CardHeader",
      "CardFooter",
      "CardTitle",
      "CardAction",
      "CardDescription",
      "CardContent"
    ],
    "slots": [
      "card",
      "card-header",
      "card-title",
      "card-description",
      "card-action",
      "card-content",
      "card-footer"
    ],
    "blockedProps": [
      "className"
    ]
  },
  {
    "registryName": "checkbox",
    "componentName": "Checkbox",
    "exports": [
      "Checkbox"
    ],
    "slots": [
      "checkbox",
      "checkbox-indicator"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "combobox",
    "componentName": "Combobox",
    "exports": [
      "Combobox",
      "ComboboxInput",
      "ComboboxContent",
      "ComboboxList",
      "ComboboxItem",
      "ComboboxGroup",
      "ComboboxLabel",
      "ComboboxCollection",
      "ComboboxEmpty",
      "ComboboxSeparator",
      "ComboboxChips",
      "ComboboxChip",
      "ComboboxChipsInput",
      "ComboboxTrigger",
      "ComboboxValue",
      "useComboboxAnchor"
    ],
    "slots": [
      "combobox-value",
      "combobox-trigger",
      "combobox-trigger-icon",
      "combobox-clear",
      "input-group-button",
      "combobox-content",
      "combobox-list",
      "combobox-item",
      "combobox-item-indicator",
      "combobox-group",
      "combobox-label",
      "combobox-collection",
      "combobox-empty",
      "combobox-separator",
      "combobox-chips",
      "combobox-chip",
      "combobox-chip-remove",
      "combobox-chip-input"
    ],
    "blockedProps": [
      "className",
      "asChild"
    ],
    "dependencies": [
      "@base-ui/react"
    ],
    "registryDependencies": [
      "button",
      "input-group"
    ]
  },
  {
    "registryName": "input",
    "componentName": "Input",
    "exports": [
      "Input"
    ],
    "slots": [
      "input"
    ],
    "blockedProps": [
      "className"
    ]
  },
  {
    "registryName": "progress",
    "componentName": "Progress",
    "exports": [
      "Progress"
    ],
    "slots": [
      "progress",
      "progress-indicator"
    ],
    "blockedProps": [
      "className",
      "style"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "radio-group",
    "componentName": "RadioGroup",
    "exports": [
      "RadioGroup",
      "RadioGroupItem"
    ],
    "slots": [
      "radio-group",
      "radio-group-item",
      "radio-group-indicator"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "select",
    "componentName": "Select",
    "exports": [
      "Select",
      "SelectContent",
      "SelectGroup",
      "SelectItem",
      "SelectLabel",
      "SelectScrollDownButton",
      "SelectScrollUpButton",
      "SelectSeparator",
      "SelectTrigger",
      "SelectValue"
    ],
    "slots": [
      "select",
      "select-group",
      "select-value",
      "select-trigger",
      "select-content",
      "select-label",
      "select-item",
      "select-item-indicator",
      "select-separator",
      "select-scroll-up-button",
      "select-scroll-down-button"
    ],
    "unionProps": {
      "size": [
        "sm",
        "default"
      ]
    },
    "blockedProps": [
      "className",
      "asChild"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "separator",
    "componentName": "Separator",
    "exports": [
      "Separator"
    ],
    "slots": [
      "separator"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "slider",
    "componentName": "Slider",
    "exports": [
      "Slider"
    ],
    "slots": [
      "slider",
      "slider-track",
      "slider-range",
      "slider-thumb"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "switch",
    "componentName": "Switch",
    "exports": [
      "Switch"
    ],
    "slots": [
      "switch",
      "switch-thumb"
    ],
    "unionProps": {
      "size": [
        "sm",
        "default"
      ]
    },
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "table",
    "componentName": "Table",
    "exports": [
      "Table",
      "TableHeader",
      "TableBody",
      "TableFooter",
      "TableHead",
      "TableRow",
      "TableCell",
      "TableCaption"
    ],
    "slots": [
      "table-container",
      "table",
      "table-header",
      "table-body",
      "table-footer",
      "table-row",
      "table-head",
      "table-cell",
      "table-caption"
    ],
    "blockedProps": [
      "className"
    ]
  },
  {
    "registryName": "tabs",
    "componentName": "Tabs",
    "exports": [
      "Tabs",
      "TabsList",
      "TabsTrigger",
      "TabsContent",
      "tabsListVariants"
    ],
    "slots": [
      "tabs",
      "tabs-list",
      "tabs-trigger",
      "tabs-content"
    ],
    "variantProps": {
      "variant": [
        "default",
        "line"
      ]
    },
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "textarea",
    "componentName": "Textarea",
    "exports": [
      "Textarea"
    ],
    "slots": [
      "textarea"
    ],
    "blockedProps": [
      "className"
    ]
  },
  {
    "registryName": "toggle",
    "componentName": "Toggle",
    "exports": [
      "Toggle",
      "toggleVariants"
    ],
    "slots": [
      "toggle"
    ],
    "variantProps": {
      "variant": [
        "default",
        "outline"
      ],
      "size": [
        "default",
        "sm",
        "lg"
      ]
    },
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  },
  {
    "registryName": "toggle-group",
    "componentName": "ToggleGroup",
    "exports": [
      "ToggleGroup",
      "ToggleGroupItem"
    ],
    "slots": [
      "toggle-group",
      "toggle-group-item"
    ],
    "blockedProps": [
      "className",
      "style"
    ],
    "dependencies": [
      "radix-ui"
    ],
    "registryDependencies": [
      "toggle"
    ]
  },
  {
    "registryName": "tooltip",
    "componentName": "Tooltip",
    "exports": [
      "Tooltip",
      "TooltipTrigger",
      "TooltipContent",
      "TooltipProvider"
    ],
    "slots": [
      "tooltip-provider",
      "tooltip",
      "tooltip-trigger",
      "tooltip-content"
    ],
    "blockedProps": [
      "className"
    ],
    "dependencies": [
      "radix-ui"
    ]
  }
] as const satisfies readonly GeneratedShadcnIntrospection[]

export const GENERATED_RESOLVED_COMPONENT_SCHEMAS = [
  {
    "name": "page",
    "description": "Document root component.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible page title."
      }
    ],
    "semanticProps": [
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible page title.",
        "origin": "content"
      }
    ],
    "allowedChildren": [
      "stack",
      "frame",
      "alert",
      "card",
      "separator",
      "table",
      "list",
      "tabs",
      "accordion"
    ]
  },
  {
    "name": "stack",
    "description": "Vertical content stack.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "cluster",
    "description": "Wrapping horizontal content cluster.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "split",
    "description": "Split layout wrapper for paired content regions.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "grid",
    "description": "Grid layout wrapper for repeated content regions.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "switcher",
    "description": "Responsive layout wrapper that can switch arrangement.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "frame",
    "description": "Frame layout wrapper for page and reading boundaries.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "alert",
    "description": "Important callout or warning.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Callout heading."
      },
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "destructive"
        ]
      }
    ],
    "semanticProps": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Callout heading.",
        "origin": "content"
      }
    ],
    "rawCandidateProps": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "destructive"
        ],
        "exposureState": "raw-candidate",
        "exposed": true
      }
    ],
    "exposedRawProps": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "destructive"
        ]
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "card",
    "description": "Content grouping component.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Card heading."
      }
    ],
    "semanticProps": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Card heading.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "separator",
    "description": "Section divider.",
    "props": [],
    "semanticProps": [],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "badge",
    "description": "Short status label.",
    "props": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link"
        ]
      }
    ],
    "semanticProps": [],
    "rawCandidateProps": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link"
        ],
        "exposureState": "raw-candidate",
        "exposed": true
      }
    ],
    "exposedRawProps": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link"
        ]
      }
    ],
    "blockedPropNames": [
      "className",
      "asChild"
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "progress",
    "description": "Read-only completion indicator.",
    "props": [
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Completion percentage from 0 to 100."
      }
    ],
    "semanticProps": [
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Completion percentage from 0 to 100.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className",
      "style"
    ],
    "allowedChildren": []
  },
  {
    "name": "input",
    "description": "Single-line text field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "textarea",
    "description": "Multiline text field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "checkbox",
    "description": "Single boolean confirmation field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the field starts checked."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the field starts checked.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "switch",
    "description": "Immediate on/off preference toggle.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the toggle starts enabled."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the toggle starts enabled.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "rawCandidateProps": [
      {
        "name": "size",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "sm",
          "default"
        ],
        "exposureState": "raw-candidate",
        "exposed": false
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "slider",
    "description": "Read-only numeric preference slider.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Current numeric value from 0 to 100."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Current numeric value from 0 to 100.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": []
  },
  {
    "name": "radio-group",
    "description": "Single-select option field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "toggle-group",
    "description": "Inline single-select option set.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className",
      "style"
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "select",
    "description": "Single-select option picker.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "rawCandidateProps": [
      {
        "name": "size",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "sm",
          "default"
        ],
        "exposureState": "raw-candidate",
        "exposed": false
      }
    ],
    "blockedPropNames": [
      "className",
      "asChild"
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "combobox",
    "description": "Searchable single-select option picker.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "semanticProps": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label.",
        "origin": "content"
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value.",
        "origin": "content"
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note.",
        "origin": "content"
      }
    ],
    "blockedPropNames": [
      "className",
      "asChild"
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "option",
    "description": "Single selectable option.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable option value."
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible option label."
      }
    ],
    "semanticProps": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable option value.",
        "origin": "structure"
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible option label.",
        "origin": "content"
      }
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "table",
    "description": "Structured tabular evidence.",
    "props": [],
    "semanticProps": [],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "row"
    ]
  },
  {
    "name": "row",
    "description": "Table row values.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "cell"
    ]
  },
  {
    "name": "cell",
    "description": "Table cell content.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "list",
    "description": "Ordered or unordered item list.",
    "props": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "List marker style.",
        "enumValues": [
          "ordered",
          "unordered"
        ]
      }
    ],
    "semanticProps": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "List marker style.",
        "enumValues": [
          "ordered",
          "unordered"
        ],
        "origin": "content"
      }
    ],
    "allowedChildren": [
      "item"
    ]
  },
  {
    "name": "item",
    "description": "List item.",
    "props": [],
    "semanticProps": [],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "tabs",
    "description": "Interactive view switcher.",
    "props": [],
    "semanticProps": [],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "tab"
    ]
  },
  {
    "name": "tab",
    "description": "Single tabs view.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable tab value."
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible tab label."
      }
    ],
    "semanticProps": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable tab value.",
        "origin": "structure"
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible tab label.",
        "origin": "content"
      }
    ],
    "allowedChildren": [
      "alert",
      "card",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame"
    ]
  },
  {
    "name": "accordion",
    "description": "Expandable section group.",
    "props": [],
    "semanticProps": [],
    "blockedPropNames": [
      "className"
    ],
    "allowedChildren": [
      "accordion-item"
    ]
  },
  {
    "name": "accordion-item",
    "description": "Expandable section.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable accordion item value."
      },
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible section title."
      }
    ],
    "semanticProps": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable accordion item value.",
        "origin": "structure"
      },
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible section title.",
        "origin": "content"
      }
    ],
    "allowedChildren": [
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  }
] as const satisfies readonly ResolvedComponentSchema[]

export const GENERATED_STANDARD_COMPONENT_SCHEMAS = [
  {
    "name": "page",
    "description": "Document root component.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible page title."
      }
    ],
    "allowedChildren": [
      "stack",
      "frame",
      "alert",
      "card",
      "separator",
      "table",
      "list",
      "tabs",
      "accordion"
    ]
  },
  {
    "name": "stack",
    "description": "Vertical content stack.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "cluster",
    "description": "Wrapping horizontal content cluster.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "split",
    "description": "Split layout wrapper for paired content regions.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "grid",
    "description": "Grid layout wrapper for repeated content regions.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "switcher",
    "description": "Responsive layout wrapper that can switch arrangement.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "frame",
    "description": "Frame layout wrapper for page and reading boundaries.",
    "props": [],
    "allowedChildren": [
      "alert",
      "badge",
      "card",
      "separator",
      "progress",
      "input",
      "textarea",
      "checkbox",
      "switch",
      "slider",
      "radio-group",
      "toggle-group",
      "select",
      "combobox",
      "table",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "alert",
    "description": "Important callout or warning.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Callout heading."
      },
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "destructive"
        ]
      }
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "card",
    "description": "Content grouping component.",
    "props": [
      {
        "name": "title",
        "valueKind": "string",
        "description": "Card heading."
      }
    ],
    "allowedChildren": [
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "tabs",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  },
  {
    "name": "separator",
    "description": "Section divider.",
    "props": [],
    "allowedChildren": []
  },
  {
    "name": "badge",
    "description": "Short status label.",
    "props": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "Raw candidate prop from shadcn component facts.",
        "enumValues": [
          "default",
          "secondary",
          "destructive",
          "outline",
          "ghost",
          "link"
        ]
      }
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "progress",
    "description": "Read-only completion indicator.",
    "props": [
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Completion percentage from 0 to 100."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "input",
    "description": "Single-line text field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "textarea",
    "description": "Multiline text field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Current field value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "checkbox",
    "description": "Single boolean confirmation field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the field starts checked."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "switch",
    "description": "Immediate on/off preference toggle.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "checked",
        "valueKind": "boolean",
        "description": "Whether the toggle starts enabled."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "slider",
    "description": "Read-only numeric preference slider.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "number",
        "required": true,
        "description": "Current numeric value from 0 to 100."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": []
  },
  {
    "name": "radio-group",
    "description": "Single-select option field.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "toggle-group",
    "description": "Inline single-select option set.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "select",
    "description": "Single-select option picker.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "combobox",
    "description": "Searchable single-select option picker.",
    "props": [
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible field label."
      },
      {
        "name": "value",
        "valueKind": "string",
        "description": "Initially selected option value."
      },
      {
        "name": "description",
        "valueKind": "string",
        "description": "Helpful field note."
      }
    ],
    "allowedChildren": [
      "option"
    ]
  },
  {
    "name": "option",
    "description": "Single selectable option.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable option value."
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible option label."
      }
    ],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "table",
    "description": "Structured tabular evidence.",
    "props": [],
    "allowedChildren": [
      "row"
    ]
  },
  {
    "name": "row",
    "description": "Table row values.",
    "props": [],
    "allowedChildren": [
      "cell"
    ]
  },
  {
    "name": "cell",
    "description": "Table cell content.",
    "props": [],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "list",
    "description": "Ordered or unordered item list.",
    "props": [
      {
        "name": "variant",
        "valueKind": "enum",
        "description": "List marker style.",
        "enumValues": [
          "ordered",
          "unordered"
        ]
      }
    ],
    "allowedChildren": [
      "item"
    ]
  },
  {
    "name": "item",
    "description": "List item.",
    "props": [],
    "allowedChildren": [
      "#text"
    ]
  },
  {
    "name": "tabs",
    "description": "Interactive view switcher.",
    "props": [],
    "allowedChildren": [
      "tab"
    ]
  },
  {
    "name": "tab",
    "description": "Single tabs view.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable tab value."
      },
      {
        "name": "label",
        "valueKind": "string",
        "required": true,
        "description": "Visible tab label."
      }
    ],
    "allowedChildren": [
      "alert",
      "card",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "separator",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "accordion",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame"
    ]
  },
  {
    "name": "accordion",
    "description": "Expandable section group.",
    "props": [],
    "allowedChildren": [
      "accordion-item"
    ]
  },
  {
    "name": "accordion-item",
    "description": "Expandable section.",
    "props": [
      {
        "name": "value",
        "valueKind": "string",
        "required": true,
        "description": "Stable accordion item value."
      },
      {
        "name": "title",
        "valueKind": "string",
        "required": true,
        "description": "Visible section title."
      }
    ],
    "allowedChildren": [
      "alert",
      "badge",
      "checkbox",
      "combobox",
      "input",
      "progress",
      "radio-group",
      "select",
      "slider",
      "switch",
      "table",
      "textarea",
      "toggle-group",
      "list",
      "stack",
      "cluster",
      "split",
      "grid",
      "switcher",
      "frame",
      "#text"
    ]
  }
] as const satisfies readonly ComponentSchema[]
