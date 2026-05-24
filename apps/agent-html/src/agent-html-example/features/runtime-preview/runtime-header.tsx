import {
  Button,
  DialogTrigger,
} from "@/agent-html-example/ui"

export function RuntimeHeader({
  title,
}: {
  title: string
}) {
  return (
    <header className="flex items-center justify-between gap-3 border-b border-border/70 px-1 pb-2">
      <div className="min-w-0">
        <h1 className="truncate text-[length:var(--type-lg)] leading-[var(--type-base-line-height)] font-medium">
          {title}
        </h1>
      </div>
      <DialogTrigger asChild>
        <Button variant="outline">Source</Button>
      </DialogTrigger>
    </header>
  )
}
