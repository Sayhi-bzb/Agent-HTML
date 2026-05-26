import {
  Button,
  DialogTrigger,
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@example/ui"
import {
  exampleThemeOptions,
  type ExampleThemeId,
} from "@example/theme/theme-presets"
import type { AgentHtmlExampleLocale } from "@example/cases"
import { Languages, SquareCodeIcon } from "lucide-react"

export function RuntimeHeader({
  locale,
  onLocaleChange,
  onThemeChange,
  theme,
}: {
  locale: AgentHtmlExampleLocale
  onLocaleChange: (locale: AgentHtmlExampleLocale) => void
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
}) {
  const nextLocale = locale === "zh" ? "en" : "zh"

  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/70 px-1 pb-2">
      <div className="min-w-0 flex-1">
        <h1 className="flex min-w-0 items-center gap-2 truncate text-[length:var(--type-lg)] leading-[var(--type-base-line-height)] font-medium">
          <span className="shrink-0 text-muted-foreground">Introducing</span>
          <span className="flex min-w-0 items-center gap-1.5 bg-gradient-to-r from-primary via-foreground to-chart-2 bg-clip-text text-transparent">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="url(#agent-html-logo-gradient)"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
              className="size-5 shrink-0"
            >
              <defs>
                <linearGradient
                  id="agent-html-logo-gradient"
                  x1="4"
                  y1="4"
                  x2="20"
                  y2="20"
                  gradientUnits="userSpaceOnUse"
                >
                  <stop stopColor="var(--primary)" />
                  <stop offset="0.52" stopColor="var(--foreground)" />
                  <stop offset="1" stopColor="var(--chart-2)" />
                </linearGradient>
              </defs>
              <path d="M9 10h.01" />
              <path d="M15 10h.01" />
              <path d="M12 2a8 8 0 0 0-8 8v12l3-3 2.5 2.5L12 19l2.5 2.5L17 19l3 3V10a8 8 0 0 0-8-8z" />
            </svg>
            <span className="truncate">agent-html</span>
          </span>
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
        <Button
          variant="outline"
          size="icon-sm"
          aria-label={
            nextLocale === "zh"
              ? "Switch to Chinese"
              : "Switch to English"
          }
          onClick={() => {
            onLocaleChange(nextLocale)
          }}
        >
          <Languages />
        </Button>
        <Select onValueChange={onThemeChange} value={theme}>
          <SelectTrigger aria-label="Theme" className="w-32" size="sm">
            <SelectValue placeholder="Theme" />
          </SelectTrigger>
          <SelectContent>
            <SelectGroup>
              <SelectLabel>Theme</SelectLabel>
              {exampleThemeOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon-sm" asChild>
          <a
            href="https://github.com/Sayhi-bzb/Agent-HTML"
            target="_blank"
            rel="noreferrer"
            aria-label="Open Agent-HTML on GitHub"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
              <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M12 2C6.48 2 2 6.58 2 12.25c0 4.53 2.87 8.37 6.84 9.73.5.1.68-.22.68-.5 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.5-1.11-1.5-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.9 1.57 2.36 1.12 2.94.85.09-.67.35-1.12.63-1.38-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.7 0 0 .84-.28 2.75 1.05A9.35 9.35 0 0 1 12 6.95c.85 0 1.7.12 2.5.35 1.9-1.33 2.74-1.05 2.74-1.05.55 1.4.2 2.44.1 2.7.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.8-4.57 5.06.36.32.68.94.68 1.9 0 1.38-.01 2.49-.01 2.82 0 .28.18.6.69.5A10.2 10.2 0 0 0 22 12.25C22 6.58 17.52 2 12 2Z"
              />
            </svg>
          </a>
        </Button>
        <DialogTrigger asChild>
          <Button
            variant="outline"
            size="icon-sm"
            aria-label="Open source"
          >
            <SquareCodeIcon />
          </Button>
        </DialogTrigger>
      </div>
    </header>
  )
}
