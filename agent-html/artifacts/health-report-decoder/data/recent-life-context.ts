import type { LifeContextField } from "./types"

export const lifeContextFields: LifeContextField[] = [
  {
    label: "睡眠与压力",
    prompt: "近两周是否熬夜、夜班或压力明显增加？",
    record: "睡眠时长、工作节奏、压力事件",
  },
  {
    label: "饮食与饮酒",
    prompt: "体检前是否有高脂饮食、饮酒或明显饮食变化？",
    record: "体检前 3-7 天饮食和饮酒情况",
  },
  {
    label: "运动",
    prompt: "抽血或尿检前是否有长跑、力量训练或过度疲劳？",
    record: "体检前 48 小时运动强度",
  },
  {
    label: "用药与补充剂",
    prompt: "近期是否新增处方药、非处方药或保健品？",
    record: "名称、开始时间、是否连续使用",
  },
  {
    label: "近期感染",
    prompt: "是否有感冒、发热、泌尿不适或其他急性症状？",
    record: "症状、持续时间、是否已恢复",
  },
  {
    label: "家庭病史",
    prompt: "家族中是否有高血压、糖尿病或早发心血管病？",
    record: "亲属关系、发生年龄、长期用药情况",
  },
]

