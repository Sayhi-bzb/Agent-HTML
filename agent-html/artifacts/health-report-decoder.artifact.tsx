import { defineArtifact } from "@agent-html/react"

export default defineArtifact({
  title: "这次体检怎么记",
  blocks: [
    { id: "report-triage", title: "报告优先级" },
    { id: "lab-system-map", title: "检验项目分组" },
    { id: "ldl-range-review", title: "LDL-C 范围复核" },
    { id: "lab-trend-review", title: "检验趋势复核" },
    { id: "report-literacy-check", title: "报告阅读自查" },
    { id: "doctor-question-list", title: "就诊问题清单" },
    { id: "recent-life-context", title: "近期生活背景" },
    { id: "health-literacy-sources", title: "健康阅读资料" },
  ],
})
