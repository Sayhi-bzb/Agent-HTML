import { useEffect, useState } from "react"

import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import {
  Carousel,
  type CarouselApi,
  CarouselContent,
  CarouselItem,
} from "../../components/ui/carousel"

import { lunarMediaBeats } from "./data/lunar-flyby"
import { mediaAssets } from "./data/media"

export default function LunarFlybyBlock() {
  const gallery = mediaAssets.lunarFlyby.gallery
  const [carouselApi, setCarouselApi] = useState<CarouselApi>()
  const [isCarouselPaused, setIsCarouselPaused] = useState(false)

  useEffect(() => {
    if (!carouselApi || isCarouselPaused || gallery.length < 2) return

    const intervalId = window.setInterval(() => {
      carouselApi.scrollNext()
    }, 4000)

    return () => window.clearInterval(intervalId)
  }, [carouselApi, gallery.length, isCarouselPaused])

  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-md">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="secondary">lunar flyby</Badge>
          <StatusBadge status="info">visual climax</StatusBadge>
        </div>
        <h2 className="canvas-text-heading">
          The Moon is no longer a distant object in the night sky; it is a real
          landmark in flight.
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          Fewer, stronger visuals carry the flyby: one primary lunar pass and
          supporting frames for distance, scale, solitude, and the Earth-Moon
          relationship.
        </p>

        <Carousel
          onFocus={() => setIsCarouselPaused(true)}
          onBlur={() => setIsCarouselPaused(false)}
          onMouseEnter={() => setIsCarouselPaused(true)}
          onMouseLeave={() => setIsCarouselPaused(false)}
          onPointerCancel={() => setIsCarouselPaused(false)}
          onPointerDown={() => setIsCarouselPaused(true)}
          onPointerUp={() => setIsCarouselPaused(false)}
          opts={{ align: "start", loop: true }}
          setApi={setCarouselApi}
        >
          <CarouselContent>
            {gallery.map((asset, index) => (
              <CarouselItem key={asset.src}>
                <figure className="canvas-stack-sm">
                  <div className="canvas-frame-media aspect-[16/10] max-h-screen">
                    <img
                      alt={asset.alt}
                      className="h-full w-full object-cover"
                      src={asset.src}
                    />
                  </div>
                  <p className="canvas-text-caption text-muted-foreground">
                    Frame {index + 1} of {gallery.length}. {asset.caption} {asset.credit}.
                  </p>
                </figure>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel>
      </div>

      <div className="canvas-grid-2">
        <figure className="canvas-stack-sm">
          <video
            className="max-h-80 w-full rounded-md"
            controls
            muted
            preload="metadata"
            src={mediaAssets.lunarFlyby.flybyVideo.src}
          >
            This browser cannot play the simulated Artemis II lunar flyby video.
          </video>
          <p className="canvas-text-caption text-muted-foreground">
            {mediaAssets.lunarFlyby.flybyVideo.caption} {mediaAssets.lunarFlyby.flybyVideo.credit}.
          </p>
        </figure>
        <div className="canvas-grid-gap-md">
          {lunarMediaBeats.map((beat) => (
            <article className="canvas-stack-xs" key={beat.angle}>
              <Badge variant="outline">{beat.angle}</Badge>
              <p className="canvas-text-body text-muted-foreground">
                {beat.title}
              </p>
            </article>
          ))}
        </div>
      </div>
    </section>
  )
}
