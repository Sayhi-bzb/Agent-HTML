import type { SystemGroup } from "./types"

export const systems: SystemGroup[] = [
  {
    id: "blood",
    label: "血液与炎症",
    note: "看血细胞数量、贫血线索和炎症背景。",
    signal: "血常规",
  },
  {
    id: "liver",
    label: "肝功能",
    note: "看肝细胞、胆道和近期生活背景相关线索。",
    signal: "肝功能",
  },
  {
    id: "kidney",
    label: "肾功能",
    note: "看过滤、代谢废物和尿酸变化。",
    signal: "肾功能",
  },
  {
    id: "glucose",
    label: "代谢与血糖",
    note: "看短期血糖和更长期糖代谢状态。",
    signal: "血糖",
  },
  {
    id: "cardio",
    label: "心血管风险",
    note: "整理血脂、血压和家族史等长期沟通线索。",
    signal: "血脂",
  },
  {
    id: "urine",
    label: "尿检",
    note: "看采样、感染、排泄和代谢相关线索。",
    signal: "尿检",
  },
]

