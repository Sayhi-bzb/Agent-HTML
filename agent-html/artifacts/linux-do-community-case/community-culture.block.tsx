import { Badge } from "../../components/ui/badge"

import { CaseSection } from "./case-components"
import { culturePrinciples } from "./data"

export default function CommunityCultureBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="02 / 文化" title="这里鼓励什么样的相处方式">
        LINUX DO 的社区文化可以先记成四个词：真诚、友善、团结、专业。新人不需要背文案，但要理解它们对应的发言方式。
      </CaseSection>

      <div className="canvas-grid-2">
        {culturePrinciples.map((principle) => (
          <div className="canvas-stack-xs" key={principle.label}>
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading">{principle.label}</h3>
              <Badge variant="outline">{principle.role}</Badge>
            </div>
            <p className="canvas-text-body text-muted-foreground">
              {principle.interpretation}
            </p>
          </div>
        ))}
      </div>

      <p className="canvas-text-caption text-muted-foreground">
        简单判断：如果一条回复能让讨论更清楚、更可复现、更愿意继续交流，它通常就符合这里的气质。
      </p>
    </section>
  )
}
