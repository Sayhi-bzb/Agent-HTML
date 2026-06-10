import { Badge } from "../../components/ui/badge"
import { Progress } from "../../components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import { systemGroups } from "./data"

export function SystemMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <Badge variant="secondary">body system map</Badge>
        <h2 className="canvas-text-heading">
          每个数字都在回答一个身体系统的问题。
        </h2>
        <p className="canvas-text-body text-muted-foreground">
          指标不是孤立数字。先把它们放回身体系统，用户才知道该带着哪类问题继续看。
        </p>
      </div>

      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-content-panel canvas-stack-md">
          <svg
            aria-label="Body system locator diagram"
            className="h-80 w-full text-muted-foreground"
            role="img"
            viewBox="0 0 320 420"
          >
            <path
              className="fill-muted stroke-border"
              d="M160 32c30 0 54 24 54 54 0 22-13 41-32 49v40h42c18 0 32 14 32 32v86c0 14-9 26-22 30l-22 7v54h-34v-92h-36v92h-34v-54l-22-7c-13-4-22-16-22-30v-86c0-18 14-32 32-32h42v-40c-19-8-32-27-32-49 0-30 24-54 54-54Z"
            />
            {systemGroups.map((group, index) => {
              const x = index % 2 === 0 ? 84 : 236
              const y = 92 + index * 48

              return (
                <g key={group.id}>
                  <circle className="fill-background stroke-primary" cx={x} cy={y} r="17" />
                  <text
                    className="fill-foreground text-xs"
                    textAnchor="middle"
                    x={x}
                    y={y + 4}
                  >
                    {index + 1}
                  </text>
                  <line
                    className="stroke-border"
                    x1={x}
                    x2="160"
                    y1={y}
                    y2={y}
                  />
                </g>
              )
            })}
          </svg>
          <p className="canvas-text-caption text-muted-foreground">
            示意图只帮助定位指标分组，不表达病灶、诊断或扫描结果。
          </p>
        </div>

        <Tabs defaultValue={systemGroups[0]?.id} className="canvas-stack-md">
          <TabsList className="flex-wrap">
            {systemGroups.map((group) => (
              <TabsTrigger key={group.id} value={group.id}>
                {group.label}
              </TabsTrigger>
            ))}
          </TabsList>

          {systemGroups.map((group, index) => (
            <TabsContent className="canvas-stack-md" key={group.id} value={group.id}>
              <div className="canvas-content-panel canvas-stack-sm">
                <div className="canvas-wrap-sm items-center">
                  <Badge>{index + 1}</Badge>
                  <Badge variant="outline">{group.signal}</Badge>
                </div>
                <h3 className="canvas-text-heading">{group.label}</h3>
                <p className="canvas-text-body text-muted-foreground">
                  {group.note}
                </p>
                <div className="canvas-stack-xs">
                  <p className="canvas-text-caption text-muted-foreground">
                    示例指标
                  </p>
                  <div className="canvas-wrap-sm">
                    {group.indicators.map((indicator) => (
                      <Badge key={indicator} variant="secondary">
                        {indicator}
                      </Badge>
                    ))}
                  </div>
                </div>
                <Progress value={Math.min(95, 35 + index * 10)} />
                <p className="canvas-text-caption text-muted-foreground">
                  {group.question}
                </p>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </div>
    </section>
  )
}
