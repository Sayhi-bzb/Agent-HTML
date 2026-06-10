import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"

import {
  labItemsBySystem,
  statusFor,
  systems,
  type LabItem,
} from "./data"

function SystemItem({ item }: { item: LabItem }) {
  const meta = statusFor(item.status)

  return (
    <div className="canvas-stack-xs border-b py-3 last:border-b-0">
      <div className="canvas-wrap-sm items-center justify-between">
        <div className="canvas-wrap-sm items-center">
          <StatusBadge status={meta.status}>{item.code}</StatusBadge>
          <span className="font-medium">{item.label}</span>
        </div>
        <span className="font-mono text-sm">
          {item.result}
          {item.unit ? ` ${item.unit}` : ""}
        </span>
      </div>
      <p className="canvas-text-caption text-muted-foreground">
        {item.whyItMatters}
      </p>
      <p className="font-mono text-xs text-muted-foreground">
        {item.referenceRange}
      </p>
    </div>
  )
}

export function SystemMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">按项目归好类</Badge>
          <h2 className="canvas-text-heading">
            一张体检单，先分成几摞。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            血常规、肝功能、血糖、血脂、尿检分开放。下次复查时，才知道该和哪一组旧记录对照。
          </p>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {systems.map((system, index) => {
            const items = labItemsBySystem(system.id)
            const flagged = items.filter((item) => item.status !== "normal")

            return (
              <div className="canvas-stack-xs p-2" key={system.id}>
                <div className="canvas-wrap-sm items-center">
                  <Badge>{index + 1}</Badge>
                  <Badge variant="outline">{system.signal}</Badge>
                </div>
                <p className="font-medium">{system.label}</p>
                <p className="canvas-text-caption text-muted-foreground">
                  {items.map((item) => item.code).join(" / ")}
                </p>
                {flagged.length ? (
                  <div className="canvas-wrap-sm">
                    {flagged.map((item) => (
                      <StatusBadge key={item.code} status={statusFor(item.status).status}>
                        {item.code}
                      </StatusBadge>
                    ))}
                  </div>
                ) : (
                  <p className="canvas-text-caption text-muted-foreground">
                    这次先收好
                  </p>
                )}
              </div>
            )
          })}
        </div>
      </div>

      <Tabs defaultValue={systems[0]?.id} className="canvas-stack-md">
        <TabsList className="flex-wrap">
          {systems.map((system) => (
            <TabsTrigger key={system.id} value={system.id}>
              {system.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {systems.map((system) => (
          <TabsContent
            className="grid gap-4 md:grid-cols-2"
            key={system.id}
            value={system.id}
          >
            <div className="canvas-stack-sm">
              <Badge variant="secondary">{system.signal}</Badge>
              <h3 className="canvas-text-heading">{system.label}</h3>
              <p className="canvas-text-body text-muted-foreground">
                {system.note}
              </p>
              <p className="canvas-text-caption text-muted-foreground">
                这里先做归档，不在页面里给原因下判断。
              </p>
            </div>

            <div className="px-1">
              {labItemsBySystem(system.id).map((item) => (
                <SystemItem item={item} key={item.code} />
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </section>
  )
}
