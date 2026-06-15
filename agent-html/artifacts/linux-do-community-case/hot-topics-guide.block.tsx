import { Badge } from "../../components/ui/badge"
import { FlameIcon } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"

import {
  CaseSection,
  HandbookPanel,
  OpenRows,
  TopicSampleCard,
} from "./case-components"
import { hotTopicGroups, hotTopicSamples } from "./data/hot-topics-guide"

const hotTopicFilters = [
  {
    id: "all",
    label: "全部",
    topics: hotTopicSamples,
  },
  ...hotTopicGroups.map((group) => ({
    id: group.id,
    label: group.label,
    topics: hotTopicSamples.filter((topic) =>
      (group.topicTitles as readonly string[]).includes(topic.title)
    ),
  })),
]

export default function HotTopicsGuideBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection
        badge="快照 / 热门帖"
        icon={<FlameIcon />}
        title="热门帖可以怎么读"
      >
        热门页适合新人观察社区真实讨论：这里有教程、工具实践，也有文化讨论。先把它当成阅读样本，不要把热度当成发帖模板。
      </CaseSection>

      <HandbookPanel>
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
        <p className="canvas-text-body text-muted-foreground">
          下列标题来自公开热门页快照。这里只做新人阅读导览，不代表长期榜单，也不复制帖子正文。
        </p>
      </HandbookPanel>

      <div className="canvas-stack-md">
        <Tabs defaultValue="all" className="canvas-stack-sm">
          <div className="canvas-wrap-sm items-center justify-between">
            <h3 className="canvas-text-heading font-semibold">热门帖</h3>
            <TabsList variant="line">
              {hotTopicFilters.map((filter) => (
                <TabsTrigger key={filter.id} value={filter.id}>
                  {filter.label}
                </TabsTrigger>
              ))}
            </TabsList>
          </div>
          {hotTopicFilters.map((filter) => (
            <TabsContent className="canvas-stack-sm" key={filter.id} value={filter.id}>
              {filter.topics.map((topic) => (
                <TopicSampleCard
                  author={topic.author}
                  category={topic.category}
                  focus={topic.newcomerFocus}
                  key={topic.title}
                  publishedAt={topic.publishedAt}
                  rank={topic.rank}
                  signal={topic.signal}
                  title={topic.title}
                  url={topic.url}
                />
              ))}
            </TabsContent>
          ))}
        </Tabs>

        <HandbookPanel>
          <h3 className="canvas-text-heading font-semibold">按类型读</h3>
          <OpenRows
            items={hotTopicGroups.map((group) => ({
              label: group.label,
              meta: `${group.topicTitles.length} 个样本`,
              value: group.summary,
            }))}
          />
        </HandbookPanel>
      </div>
    </section>
  )
}
