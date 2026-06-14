import { Badge } from "../../components/ui/badge"
import { StatusBadge } from "../../components/ui/status-badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { artifactPublicUrlFactory } from "../../lib/public-url"

import {
  labItemsBySystem,
} from "./data/report"
import { statusFor } from "./data/status"
import { systems } from "./data/lab-system-map"
import type { LabItem } from "./data/types"

const publicUrl = artifactPublicUrlFactory("health-report-decoder")

function SystemItem({ item }: { item: LabItem }) {
  const meta = statusFor(item.status)

  return (
    <div className="canvas-stack-xs border-b py-3 last:border-b-0">
      <div className="canvas-wrap-sm items-center justify-between">
        <div className="canvas-wrap-sm items-center">
          <StatusBadge status={meta.status}>{item.code}</StatusBadge>
          <span>{item.label}</span>
        </div>
        <span className="canvas-text-caption">
          {item.result}
          {item.unit ? ` ${item.unit}` : ""}
        </span>
      </div>
      <p className="canvas-text-caption text-muted-foreground">
        {item.whyItMatters}
      </p>
      <p className="canvas-text-caption text-muted-foreground">
        {item.referenceRange}
      </p>
    </div>
  )
}

function SystemMapIllustration() {
  return (
    <svg
      aria-labelledby="lab-system-map-illustration-title"
      className="max-h-56 w-full object-contain pt-3"
      role="img"
      viewBox="0 0 888 618.10603"
    >
      <title id="lab-system-map-illustration-title">医疗护理记录插图</title>
      <use
        className="fill-border"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-muted")}
      />
      <use
        className="fill-ring"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-accent")}
      />
      <use
        className="fill-background"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-contrast")}
      />
      <use
        className="fill-muted-foreground"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-skin")}
      />
      <use
        className="fill-muted-foreground"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-secondary")}
      />
      <use
        className="fill-foreground"
        href={publicUrl("undraw_medical-care.svg#undraw-medical-care-ink")}
      />
    </svg>
  )
}

const systemIconById: Record<string, { label: string; src: string }> = {
  blood: {
    label: "血液图标",
    src: publicUrl("healthicons/blood-cells.svg"),
  },
  cardio: {
    label: "心脏图标",
    src: publicUrl("healthicons/heart-organ.svg"),
  },
  glucose: {
    label: "胰腺图标",
    src: publicUrl("healthicons/pancreas.svg"),
  },
  kidney: {
    label: "肾脏图标",
    src: publicUrl("healthicons/kidneys.svg"),
  },
  liver: {
    label: "肝脏图标",
    src: publicUrl("healthicons/liver.svg"),
  },
  urine: {
    label: "膀胱图标",
    src: publicUrl("healthicons/bladder.svg"),
  },
}

function SystemHealthIcon({ systemId }: { systemId: string }) {
  const icon = systemIconById[systemId]

  if (!icon) {
    return null
  }

  return (
    <img
      alt={icon.label}
      className="size-8 shrink-0 opacity-70"
      src={icon.src}
    />
  )
}

export default function LabSystemMapBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-grid-gap md:grid-cols-2">
        <div className="canvas-stack-sm">
          <Badge variant="secondary">检验项目分组</Badge>
          <h2 className="canvas-text-heading">
            一张体检单，先分成几摞。
          </h2>
          <p className="canvas-text-body text-muted-foreground">
            血常规、肝功能、血糖、血脂、尿检分开放。下次复查时，才知道该和哪一组旧记录对照。
          </p>
          <SystemMapIllustration />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          {systems.map((system) => {
            const items = labItemsBySystem(system.id)
            const flagged = items.filter((item) => item.status !== "normal")

            return (
              <div className="canvas-stack-xs" key={system.id}>
                <div className="canvas-wrap-sm items-center">
                  <SystemHealthIcon systemId={system.id} />
                  <Badge variant="outline">{system.signal}</Badge>
                </div>
                <p className="canvas-text-body">{system.label}</p>
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
