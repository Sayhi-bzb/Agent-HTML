import { artifactPublicUrlFactory } from "../../../lib/public-url"

import type { MediaAsset } from "./types"

const publicUrl = artifactPublicUrlFactory("tokyo-three-speeds")

export const mediaAssets = {
  arrivalRoute: {
    alt: "Tokyo Monorail near Haneda Airport seen from Keihinjima island.",
    caption: "Soft landing is a moving edge between airport and city.",
    credit: "Wikimedia Commons / Yamaguchi Yoshiaki / CC BY-SA 2.0",
    src: publicUrl("route-arrival-haneda-monorail.jpg"),
  },
  densityRoute: {
    alt: "A view along Cat Street in Tokyo.",
    caption: "High density works best when the route stays street-readable.",
    credit: "Wikimedia Commons / Another Believer / CC BY-SA 4.0",
    src: publicUrl("route-density-cat-street.jpg"),
  },
  quietRoute: {
    alt: "Books along a walkway in the Kanda-Jimbocho area of Tokyo.",
    caption: "Quiet routes trade movement for time inside a neighborhood.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    src: publicUrl("open-loop-jimbocho-bookshop.jpg"),
  },
  lowStimulusRoute: {
    alt: "Yanaka Ginza Street seen from Yuyake Dandan in Tokyo.",
    caption: "Low-stimulus Tokyo is neighborhood scale before it is itinerary.",
    credit: "Wikimedia Commons / SuFlyer / CC0",
    src: publicUrl("route-low-stimulus-yanaka-ginza.jpg"),
  },
  arrival: {
    alt: "A Tokyo Monorail platform at Haneda Airport Terminal 3.",
    caption: "Airport rail makes arrival feel like a controlled first step.",
    credit: "Wikimedia Commons / MaedaAkihiko / CC0",
    src: publicUrl("arrival-monorail-platform.jpg"),
  },
  density: {
    alt: "A crowd reflected in the mirrored entrance of Tokyu Plaza Omotesando Harajuku.",
    caption: "High density is legible when crowd, signage, and interface align.",
    credit: "Wikimedia Commons / Basile Morin / CC BY-SA 4.0",
    src: publicUrl("density-omotesando-mirror-crowd.jpg"),
  },
  quiet: {
    alt: "Kiyosumi Garden in Tokyo.",
    caption: "Quiet Tokyo is built from pause, texture, and dwell time.",
    credit: "Wikimedia Commons / Guilhem Vellut / CC BY 2.0",
    src: publicUrl("quiet-kiyosumi-garden.jpg"),
  },
  openLoop: {
    alt: "A bookshop in the Kanda-Jimbocho area of Tokyo.",
    caption: "The best ending leaves one route unfinished.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    src: publicUrl("open-loop-jimbocho-bookshop.jpg"),
  },
} satisfies Record<string, MediaAsset>

export const headerSlides = [
  {
    alt: "A train passenger looking out at Tokyo from a moving train.",
    caption: "Arrival begins inside the transit rhythm, before the city opens.",
    credit: "Unsplash / taro ohtani",
    label: "Soft Landing",
    note: "Day 1 begins by letting the body arrive before the city expands.",
    src: publicUrl("header-train-motion.jpg"),
  },
  {
    alt: "A dense group of commuters moving through a subway station.",
    caption: "Density is useful when movement, signs, and timing stay legible.",
    credit: "Pexels / Dex Planet",
    label: "High Density",
    note: "Day 2 uses density as structure: crowd flow, stations, commerce.",
    src: publicUrl("header-station-density.jpg"),
  },
  {
    alt: "Urban train tracks and power lines seen through a train window in Tokyo.",
    caption: "The route is a moving frame, not only a list of stops.",
    credit: "Pexels / Kaz Yura",
    label: "Route Frame",
    note: "The plan stays readable when movement becomes part of the image.",
    src: publicUrl("header-urban-route.jpg"),
  },
  {
    alt: "A quiet residential alleyway in Tokyo.",
    caption: "Quiet Tokyo is made from smaller streets and lower volume.",
    credit: "Pexels / Tom Swinnen",
    label: "Open Loop",
    note: "The route ends by preserving one unfinished reason to return.",
    src: publicUrl("header-quiet-street.jpg"),
  },
]
