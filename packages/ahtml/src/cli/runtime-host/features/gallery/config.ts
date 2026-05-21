import type {
  FontPickerOption,
  GalleryColorTokenSection,
  ThemeTokenName,
} from "./types"

export const focusableThemeTokenEntries: Array<[string, ThemeTokenName]> = [
  ["destructive-foreground", "destructiveForeground"],
  ["primary-foreground", "primaryForeground"],
  ["secondary-foreground", "secondaryForeground"],
  ["card-foreground", "cardForeground"],
  ["popover-foreground", "popoverForeground"],
  ["muted-foreground", "mutedForeground"],
  ["accent-foreground", "accentForeground"],
  ["chart-1", "chart1"],
  ["chart-2", "chart2"],
  ["chart-3", "chart3"],
  ["chart-4", "chart4"],
  ["chart-5", "chart5"],
  ["sidebar-primary-foreground", "sidebarPrimaryForeground"],
  ["sidebar-accent-foreground", "sidebarAccentForeground"],
  ["sidebar-foreground", "sidebarForeground"],
  ["sidebar-primary", "sidebarPrimary"],
  ["sidebar-accent", "sidebarAccent"],
  ["sidebar-border", "sidebarBorder"],
  ["sidebar-ring", "sidebarRing"],
  ["sidebar", "sidebar"],
  ["background", "background"],
  ["foreground", "foreground"],
  ["destructive", "destructive"],
  ["secondary", "secondary"],
  ["primary", "primary"],
  ["popover", "popover"],
  ["accent", "accent"],
  ["border", "border"],
  ["input", "input"],
  ["muted", "muted"],
  ["card", "card"],
  ["ring", "ring"],
]

export const colorTokenSections: GalleryColorTokenSection[] = [
  {
    description: "Primary action colors for filled emphasis surfaces.",
    id: "primary-colors",
    title: "Primary",
    tokenNames: ["primary", "primaryForeground"],
  },
  {
    description: "Secondary action colors for quieter filled surfaces.",
    id: "secondary-colors",
    title: "Secondary",
    tokenNames: ["secondary", "secondaryForeground"],
  },
  {
    description:
      "Accent colors for selection, hover, and focus-adjacent emphasis.",
    id: "accent-colors",
    title: "Accent",
    tokenNames: ["accent", "accentForeground"],
  },
  {
    description: "Canvas and copy colors that establish overall contrast.",
    id: "base-colors",
    title: "Base",
    tokenNames: ["background", "foreground"],
  },
  {
    description:
      "Card surface pair for nested preview shells and content panels.",
    id: "card-colors",
    title: "Card",
    tokenNames: ["card", "cardForeground"],
  },
  {
    description:
      "Popover surface pair for menus, pickers, and floating editors.",
    id: "popover-colors",
    title: "Popover",
    tokenNames: ["popover", "popoverForeground"],
  },
  {
    description:
      "Muted background and text used for low-priority surfaces and captions.",
    id: "muted-colors",
    title: "Muted",
    tokenNames: ["muted", "mutedForeground"],
  },
  {
    description: "Destructive colors for alerts and destructive actions.",
    id: "destructive-colors",
    title: "Destructive",
    tokenNames: ["destructive", "destructiveForeground"],
  },
  {
    description:
      "Border, input, and focus ring tokens that hold the editor shell together.",
    id: "border-input-colors",
    title: "Border & Input",
    tokenNames: ["border", "input", "ring"],
  },
  {
    description:
      "Chart tokens for dashboard data marks and compact analytics surfaces.",
    id: "chart-colors",
    title: "Chart",
    tokenNames: ["chart1", "chart2", "chart3", "chart4", "chart5"],
  },
  {
    description:
      "Sidebar tokens for app navigation shells and inset workbench frames.",
    id: "sidebar-colors",
    title: "Sidebar",
    tokenNames: [
      "sidebar",
      "sidebarForeground",
      "sidebarPrimary",
      "sidebarPrimaryForeground",
      "sidebarAccent",
      "sidebarAccentForeground",
      "sidebarBorder",
      "sidebarRing",
    ],
  },
]

export const fontPresetOptions: Record<
  "heading" | "mono" | "sans" | "serif",
  FontPickerOption[]
> = {
  sans: [
    {
      category: "Sans",
      label: "Inter",
      value: '"Inter", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "IBM Plex Sans",
      value: '"IBM Plex Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Geist",
      value: '"Geist", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "DM Sans",
      value: '"DM Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Plus Jakarta Sans",
      value: '"Plus Jakarta Sans", ui-sans-serif, system-ui, sans-serif',
    },
    {
      category: "Sans",
      label: "Manrope",
      value: '"Manrope", ui-sans-serif, system-ui, sans-serif',
    },
  ],
  heading: [
    {
      category: "Heading",
      label: "Merriweather",
      value: '"Merriweather", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Fraunces",
      value: '"Fraunces", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Playfair Display",
      value: '"Playfair Display", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Lora",
      value: '"Lora", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Cormorant Garamond",
      value: '"Cormorant Garamond", Georgia, serif',
    },
    {
      category: "Heading",
      label: "Libre Baskerville",
      value: '"Libre Baskerville", Georgia, serif',
    },
  ],
  serif: [
    {
      category: "Serif",
      label: "Merriweather",
      value: '"Merriweather", Georgia, serif',
    },
    {
      category: "Serif",
      label: "Lora",
      value: '"Lora", Georgia, serif',
    },
    {
      category: "Serif",
      label: "Source Serif 4",
      value: '"Source Serif 4", Georgia, serif',
    },
    {
      category: "Serif",
      label: "IBM Plex Serif",
      value: '"IBM Plex Serif", Georgia, serif',
    },
  ],
  mono: [
    {
      category: "Mono",
      label: "JetBrains Mono",
      value: '"JetBrains Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "IBM Plex Mono",
      value: '"IBM Plex Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "Geist Mono",
      value: '"Geist Mono", ui-monospace, monospace',
    },
    {
      category: "Mono",
      label: "Source Code Pro",
      value: '"Source Code Pro", ui-monospace, monospace',
    },
  ],
}
