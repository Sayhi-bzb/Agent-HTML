import { useEffect, useState } from "react"

import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel"

import { headerSlides } from "./data/media"

export default function SpeedOverviewBlock() {
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
    <section>
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
                <div className="canvas-frame-media canvas-frame-media-16-9 canvas-frame-tall">
                  <img
                    alt={slide.alt}
                    className="h-full w-full object-cover"
                    src={slide.src}
                  />
                </div>
                <figcaption className="canvas-stack-xs">
                  <div className="canvas-wrap-sm items-center justify-between">
                    <span className="canvas-text-body">{slide.label}</span>
                    <span className="canvas-text-caption text-muted-foreground">
                      {index + 1} / {headerSlides.length}
                    </span>
                  </div>
                  <p className="canvas-text-caption text-muted-foreground">
                    {slide.caption} {slide.credit}.
                  </p>
                </figcaption>
              </figure>
            </CarouselItem>
          ))}
        </CarouselContent>
      </Carousel>
    </section>
  )
}
