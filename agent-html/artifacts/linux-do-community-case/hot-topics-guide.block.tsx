import { BarHChart } from "../../components/chart/bar-chart"
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../../components/ui/hover-card"
import { Badge } from "../../components/ui/badge"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

import {
  CaseSection,
  HandbookChartNote,
  handbookRoughOptions,
  MechanismPanel,
  OpenRows,
} from "./case-components"
import { hotTopicGroups, hotTopicSamples } from "./data"

export default function HotTopicsGuideBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="快照 / 热门帖" title="热门帖可以怎么读">
        热门页适合新人观察社区真实讨论：这里有教程、工具实践，也有文化讨论。先把它当成阅读样本，不要把热度当成发帖模板。
      </CaseSection>

      <MechanismPanel>
        <div className="canvas-grid-main-aside-lg">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center justify-between">
              <Badge variant="outline">2026-06-15 快照</Badge>
              <a
                className="canvas-text-caption text-muted-foreground underline underline-offset-4"
                href="https://linux.do/top"
                rel="noreferrer"
                target="_blank"
              >
                linux.do/top
              </a>
            </div>
            <h2 className="canvas-text-heading">先看主题类型，再决定是否参与</h2>
            <HandbookChartNote>
              下列标题来自公开热门页快照。这里只做新人阅读导览，不代表长期榜单，也不复制帖子正文。
            </HandbookChartNote>
          </div>
          <BarHChart
            aspectRatio="5 / 3"
            data={hotTopicSamples}
            minHeight={320}
            renderer="rough"
            rough={handbookRoughOptions}
            tooltipFields={[
              {
                key: "category",
                label: "类型",
                value: "category",
              },
              {
                key: "signal",
                label: "看点",
                value: "signal",
              },
              {
                formatter: (value) => `${value}`,
                key: "readWeight",
                label: "阅读导览权重",
                value: "readWeight",
              },
            ]}
            tooltipLabel="title"
            xKey="readWeight"
            xValueFormatter={(value) => `${value}`}
            yKey="signal"
          />
        </div>
      </MechanismPanel>

      <div className="canvas-grid-main-aside-lg">
        <div className="canvas-stack-sm">
          <div className="canvas-stack-sm">
            <div className="canvas-wrap-sm items-center justify-between">
              <h3 className="canvas-text-heading">热门帖样本</h3>
              <Badge variant="secondary">悬停看读法</Badge>
            </div>
            <div className="canvas-stack-sm">
              {hotTopicSamples.map((topic) => (
                <HoverCard key={topic.title}>
                  <HoverCardTrigger asChild>
                    <a
                      className="canvas-grid-2 text-foreground"
                      href={topic.url}
                      rel="noreferrer"
                      target="_blank"
                    >
                      <div className="canvas-stack-xs">
                        <span className="canvas-text-caption text-muted-foreground">
                          {topic.rank} / {topic.category}
                        </span>
                        <span className="canvas-text-body">{topic.title}</span>
                      </div>
                      <span className="canvas-text-caption text-muted-foreground">
                        {topic.author} · {topic.publishedAt}
                      </span>
                    </a>
                  </HoverCardTrigger>
                  <HoverCardContent className="canvas-stack-xs">
                    <Badge variant="secondary">{topic.signal}</Badge>
                    <p className="canvas-text-caption text-muted-foreground">
                      作者：{topic.author} / 时间：{topic.publishedAt}
                    </p>
                    <p className="canvas-text-caption text-muted-foreground">
                      先看：{topic.newcomerFocus}
                    </p>
                    <p className="canvas-text-caption text-muted-foreground">
                      参与：{topic.participationTip}
                    </p>
                  </HoverCardContent>
                </HoverCard>
              ))}
            </div>
          </div>
        </div>

        <div className="canvas-stack-sm">
          <Tabs defaultValue={hotTopicGroups[0]?.id}>
            <TabsList>
              {hotTopicGroups.map((group) => (
                <TabsTrigger key={group.id} value={group.id}>
                  {group.label}
                </TabsTrigger>
              ))}
            </TabsList>
            {hotTopicGroups.map((group) => (
              <TabsContent
                className="canvas-stack-sm"
                key={group.id}
                value={group.id}
              >
                <p className="canvas-text-body text-muted-foreground">
                  {group.summary}
                </p>
                <OpenRows
                  items={group.topicTitles.map((title) => ({
                    label: title,
                    meta: "阅读顺序",
                    value: "先收藏、再复现、最后带着上下文提问。",
                  }))}
                />
              </TabsContent>
            ))}
          </Tabs>
        </div>
      </div>
    </section>
  )
}
