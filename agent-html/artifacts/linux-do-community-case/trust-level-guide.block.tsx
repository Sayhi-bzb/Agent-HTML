import { Badge } from "../../components/ui/badge"
import { ShieldCheckIcon } from "lucide-react"
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from "../../components/timeline"
import { cn } from "../../lib/cn"
import { artifactPublicUrlFactory } from "../../lib/public-url"

import {
  CaseSection,
  HandbookPanel,
} from "./case-components"
import { trustLevels } from "./data/trust-level-guide"

const publicUrl = artifactPublicUrlFactory("linux-do-community-case")

function TrustLevelIllustration() {
  return (
    <svg
      aria-labelledby="trust-level-illustration-title"
      className="max-h-56 w-full object-contain"
      role="img"
      viewBox="0 0 800 600"
    >
      <title id="trust-level-illustration-title">信任等级逐步提升的插图</title>
      <use
        className="fill-border"
        href={publicUrl("undraw_stepping-up.svg#undraw-stepping-up-muted")}
      />
      <use
        className="fill-ring"
        href={publicUrl("undraw_stepping-up.svg#undraw-stepping-up-accent")}
      />
      <use
        className="fill-background"
        href={publicUrl("undraw_stepping-up.svg#undraw-stepping-up-contrast")}
      />
      <use
        className="fill-muted-foreground"
        href={publicUrl("undraw_stepping-up.svg#undraw-stepping-up-skin")}
      />
      <use
        className="fill-foreground"
        href={publicUrl("undraw_stepping-up.svg#undraw-stepping-up-ink")}
      />
    </svg>
  )
}

export default function TrustLevelGuideBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection
        badge="04 / 信任等级"
        icon={<ShieldCheckIcon />}
        title="为什么新人权限一开始有限"
      >
        LINUX DO 使用信任等级来区分新账号、稳定参与者和高信任成员。它不是单纯的积分游戏，而是让社区先观察账号是否持续、真实、可靠。
      </CaseSection>

      <div className="canvas-grid-main-aside-lg">
        <HandbookPanel>
          <Timeline className="w-full" defaultValue={trustLevels.length}>
            {trustLevels.map((level, index) => (
              <TimelineItem
                className={cn(
                  "w-[calc(50%-1.5rem)] odd:ms-auto even:me-auto even:text-right even:group-data-[orientation=vertical]/timeline:ms-0 even:group-data-[orientation=vertical]/timeline:me-8",
                  "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:-right-6 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:left-auto",
                  "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-indicator]:translate-x-1/2 even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:-right-6",
                  "even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:left-auto even:group-data-[orientation=vertical]/timeline:**:data-[slot=timeline-separator]:translate-x-1/2"
                )}
                key={level.level}
                step={index + 1}
              >
                <TimelineHeader>
                  <TimelineSeparator />
                  <TimelineDate>{level.level}</TimelineDate>
                  <TimelineTitle>{level.title}</TimelineTitle>
                  <TimelineIndicator />
                </TimelineHeader>
                <TimelineContent className="canvas-stack-xs">
                  <span className="canvas-text-body font-medium text-foreground">
                    {level.role}
                  </span>
                  <span>{level.value}</span>
                </TimelineContent>
              </TimelineItem>
            ))}
          </Timeline>
        </HandbookPanel>

        <div className="canvas-stack-md">
          <figure className="flex items-center justify-center md:justify-end">
            <TrustLevelIllustration />
          </figure>
          <HandbookPanel>
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading font-semibold">新人策略</h3>
              <Badge variant="outline">先读再发</Badge>
            </div>
            <p className="canvas-text-caption text-muted-foreground">
              如果你刚来，最有效的动作不是马上大量发帖，而是稳定阅读、收藏规则、参与少量高质量讨论。
            </p>
          </HandbookPanel>
          <p className="canvas-text-body text-muted-foreground">
            当权限受限时，先去看信任等级说明。很多限制不是针对某个人，而是社区对新账号的默认保护。
          </p>
        </div>
      </div>
    </section>
  )
}
