import type { TrendSeries } from "./types"

export const trendSeries: TrendSeries[] = [
  {
    code: "LDL-C",
    context: "连续几年往上走，比今年一个红点更值得问清楚。",
    points: [
      { year: "2021", value: 2.7 },
      { year: "2022", value: 3.0 },
      { year: "2023", value: 3.2 },
      { year: "2024", value: 3.5 },
      { marker: "flagged", year: "2025", value: 3.6 },
    ],
  },
  {
    code: "FPG",
    context: "接近上沿时，先看下次是不是还这样。",
    points: [
      { year: "2021", value: 5.1 },
      { year: "2022", value: 5.2 },
      { year: "2023", value: 5.6 },
      { year: "2024", value: 5.7 },
      { marker: "flagged", year: "2025", value: 5.9 },
    ],
  },
  {
    code: "ALT",
    context: "一次升高先记下运动、饮酒、用药，再看复查。",
    points: [
      { year: "2021", value: 24 },
      { year: "2022", value: 28 },
      { year: "2023", value: 26 },
      { year: "2024", value: 33 },
      { marker: "flagged", year: "2025", value: 48 },
    ],
  },
]

