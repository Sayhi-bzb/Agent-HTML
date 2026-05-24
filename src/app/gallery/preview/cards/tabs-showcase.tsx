import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/app/gallery/preview/ui/tabs"
import { ShowcaseShell } from "@/app/gallery/preview/cards/showcase-shell"

const panels = [
  {
    value: "summary",
    title: "Summary",
    detail: "A high-level pass that captures intent before deeper evaluation starts.",
  },
  {
    value: "notes",
    title: "Notes",
    detail: "Working observations stay visible without permanently occupying vertical space.",
  },
  {
    value: "handoff",
    title: "Handoff",
    detail: "The final tab condenses what the next operator actually needs to continue.",
  },
] as const

export function TabsShowcase() {
  return (
    <ShowcaseShell
      title="Tabs"
      description="Panel switching for parallel views that share one footprint and one context."
      footer="The tab list owns navigation while each panel proves the content slot changes cleanly."
    >
      <Tabs className="gap-3" defaultValue="summary">
        <TabsList variant="line">
          {panels.map((panel) => (
            <TabsTrigger key={panel.value} value={panel.value}>
              {panel.title}
            </TabsTrigger>
          ))}
        </TabsList>
        {panels.map((panel) => (
          <TabsContent
            key={panel.value}
            className="rounded-[calc(var(--radius)*1.25)] border border-border/70 bg-muted/20 p-3"
            value={panel.value}
          >
            <p className="type-label">{panel.title}</p>
            <p className="type-body mt-2 text-foreground/90">{panel.detail}</p>
          </TabsContent>
        ))}
      </Tabs>
    </ShowcaseShell>
  )
}

