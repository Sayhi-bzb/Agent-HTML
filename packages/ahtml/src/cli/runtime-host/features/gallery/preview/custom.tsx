import { ArrowRight, Copy, Inspect, Maximize2, Search, Shuffle, X } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

import { createGallerySurfaceShadow, getManualCardProps } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
import { FieldRow } from "../shared/form-controls"
import type { PreviewSceneProps } from "./types"

export function GalleryCustomPreviewPanel({
  profile,
}: {
  profile: PreviewSceneProps["profile"]
}) {
  const lightTokens = profile.globalStyle.tokenSets.light
  const darkTokens = profile.globalStyle.tokenSets.dark
  const surfaceShadow = createGallerySurfaceShadow(profile)
  const customPreviewUrl = `https://preview.ahtml.local/${profile.id}`

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-custom-panel">
      <div className="ahtml-gallery-custom-content">
        <div
          className="ahtml-gallery-custom-browser"
          data-agent-html-component="frame"
        >
          <div className="ahtml-gallery-custom-preview-toolbar">
            <div className="ahtml-gallery-custom-preview-input">
              <Search
                aria-hidden="true"
                className="ahtml-gallery-custom-preview-input-icon"
              />
              <Input readOnly value={customPreviewUrl} />
              <Button size="sm" type="button" variant="ghost">
                <X aria-hidden="true" />
              </Button>
            </div>
            <div className="ahtml-gallery-custom-preview-actions">
              <Button size="sm" type="button" variant="outline">
                <Shuffle aria-hidden="true" />
              </Button>
              <Button size="sm" type="button" variant="outline">
                <Copy aria-hidden="true" />
              </Button>
              <Button size="sm" type="button" variant="outline">
                <Maximize2 aria-hidden="true" />
              </Button>
            </div>
          </div>
          <div className="ahtml-gallery-custom-page">
            <div className="ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
              <div className="ahtml-gallery-stage-toolbar-copy">
                <span className="ahtml-gallery-stage-panel-kicker">
                  Destination surface
                </span>
                <strong>Embedded campaign workbench preview</strong>
              </div>
              <div className="ahtml-gallery-stage-toolbar-meta">
                <GalleryPreviewMeta label="Style" value={profile.id} />
                <GalleryPreviewMeta
                  label="Primary"
                  value={lightTokens.primary}
                />
                <GalleryPreviewMeta
                  label="Sidebar"
                  value={darkTokens.sidebarPrimary}
                />
              </div>
            </div>

            <div className="ahtml-gallery-custom-surface-shell">
              <div
                className="ahtml-gallery-custom-site-header"
                data-agent-html-component="card"
                data-ahtml-path="manual.custom.header"
                data-ahtml-render-kind="compound"
                data-ahtml-source="shadcn"
              >
                <div className="ahtml-gallery-custom-site-brand">
                  <Badge variant="secondary">Custom Website Preview</Badge>
                  <strong>{profile.id}.studio</strong>
                </div>
                <div className="ahtml-gallery-custom-site-nav">
                  <span className="is-active">Overview</span>
                  <span>Launches</span>
                  <span>Insights</span>
                  <span>Resources</span>
                </div>
                <div className="ahtml-gallery-custom-site-actions">
                  <Badge variant="outline">Live sync</Badge>
                  <Button size="sm" type="button">
                    Publish
                  </Button>
                </div>
              </div>

              <div className="ahtml-gallery-custom-preview-status-grid">
                <div className="ahtml-gallery-custom-connection-status">
                  <span
                    aria-hidden="true"
                    className="ahtml-gallery-custom-connection-indicator"
                  />
                  <span className="ahtml-gallery-custom-connection-label">
                    Live preview target connected. Inspect how typography,
                    radius, and tokens behave on a real destination surface.
                  </span>
                  <Button size="sm" type="button" variant="outline">
                    Retry
                  </Button>
                </div>
                <div
                  className="ahtml-gallery-custom-preview-callout"
                  data-agent-html-component="card"
                  data-ahtml-path="manual.custom.empty"
                  data-ahtml-render-kind="compound"
                  data-ahtml-source="shadcn"
                >
                  <div className="ahtml-gallery-custom-preview-empty-icons">
                    <div className="ahtml-gallery-custom-preview-empty-icon">
                      <Search aria-hidden="true" />
                    </div>
                    <X
                      aria-hidden="true"
                      className="ahtml-gallery-custom-preview-empty-separator"
                    />
                    <div className="ahtml-gallery-custom-preview-empty-icon">
                      <Inspect aria-hidden="true" />
                    </div>
                  </div>
                  <div className="ahtml-gallery-custom-preview-callout-copy">
                    <span className="ahtml-gallery-stage-panel-kicker">
                      Preview workflow
                    </span>
                    <h4>Inspect the live destination before you publish.</h4>
                    <p>
                      Review how navigation, editorial blocks, and action
                      surfaces behave together on the target page before the
                      profile ships.
                    </p>
                  </div>
                  <div className="ahtml-gallery-custom-preview-guides">
                    <button type="button">Script Tag</button>
                    <button type="button">Next.js</button>
                    <button type="button">Vite</button>
                    <button type="button">Remix</button>
                  </div>
                </div>
              </div>

              <div className="ahtml-gallery-custom-stage-grid">
                <section
                  className="ahtml-gallery-custom-hero"
                  data-agent-html-component="card"
                  data-ahtml-path="manual.custom.hero"
                  data-ahtml-render-kind="compound"
                  data-ahtml-source="shadcn"
                  style={{
                    boxShadow: surfaceShadow,
                    gap: `calc(${profile.globalStyle.typography.spacing} * 4)`,
                    letterSpacing: profile.globalStyle.typography.letterSpacing,
                  }}
                >
                  <div className="ahtml-gallery-custom-hero-copy">
                    <Badge variant="secondary">Editorial system</Badge>
                    <h3
                      style={{
                        fontFamily: profile.globalStyle.typography.fontSerif,
                      }}
                    >
                      {profile.id} campaign workspace
                    </h3>
                    <p>
                      Build a launch surface where navigation, editorial blocks,
                      and conversion paths all respond to the same token system.
                    </p>
                    <div className="ahtml-gallery-custom-hero-actions">
                      <Button type="button">
                        Open theme
                        <ArrowRight aria-hidden="true" />
                      </Button>
                      <Button type="button" variant="outline">
                        Review tokens
                      </Button>
                    </div>
                    <div className="ahtml-gallery-custom-stat-strip">
                      {[
                        ["Pipeline", "$184K"],
                        ["Active briefs", "12"],
                        ["Approval", "92%"],
                      ].map(([label, value]) => (
                        <div className="ahtml-gallery-custom-stat" key={label}>
                          <span>{label}</span>
                          <strong>{value}</strong>
                        </div>
                      ))}
                    </div>
                  </div>
                </section>
                <div className="ahtml-gallery-custom-side-stack">
                  <Card
                    {...getManualCardProps(
                      profile,
                      "manual.custom.side",
                      "ahtml-gallery-custom-card ahtml-gallery-custom-side-card",
                    )}
                    style={{ boxShadow: surfaceShadow }}
                  >
                    <CardHeader>
                      <CardTitle>Theme snapshot</CardTitle>
                    </CardHeader>
                    <CardContent className="ahtml-gallery-custom-stack">
                      <div className="ahtml-gallery-custom-swatch-stack">
                        <span style={{ background: lightTokens.primary }} />
                        <span style={{ background: lightTokens.chart2 }} />
                        <span style={{ background: darkTokens.sidebarPrimary }} />
                        <span style={{ background: darkTokens.background }} />
                      </div>
                      <FieldRow label="Primary" value={lightTokens.primary} />
                      <FieldRow label="Sidebar" value={lightTokens.sidebar} />
                      <FieldRow
                        label="Radius"
                        value={profile.globalStyle.radiusScale.base}
                      />
                      <div className="ahtml-gallery-custom-note-list">
                        <span>Cross-surface contrast stays editorial.</span>
                        <span>
                          Navigation and content share one token system.
                        </span>
                        <span>
                          Side panels expose drift faster than isolated cards.
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                  <Card
                    {...getManualCardProps(
                      profile,
                      "manual.custom.signal",
                      "ahtml-gallery-custom-card",
                    )}
                    style={{ boxShadow: surfaceShadow }}
                  >
                    <CardHeader>
                      <CardTitle>Signal Feed</CardTitle>
                    </CardHeader>
                    <CardContent className="ahtml-gallery-custom-stack">
                      <div className="ahtml-gallery-custom-signal-list">
                        {[
                          "Palette passes accessibility in hero and nav layers.",
                          "Sidebar emphasis reads stronger in dark preview mode.",
                          "Editorial serif stays contained to content-led surfaces.",
                        ].map((item) => (
                          <div
                            className="ahtml-gallery-custom-signal-item"
                            key={item}
                          >
                            <span className="ahtml-gallery-custom-signal-dot" />
                            <p className="ahtml-gallery-custom-copy">{item}</p>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              <div className="ahtml-gallery-custom-grid ahtml-gallery-custom-grid-rich">
                <Card
                  {...getManualCardProps(
                    profile,
                    "manual.custom.0",
                    "ahtml-gallery-custom-card",
                  )}
                  style={{ boxShadow: surfaceShadow }}
                >
                  <CardHeader>
                    <CardTitle>Ops Review</CardTitle>
                  </CardHeader>
                  <CardContent className="ahtml-gallery-custom-stack">
                    <FieldRow label="Style" value={profile.id} />
                    <FieldRow
                      label="Font Sans"
                      multiline
                      value={profile.globalStyle.typography.fontSans}
                    />
                    <FieldRow
                      label="Font Mono"
                      multiline
                      value={profile.globalStyle.typography.fontMono}
                    />
                  </CardContent>
                </Card>
                <Card
                  {...getManualCardProps(
                    profile,
                    "manual.custom.1",
                    "ahtml-gallery-custom-card",
                  )}
                  style={{ boxShadow: surfaceShadow }}
                >
                  <CardHeader>
                    <CardTitle>Launch Board</CardTitle>
                  </CardHeader>
                  <CardContent className="ahtml-gallery-custom-stack">
                    <div className="ahtml-gallery-custom-badges">
                      <Badge variant="secondary">review</Badge>
                      <Badge variant="outline">assets</Badge>
                      <Badge variant="outline">handoff</Badge>
                    </div>
                    <div className="ahtml-gallery-custom-progress-list">
                      {[
                        ["Narrative", 84],
                        ["Motion", 61],
                        ["QA", 92],
                      ].map(([label, value]) => (
                        <div
                          className="ahtml-gallery-custom-progress-row"
                          key={label}
                        >
                          <div className="ahtml-gallery-inline-metrics">
                            <span>{label}</span>
                            <strong>{value}%</strong>
                          </div>
                          <Progress value={value as number} />
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                <Card
                  {...getManualCardProps(
                    profile,
                    "manual.custom.2",
                    "ahtml-gallery-custom-card",
                  )}
                  style={{ boxShadow: surfaceShadow }}
                >
                  <CardHeader>
                    <CardTitle>Conversion Stack</CardTitle>
                  </CardHeader>
                  <CardContent className="ahtml-gallery-custom-stack">
                    <div className="ahtml-gallery-custom-conversion-row">
                      <span>Landing</span>
                      <strong>63%</strong>
                    </div>
                    <div className="ahtml-gallery-custom-conversion-row">
                      <span>Qualified</span>
                      <strong>38%</strong>
                    </div>
                    <div className="ahtml-gallery-custom-conversion-row">
                      <span>Approved</span>
                      <strong>17%</strong>
                    </div>
                    <p className="ahtml-gallery-custom-copy">
                      Custom scenes should expose how one profile moves between
                      hero persuasion, compact utility panels, and operational
                      status blocks.
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
