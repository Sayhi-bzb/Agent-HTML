import type { LabItem, ReportStatus } from "./types"

export const sampleReport = {
  context: "年度体检 / 虚构示例 / 不含个人数据",
  labItems: [
    {
      code: "WBC",
      doctorQuestion:
        "白细胞和近期感染、发热、疲劳背景是否需要一起看？",
      label: "白细胞计数",
      rawNote: "范围内",
      referenceRange: "3.5-9.5",
      result: "5.8",
      status: "normal",
      systemId: "blood",
      unit: "10^9/L",
      whyItMatters: "先作为血常规背景值收好。",
    },
    {
      code: "HGB",
      doctorQuestion:
        "血红蛋白稳定时，是否只需要继续保留为背景值？",
      label: "血红蛋白",
      rawNote: "范围内",
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
      rawNote: "范围内",
      referenceRange: "0-40",
      result: "31",
      status: "normal",
      systemId: "liver",
      unit: "U/L",
      whyItMatters: "和 ALT 放在一起看，避免只盯一个数。",
    },
    {
      code: "CREA",
      doctorQuestion:
        "肌酐和 eGFR 是否需要结合饮水、运动和既往结果看？",
      label: "肌酐",
      rawNote: "范围内",
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
      rawNote: "接近上沿",
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
      rawNote: "范围内",
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
      rawNote: "范围内",
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
      rawNote: "范围内",
      referenceRange: "0-1.7",
      result: "1.3",
      status: "normal",
      systemId: "cardio",
      unit: "mmol/L",
      whyItMatters: "和 LDL-C、HDL-C 放在同一组看。",
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

export function labItemsByStatus(status: ReportStatus) {
  return sampleReport.labItems.filter((item) => item.status === status)
}

export function labItemsBySystem(systemId: string) {
  return sampleReport.labItems.filter((item) => item.systemId === systemId)
}

export function labItemByCode(code: string) {
  return sampleReport.labItems.find((item) => item.code === code)
}

