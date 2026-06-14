import type { SunburstDatum } from "../../../components/chart/sunburst-chart"

export const bundleSizeTree = {
  children: [
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    { name: "defs", value: 5 },
                    { name: "patterns", value: 4 },
                    { name: "strokes", value: 3 },
                  ],
                  name: "texture",
                },
                { name: "material", value: 14 },
                { name: "tooltip", value: 9 },
              ],
              name: "runtime",
            },
            { name: "motion", value: 4 },
            { name: "tokens", value: 3 },
          ],
          name: "shared",
        },
        {
          children: [
            { name: "bar", value: 20 },
            { name: "area", value: 9 },
            { name: "heatmap", value: 5 },
            { name: "scatter", value: 4 },
          ],
          name: "cartesian",
        },
        {
          children: [
            {
              children: [
                { name: "layout", value: 12 },
                { name: "links", value: 5 },
              ],
              name: "sankey",
            },
            { name: "network", value: 14 },
            { name: "sunburst", value: 11 },
            { name: "pie", value: 4 },
          ],
          name: "relational",
        },
      ],
      name: "charts",
    },
    {
      children: [
        {
          children: [
            { name: "table core", value: 12 },
            { name: "headers", value: 3 },
            { name: "filters", value: 2 },
          ],
          name: "tables",
        },
        {
          children: [
            {
              children: [
                { name: "menus", value: 6 },
                { name: "combobox", value: 5 },
              ],
              name: "overlays",
            },
            { name: "buttons", value: 8 },
            { name: "badges", value: 3 },
            { name: "forms", value: 4 },
          ],
          name: "controls",
        },
        { name: "status primitives", value: 7 },
      ],
      name: "ui",
    },
    {
      children: [
        {
          children: [
            { name: "metrics", value: 5 },
            { name: "tables", value: 3 },
            { name: "review shell", value: 4 },
          ],
          name: "code-review-room",
        },
        {
          children: [
            {
              children: [
                { name: "tiles", value: 7 },
                { name: "routes", value: 4 },
                { name: "pickup zones", value: 3 },
              ],
              name: "map",
            },
            { name: "flow", value: 8 },
            { name: "timeline", value: 2 },
          ],
          name: "nyc-taxi-sketchbook",
        },
        { name: "tokyo-three-speeds", value: 7 },
      ],
      name: "artifacts",
    },
    {
      children: [
        {
          children: [
            {
              children: [
                {
                  children: [
                    { name: "arcs", value: 8 },
                    { name: "paths", value: 5 },
                  ],
                  name: "shape",
                },
                { name: "pattern", value: 9 },
              ],
              name: "svg primitives",
            },
            { name: "scale", value: 7 },
            { name: "xychart", value: 13 },
          ],
          name: "visx",
        },
        {
          children: [
            { name: "hierarchy", value: 5 },
            { name: "sankey", value: 4 },
          ],
          name: "d3 layout",
        },
        {
          children: [
            { name: "roughjs", value: 12 },
            { name: "motion", value: 6 },
          ],
          name: "rough + motion",
        },
      ],
      name: "external deps",
    },
  ],
  name: "bundle size",
} satisfies SunburstDatum
