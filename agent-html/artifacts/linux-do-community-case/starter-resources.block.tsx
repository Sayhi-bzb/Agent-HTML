import { Alert, AlertDescription } from "../../components/ui/alert"
import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"

import { CaseSection, MechanismRows } from "./case-components"
import { linuxDoSources, newcomerTips } from "./data"

export default function StarterResourcesBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="06 / 收藏" title="新人可以先收藏这些入口">
        这份手册只负责帮你进入 LINUX DO。真正的规则、服务和工具仍以官方 Wiki 与社区页面为准。
      </CaseSection>

      <MechanismRows
        items={newcomerTips.map((tip) => ({
          label: tip.label,
          value: tip.value,
        }))}
      />

      <Alert>
        <AlertDescription>
          手册边界：这里不统计社区规模、活跃数据，不复制人员名单或非公开细节；只整理公开入口和新人行动建议。
        </AlertDescription>
      </Alert>

      <div className="canvas-stack-sm">
        <div className="canvas-wrap-sm items-center">
          <Badge variant="outline">来源与入口</Badge>
          <span className="canvas-text-caption text-muted-foreground">
            建议新人优先阅读和收藏。
          </span>
        </div>
        <SourceLinks
          density="compact"
          links={[
            ...linuxDoSources.core,
            ...linuxDoSources.handbook,
            ...linuxDoSources.services,
          ]}
        />
      </div>
    </section>
  )
}
