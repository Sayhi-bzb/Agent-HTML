export type StatusVariant = "success" | "info" | "warning" | "destructive"

export type ReportStatus = "normal" | "watch" | "recheck" | "consult"

export type LabItem = {
  code: string
  doctorQuestion: string
  flag?: "high" | "low" | "trace"
  label: string
  rawNote: string
  referenceRange: string
  result: string
  status: ReportStatus
  systemId: string
  unit: string
  whyItMatters: string
}

export type SystemGroup = {
  id: string
  label: string
  note: string
  signal: string
}

export type DoctorQueueItem = {
  code: string
  label: string
  prompt: string
  status: ReportStatus
}

export type TrendSeries = {
  code: string
  context: string
  points: Array<{
    marker?: "flagged"
    value: number
    year: string
  }>
}

export type LifeContextField = {
  label: string
  prompt: string
  record: string
}

export type SourceLink = {
  label: string
  note: string
  url: string
}

export const statusMeta = {
  normal: {
    label: "正常",
    lane: "background signal",
    status: "success",
  },
  watch: {
    label: "需观察",
    lane: "context check",
    status: "info",
  },
  recheck: {
    label: "建议复查",
    lane: "repeat under known conditions",
    status: "warning",
  },
  consult: {
    label: "咨询医生",
    lane: "bring to clinician",
    status: "destructive",
  },
} as const satisfies Record<
  ReportStatus,
  { label: string; lane: string; status: StatusVariant }
>

export const systems: SystemGroup[] = [
  {
    id: "blood",
    label: "血液与炎症",
    note: "看血细胞数量、贫血线索和炎症背景。",
    signal: "blood signal",
  },
  {
    id: "liver",
    label: "肝功能",
    note: "看肝细胞、胆道和近期生活背景相关线索。",
    signal: "processing signal",
  },
  {
    id: "kidney",
    label: "肾功能",
    note: "看过滤、代谢废物和尿酸变化。",
    signal: "filter signal",
  },
  {
    id: "glucose",
    label: "代谢与血糖",
    note: "看短期血糖和更长期糖代谢状态。",
    signal: "energy signal",
  },
  {
    id: "cardio",
    label: "心血管风险",
    note: "整理血脂、血压和家族史等长期沟通线索。",
    signal: "long-view signal",
  },
  {
    id: "urine",
    label: "尿检",
    note: "看采样、感染、排泄和代谢相关线索。",
    signal: "sample signal",
  },
]

export const sampleReport = {
  context: "annual checkup / fictional sample / no personal data",
  labItems: [
    {
      code: "WBC",
      doctorQuestion:
        "白细胞和近期感染、发热、疲劳背景是否需要一起看？",
      label: "白细胞计数",
      rawNote: "within range",
      referenceRange: "3.5-9.5",
      result: "5.8",
      status: "normal",
      systemId: "blood",
      unit: "10^9/L",
      whyItMatters: "作为炎症和血液系统背景信号保留。",
    },
    {
      code: "HGB",
      doctorQuestion:
        "血红蛋白稳定时，是否只需要继续保留为背景值？",
      label: "血红蛋白",
      rawNote: "within range",
      referenceRange: "115-150",
      result: "132",
      status: "normal",
      systemId: "blood",
      unit: "g/L",
      whyItMatters: "帮助判断血液基础状态是否稳定。",
    },
    {
      code: "ALT",
      doctorQuestion:
        "复查前是否需要记录饮酒、剧烈运动、药物或保健品？",
      flag: "high",
      label: "丙氨酸氨基转移酶",
      rawNote: "H",
      referenceRange: "0-40",
      result: "48",
      status: "recheck",
      systemId: "liver",
      unit: "U/L",
      whyItMatters: "轻微偏高需要看是否持续，以及是否有近期背景影响。",
    },
    {
      code: "AST",
      doctorQuestion:
        "AST 未同步明显变化时，ALT 轻偏高是否先复查确认？",
      label: "天门冬氨酸氨基转移酶",
      rawNote: "within range",
      referenceRange: "0-40",
      result: "31",
      status: "normal",
      systemId: "liver",
      unit: "U/L",
      whyItMatters: "和 ALT 一起帮助看肝功能信号是否成组变化。",
    },
    {
      code: "CREA",
      doctorQuestion:
        "肌酐和 eGFR 是否需要结合饮水、运动和既往结果看？",
      label: "肌酐",
      rawNote: "within range",
      referenceRange: "45-84",
      result: "71",
      status: "normal",
      systemId: "kidney",
      unit: "umol/L",
      whyItMatters: "作为肾功能过滤状态的背景值。",
    },
    {
      code: "UA",
      doctorQuestion:
        "尿酸接近上沿时，是否需要记录饮食、饮酒和复查条件？",
      label: "尿酸",
      rawNote: "near upper edge",
      referenceRange: "155-357",
      result: "352",
      status: "watch",
      systemId: "kidney",
      unit: "umol/L",
      whyItMatters: "接近参考范围上沿，适合和饮食、饮酒、既往趋势一起看。",
    },
    {
      code: "FPG",
      doctorQuestion:
        "空腹血糖接近上沿，是否需要结合 HbA1c 或复查确认？",
      flag: "high",
      label: "空腹血糖",
      rawNote: "H",
      referenceRange: "3.9-6.1",
      result: "5.9",
      status: "watch",
      systemId: "glucose",
      unit: "mmol/L",
      whyItMatters: "单次接近上沿需要结合长期指标和复查条件。",
    },
    {
      code: "HbA1c",
      doctorQuestion:
        "长期糖代谢指标稳定时，空腹血糖是否先观察和复查？",
      label: "糖化血红蛋白",
      rawNote: "within range",
      referenceRange: "4.0-6.0",
      result: "5.5",
      status: "normal",
      systemId: "glucose",
      unit: "%",
      whyItMatters: "帮助把单次血糖放进更长时间窗口。",
    },
    {
      code: "LDL-C",
      doctorQuestion:
        "LDL-C 连续升高时，需要结合哪些个人背景和既往记录？",
      flag: "high",
      label: "低密度脂蛋白胆固醇",
      rawNote: "H",
      referenceRange: "目标区间依个人背景而定",
      result: "3.6",
      status: "consult",
      systemId: "cardio",
      unit: "mmol/L",
      whyItMatters: "不是看一次红点，而是看长期趋势和个人背景。",
    },
    {
      code: "HDL-C",
      doctorQuestion:
        "HDL-C 和 LDL-C、甘油三酯是否需要一起讨论？",
      label: "高密度脂蛋白胆固醇",
      rawNote: "within range",
      referenceRange: ">1.0",
      result: "1.4",
      status: "normal",
      systemId: "cardio",
      unit: "mmol/L",
      whyItMatters: "作为血脂组合的一部分，而不是单独解读。",
    },
    {
      code: "TG",
      doctorQuestion:
        "甘油三酯是否受前一晚饮食、饮酒或空腹状态影响？",
      label: "甘油三酯",
      rawNote: "within range",
      referenceRange: "0-1.7",
      result: "1.3",
      status: "normal",
      systemId: "cardio",
      unit: "mmol/L",
      whyItMatters: "帮助把血脂结果放进同一组信号。",
    },
    {
      code: "UPRO",
      doctorQuestion:
        "尿蛋白 trace 是否需要按标准采样复查一次？",
      flag: "trace",
      label: "尿蛋白",
      rawNote: "trace",
      referenceRange: "negative",
      result: "trace",
      status: "recheck",
      systemId: "urine",
      unit: "",
      whyItMatters: "采样、运动、近期感染都可能影响尿检，需要先确认是否持续。",
    },
  ] satisfies LabItem[],
}

export const activeIndicatorCode = "LDL-C"

export const trendSeries: TrendSeries[] = [
  {
    code: "LDL-C",
    context: "连续抬升比某一次红点更值得带去沟通。",
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
    context: "接近上沿时，下一步通常是确认是否持续。",
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
    context: "一次升高要和运动、饮酒、用药、复查一起看。",
    points: [
      { year: "2021", value: 24 },
      { year: "2022", value: 28 },
      { year: "2023", value: 26 },
      { year: "2024", value: 33 },
      { marker: "flagged", year: "2025", value: 48 },
    ],
  },
]

export const doctorQueue: DoctorQueueItem[] = sampleReport.labItems
  .filter((item) => item.status !== "normal")
  .map((item) => ({
    code: item.code,
    label: item.label,
    prompt: item.doctorQuestion,
    status: item.status,
  }))

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

export const sourceGroups = [
  {
    label: "Lab result literacy",
    links: [
      {
        label: "MedlinePlus: How to Understand Your Lab Results",
        note: "Reference range and lab result interpretation guidance.",
        url: "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/",
      },
      {
        label: "MedlinePlus Lab Tests",
        note: "General explanations for common laboratory tests.",
        url: "https://medlineplus.gov/lab-tests/",
      },
    ],
  },
  {
    label: "Public health communication",
    links: [
      {
        label: "CDC Visual Communication Resources",
        note: "Plain, accessible public health visual communication guidance.",
        url: "https://www.cdc.gov/health-literacy/php/develop-materials/visual-communication.html",
      },
      {
        label: "CDC/NCHS Health infographics",
        note: "Health statistics infographic reference for low-noise trend communication.",
        url: "https://www.cdc.gov/nchs/hus/resources/infographics.htm",
      },
    ],
  },
  {
    label: "Example test context",
    links: [
      {
        label: "Mayo Clinic: Complete Blood Count",
        note: "CBC overview used as general context, not as diagnostic guidance.",
        url: "https://www.mayoclinic.org/tests-procedures/complete-blood-count/about/pac-20384919",
      },
    ],
  },
] satisfies Array<{ label: string; links: SourceLink[] }>

export function labItemsByStatus(status: ReportStatus) {
  return sampleReport.labItems.filter((item) => item.status === status)
}

export function labItemsBySystem(systemId: string) {
  return sampleReport.labItems.filter((item) => item.systemId === systemId)
}

export function labItemByCode(code: string) {
  return sampleReport.labItems.find((item) => item.code === code)
}

export function statusFor(status: ReportStatus) {
  return statusMeta[status]
}
