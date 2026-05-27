import * as React from "react"

import { agentEventScenarios } from "@/app/gallery/agent-lab/scenarios"
import { useScenarioPlayback } from "@/app/gallery/agent-lab/runtime"
import type {
  BlockMarkerState,
  BlockOutcomeCard,
  PetActivity,
  ScenarioDefinition,
} from "@/app/gallery/agent-lab/types"
import { cn } from "@/app/shared/lib/utils"
import { Badge } from "@/app/shared/ui/badge"
import { Button } from "@/app/shared/ui/button"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@/app/shared/ui/hover-card"
import { ScrollArea } from "@/app/shared/ui/scroll-area"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/app/shared/ui/sheet"
import {
  AlertTriangleIcon,
  CheckCircle2Icon,
  LoaderCircleIcon,
  MessageSquareTextIcon,
  PanelRightOpenIcon,
  PauseIcon,
  PlayIcon,
  RotateCcwIcon,
  ShieldAlertIcon,
  StepForwardIcon,
} from "lucide-react"

type MockBlock = {
  body: string
  eyebrow: string
  path: string
  title: string
}

const mockBlocks: readonly MockBlock[] = [
  {
    path: "hero.title",
    eyebrow: "Hero title",
    title: "Agent work should read like a durable artifact.",
    body: "Short directional copy that sets the page without repeating the details below.",
  },
  {
    path: "hero.body",
    eyebrow: "Hero body",
    title: "Introduce the operating frame",
    body: "This block currently carries setup, explanation, and transition language. It is a useful target for rewrite scenarios.",
  },
  {
    path: "summary.card",
    eyebrow: "Summary card",
    title: "Section summary and cue",
    body: "A compact card that explains why the next layer exists and where the reader should look next.",
  },
  {
    path: "cta.actions",
    eyebrow: "Action row",
    title: "Action cluster",
    body: "A small command row that usually becomes the place where approvals and completion cues feel most visible.",
  },
] as const

function findScenarioById(id: string) {
  return agentEventScenarios.find((scenario) => scenario.id === id) ?? agentEventScenarios[0]
}

function markerTone(status: BlockMarkerState["status"]) {
  switch (status) {
    case "pending":
      return "border-sky-400/45 bg-sky-500/10 text-sky-700"
    case "done":
      return "border-emerald-400/45 bg-emerald-500/10 text-emerald-700"
    case "blocked":
      return "border-amber-400/50 bg-amber-500/10 text-amber-700"
    case "failed":
      return "border-destructive/40 bg-destructive/10 text-destructive"
    default:
      return "border-border bg-background text-foreground"
  }
}

function MarkerIcon({ status }: { status: BlockMarkerState["status"] }) {
  switch (status) {
    case "pending":
      return <LoaderCircleIcon className="size-3 animate-spin" />
    case "done":
      return <MessageSquareTextIcon className="size-3" />
    case "blocked":
      return <ShieldAlertIcon className="size-3" />
    case "failed":
      return <AlertTriangleIcon className="size-3" />
    default:
      return <CheckCircle2Icon className="size-3" />
  }
}

function petTone(activity: PetActivity) {
  switch (activity.kind) {
    case "thinking":
      return "border-sky-400/40 bg-sky-500/10 text-sky-950"
    case "speaking":
      return "border-fuchsia-400/35 bg-fuchsia-500/10 text-fuchsia-950"
    case "editing":
      return "border-indigo-400/35 bg-indigo-500/10 text-indigo-950"
    case "waiting":
      return "border-amber-400/45 bg-amber-500/12 text-amber-950"
    case "review":
      return "border-emerald-400/40 bg-emerald-500/10 text-emerald-950"
    case "failed":
      return "border-destructive/35 bg-destructive/10 text-foreground"
    default:
      return "border-border/80 bg-background/80 text-muted-foreground"
  }
}

function petLabel(activity: PetActivity) {
  switch (activity.kind) {
    case "thinking":
      return activity.label ?? "Thinking"
    case "speaking":
      return activity.text
    case "editing":
      return activity.label
    case "waiting":
      return activity.reason
    case "review":
      return activity.summary
    case "failed":
      return activity.message
    default:
      return "Idle"
  }
}

function outcomeSummary(card: BlockOutcomeCard) {
  switch (card.kind) {
    case "change":
      return card.summary
    case "explanation":
      return card.body
    case "suggestion":
      return card.summary
    case "blocked":
      return card.reason
    case "failure":
      return card.reason
  }
}

function BlockMarker({
  marker,
}: {
  marker: BlockMarkerState
}) {
  const latestCard = marker.cards[marker.cards.length - 1]
  const markerLabel =
    marker.status === "pending"
      ? "Working"
      : marker.status === "blocked"
        ? "Blocked"
        : marker.status === "failed"
          ? "Failed"
          : marker.cards.length > 0
            ? "Comment"
            : "Ready"

  return (
    <HoverCard openDelay={120}>
      <HoverCardTrigger asChild>
        <button
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full border shadow-sm transition-transform hover:-translate-y-0.5",
            markerTone(marker.status)
          )}
          type="button"
        >
          <span className="sr-only">{markerLabel}</span>
          <MarkerIcon status={marker.status} />
        </button>
      </HoverCardTrigger>
      <HoverCardContent align="end" className="w-72 rounded-2xl border border-border/80 p-0 shadow-xl">
        <div className="border-b border-border/70 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
            Codex
          </p>
          <p className="mt-1 text-sm font-medium text-foreground">
            {latestCard?.title ?? markerLabel}
          </p>
        </div>
        <div className="px-4 py-3">
          <p className="text-sm leading-6 text-foreground">
            {latestCard ? outcomeSummary(latestCard) : "Agent is still working on this block."}
          </p>
          {latestCard?.kind === "change" ? (
            <p className="mt-3 text-xs text-muted-foreground">
              {latestCard.changedFiles} file changed
            </p>
          ) : null}
        </div>
        <div className="flex items-center gap-2 border-t border-border/70 bg-muted/25 px-4 py-3">
          <Button size="xs" variant="outline" type="button">
            Reply
          </Button>
          <Button size="xs" variant="outline" type="button">
            Resolve
          </Button>
        </div>
      </HoverCardContent>
    </HoverCard>
  )
}

function MockCanvas({
  activeBlockPath,
  blockMarkers,
  onSelectBlock,
}: {
  activeBlockPath: string
  blockMarkers: Record<string, BlockMarkerState>
  onSelectBlock: (blockPath: string) => void
}) {
  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,1.45fr)_minmax(0,0.95fr)]">
      <div className="rounded-[28px] border border-border/80 bg-card/75 p-5 shadow-[0_24px_60px_-34px_color-mix(in_oklab,var(--foreground)_26%,transparent)]">
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
              Canvas
            </p>
            <h2 className="mt-2 text-2xl font-medium text-foreground">
              Agent event surface study
            </h2>
          </div>
          <Badge variant="outline">Mock workspace</Badge>
        </div>
        <div className="grid gap-4">
          {mockBlocks.map((block) => {
            const isActive = activeBlockPath === block.path
            const marker = blockMarkers[block.path]

            return (
              <article
                key={block.path}
                className={cn(
                  "relative overflow-hidden rounded-[24px] border bg-background/92 px-5 py-5 text-left transition-colors",
                  isActive
                    ? "border-foreground/30 shadow-[0_0_0_1px_color-mix(in_oklab,var(--foreground)_12%,transparent)]"
                    : "border-border/75 hover:border-border"
                )}
              >
                <button
                  className="absolute inset-0"
                  onClick={() => onSelectBlock(block.path)}
                  type="button"
                >
                  <span className="sr-only">Select {block.path}</span>
                </button>
                <div className="relative z-10 flex items-start justify-between gap-4">
                  <div className="max-w-[42rem]">
                    <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-muted-foreground">
                      {block.eyebrow}
                    </p>
                    <h3 className="mt-2 text-lg font-medium text-foreground">
                      {block.title}
                    </h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">
                      {block.body}
                    </p>
                  </div>
                  {marker && marker.status !== "idle" ? <BlockMarker marker={marker} /> : null}
                </div>
              </article>
            )
          })}
        </div>
      </div>

      <aside className="grid gap-4">
        <section className="rounded-[24px] border border-border/80 bg-card/80 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Selected block
          </p>
          <p className="mt-3 text-lg font-medium text-foreground">{activeBlockPath}</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            The mock canvas keeps block paths stable so marker routing stays legible while scenarios change.
          </p>
        </section>
        <section className="rounded-[24px] border border-border/80 bg-card/80 p-5">
          <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
            Rules under test
          </p>
          <ul className="mt-3 grid gap-3 text-sm leading-6 text-muted-foreground">
            <li>Pet owns live activity and short delta bubbles.</li>
            <li>Comment markers appear only for completed block outcomes.</li>
            <li>Drawer keeps the full turn ledger without crowding the canvas.</li>
          </ul>
        </section>
      </aside>
    </section>
  )
}

function PetDock({
  activity,
  onOpenDrawer,
}: {
  activity: PetActivity
  onOpenDrawer: () => void
}) {
  return (
    <div className="pointer-events-none fixed right-8 bottom-8 z-40 flex max-w-md flex-col items-end gap-3">
      {activity.kind !== "idle" ? (
        <section
          className={cn(
            "pointer-events-auto w-full rounded-[24px] border px-4 py-4 shadow-[0_28px_70px_-34px_color-mix(in_oklab,var(--foreground)_35%,transparent)] backdrop-blur-sm",
            petTone(activity)
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-xs font-medium uppercase tracking-[0.16em] opacity-70">
                Pet
              </p>
              <p className="mt-2 text-sm leading-6">{petLabel(activity)}</p>
            </div>
            <Badge variant="outline">{activity.kind}</Badge>
          </div>
          {activity.kind === "waiting" ? (
            <div className="mt-4 flex items-center gap-2">
              <Button size="xs" type="button">
                {activity.actionLabel ?? "Allow"}
              </Button>
              <Button size="xs" variant="outline" type="button">
                Deny
              </Button>
            </div>
          ) : null}
        </section>
      ) : null}

      <div className="pointer-events-auto flex items-center gap-2 rounded-full border border-border/80 bg-background/92 px-3 py-2 shadow-lg backdrop-blur-sm">
        <span className="text-xs font-medium text-muted-foreground">Codex</span>
        <Badge variant="secondary">{activity.kind}</Badge>
        <Button
          className="rounded-full"
          onClick={onOpenDrawer}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <PanelRightOpenIcon />
          <span className="sr-only">Open activity</span>
        </Button>
      </div>
    </div>
  )
}

function ScenarioToolbar({
  activeScenario,
  appliedCount,
  isPlaying,
  onPause,
  onPlay,
  onReset,
  onSelectScenario,
  onStep,
  scenarioLength,
}: {
  activeScenario: ScenarioDefinition
  appliedCount: number
  isPlaying: boolean
  onPause: () => void
  onPlay: () => void
  onReset: () => void
  onSelectScenario: (scenarioId: string) => void
  onStep: () => void
  scenarioLength: number
}) {
  return (
    <section className="rounded-[28px] border border-border/80 bg-card/80 p-5 shadow-[0_18px_48px_-36px_color-mix(in_oklab,var(--foreground)_30%,transparent)]">
      <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
        <div className="max-w-2xl">
          <p className="text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground">
            Scenario lab
          </p>
          <h1 className="mt-2 text-2xl font-medium text-foreground">
            Agent Event Lab
          </h1>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {activeScenario.description}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={isPlaying ? onPause : onPlay} type="button">
            {isPlaying ? <PauseIcon /> : <PlayIcon />}
            {isPlaying ? "Pause" : "Play"}
          </Button>
          <Button onClick={onStep} type="button" variant="outline">
            <StepForwardIcon />
            Step
          </Button>
          <Button onClick={onReset} size="icon-sm" type="button" variant="ghost">
            <RotateCcwIcon />
            <span className="sr-only">Reset</span>
          </Button>
        </div>
      </div>
      <div className="mt-5 flex flex-wrap gap-2">
        {agentEventScenarios.map((scenario) => (
          <Button
            key={scenario.id}
            onClick={() => onSelectScenario(scenario.id)}
            size="sm"
            type="button"
            variant={scenario.id === activeScenario.id ? "default" : "outline"}
          >
            {scenario.label}
          </Button>
        ))}
      </div>
      <div className="mt-5 flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
        <Badge variant="outline">
          {appliedCount}/{scenarioLength} events
        </Badge>
        <span>Prompt: {activeScenario.prompt}</span>
      </div>
    </section>
  )
}

export function AgentEventLabSurface() {
  const [activeScenarioId, setActiveScenarioId] = React.useState(
    agentEventScenarios[0].id
  )
  const [activeBlockPath, setActiveBlockPath] = React.useState(mockBlocks[1].path)
  const activeScenario = React.useMemo(
    () => findScenarioById(activeScenarioId),
    [activeScenarioId]
  )
  const playback = useScenarioPlayback(activeScenario)

  React.useEffect(() => {
    const blockScopedEvent = activeScenario.events.find(
      (event) => "scope" in event && event.scope?.type === "block"
    )

    if (blockScopedEvent?.scope?.type === "block") {
      setActiveBlockPath(blockScopedEvent.scope.blockPath)
    }
  }, [activeScenario])

  return (
    <div className="relative flex min-h-full flex-col gap-4">
      <ScenarioToolbar
        activeScenario={activeScenario}
        appliedCount={playback.appliedCount}
        isPlaying={playback.isPlaying}
        onPause={playback.pause}
        onPlay={playback.play}
        onReset={playback.reset}
        onSelectScenario={setActiveScenarioId}
        onStep={playback.step}
        scenarioLength={playback.scenarioLength}
      />

      <div className="rounded-[30px] border border-border/70 bg-[radial-gradient(circle_at_top_left,color-mix(in_oklab,var(--muted)_65%,transparent),transparent_46%),linear-gradient(180deg,color-mix(in_oklab,var(--background)_92%,white_8%),var(--background))] p-4 md:p-5">
        <MockCanvas
          activeBlockPath={activeBlockPath}
          blockMarkers={playback.surfaceState.blockMarkers}
          onSelectBlock={setActiveBlockPath}
        />
      </div>

      <PetDock
        activity={playback.surfaceState.petActivity}
        onOpenDrawer={playback.openDrawer}
      />

      <Sheet open={playback.isDrawerOpen} onOpenChange={playback.setIsDrawerOpen}>
        <SheetContent className="w-full max-w-xl p-0" showCloseButton side="right">
          <SheetHeader className="border-b border-border/80">
            <SheetTitle>Thread timeline</SheetTitle>
            <SheetDescription>
              Full event ledger for the current scenario. Pet and comment markers only consume the surface-specific slices.
            </SheetDescription>
          </SheetHeader>
          <ScrollArea className="min-h-0 flex-1">
            <div className="grid gap-3 p-4">
              {playback.surfaceState.drawerEvents.map((event) => (
                <article
                  key={event.id}
                  className="rounded-2xl border border-border/80 bg-background/90 px-4 py-3"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-foreground">{event.title}</p>
                    <Badge variant="outline">{event.timeLabel}</Badge>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-foreground">{event.detail}</p>
                  <p className="mt-2 text-xs text-muted-foreground">{event.scopeLabel}</p>
                </article>
              ))}
              {playback.surfaceState.documentOutcomes.length > 0 ? (
                <section className="rounded-2xl border border-dashed border-border bg-muted/20 px-4 py-3">
                  <p className="text-sm font-medium text-foreground">
                    Document-scoped outcomes
                  </p>
                  {playback.surfaceState.documentOutcomes.map((outcome) => (
                    <p key={outcome.summary} className="mt-2 text-sm leading-6 text-muted-foreground">
                      {outcome.summary}
                    </p>
                  ))}
                </section>
              ) : null}
            </div>
          </ScrollArea>
        </SheetContent>
      </Sheet>
    </div>
  )
}
