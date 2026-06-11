import type { QuizQuestion } from "./types"

export const quizQuestions: QuizQuestion[] = [
  {
    correctOptionId: "layer-first",
    explanation:
      "红色箭头先进入关注层级，再结合参考范围、相关指标和既往记录阅读。",
    id: "red-arrow",
    options: [
      {
        id: "layer-first",
        label: "先看它属于哪一层，再准备相关背景和问题。",
      },
      {
        id: "ignore",
        label: "只要不是很高，就完全不用记录。",
      },
      {
        id: "single-answer",
        label: "看到红箭头就立刻把它当成最终答案。",
      },
    ],
    prompt: "报告里出现红色箭头时，最合理的第一步是什么？",
    relatedCode: "ALT",
  },
  {
    correctOptionId: "report-specific",
    explanation:
      "参考范围来自具体实验室和报告条件，跨报告比较时要谨慎。",
    id: "reference-range",
    options: [
      {
        id: "universal",
        label: "所有实验室的参考范围都完全一样。",
      },
      {
        id: "report-specific",
        label: "先按这份报告的范围阅读，再看是否需要和历史记录比较。",
      },
      {
        id: "label-only",
        label: "只看 H 或 L 标记，范围数字不用看。",
      },
    ],
    prompt: "为什么参考范围不能直接跨实验室当作同一把尺？",
  },
  {
    correctOptionId: "context",
    explanation:
      "ALT 轻微偏高时，复查条件和近期背景能帮助医生判断下一步。",
    id: "alt-context",
    options: [
      {
        id: "context",
        label: "记录饮酒、剧烈运动、药物和保健品等近期背景。",
      },
      {
        id: "one-number",
        label: "只带 ALT 一个数字，其他信息都不重要。",
      },
      {
        id: "skip-repeat",
        label: "不需要看是否持续出现。",
      },
    ],
    prompt: "这份示例报告里 ALT 轻微偏高，下一步更适合准备什么？",
    relatedCode: "ALT",
  },
  {
    correctOptionId: "trend",
    explanation:
      "LDL-C 的重点是连续变化和个人背景，适合带着多年记录沟通。",
    id: "ldl-trend",
    options: [
      {
        id: "trend",
        label: "带上多年 LDL-C 记录，询问需要结合哪些个人背景。",
      },
      {
        id: "single-dot",
        label: "只看 2025 年这个红点，不看之前几年。",
      },
      {
        id: "separate",
        label: "LDL-C 不需要和血压、家族史等背景一起看。",
      },
    ],
    prompt: "LDL-C 连续上升时，最有用的沟通准备是什么？",
    relatedCode: "LDL-C",
  },
  {
    correctOptionId: "sample",
    explanation:
      "尿检容易受采样、运动和近期状态影响，trace 结果适合先确认是否持续。",
    id: "urine-trace",
    options: [
      {
        id: "sample",
        label: "确认采样条件，并按医生建议复查一次标准采样。",
      },
      {
        id: "no-context",
        label: "完全不需要说明运动、感染或采样背景。",
      },
      {
        id: "only-label",
        label: "只看 trace 这个词，不看整份尿检背景。",
      },
    ],
    prompt: "尿蛋白 trace 为什么适合先确认采样和复查条件？",
    relatedCode: "UPRO",
  },
  {
    correctOptionId: "questions",
    explanation:
      "沟通清单应该输出问题、背景和历史记录，帮助下一次对话更清楚。",
    id: "doctor-list",
    options: [
      {
        id: "questions",
        label: "整理问题、背景因素、复查线索和历史记录。",
      },
      {
        id: "final-answer",
        label: "要求页面直接给出最终医学判断。",
      },
      {
        id: "hide-history",
        label: "不要带历史记录，只描述这次报告。",
      },
    ],
    prompt: "医生沟通清单最应该包含什么？",
  },
]

