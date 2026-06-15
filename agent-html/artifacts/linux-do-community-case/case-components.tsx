import type { ReactNode } from "react"

import { Badge } from "../../components/ui/badge"
import { Checkbox } from "../../components/ui/checkbox"
import { cn } from "../../lib/cn"
import type { ChartRoughOptions } from "../../components/chart/types"

export const handbookRoughOptions = {
  fillStyle: "hachure",
  fillWeight: 1,
  hachureGap: 4,
  roughness: 2.8,
  stroke: "currentColor",
  strokeWidth: 1,
} satisfies ChartRoughOptions

export function CaseSection({
  badge,
  children,
  title,
}: {
  badge: string
  children: ReactNode
  title: string
}) {
  return (
    <div className="canvas-stack-sm">
      <div className="canvas-stack-xs">
        <Badge variant="secondary">{badge}</Badge>
        <h2 className="canvas-text-heading">{title}</h2>
      </div>
      <p className="canvas-text-body text-muted-foreground">{children}</p>
    </div>
  )
}

export function MechanismPanel({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        "canvas-content-panel canvas-stack-sm",
        className
      )}
    >
      {children}
    </div>
  )
}

export function MechanismRows({
  items,
}: {
  items: Array<{ label: ReactNode; note?: ReactNode; value: ReactNode }>
}) {
  return (
    <div className="canvas-stack-xs">
      {items.map((item) => (
        <div
          className="canvas-grid-2 border-b border-border py-3 last:border-b-0"
          key={String(item.label)}
        >
          <div className="canvas-stack-xs">
            <span className="canvas-text-caption text-muted-foreground">
              {item.label}
            </span>
            {item.note ? (
              <span className="canvas-text-caption text-muted-foreground">
                {item.note}
              </span>
            ) : null}
          </div>
          <div className="canvas-text-body text-foreground">{item.value}</div>
        </div>
      ))}
    </div>
  )
}

export function OpenRows({
  items,
}: {
  items: Array<{ label: ReactNode; meta?: ReactNode; value: ReactNode }>
}) {
  return (
    <div className="canvas-stack-sm">
      {items.map((item) => (
        <div className="canvas-grid-2" key={String(item.label)}>
          <div className="canvas-stack-xs">
            <span className="canvas-text-body text-foreground">
              {item.label}
            </span>
            {item.meta ? (
              <span className="canvas-text-caption text-muted-foreground">
                {item.meta}
              </span>
            ) : null}
          </div>
          <div className="canvas-text-caption text-muted-foreground">
            {item.value}
          </div>
        </div>
      ))}
    </div>
  )
}

export function SystemLayer({
  index,
  label,
  note,
  signal,
}: {
  index: number
  label: string
  note: string
  signal: string
}) {
  return (
    <div className="canvas-content-panel canvas-grid-2">
      <div className="canvas-icon-box-sm flex items-center justify-center text-muted-foreground">
        {String(index + 1).padStart(2, "0")}
      </div>
      <div className="canvas-stack-xs">
        <div className="canvas-wrap-sm items-center justify-between">
          <h3 className="canvas-text-body text-foreground">{label}</h3>
          <Badge variant="outline">{signal}</Badge>
        </div>
        <p className="canvas-text-caption text-muted-foreground">{note}</p>
      </div>
    </div>
  )
}

export function EntryMap() {
  return (
    <div className="canvas-content-panel canvas-stack-md">
      <div className="canvas-wrap-sm items-center justify-between">
        <h2 className="canvas-text-heading">新人入口地图</h2>
        <Badge variant="outline">从这里开始</Badge>
      </div>
      <svg
        aria-label="LINUX DO 新人入口地图：论坛、Wiki、服务围绕社区身份组织"
        className="h-auto w-full text-foreground"
        role="img"
        viewBox="0 0 720 360"
      >
        <defs>
          <marker
            id="linux-do-entry-arrow"
            markerHeight="8"
            markerWidth="8"
            orient="auto"
            refX="7"
            refY="4"
            viewBox="0 0 8 8"
          >
            <path d="M0 0 L8 4 L0 8 Z" fill="var(--muted-foreground)" />
          </marker>
        </defs>
        <rect
          fill="var(--muted)"
          height="320"
          rx="12"
          width="680"
          x="20"
          y="20"
        />
        <g fill="none" markerEnd="url(#linux-do-entry-arrow)" stroke="var(--muted-foreground)" strokeWidth="2">
          <path d="M360 174 C260 110, 190 96, 126 96" />
          <path d="M360 174 C462 108, 530 96, 596 96" />
          <path d="M360 198 C260 252, 190 264, 126 264" />
          <path d="M360 198 C462 252, 530 264, 596 264" />
        </g>
        <MapNode label="LINUX DO" note="社区身份" x={270} y={140} />
        <MapNode label="论坛" note="看帖 / 回复 / 发帖" x={56} y={62} />
        <MapNode label="Wiki" note="规则 / 入口 / 说明" x={530} y={62} />
        <MapNode label="百宝箱" note="工具 / 资源 / 服务" x={56} y={230} />
        <MapNode label="Connect" note="账号 / 授权 / 邮箱" x={530} y={230} />
      </svg>
      <p className="canvas-text-caption text-muted-foreground">
        先用 Wiki 建立地图，再到论坛参与；需要服务或工具时，从百宝箱和 Connect 继续找。
      </p>
    </div>
  )
}

function MapNode({
  label,
  note,
  x,
  y,
}: {
  label: string
  note: string
  x: number
  y: number
}) {
  return (
    <g>
      <rect
        fill="var(--background)"
        height="68"
        rx="10"
        stroke="var(--border)"
        width="134"
        x={x}
        y={y}
      />
      <text
        fill="var(--foreground)"
        fontSize="15"
        fontWeight="600"
        textAnchor="middle"
        x={x + 67}
        y={y + 29}
      >
        {label}
      </text>
      <text
        fill="var(--muted-foreground)"
        fontSize="12"
        textAnchor="middle"
        x={x + 67}
        y={y + 49}
      >
        {note}
      </text>
    </g>
  )
}

export function RouteStepCard({
  action,
  step,
  title,
  value,
}: {
  action: string
  step: string
  title: string
  value: string
}) {
  return (
    <div className="canvas-stack-xs">
      <span className="canvas-text-caption text-muted-foreground">
        {step} / {action}
      </span>
      <h3 className="canvas-text-body text-foreground">{title}</h3>
      <p className="canvas-text-caption text-muted-foreground">{value}</p>
    </div>
  )
}

export function ChecklistItem({
  hint,
  label,
}: {
  hint: string
  label: string
}) {
  return (
    <div className="canvas-grid-2">
      <Checkbox checked aria-label={label} />
      <div className="canvas-stack-xs">
        <span className="canvas-text-body text-foreground">{label}</span>
        <span className="canvas-text-caption text-muted-foreground">
          {hint}
        </span>
      </div>
    </div>
  )
}

export function HandbookChartNote({ children }: { children: ReactNode }) {
  return (
    <p className="canvas-text-caption text-muted-foreground">
      {children}
    </p>
  )
}
