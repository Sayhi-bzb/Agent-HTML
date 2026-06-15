import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"

import { CaseSection, MechanismPanel, MechanismRows } from "./case-components"
import { entryCards, linuxDoSources } from "./data"

export default function WhatIsLinuxDoBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-main-aside-lg">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <Badge variant="secondary">新人手册</Badge>
            <h1 className="canvas-text-title">LINUX DO 是什么？</h1>
            <p className="canvas-text-body text-muted-foreground">
              LINUX DO 是一个以技术讨论、资源分享和社区协作为核心的线上社区。新人可以把它先理解成三件事：论坛负责日常交流，Wiki 负责稳定说明，社区服务负责账号、工具和资源入口。
            </p>
          </div>

          <MechanismPanel>
            <CaseSection badge="先记住" title="不要只把它当成帖子列表">
              进入 LINUX DO 以后，先用 Wiki 找规则和入口，再到论坛参与讨论。这样比直接发帖更稳，也更容易得到有效回应。
            </CaseSection>
          </MechanismPanel>
        </div>

        <MechanismPanel>
          <div className="canvas-wrap-sm items-center justify-between">
            <h2 className="canvas-text-heading">三类入口</h2>
            <Badge variant="outline">先认路</Badge>
          </div>
          <MechanismRows
            items={entryCards.map((item) => ({
              label: item.label,
              note: item.note,
              value: item.value,
            }))}
          />
        </MechanismPanel>
      </div>

      <SourceLinks density="compact" links={linuxDoSources.core} />
    </section>
  )
}
