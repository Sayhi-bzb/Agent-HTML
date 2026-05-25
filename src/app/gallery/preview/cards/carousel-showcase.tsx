import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/app/shared/ui/carousel"
import { ShowcaseShell } from "@/app/gallery/preview/cards/showcase-shell"

const slides = [
  {
    title: "Scene 01",
    detail: "Contrast audit for high-signal dashboard surfaces.",
    tone: "from-primary/85 via-primary/25 to-card",
  },
  {
    title: "Scene 02",
    detail: "Annotation pass focused on spacing and text balance.",
    tone: "from-primary/18 via-accent/85 to-secondary/55",
  },
  {
    title: "Scene 03",
    detail: "Final sweep for component consistency before export.",
    tone: "from-card via-muted/72 to-primary/12",
  },
] as const

export function CarouselShowcase() {
  return (
    <ShowcaseShell
      title="Carousel"
      description="Sequential browsing for parallel scenes that should share one bounded preview slot."
      bodyClassName="px-5 py-5"
      footer="Previous and next controls are intentionally visible inside the card so the carousel behavior is explicit."
    >
      <Carousel opts={{ align: "start", loop: true }}>
        <CarouselContent>
          {slides.map((slide, index) => (
            <CarouselItem key={slide.title}>
              <div
                className={`flex min-h-52 flex-col justify-end rounded-[calc(var(--radius)*1.5)] border border-border/60 bg-gradient-to-br ${slide.tone} p-4`}
              >
                <div className="flex items-center justify-between gap-3">
                  <span className="type-label text-foreground">{slide.title}</span>
                  <span className="type-supporting text-foreground/70">
                    {index + 1} / {slides.length}
                  </span>
                </div>
                <p className="type-body mt-2 max-w-[24ch] text-foreground/90">
                  {slide.detail}
                </p>
              </div>
            </CarouselItem>
          ))}
        </CarouselContent>
        <CarouselPrevious
          className="left-2 top-2 translate-y-0"
          type="button"
        />
        <CarouselNext
          className="top-2 right-2 translate-y-0"
          type="button"
        />
      </Carousel>
    </ShowcaseShell>
  )
}

