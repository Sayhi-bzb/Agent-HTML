import { useEffect, useState } from "react"

import { Badge } from "../../components/ui/badge"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel"

import { headerSlides } from "./data"

export function TokyoHeaderBlock() {
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  useEffect(() => {
    if (!carouselApi || isCarouselPaused || headerSlides.length < 2) return

    const intervalId = window.setInterval(() => {
      carouselApi.scrollNext()
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [carouselApi, isCarouselPaused])

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-[0.9fr_1.1fr]">
        <div className="canvas-stack-md">
          <div className="canvas-wrap-sm items-center">
            <Badge variant="secondary">three speeds</Badge>
            <Badge variant="outline">Tokyo rhythm plan</Badge>
          </div>
          <h1 className="canvas-text-title">
            东京太丰富，所以真正的问题不是去哪，而是如何取舍。
          </h1>
          <p className="canvas-text-body text-muted-foreground">
            Three days become three city speeds: Soft Landing, High Density, and
            Quiet Tokyo. The plan is not a checklist; it is a way to manage
            energy, movement, and attention.
          </p>
        </div>

        <Carousel
          onBlur={() => setIsCarouselPaused(false)}
          onFocus={() => setIsCarouselPaused(true)}
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onPointerCancel={() => setIsCarouselPaused(false)}
          onPointerDown={() => setIsCarouselPaused(true)}
          onPointerUp={() => setIsCarouselPaused(false)}
          opts={{ align: "start", loop: true }}
          setApi={setCarouselApi}
        >
          <CarouselContent>
            {headerSlides.map((slide, index) => (
              <CarouselItem key={slide.label}>
                <figure className="canvas-stack-sm">
                  <div className="relative aspect-[16/10] overflow-hidden rounded-md bg-muted">
                    <img
                      alt={slide.asset.alt}
                      className="h-full w-full object-cover"
                      src={slide.asset.src}
                    />
                    <div className="absolute top-3 left-3 canvas-wrap-sm items-center rounded-full bg-background/85 px-3 py-1 shadow-sm backdrop-blur">
                      <span className="canvas-text-caption">{slide.label}</span>
                      <span className="canvas-text-caption text-muted-foreground">
                        {index + 1} / {headerSlides.length}
                      </span>
                    </div>
                  </div>
                  <figcaption className="canvas-stack-xs">
                    <p className="canvas-text-body">{slide.note}</p>
                    <p className="canvas-text-caption text-muted-foreground">
                      {slide.asset.caption} {slide.asset.credit}.
                    </p>
                  </figcaption>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>
    </section>
  )
}
