import { Badge } from "../../components/ui/badge"
import { SignpostIcon } from "lucide-react"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "../../components/ui/tabs"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../components/ui/table"
import { SourceLinks } from "../../components/source-links"

import { CaseSection, HandbookPanel, OpenRows } from "./case-components"
import { entryRows, navigationGroups } from "./data/where-to-go"
import { linuxDoSources } from "./data/sources"

export default function WhereToGoBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection
        badge="03 / 入口"
        icon={<SignpostIcon />}
        title="想做一件事时，先去哪里"
      >
        新人最容易迷路的地方不是功能复杂，而是不知道规则、工具和服务分别在哪里。先按目标找入口。
      </CaseSection>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading font-semibold">按目标选入口</h3>
          <Badge variant="outline">按目标找</Badge>
        </div>
        <Tabs defaultValue={entryRows[0]?.need} className="canvas-stack-md">
          <TabsList className="h-auto flex-wrap justify-start" variant="line">
            {entryRows.map((row) => (
              <TabsTrigger key={row.need} value={row.need}>
                {row.go}
              </TabsTrigger>
            ))}
          </TabsList>
          {entryRows.map((row) => (
            <TabsContent className="canvas-stack-sm" key={row.need} value={row.need}>
              <div className="canvas-stack-xs">
                <span className="canvas-text-caption text-muted-foreground">
                  你想做什么
                </span>
                <h3 className="canvas-text-heading">{row.need}</h3>
              </div>
              <div className="grid gap-4 md:grid-cols-[minmax(0,0.34fr)_minmax(0,0.66fr)]">
                <div className="canvas-stack-xs">
                  <span className="canvas-text-caption text-muted-foreground">
                    建议入口
                  </span>
                  <p className="canvas-text-body font-medium text-primary">{row.go}</p>
                </div>
                <p className="canvas-text-body text-muted-foreground">
                  {row.reason}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </HandbookPanel>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading font-semibold">常见情况推荐</h3>
          <Badge variant="outline">先走这几步</Badge>
        </div>
        <OpenRows
          items={[
            {
              label: "想发帖",
              meta: "先确认边界",
              value: "先看社区守则，再搜索旧帖；确认没有重复问题后再组织上下文。",
            },
            {
              label: "想找工具",
              meta: "先找稳定入口",
              value: "先去百宝箱，避免只靠临时帖子或别人转发的零散链接。",
            },
            {
              label: "权限受限",
              meta: "先理解机制",
              value: "先看信任等级说明，把限制当作新账号默认保护，而不是单独针对你。",
            },
          ]}
        />
      </HandbookPanel>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading font-semibold">完整入口表</h3>
          <Badge variant="outline">对照</Badge>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>你想做什么</TableHead>
              <TableHead>建议入口</TableHead>
              <TableHead>原因</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {entryRows.map((row) => (
              <TableRow key={row.need}>
                <TableCell>{row.need}</TableCell>
                <TableCell className="font-medium text-foreground">{row.go}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.reason}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </HandbookPanel>

      <div className="canvas-grid-2">
        {navigationGroups.map((group) => (
          <HandbookPanel key={group.id}>
            <h3 className="canvas-text-heading font-semibold">{group.label}</h3>
            <OpenRows
              items={group.rows.map((row) => ({
                label: row.target,
                meta: row.entry,
                value: row.detail,
              }))}
            />
          </HandbookPanel>
        ))}
      </div>

      <div className="canvas-grid-2">
        <SourceLinks density="compact" links={linuxDoSources.handbook} />
        <SourceLinks density="compact" links={linuxDoSources.services} />
      </div>
    </section>
  )
}
