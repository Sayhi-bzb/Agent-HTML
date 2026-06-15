import { Badge } from "../../components/ui/badge"
import { SourceLinks } from "../../components/source-links"
import { CompassIcon } from "lucide-react"
import { artifactPublicUrlFactory } from "../../lib/public-url"

import {
  CaseSection,
  HandbookPanel,
  OpenRows,
} from "./case-components"
import { entryCards } from "./data/entry-overview"
import { linuxDoSources } from "./data/sources"

const publicUrl = artifactPublicUrlFactory("linux-do-community-case")

function NewcomerHandbookIllustration() {
  const asset =
    "bouncy-delivered-boxes-and-phone-with-a-message-that-the-order-has-arrived-at-its-destination.svg"

  return (
    <svg
      aria-labelledby="newcomer-handbook-illustration-title"
      className="h-auto max-h-80 w-full object-contain"
      role="img"
      viewBox="0 0 2500 2500"
    >
      <title id="newcomer-handbook-illustration-title">
        已送达包裹与手机消息插图
      </title>
      <use
        className="fill-primary"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-primary`)}
      />
      <use
        className="fill-accent"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-accent`)}
      />
      <use
        className="fill-background"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-contrast`)}
      />
      <use
        className="fill-ring"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-secondary`)}
      />
      <use
        className="fill-muted-foreground"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-muted`)}
      />
      <use
        className="fill-foreground"
        href={publicUrl(`${asset}#bouncy-delivered-boxes-ink`)}
      />
    </svg>
  )
}

export default function WhatIsLinuxDoBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-main-aside-lg">
        <div className="canvas-stack-md">
          <div className="canvas-stack-sm">
            <Badge variant="secondary">新人手册</Badge>
            <h1 className="canvas-text-title font-semibold">LINUX DO 是什么？</h1>
            <p className="canvas-text-body text-muted-foreground">
              LINUX DO 是一个以技术讨论、资源分享和社区协作为核心的线上社区。新人可以把它先理解成三件事：论坛负责日常交流，Wiki 负责稳定说明，社区服务负责账号、工具和资源入口。
            </p>
          </div>

          <CaseSection
            badge="先记住"
            icon={<CompassIcon />}
            title="不要只把它当成帖子列表"
          >
            进入 LINUX DO 以后，先用 Wiki 找规则和入口，再到论坛参与讨论。这样比直接发帖更稳，也更容易得到有效回应。
          </CaseSection>
        </div>

        <figure className="flex items-center justify-center md:justify-end">
          <NewcomerHandbookIllustration />
        </figure>
      </div>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h2 className="canvas-text-heading font-semibold">三类入口</h2>
          <Badge variant="outline">先认路</Badge>
        </div>
        <OpenRows
          items={entryCards.map((item) => ({
            label: item.label,
            meta: item.note,
            value: item.value,
          }))}
        />
      </HandbookPanel>

      <SourceLinks density="compact" links={linuxDoSources.core} />
    </section>
  )
}
