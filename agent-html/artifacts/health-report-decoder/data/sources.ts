import type { SourceLink } from "./types"

export const sourceGroups = [
  {
    label: "检验结果阅读",
    links: [
      {
        label: "MedlinePlus: How to Understand Your Lab Results",
        note: "关于参考范围和检验结果阅读方式的说明。",
        url: "https://medlineplus.gov/lab-tests/how-to-understand-your-lab-results/",
      },
      {
        label: "MedlinePlus Lab Tests",
        note: "常见实验室检查的一般说明。",
        url: "https://medlineplus.gov/lab-tests/",
      },
    ],
  },
  {
    label: "公共健康沟通",
    links: [
      {
        label: "CDC Visual Communication Resources",
        note: "清晰、易读的公共健康视觉沟通指南。",
        url: "https://www.cdc.gov/health-literacy/php/develop-materials/visual-communication.html",
      },
      {
        label: "CDC/NCHS Health infographics",
        note: "健康统计图示参考，用于低噪声趋势沟通。",
        url: "https://www.cdc.gov/nchs/hus/resources/infographics.htm",
      },
    ],
  },
  {
    label: "示例检查背景",
    links: [
      {
        label: "Mayo Clinic: Complete Blood Count",
        note: "血常规概览，仅作为一般背景，不当作个人结论。",
        url: "https://www.mayoclinic.org/tests-procedures/complete-blood-count/about/pac-20384919",
      },
    ],
  },
] satisfies Array<{ label: string; links: SourceLink[] }>

