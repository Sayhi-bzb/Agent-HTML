import { Badge } from "../../components/ui/badge"
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

import { CaseSection, MechanismPanel, OpenRows } from "./case-components"
import { entryRows, linuxDoSources, navigationGroups } from "./data"

export default function WhereToGoBlock() {
  return (
    <section className="canvas-stack-lg">
      <CaseSection badge="03 / 入口" title="想做一件事时，先去哪里">
        新人最容易迷路的地方不是功能复杂，而是不知道规则、工具和服务分别在哪里。先按目标找入口。
      </CaseSection>

      <MechanismPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading">新人入口表</h3>
          <Badge variant="outline">按目标找</Badge>
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
                <TableCell>{row.go}</TableCell>
                <TableCell className="text-muted-foreground">
                  {row.reason}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </MechanismPanel>

      <div className="canvas-stack-sm">
        <Tabs defaultValue={navigationGroups[0]?.id}>
          <TabsList>
            {navigationGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>
          {navigationGroups.map((group) => (
            <TabsContent className="canvas-stack-sm" key={group.id} value={group.id}>
              <OpenRows
                items={group.rows.map((row) => ({
                  label: row.target,
                  meta: row.entry,
                  value: row.detail,
                }))}
              />
            </TabsContent>
          ))}
        </Tabs>
      </div>

      <div className="canvas-grid-2">
        <SourceLinks density="compact" links={linuxDoSources.handbook} />
        <SourceLinks density="compact" links={linuxDoSources.services} />
      </div>
    </section>
  )
}
