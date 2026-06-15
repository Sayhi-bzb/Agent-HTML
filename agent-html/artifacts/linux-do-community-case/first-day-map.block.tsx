import { MapIcon } from "lucide-react"
import { artifactPublicUrlFactory } from "../../lib/public-url"

import {
  CaseSection,
  HandbookPanel,
  RouteStepCard,
} from "./case-components"
import { firstDaySteps } from "./data/first-day-map"

const publicUrl = artifactPublicUrlFactory("linux-do-community-case")

function FirstDayMapIllustration() {
  return (
    <svg
      aria-labelledby="first-day-map-illustration-title"
      className="size-14 shrink-0 fill-ring sm:size-16"
      role="img"
      viewBox="0 0 192.383 210.517"
    >
      <title id="first-day-map-illustration-title">人工智能标识插图</title>
      <use
        href={publicUrl(
          "bouncy-artificial-intelligence-sign.svg#bouncy-artificial-intelligence-sign"
        )}
      />
    </svg>
  )
}

export default function FirstDayMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection
        badge="01 / 第一天"
        icon={<MapIcon />}
        title="新人第一天先做什么"
      >
        第一天不用急着证明自己。先认路、读规则、理解信任等级，再开始发言，会比直接求助或转发资源更顺。
      </CaseSection>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading font-semibold">四步就够</h3>
          <FirstDayMapIllustration />
        </div>
        <p className="canvas-text-body text-muted-foreground">
          第一天的目标不是马上成为活跃成员，而是完成基本认路：知道哪里讨论、哪里查规则、哪里找工具。
        </p>
      </HandbookPanel>

      <div className="grid gap-5 md:grid-cols-4">
        {firstDaySteps.map((step) => (
          <RouteStepCard
            action={step.action}
            key={step.step}
            step={step.step}
            title={step.title}
            value={step.value}
          />
        ))}
      </div>
    </section>
  )
}
