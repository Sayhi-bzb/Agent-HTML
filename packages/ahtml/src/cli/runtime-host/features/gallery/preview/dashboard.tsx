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
          <div className="ahtml-gallery-dashboard-sidebar-top">
            <span className="ahtml-gallery-stage-panel-kicker">
              Dashboard workbench
            </span>
            <strong>Acme Ops</strong>
            <p>Dense operating surface for metrics, queue health, and token checks.</p>
          </div>
          <div className="ahtml-gallery-dashboard-nav-section">
            <span className="ahtml-gallery-dashboard-nav-label">Workspace</span>
            <div className="ahtml-gallery-dashboard-nav-group">
              <span className="is-active">Overview</span>
              <span>Revenue</span>
              <span>Operations</span>
              <span>Settings</span>
            </div>
          </div>
          <Separator />
          <div className="ahtml-gallery-dashboard-nav-section">
            <span className="ahtml-gallery-dashboard-nav-label">Signals</span>
            <div className="ahtml-gallery-dashboard-nav-group">
              <span>Retention</span>
              <span>Channels</span>
              <span>Exports</span>
            </div>
          </div>
          <div className="ahtml-gallery-dashboard-sidebar-status">
            <Badge
              style={{
                background: tokens.sidebarPrimary,
                color: tokens.sidebarPrimaryForeground,
              }}
              variant="secondary"
            >
              Live sync
            </Badge>
            <FieldRow label="Owners online" value="8" />
            <FieldRow label="Review SLA" value="2.4h" />
          </div>
        </aside>
        <div className="ahtml-gallery-dashboard-main">
          <header className="ahtml-gallery-workbench-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div className="ahtml-gallery-workbench-header-copy">
              <span className="ahtml-gallery-stage-panel-kicker">
                Dashboard surface
              </span>
              <h4>Operating dashboard workbench</h4>
              <p>
                Keep analytics, review queues, and channel diagnostics inside
                the same continuous workbench surface.
              </p>
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
          <div className="ahtml-gallery-dashboard-utility-strip">
            <div className="ahtml-gallery-dashboard-utility-copy">
              <strong>Release pulse</strong>
              <p>Q2 release week stays readable as a product-native analytics frame.</p>
            </div>
            <div className="ahtml-gallery-custom-badges">
              <Badge variant="secondary">Revenue stable</Badge>
              <Badge variant="outline">3 reviews pending</Badge>
              <Badge variant="outline">Dark mode ready</Badge>
            </div>
          </div>
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
                  "ahtml-gallery-dashboard-metric-card",
                )}
                key={label}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>{label}</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-dashboard-metric-content">
                  <strong className="ahtml-gallery-goal-number">{value}</strong>
                  <span>
                    {label === "MRR"
                      ? "Compounding from product-led upgrades."
                      : label === "Expansion"
                        ? "Upsell lanes outperform baseline forecast."
                        : label === "Active users"
                          ? "Usage stays dense without dashboard chrome drift."
                          : "Sentiment remains strong across the workbench."}
                  </span>
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
              <div className="ahtml-gallery-dashboard-chart-footer ahtml-gallery-workbench-summary-grid">
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
                <div className="ahtml-gallery-dashboard-table-footer ahtml-gallery-workbench-summary-grid">
                  <FieldRow label="Escalations" value="2 open" />
                  <FieldRow label="Next cut" value="16:00 UTC" />
                </div>
              </CardContent>
            </Card>
            <div className="ahtml-gallery-workbench-side-stack">
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
                {...getManualCardProps(profile, "manual.dashboard.checklist")}
                style={{ boxShadow: surfaceShadow }}
              >
                <CardHeader>
                  <CardTitle>Workbench checklist</CardTitle>
                </CardHeader>
                <CardContent className="ahtml-gallery-workbench-checklist">
                  <div className="ahtml-gallery-workbench-checklist-item">
                    <strong>Density</strong>
                    <span>Header, cards, and diagnostics keep one app rhythm.</span>
                  </div>
                  <div className="ahtml-gallery-workbench-checklist-item">
                    <strong>Continuity</strong>
                    <span>Sidebar and preview belong to the same surface plane.</span>
                  </div>
                  <div className="ahtml-gallery-workbench-checklist-item">
                    <strong>Theme shift</strong>
                    <span>Chart, sidebar, and table all react to one profile.</span>
                  </div>
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
