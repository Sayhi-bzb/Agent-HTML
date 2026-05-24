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
} from "@/agent-html-example/ui"
import {
  exampleThemeOptions,
  type ExampleThemeId,
} from "@/agent-html-example/theme/theme-presets"

export function RuntimeHeader({
  onThemeChange,
  theme,
  title,
}: {
  onThemeChange: (theme: ExampleThemeId) => void
  theme: ExampleThemeId
  title: string
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/70 px-1 pb-2">
      <div className="min-w-0 flex-1">
        <h1 className="truncate text-[length:var(--type-lg)] leading-[var(--type-base-line-height)] font-medium">
          {title}
        </h1>
      </div>
      <div className="flex shrink-0 items-center gap-2">
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
        <DialogTrigger asChild>
          <Button variant="outline">Source</Button>
        </DialogTrigger>
      </div>
    </header>
  )
}
