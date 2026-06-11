export const mediaAssets = {
  crew: {
    christinaKoch: {
      alt: "Official NASA portrait of Artemis II mission specialist Christina Koch.",
      caption: "Christina Koch, mission specialist.",
      credit: "Credit: NASA",
      src: "/__agent-html/artifacts/nasa-artemis-ii/public/crew-christina-koch.jpg",
    },
    jeremyHansen: {
      alt: "Official portrait of Artemis II mission specialist Jeremy Hansen.",
      caption: "Jeremy Hansen, mission specialist.",
      credit: "Credit: NASA",
      src: "/__agent-html/artifacts/nasa-artemis-ii/public/crew-jeremy-hansen.jpg",
    },
    reidWiseman: {
      alt: "Official NASA portrait of Artemis II commander Reid Wiseman.",
      caption: "Reid Wiseman, commander.",
      credit: "Credit: NASA",
      src: "/__agent-html/artifacts/nasa-artemis-ii/public/crew-reid-wiseman.jpg",
    },
    victorGlover: {
      alt: "Official NASA portrait of Artemis II pilot Victor Glover.",
      caption: "Victor Glover, pilot.",
      credit: "Credit: NASA",
      src: "/__agent-html/artifacts/nasa-artemis-ii/public/crew-victor-glover.jpg",
    },
  },
  launch: {
    alt: "SLS rocket lifting off for Artemis II from Launch Complex 39B.",
    caption: "SLS launch imagery anchors the system ignition scene.",
    credit: "Credit: NASA",
    src: "/__agent-html/artifacts/nasa-artemis-ii/public/launch-sls.jpg",
  },
  lunarFlyby: {
    flybyVideo: {
      caption:
        "A simulated Orion viewpoint turns the lunar flyby into motion, not only a still landmark.",
      credit: "Credit: NASA Scientific Visualization Studio",
      src: "https://svs.gsfc.nasa.gov/vis/a000000/a005500/a005536/a2_flyby_1min_1080p30.mp4",
    },
    gallery: [
      {
        alt: "Earth setting behind the Moon's horizon during the Artemis II lunar flyby.",
        caption:
          "Earthset beyond the lunar horizon turns the Moon into a flight landmark.",
        credit: "Credit: NASA",
        src: "/__agent-html/artifacts/nasa-artemis-ii/public/lunar-earthset.jpg",
      },
      {
        alt: "The Moon backlit by the Sun during an in-space solar eclipse, with Orion visible in the foreground.",
        caption:
          "The Moon crossing the Sun makes the flyby feel precise and spacecraft-scale.",
        credit: "Credit: NASA",
        src: "/__agent-html/artifacts/nasa-artemis-ii/public/lunar-solar-eclipse.jpg",
      },
      {
        alt: "The Moon and Earth captured in one frame during the Artemis II lunar flyby.",
        caption:
          "Moon and Earth share one frame as Orion crosses lunar space.",
        credit: "Credit: NASA",
        src: "/__agent-html/artifacts/nasa-artemis-ii/public/lunar-moon-earth.jpg",
      },
      {
        alt: "A detailed lunar surface view with a distant Earth setting in the background.",
        caption:
          "Cratered terrain and distant Earth compress the scale of the flyby.",
        credit: "Credit: NASA",
        src: "/__agent-html/artifacts/nasa-artemis-ii/public/lunar-surface-earth.jpg",
      },
      {
        alt: "The Moon peeking above the Orion spacecraft window sill during Artemis II.",
        caption:
          "A close lunar view keeps the pass tied to the crew's spacecraft perspective.",
        credit: "Credit: NASA",
        src: "/__agent-html/artifacts/nasa-artemis-ii/public/lunar-window-moon.jpg",
      },
    ],
  },
  opening: {
    alt: "Earth seen from Orion during Artemis II.",
    caption: "Earth seen from Orion establishes the first-person deep-space view.",
    credit: "Credit: NASA",
    src: "/__agent-html/artifacts/nasa-artemis-ii/public/opening-earth-orion.jpg",
  },
  recovery: {
    alt: "Recovery operations after Artemis II splashdown.",
    caption: "Recovery confirms the mission's operational closure.",
    credit: "Credit: NASA",
    src: "/__agent-html/artifacts/nasa-artemis-ii/public/recovery-operations.jpg",
  },
  route: {
    alt: "Artemis II mission map showing the flight path around the Moon and back to Earth.",
    caption: "The mission map turns the crewed lunar flyby into a readable flight path.",
    credit: "Credit: NASA Scientific Visualization Studio",
    src: "/__agent-html/artifacts/nasa-artemis-ii/public/route-mission-map.png",
  },
  splashdown: {
    alt: "Orion spacecraft after Artemis II splashdown.",
    caption: "Splashdown brings the flight back to Earth.",
    credit: "Credit: NASA",
    src: "/__agent-html/artifacts/nasa-artemis-ii/public/splashdown-orion.jpg",
  },
} satisfies Record<string, unknown>
