import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"

import { createGallerySurfaceShadow, getManualCardProps } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
import { FieldRow } from "../shared/form-controls"
import type { PreviewSceneProps } from "./types"

export function GalleryDashboardWorkbenchPanel({
  profile,
  previewThemeMode,
}: PreviewSceneProps) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const chartTokens = [
    tokens.chart1,
    tokens.chart2,
    tokens.chart3,
    tokens.chart4,
    tokens.chart5,
  ]
  const surfaceShadow = createGallerySurfaceShadow(profile)

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-dashboard-shell">
        <aside
          className="ahtml-gallery-dashboard-sidebar"
          style={{
            background: tokens.sidebar,
            borderColor: tokens.sidebarBorder,
            color: tokens.sidebarForeground,
          }}
        >
          <strong>Acme Ops</strong>
          <div className="ahtml-gallery-dashboard-nav-group">
            <span className="is-active">Overview</span>
            <span>Revenue</span>
            <span>Operations</span>
            <span>Settings</span>
          </div>
          <Separator />
          <div className="ahtml-gallery-dashboard-nav-group">
            <span>Retention</span>
            <span>Channels</span>
            <span>Exports</span>
          </div>
          <Badge
            style={{
              background: tokens.sidebarPrimary,
              color: tokens.sidebarPrimaryForeground,
            }}
            variant="secondary"
          >
            Live sync
          </Badge>
        </aside>
        <div className="ahtml-gallery-dashboard-main">
          <header className="ahtml-gallery-dashboard-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div>
              <span className="ahtml-gallery-stage-panel-kicker">
                Acme Inc.
              </span>
              <h4>Dashboard</h4>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta
                label="Sidebar"
                value={tokens.sidebarPrimary}
              />
              <GalleryPreviewMeta label="Chart 1" value={tokens.chart1} />
            </div>
          </header>
          <div className="ahtml-gallery-dashboard-section-cards">
            {[
              ["MRR", "$124K"],
              ["Expansion", "+12.4%"],
              ["Active users", "8,420"],
              ["NPS", "61"],
            ].map(([label, value]) => (
              <Card
                {...getManualCardProps(
                  profile,
                  `manual.dashboard.metric.${label}`,
                )}
                key={label}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent>
                  <strong className="ahtml-gallery-goal-number">{value}</strong>
                </CardContent>
              </Card>
            ))}
          </div>
          <Card
            {...getManualCardProps(profile, "manual.dashboard.chart")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <div className="ahtml-gallery-inline-metrics">
                <CardTitle>Interactive area chart</CardTitle>
                <div className="ahtml-gallery-custom-badges">
                  <Badge variant="outline">Quarterly</Badge>
                  <Badge variant="secondary">Live</Badge>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="ahtml-gallery-chart-bars">
                {[48, 72, 65, 90, 82, 96, 68, 88].map((value, index) => (
                  <span
                    key={index}
                    style={{
                      background: chartTokens[index % chartTokens.length],
                      height: `${value}%`,
                    }}
                  />
                ))}
              </div>
              <div className="ahtml-gallery-dashboard-chart-footer">
                <FieldRow label="Goal" value="$200K" />
                <FieldRow label="Window" value="Last 90 days" />
              </div>
            </CardContent>
          </Card>
          <div className="ahtml-gallery-dashboard-lower">
            <Card
              {...getManualCardProps(profile, "manual.dashboard.table")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Review queue</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Team</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Owner</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {[
                      ["Platform", "Ready", "Noah"],
                      ["Docs", "Review", "Alicia"],
                      ["Design", "Synced", "Mia"],
                    ].map(([team, status, owner]) => (
                      <TableRow key={team}>
                        <TableCell>{team}</TableCell>
                        <TableCell>{status}</TableCell>
                        <TableCell>{owner}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
            <div className="ahtml-gallery-dashboard-secondary-stack">
              <Card
                {...getManualCardProps(profile, "manual.dashboard.tokens")}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Token snapshot</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-custom-stack">
                  <FieldRow label="Primary" value={tokens.primary} />
                  <FieldRow label="Accent" value={tokens.accent} />
                  <FieldRow
                    label="Sidebar primary"
                    value={tokens.sidebarPrimary}
                  />
                  <FieldRow label="Background" value={tokens.background} />
                </CardContent>
              </Card>
              <Card
                {...getManualCardProps(profile, "manual.dashboard.mix")}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Channel Mix</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-dashboard-mix-card">
                  <div
                    className="ahtml-gallery-dashboard-donut"
                    style={{
                      background: `conic-gradient(${tokens.chart1} 0 34%, ${tokens.chart2} 34% 62%, ${tokens.chart3} 62% 82%, ${tokens.chart4} 82% 100%)`,
                    }}
                  />
                  <div className="ahtml-gallery-dashboard-mix-list">
                    {[
                      ["Search", "34%"],
                      ["Direct", "28%"],
                      ["Email", "20%"],
                      ["Partners", "18%"],
                    ].map(([label, value]) => (
                      <div className="ahtml-gallery-inline-metrics" key={label}>
                        <span>{label}</span>
                        <strong>{value}</strong>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
