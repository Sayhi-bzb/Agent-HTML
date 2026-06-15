import { useState } from "react"
import { ListChecksIcon } from "lucide-react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../../components/ui/accordion"
import { Alert, AlertDescription } from "../../components/ui/alert"
import { CodeBlock } from "../../components/code-block"
import { Progress } from "../../components/ui/progress"
import { StatusBadge } from "../../components/ui/status-badge"
import { SourceLinks } from "../../components/source-links"

import {
  CaseSection,
  ChecklistItem,
  HandbookPanel,
} from "./case-components"
import {
  postingChecklist,
} from "./data/posting-checklist"
import { linuxDoSources } from "./data/sources"

export default function PostingChecklistBlock() {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(
    () => new Set(postingChecklist.map((item) => item.label))
  )
  const readyCount = checkedItems.size
  const readyProgress = (readyCount / postingChecklist.length) * 100
  const readyLabel =
    readyCount === postingChecklist.length ? "可以发帖" : "继续补齐"

  function updateChecklistItem(label: string, checked: boolean) {
    setCheckedItems((current) => {
      const next = new Set(current)

      if (checked) {
        next.add(label)
      } else {
        next.delete(label)
      }

      return next
    })
  }

  return (
    <section className="canvas-stack-lg">
      <CaseSection
        badge="五项自检"
        icon={<ListChecksIcon />}
        title="发帖前检查这几件事"
      >
        好帖子不一定很长，但应该让别人能快速判断你在说什么、需要什么、已经尝试过什么。
      </CaseSection>

      <HandbookPanel>
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-heading font-semibold">五项自检</h3>
          <StatusBadge status={readyCount === postingChecklist.length ? "success" : "default"}>
            {readyCount}/{postingChecklist.length} {readyLabel}
          </StatusBadge>
        </div>
        <Progress aria-label="发帖前自检完成度" value={readyProgress} />
        <div className="grid gap-4 md:grid-cols-2">
          {postingChecklist.map((item) => (
            <ChecklistItem
              checked={checkedItems.has(item.label)}
              hint={item.hint}
              key={item.label}
              label={item.label}
              onCheckedChange={(checked) =>
                updateChecklistItem(item.label, checked)
              }
            />
          ))}
        </div>

        <div className="canvas-grid-main-aside-lg">
          <div className="canvas-stack-sm">
            <Alert>
              <AlertDescription>
                如果不确定能不能发，先看社区守则；如果不确定去哪发，先搜索旧帖或看 Wiki 入口。
              </AlertDescription>
            </Alert>
            <CodeBlock
              code={`不利于别人回答
- 求助，跑不起来，急。
- 有没有大佬直接给个完整方案？
- 试了很多办法都不行。

更容易得到有效回应
+ 环境：Windows 11 / Node 22 / pnpm 10。
+ 目标：本地启动服务并访问登录页。
+ 已尝试：重新安装依赖、清理缓存、检查端口占用。
+ 卡点：npm run dev 后出现 EADDRINUSE，想确认正确处理方式。`}
              language="diff"
              title="发帖前后对照"
              wrap
            />
            <SourceLinks density="compact" links={linuxDoSources.handbook} />
          </div>

          <Accordion collapsible defaultValue={postingChecklist[0]?.label} type="single">
            {postingChecklist.map((item) => (
              <AccordionItem key={item.label} value={item.label}>
                <AccordionTrigger>
                  <span className="canvas-wrap-sm items-center">
                    <StatusBadge>检查</StatusBadge>
                    <span className="font-medium">{item.label}</span>
                  </span>
                </AccordionTrigger>
                <AccordionContent>
                  <p className="canvas-text-caption text-muted-foreground">
                    {item.value}
                  </p>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </HandbookPanel>
    </section>
  )
}
