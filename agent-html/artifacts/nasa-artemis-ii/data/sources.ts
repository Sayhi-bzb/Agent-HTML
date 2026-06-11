import type { SourceLink } from "./types"

export const sourceLinks = {
  crew: [
    {
      label: "Artemis II Crew",
      url: "https://www.nasa.gov/feature/our-artemis-crew/",
    },
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
  ],
  launch: [
    {
      label: "Artemis II Launch Gallery",
      url: "https://www.nasa.gov/gallery/artemis-ii-launch/",
    },
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
  ],
  lunar: [
    {
      label: "Lunar Flyby Gallery",
      url: "https://www.nasa.gov/gallery/lunar-flyby/",
    },
    {
      label: "Artemis II Multimedia",
      url: "https://www.nasa.gov/artemis-ii-multimedia/",
    },
    {
      label: "Simulated Artemis II Lunar Flyby",
      url: "https://svs.gsfc.nasa.gov/5536/",
    },
  ],
  mediaUsage: [
    {
      label: "NASA Images And Media Usage",
      url: "https://www.nasa.gov/nasa-brand-center/images-and-media/",
    },
  ],
  opening: [
    {
      label: "Artemis II Multimedia",
      url: "https://www.nasa.gov/artemis-ii-multimedia/",
    },
    {
      label: "NASA Images Search",
      url: "https://images.nasa.gov/search?keywords=Artemis+II&media=image%2Cvideo%2Caudio",
    },
  ],
  return: [
    {
      label: "Artemis II Media Resources",
      url: "https://www.nasa.gov/artemis-ii-media-resources/",
    },
    {
      label: "NASA Images Search: Splashdown Recovery",
      url: "https://images.nasa.gov/search?keywords=Artemis+II+splashdown+recovery&media=image%2Cvideo%2Caudio",
    },
  ],
  route: [
    {
      label: "Artemis II Map",
      url: "https://www.nasa.gov/image-article/artemis-ii-map-2/",
    },
    {
      label: "Flight Path Animation",
      url: "https://svs.gsfc.nasa.gov/20412/",
    },
  ],
} satisfies Record<string, SourceLink[]>

