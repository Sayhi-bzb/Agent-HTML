export const agentHtmlColorFamilies = [
  "slate",
  "gray",
  "zinc",
  "neutral",
  "stone",
  "red",
  "orange",
  "amber",
  "yellow",
  "green",
  "emerald",
  "teal",
  "cyan",
  "sky",
  "blue",
  "indigo",
  "violet",
  "purple",
  "pink",
  "rose",
] as const

export const agentHtmlColorSteps = [
  "50",
  "100",
  "200",
  "300",
  "400",
  "500",
  "600",
  "700",
  "800",
  "900",
  "950",
] as const

export type AgentHtmlColorFamily = (typeof agentHtmlColorFamilies)[number]
export type AgentHtmlColorStep = (typeof agentHtmlColorSteps)[number]

export type AgentHtmlColorTokenName =
  | "background"
  | "foreground"
  | "card"
  | "card-foreground"
  | "popover"
  | "popover-foreground"
  | "primary"
  | "primary-foreground"
  | "secondary"
  | "secondary-foreground"
  | "accent"
  | "accent-foreground"
  | "destructive"
  | "muted"
  | "muted-foreground"
  | "border"
  | "input"
  | "ring"

export type AgentHtmlColorTokenValue = {
  family: AgentHtmlColorFamily
  step: AgentHtmlColorStep
}

export type AgentHtmlColorTokenValues = Record<
  AgentHtmlColorTokenName,
  AgentHtmlColorTokenValue
>

export const agentHtmlColorTokenDefaults: AgentHtmlColorTokenValues = {
  background: { family: "zinc", step: "50" },
  foreground: { family: "zinc", step: "900" },
  card: { family: "zinc", step: "50" },
  "card-foreground": { family: "zinc", step: "900" },
  popover: { family: "zinc", step: "50" },
  "popover-foreground": { family: "zinc", step: "900" },
  primary: { family: "zinc", step: "900" },
  "primary-foreground": { family: "zinc", step: "50" },
  secondary: { family: "zinc", step: "100" },
  "secondary-foreground": { family: "zinc", step: "900" },
  accent: { family: "zinc", step: "100" },
  "accent-foreground": { family: "zinc", step: "900" },
  destructive: { family: "red", step: "600" },
  muted: { family: "zinc", step: "100" },
  "muted-foreground": { family: "zinc", step: "500" },
  border: { family: "zinc", step: "200" },
  input: { family: "zinc", step: "200" },
  ring: { family: "zinc", step: "400" },
}

export const agentHtmlTypographyFamilies = {
  courier: '"Courier New", monospace',
  geist: '"Geist Variable", sans-serif',
  georgia: '"Georgia", serif',
  times: '"Times New Roman", serif',
  trebuchet: '"Trebuchet MS", sans-serif',
} as const

export type AgentHtmlTypographyFontId = keyof typeof agentHtmlTypographyFamilies

export type AgentHtmlTypographyBaseSizeValue =
  | "0.9375rem"
  | "1rem"
  | "1.0625rem"
  | "1.125rem"

export type AgentHtmlTypographyLineHeightValue =
  | "1.4"
  | "1.5"
  | "1.6"
  | "1.75"

export type AgentHtmlTypographyValue = {
  baseSize: AgentHtmlTypographyBaseSizeValue
  fontFamily: AgentHtmlTypographyFontId
  lineHeight: AgentHtmlTypographyLineHeightValue
}

export const agentHtmlTypographyDefaults: AgentHtmlTypographyValue = {
  baseSize: "1rem",
  fontFamily: "geist",
  lineHeight: "1.6",
}

export function resolveAgentHtmlTypographyFontFamily(
  fontFamily: AgentHtmlTypographyFontId
) {
  return agentHtmlTypographyFamilies[fontFamily]
}

export const agentHtmlRuntimeDefaults = {
  radius: "0.625rem",
  shadow: "medium",
  spacing: "1rem",
} as const
