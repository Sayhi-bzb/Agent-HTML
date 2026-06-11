import type { MediaAsset } from "./types"

export const mediaAssets = {
  arrivalRoute: {
    alt: "Tokyo Monorail near Haneda Airport seen from Keihinjima island.",
    caption: "Soft landing is a moving edge between airport and city.",
    credit: "Wikimedia Commons / Yamaguchi Yoshiaki / CC BY-SA 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/route-arrival-haneda-monorail.jpg",
  },
  densityRoute: {
    alt: "A view along Cat Street in Tokyo.",
    caption: "High density works best when the route stays street-readable.",
    credit: "Wikimedia Commons / Another Believer / CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:View_along_Cat_Street_in_Tokyo,_2019_-_801.jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/route-density-cat-street.jpg",
  },
  quietRoute: {
    alt: "Books along a walkway in the Kanda-Jimbocho area of Tokyo.",
    caption: "Quiet routes trade movement for time inside a neighborhood.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/open-loop-jimbocho-bookshop.jpg",
  },
  lowStimulusRoute: {
    alt: "Yanaka Ginza Street seen from Yuyake Dandan in Tokyo.",
    caption: "Low-stimulus Tokyo is neighborhood scale before it is itinerary.",
    credit: "Wikimedia Commons / SuFlyer / CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Yanaka_Ginza_Street_from_Yuyake_Dandan_(Oct_2024).jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/route-low-stimulus-yanaka-ginza.jpg",
  },
  arrival: {
    alt: "A Tokyo Monorail platform at Haneda Airport Terminal 3.",
    caption: "Airport rail makes arrival feel like a controlled first step.",
    credit: "Wikimedia Commons / MaedaAkihiko / CC0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/arrival-monorail-platform.jpg",
  },
  density: {
    alt: "A crowd reflected in the mirrored entrance of Tokyu Plaza Omotesando Harajuku.",
    caption: "High density is legible when crowd, signage, and interface align.",
    credit: "Wikimedia Commons / Basile Morin / CC BY-SA 4.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/density-omotesando-mirror-crowd.jpg",
  },
  quiet: {
    alt: "Kiyosumi Garden in Tokyo.",
    caption: "Quiet Tokyo is built from pause, texture, and dwell time.",
    credit: "Wikimedia Commons / Guilhem Vellut / CC BY 2.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/quiet-kiyosumi-garden.jpg",
  },
  openLoop: {
    alt: "A bookshop in the Kanda-Jimbocho area of Tokyo.",
    caption: "The best ending leaves one route unfinished.",
    credit: "Wikimedia Commons / Nick-D / CC BY-SA 3.0",
    sourceUrl:
      "https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/open-loop-jimbocho-bookshop.jpg",
  },
} satisfies Record<string, MediaAsset>

export const headerSlides = [
  {
    alt: "A train passenger looking out at Tokyo from a moving train.",
    caption: "Arrival begins inside the transit rhythm, before the city opens.",
    credit: "Unsplash / taro ohtani",
    label: "Soft Landing",
    note: "Day 1 begins by letting the body arrive before the city expands.",
    sourceUrl:
      "https://unsplash.com/photos/a-man-standing-on-a-train-looking-out-the-window-PrgOionplMo",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/header-train-motion.jpg",
  },
  {
    alt: "A dense group of commuters moving through a subway station.",
    caption: "Density is useful when movement, signs, and timing stay legible.",
    credit: "Pexels / Dex Planet",
    label: "High Density",
    note: "Day 2 uses density as structure: crowd flow, stations, commerce.",
    sourceUrl: "https://www.pexels.com/photo/crowd-on-the-subway-1628032/",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/header-station-density.jpg",
  },
  {
    alt: "Urban train tracks and power lines seen through a train window in Tokyo.",
    caption: "The route is a moving frame, not only a list of stops.",
    credit: "Pexels / Kaz Yura",
    label: "Route Frame",
    note: "The plan stays readable when movement becomes part of the image.",
    sourceUrl:
      "https://www.pexels.com/photo/urban-train-view-through-window-with-power-lines-33986319/",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/header-urban-route.jpg",
  },
  {
    alt: "A quiet residential alleyway in Tokyo.",
    caption: "Quiet Tokyo is made from smaller streets and lower volume.",
    credit: "Pexels / Tom Swinnen",
    label: "Open Loop",
    note: "The route ends by preserving one unfinished reason to return.",
    sourceUrl:
      "https://www.pexels.com/photo/quiet-residential-alleyway-in-tokyo-japan-31403258/",
    src: "/__agent-html/artifacts/tokyo-three-speeds/public/header-quiet-street.jpg",
  },
]
