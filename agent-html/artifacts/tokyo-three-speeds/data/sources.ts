import type { SourceLink } from "./types"

export const sourceGroups = [
  {
    label: "Photos",
    links: [
      {
        label: "Tokyo Monorail near Haneda",
        note: "Arrival route photo. Wikimedia Commons, Yamaguchi Yoshiaki, CC BY-SA 2.0.",
        url: "https://commons.wikimedia.org/wiki/File:Tokyo_monorail_-_Haneda_airport_view_from_Keihinjima_island_(488414141).jpg",
      },
      {
        label: "Cat Street, Tokyo",
        note: "Density route photo. Wikimedia Commons, Another Believer, CC BY-SA 4.0.",
        url: "https://commons.wikimedia.org/wiki/File:View_along_Cat_Street_in_Tokyo,_2019_-_801.jpg",
      },
      {
        label: "Books along Kanda-Jimbocho walkway",
        note: "Quiet route photo. Wikimedia Commons, Nick-D, CC BY-SA 3.0.",
        url: "https://commons.wikimedia.org/wiki/File:Books_along_a_walkway_in_the_Kanda-Jimbocho_area_of_Tokyo.JPG",
      },
      {
        label: "Yanaka Ginza from Yuyake Dandan",
        note: "Low-stimulus route photo. Wikimedia Commons, SuFlyer, CC0.",
        url: "https://commons.wikimedia.org/wiki/File:Yanaka_Ginza_Street_from_Yuyake_Dandan_(Oct_2024).jpg",
      },
      {
        label: "Tokyo Monorail Haneda platform",
        note: "Arrival photo. Wikimedia Commons, MaedaAkihiko, CC0.",
        url: "https://commons.wikimedia.org/wiki/File:Tokyo-Monorail_Haneda-Airport-Terminal-3-STA_Platforms.jpg",
      },
      {
        label: "Omotesando mirror crowd",
        note: "Density photo. Wikimedia Commons, Basile Morin, CC BY-SA 4.0.",
        url: "https://commons.wikimedia.org/wiki/File:Street_crowd_reflecting_in_the_polyhedral_mirrors_of_the_station_Tokyu_Plaza_Omotesando,_Harajuku,_Tokyo,_Japan.jpg",
      },
      {
        label: "Kiyosumi Garden",
        note: "Quiet photo. Wikimedia Commons, Guilhem Vellut, CC BY 2.0.",
        url: "https://commons.wikimedia.org/wiki/File:Kiyosumi_Garden_(9224595703).jpg",
      },
      {
        label: "Kanda-Jimbocho bookshop",
        note: "Open loop photo. Wikimedia Commons, Nick-D, CC BY-SA 3.0.",
        url: "https://commons.wikimedia.org/wiki/File:Bookshop_in_Kanda-Jimbocho_area_of_Tokyo.JPG",
      },
      {
        label: "Tokyo train motion",
        note: "Header photo. Unsplash.",
        url: "https://unsplash.com/photos/a-man-standing-on-a-train-looking-out-the-window-PrgOionplMo",
      },
      {
        label: "Subway crowd",
        note: "Header photo. Pexels, Dex Planet.",
        url: "https://www.pexels.com/photo/crowd-on-the-subway-1628032/",
      },
      {
        label: "Urban train window",
        note: "Header photo. Pexels, Kaz Yura.",
        url: "https://www.pexels.com/photo/urban-train-view-through-window-with-power-lines-33986319/",
      },
      {
        label: "Quiet residential alleyway",
        note: "Header photo. Pexels, Tom Swinnen.",
        url: "https://www.pexels.com/photo/quiet-residential-alleyway-in-tokyo-japan-31403258/",
      },
    ],
  },
  {
    label: "Maps and transit",
    links: [
      {
        label: "OpenStreetMap copyright",
        note: "Map layer attribution: © OpenStreetMap contributors, ODbL.",
        url: "https://www.openstreetmap.org/copyright",
      },
      {
        label: "ODPT Overview",
        note: "Transit and transfer context. Developer terms apply.",
        url: "https://www.odpt.org/en/overview/",
      },
      {
        label: "Tokyo Tourism Data Catalog",
        note: "Area intensity context; do not imply official conclusions after processing.",
        url: "https://data.tourism.metro.tokyo.lg.jp/en/",
      },
      {
        label: "Tokyo Tourism mobile data",
        note: "Mobile data attribution: 出典：モバイル空間統計.",
        url: "https://data.tourism.metro.tokyo.lg.jp/data/mobile/",
      },
    ],
  },
  {
    label: "Illustrations",
    links: [
      {
        label: "Open Doodles Zombieing",
        note: "Open Doodles illustration used as the open-loop travel note visual.",
        url: "https://opendoodles.com/",
      },
    ],
  },
  {
    label: "Official place context",
    links: [
      {
        label: "GO TOKYO Haneda access",
        note: "Official access context for arrival and first transfer.",
        url: "https://www.gotokyo.org/en/plan/airport-access/haneda-airport/index.html",
      },
      {
        label: "GO TOKYO Shibuya",
        note: "Day 2 density route context.",
        url: "https://www.gotokyo.org/en/destinations/western-tokyo/shibuya/index.html",
      },
      {
        label: "GO TOKYO Shinjuku",
        note: "Day 2 station, nightlife, and return-planning context.",
        url: "https://www.gotokyo.org/en/destinations/western-tokyo/shinjuku/index.html",
      },
      {
        label: "GO TOKYO Aoyama and Omotesando",
        note: "Day 2 design-facing street context.",
        url: "https://www.gotokyo.org/en/destinations/western-tokyo/aoyama-and-omotesando/index.html",
      },
      {
        label: "GO TOKYO Kiyosumi-Shirakawa",
        note: "Day 3 garden and quiet-route context.",
        url: "https://www.gotokyo.org/en/destinations/eastern-tokyo/kiyosumi-shirakawa/index.html",
      },
      {
        label: "GO TOKYO Kanda and Jimbocho",
        note: "Quiet and open-loop route context.",
        url: "https://www.gotokyo.org/en/destinations/central-tokyo/kanda-and-jimbocho/index.html",
      },
      {
        label: "GO TOKYO Yanaka and Nezu",
        note: "Day 3 neighborhood-scale walking context.",
        url: "https://www.gotokyo.org/en/destinations/northern-tokyo/yanaka-and-nezu/index.html",
      },
    ],
  },
] satisfies Array<{ label: string; links: SourceLink[] }>

