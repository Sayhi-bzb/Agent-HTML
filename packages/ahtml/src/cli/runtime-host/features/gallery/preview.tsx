import React from "react"
import {
  Check,
  Copy,
  Inspect,
  Maximize2,
  Minimize2,
  MoreVertical,
  Search,
  Shuffle,
  X,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"

import { DocumentArtifactShell } from "../../artifact-shell"
import {
  createGallerySurfaceShadow,
  extractFontName,
  formatThemeTokenLabel,
  getManualCardProps,
} from "./helpers"
import {
  FieldRow,
  GalleryExamplesPreviewContainer,
  GalleryPreviewMeta,
  GalleryTabsTriggerPill,
  GalleryToolbarGroup,
} from "./shared"
import type {
  ArtifactProfile,
  FocusedEditorField,
  FocusedThemeToken,
  GalleryInspectorState,
  GalleryPreviewMode,
  GalleryPreviewSection,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "./types"

type RendererNodeComponent = React.ComponentType<{
  node: GalleryPreviewSection["node"]
  path?: Array<number | string>
}>

function GalleryTypographyPanel({
  onSelectField,
  profile,
  previewThemeMode,
}: {
  onSelectField: (field: FocusedEditorField) => void
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const activeTokens = profile.globalStyle.tokenSets[previewThemeMode]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-typography-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">
            Typography audit
          </span>
          <strong>Type system preview surface</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta
            label="Heading"
            value={extractFontName(profile.globalStyle.typography.fontHeading)}
          />
          <GalleryPreviewMeta
            label="Sans"
            value={extractFontName(profile.globalStyle.typography.fontSans)}
          />
          <GalleryPreviewMeta
            label="Mono"
            value={extractFontName(profile.globalStyle.typography.fontMono)}
          />
        </div>
      </div>
      <div className="ahtml-gallery-typography-content">
        <button
          className="ahtml-gallery-typography-sample ahtml-gallery-stage-action-card"
          onClick={() => onSelectField("fontHeading")}
          style={{
            letterSpacing: profile.globalStyle.typography.letterSpacing,
          }}
          type="button"
        >
          <p className="ahtml-gallery-typography-kicker">Heading</p>
          <h2>{profile.globalStyle.typography.fontHeading}</h2>
          <p>
            Review rhythm, line length, and contrast before shipping a style
            profile into preview artifacts.
          </p>
        </button>
        <div className="ahtml-gallery-typography-sample-grid">
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontSans")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Body</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontSans }}
            >
              Dense editor copy should stay stable across toolbar labels,
              preview captions, and form rows without looking decorative.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontSerif")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Serif</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontSerif }}
            >
              Editorial support faces should hold up in richer preview scenes
              without forcing the whole shell away from utility-first clarity.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("fontMono")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Mono</p>
            <p
              className="ahtml-gallery-typography-body-copy"
              style={{ fontFamily: profile.globalStyle.typography.fontMono }}
            >
              Token values, paths, and tool-facing metadata should stay sharp
              and compact when the editor leans into workbench density.
            </p>
          </button>
          <button
            className="ahtml-gallery-typography-body-card ahtml-gallery-stage-action-card"
            onClick={() => onSelectField("spacing")}
            type="button"
          >
            <p className="ahtml-gallery-typography-kicker">Annotation</p>
            <div className="ahtml-gallery-typography-note-stack">
              <span
                className="ahtml-gallery-typography-chip"
                style={{
                  background: activeTokens.secondary,
                  borderRadius: profile.globalStyle.radiusScale.base,
                  color: activeTokens.secondaryForeground,
                }}
              >
                Space {profile.globalStyle.typography.spacing}
              </span>
              <p>
                Tracking, spacing, and radius are read together in pills,
                labels, and popovers across the workbench shell.
              </p>
            </div>
          </button>
        </div>
        <Separator />
        <div className="ahtml-gallery-typography-grid">
          <FieldRow
            label="Font Sans"
            multiline
            value={profile.globalStyle.typography.fontSans}
          />
          <FieldRow
            label="Font Heading"
            multiline
            value={profile.globalStyle.typography.fontHeading}
          />
          <FieldRow
            label="Font Serif"
            multiline
            value={profile.globalStyle.typography.fontSerif}
          />
          <FieldRow
            label="Font Mono"
            multiline
            value={profile.globalStyle.typography.fontMono}
          />
          <FieldRow
            label="Letter Spacing"
            value={profile.globalStyle.typography.letterSpacing}
          />
          <FieldRow
            label="Spacing"
            value={profile.globalStyle.typography.spacing}
          />
          <FieldRow
            label="Radius Base"
            value={profile.globalStyle.radiusScale.base}
          />
        </div>
        <div className="ahtml-gallery-typography-token">
          <code>{`--font-sans: ${profile.globalStyle.typography.fontSans};`}</code>
          <code>{`--font-heading: ${profile.globalStyle.typography.fontHeading};`}</code>
          <code>{`--font-serif: ${profile.globalStyle.typography.fontSerif};`}</code>
          <code>{`--font-mono: ${profile.globalStyle.typography.fontMono};`}</code>
          <code>{`--letter-spacing: ${profile.globalStyle.typography.letterSpacing};`}</code>
          <code>{`--spacing: ${profile.globalStyle.typography.spacing};`}</code>
        </div>
      </div>
    </div>
  )
}

function GalleryColorPreviewPanel({
  onActivateThemeMode,
  onSelectToken,
  profile,
  previewThemeMode,
  themeSyncEnabled,
}: {
  onActivateThemeMode: (mode: GalleryPreviewThemeMode) => void
  onSelectToken: (
    tokenName: ThemeTokenName,
    mode: GalleryPreviewThemeMode,
  ) => void
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
  themeSyncEnabled: boolean
}) {
  const previewModes: GalleryPreviewThemeMode[] = ["light", "dark"]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-color-panel">
      <div className="ahtml-gallery-color-content">
        <div className="ahtml-gallery-stage-toolbar">
          <div className="ahtml-gallery-stage-toolbar-copy">
            <span className="ahtml-gallery-stage-panel-kicker">
              Color palette
            </span>
            <strong>Semantic token inspection</strong>
          </div>
          <div className="ahtml-gallery-stage-toolbar-meta">
            <GalleryPreviewMeta
              label="Theme"
              value={`${previewThemeMode}${themeSyncEnabled ? " / sync" : ""}`}
            />
            <GalleryPreviewMeta
              label="Primary"
              value={profile.globalStyle.tokenSets[previewThemeMode].primary}
            />
            <GalleryPreviewMeta
              label="Background"
              value={profile.globalStyle.tokenSets[previewThemeMode].background}
            />
          </div>
        </div>
        <div className="ahtml-gallery-color-hero">
          <GalleryPreviewMeta
            label="Theme"
            value={`${previewThemeMode}${themeSyncEnabled ? " / sync" : ""}`}
          />
          <GalleryPreviewMeta
            label="Primary"
            value={profile.globalStyle.tokenSets[previewThemeMode].primary}
          />
          <GalleryPreviewMeta
            label="Background"
            value={profile.globalStyle.tokenSets[previewThemeMode].background}
          />
        </div>
        <div className="ahtml-gallery-color-mode-grid">
          {previewModes.map((mode) => {
            const tokenEntries = Object.entries(
              profile.globalStyle.tokenSets[mode],
            ) as Array<
              [
                keyof ArtifactProfile["globalStyle"]["tokenSets"]["light"],
                string,
              ]
            >

            return (
              <div
                className={[
                  "ahtml-gallery-color-mode-panel",
                  mode === previewThemeMode ? "is-active" : null,
                ]
                  .filter(Boolean)
                  .join(" ")}
                key={mode}
              >
                <div className="ahtml-gallery-color-mode-header">
                  <div className="ahtml-gallery-color-mode-copy">
                    <span>{mode}</span>
                    <strong>
                      {mode === "light"
                        ? "Editorial light palette"
                        : "Workbench dark palette"}
                    </strong>
                  </div>
                  <Button
                    className="ahtml-gallery-filter-pill"
                    onClick={() => onActivateThemeMode(mode)}
                    size="sm"
                    type="button"
                    variant={mode === previewThemeMode ? "secondary" : "ghost"}
                  >
                    {mode === previewThemeMode ? "Active theme" : "Edit theme"}
                  </Button>
                </div>
                <div className="ahtml-gallery-color-grid">
                  {tokenEntries.map(([tokenName, tokenValue]) => (
                    <button
                      className="ahtml-gallery-color-card"
                      key={`${mode}-${tokenName}`}
                      onClick={() =>
                        onSelectToken(tokenName as ThemeTokenName, mode)
                      }
                      type="button"
                    >
                      <span
                        aria-hidden="true"
                        className="ahtml-gallery-color-card-swatch"
                        style={{ background: tokenValue }}
                      />
                      <div className="ahtml-gallery-color-card-copy">
                        <span>
                          {formatThemeTokenLabel(tokenName as ThemeTokenName)}
                        </span>
                        <strong>{tokenValue}</strong>
                      </div>
                      <span className="ahtml-gallery-color-card-action">
                        {mode === previewThemeMode
                          ? "Edit token"
                          : "Switch + edit"}
                      </span>
                    </button>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function GalleryCustomPreviewPanel({ profile }: { profile: ArtifactProfile }) {
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
                  Custom surface
                </span>
                <strong>Embedded website preview scene</strong>
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
            <div
              className="ahtml-gallery-custom-preview-empty"
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
              <h4>Preview your Website in tweakcn</h4>
              <div className="ahtml-gallery-custom-preview-steps">
                <div>
                  <strong>1.</strong>
                  <span>
                    Connect a preview target and keep the editor shell in view.
                  </span>
                </div>
                <div>
                  <strong>2.</strong>
                  <span>
                    Use this tab to audit a destination surface, not a component
                    shelf.
                  </span>
                </div>
              </div>
              <div className="ahtml-gallery-custom-preview-guides">
                <button type="button">Script Tag</button>
                <button type="button">Next.js</button>
                <button type="button">Vite</button>
                <button type="button">Remix</button>
              </div>
            </div>
            <div className="ahtml-gallery-custom-connection-status">
              <span
                aria-hidden="true"
                className="ahtml-gallery-custom-connection-indicator"
              />
              <span className="ahtml-gallery-custom-connection-label">
                Live preview enabled
              </span>
              <Button size="sm" type="button" variant="outline">
                Retry
              </Button>
            </div>
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
                    <Button type="button">Open theme</Button>
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
                    <span>Navigation and content share one token system.</span>
                    <span>
                      Side panels expose drift faster than isolated cards.
                    </span>
                  </div>
                </CardContent>
              </Card>
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
        </div>
      </div>
    </div>
  )
}

function GalleryCardsWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const surfaceShadow = createGallerySurfaceShadow(profile)
  const spacing = profile.globalStyle.typography.spacing

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">
            Cards preview
          </span>
          <strong>Cards Preview</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta label="Primary" value={tokens.primary} />
          <GalleryPreviewMeta label="Muted" value={tokens.muted} />
          <GalleryPreviewMeta label="Spacing" value={spacing} />
        </div>
      </div>
      <div className="ahtml-gallery-cards-workbench">
        <div className="ahtml-gallery-cards-column ahtml-gallery-cards-column-primary">
          <Card
            {...getManualCardProps(profile, "manual.cards.0")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Revenue Pulse</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <div className="ahtml-gallery-inline-metrics">
                <strong>$94.8K</strong>
                <Badge variant="secondary">+14%</Badge>
              </div>
              <Progress value={74} />
              <p className="ahtml-gallery-custom-copy">
                Compact KPI cards should hold number, movement, and action state
                without turning into dashboard chrome.
              </p>
            </CardContent>
          </Card>
          <div className="ahtml-gallery-cards-split">
            <Card
              {...getManualCardProps(profile, "manual.cards.1")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Calendar Sync</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <div className="ahtml-gallery-mini-calendar">
                  {["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].map((day) => (
                    <span key={day}>{day}</span>
                  ))}
                  {Array.from({ length: 14 }, (_, index) => (
                    <span
                      className={index === 8 ? "is-active" : undefined}
                      key={index}
                    >
                      {index + 9}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card
              {...getManualCardProps(profile, "manual.cards.2")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Activity Goal</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <strong className="ahtml-gallery-goal-number">82%</strong>
                <Slider
                  aria-label="Activity goal"
                  defaultValue={[82]}
                  max={100}
                  step={1}
                />
              </CardContent>
            </Card>
          </div>
          <Card
            {...getManualCardProps(profile, "manual.cards.7")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Create Account</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <Input readOnly value="name@agent-html.dev" />
              <Input readOnly value="Create a password" />
              <div className="ahtml-gallery-inline-metrics">
                <Badge variant="outline">OAuth</Badge>
                <Button size="sm" type="button">
                  Continue
                </Button>
              </div>
            </CardContent>
          </Card>
          <Card
            {...getManualCardProps(profile, "manual.cards.3")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Cookie Settings</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-toggle-list">
              <label>
                <span>Strictly necessary</span>
                <Switch checked />
              </label>
              <label>
                <span>Product analytics</span>
                <Switch checked={previewThemeMode === "light"} />
              </label>
              <label>
                <span>Personalization</span>
                <Switch />
              </label>
            </CardContent>
          </Card>
        </div>
        <div className="ahtml-gallery-cards-column">
          <Card
            {...getManualCardProps(profile, "manual.cards.6")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Surface Audit</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <div className="ahtml-gallery-custom-badges">
                <Badge variant="outline">Embed</Badge>
                <Badge variant="outline">JSON</Badge>
                <Badge variant="secondary">Preview</Badge>
              </div>
              <Separator />
              <p className="ahtml-gallery-custom-copy">
                Tweakcn&apos;s cards area feels like a collage, not a linear
                design system table.
              </p>
              <FieldRow
                label="Treatment"
                value={profile.componentStyle.treatments.card ?? "none"}
              />
            </CardContent>
          </Card>
          <div className="ahtml-gallery-cards-split ahtml-gallery-cards-split-tight">
            <Card
              {...getManualCardProps(profile, "manual.cards.4")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Chat</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-chat-thread">
                <div>
                  <strong>Mia</strong>
                  <p>Can the gallery feel more like a product editor?</p>
                </div>
                <div className="is-reply">
                  <strong>You</strong>
                  <p>
                    The shell is close. The remaining gap is preview fidelity
                    and denser component composition.
                  </p>
                </div>
              </CardContent>
            </Card>
            <Card
              {...getManualCardProps(profile, "manual.cards.5")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Issue Report</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <Input readOnly value="Unexpected spacing drift" />
                <Textarea
                  readOnly
                  value="Cards preview still needs more asymmetric collage behavior to feel like tweakcn."
                />
              </CardContent>
            </Card>
          </div>
          <Card
            {...getManualCardProps(profile, "manual.cards.8")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-member-list">
              {[
                ["Alicia", "Design review"],
                ["Noah", "Runtime QA"],
                ["Mia", "Preview shell"],
              ].map(([name, role]) => (
                <div className="ahtml-gallery-member-row" key={name}>
                  <div
                    className="ahtml-gallery-member-avatar"
                    aria-hidden="true"
                  >
                    {name.slice(0, 1)}
                  </div>
                  <div className="ahtml-gallery-member-copy">
                    <strong>{name}</strong>
                    <span>{role}</span>
                  </div>
                  <Badge variant="outline">online</Badge>
                </div>
              ))}
            </CardContent>
          </Card>
          <Card
            {...getManualCardProps(profile, "manual.cards.9")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Share this document</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-custom-stack">
              <p className="ahtml-gallery-custom-copy">
                Anyone with the link can view this document.
              </p>
              <div className="ahtml-gallery-inline-metrics">
                <Input readOnly value="http://example.com/link/to/document" />
                <Button size="sm" type="button" variant="outline">
                  Copy Link
                </Button>
              </div>
              <Separator />
              <div className="ahtml-gallery-member-list">
                {[
                  ["Olivia", "m@example.com", "Can edit"],
                  ["Isabella", "b@example.com", "Can view"],
                ].map(([name, email, access]) => (
                  <div className="ahtml-gallery-member-row" key={email}>
                    <div
                      className="ahtml-gallery-member-avatar"
                      aria-hidden="true"
                    >
                      {name.slice(0, 1)}
                    </div>
                    <div className="ahtml-gallery-member-copy">
                      <strong>{name}</strong>
                      <span>{email}</span>
                    </div>
                    <Badge
                      variant={access === "Can edit" ? "secondary" : "outline"}
                    >
                      {access}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      <div className="ahtml-gallery-workbench-footer">
        <FieldRow label="Primary" value={tokens.primary} />
        <FieldRow label="Muted" value={tokens.muted} />
        <FieldRow label="Spacing" value={spacing} />
        <FieldRow label="Border" value={tokens.border} />
      </div>
    </div>
  )
}

function GalleryDashboardWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
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

function GalleryMailWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-mail-shell">
        <aside
          className="ahtml-gallery-mail-nav"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.nav"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{
            background: tokens.sidebar,
            borderColor: tokens.sidebarBorder,
            color: tokens.sidebarForeground,
          }}
        >
          <Button type="button">Compose</Button>
          <Input readOnly value="Search inbox" />
          <div className="ahtml-gallery-mail-nav-links">
            <span className="is-active">Inbox 128</span>
            <span>Drafts 9</span>
            <span>Sent</span>
            <span>Archive 23</span>
            <span>Later</span>
          </div>
          <div className="ahtml-gallery-custom-badges">
            <Badge variant="secondary">All mail</Badge>
            <Badge variant="outline">Unread 12</Badge>
          </div>
        </aside>
        <section
          className="ahtml-gallery-mail-list"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.list"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
        >
          <div className="ahtml-gallery-mail-list-header">
            <div className="ahtml-gallery-inline-metrics">
              <h5>Inbox</h5>
              <div className="ahtml-gallery-mail-tab-pills">
                <Badge variant="secondary">All mail</Badge>
                <Badge variant="outline">Unread</Badge>
              </div>
            </div>
            <div className="ahtml-gallery-mail-search-wrap">
              <Search
                aria-hidden="true"
                className="ahtml-gallery-mail-search-icon"
              />
              <Input readOnly value="Search" />
            </div>
          </div>
          <div className="ahtml-gallery-mail-list-toolbar">
            <Badge variant="secondary">Focused</Badge>
            <Badge variant="outline">Today</Badge>
          </div>
          {[
            [
              "Mia Chen",
              "Gallery alignment review",
              "Needs reply",
              "Preview shell is aligned. Remaining work is matching the denser work-app rhythm.",
              "09:12",
            ],
            [
              "Alicia Gomez",
              "Palette review ready",
              "Unread",
              "Dark mode sidebar tokens are finally reading like a real product surface.",
              "08:41",
            ],
            [
              "Noah Patel",
              "Mail preview references",
              "Pinned",
              "Collected structural refs from tweakcn mail and dashboard examples.",
              "Yesterday",
            ],
          ].map(([author, subject, state, snippet, time], index) => (
            <button
              className={[
                "ahtml-gallery-mail-list-item",
                index === 0 ? "is-active" : null,
              ]
                .filter(Boolean)
                .join(" ")}
              key={author}
              type="button"
            >
              <div className="ahtml-gallery-inline-metrics">
                <strong>{author}</strong>
                <span>{time}</span>
              </div>
              <span>{subject}</span>
              <p>{snippet}</p>
              <Badge variant={index === 0 ? "secondary" : "outline"}>
                {state}
              </Badge>
            </button>
          ))}
        </section>
        <article
          className="ahtml-gallery-mail-display"
          data-agent-html-component="card"
          data-ahtml-path="manual.mail.display"
          data-ahtml-render-kind="compound"
          data-ahtml-source="shadcn"
          style={{
            letterSpacing: profile.globalStyle.typography.letterSpacing,
          }}
        >
          <header className="ahtml-gallery-mail-display-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div>
              <span className="ahtml-gallery-stage-panel-kicker">
                Mail preview
              </span>
              <h4>Gallery alignment review</h4>
              <p>From Mia Chen · Theme {profile.id}</p>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta label="Sidebar" value={tokens.sidebar} />
              <GalleryPreviewMeta
                label="Mono"
                value={extractFontName(profile.globalStyle.typography.fontMono)}
              />
            </div>
          </header>
          <div className="ahtml-gallery-mail-display-actions">
            <Badge variant="outline">Reply</Badge>
            <Badge variant="outline">Archive</Badge>
            <Badge variant="secondary">Assigned</Badge>
          </div>
          <div className="ahtml-gallery-mail-display-body">
            <p>
              Preview shell is aligned. Remaining work is matching the denser
              work-app rhythm from tweakcn and reducing synthetic layout
              feeling.
            </p>
            <p>
              Focus on the inbox/list/detail relationship and keep the tool feel
              closer to an app than to a component catalog.
            </p>
            <div className="ahtml-gallery-mail-quote">
              <strong>Quoted context</strong>
              <p>
                Current workbench shell is substantially closer. Remaining drift
                comes from preview surfaces still reading as handcrafted demos
                instead of product-native examples.
              </p>
            </div>
            <div className="ahtml-gallery-mail-attachments">
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>design.md</strong>
                <span>Visual gap notes</span>
              </div>
              <div className="ahtml-gallery-mail-attachment-card">
                <strong>gallery.md</strong>
                <span>Product standard</span>
              </div>
            </div>
          </div>
          <Textarea
            readOnly
            value={`Reply draft\n\nPrimary ${tokens.primary}\nSidebar ${tokens.sidebar}\nMono ${profile.globalStyle.typography.fontMono}\nRadius ${profile.globalStyle.radiusScale.base}`}
          />
          <div className="ahtml-gallery-inline-metrics">
            <Badge variant="outline">⌘ Enter to send</Badge>
            <Button size="sm" type="button">
              Send draft
            </Button>
          </div>
        </article>
      </div>
    </div>
  )
}

function GalleryPricingWorkbenchPanel({
  profile,
  previewThemeMode,
}: {
  profile: ArtifactProfile
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const surfaceShadow = createGallerySurfaceShadow(profile)

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-stage-toolbar">
        <div className="ahtml-gallery-stage-toolbar-copy">
          <span className="ahtml-gallery-stage-panel-kicker">
            Pricing preview
          </span>
          <strong>Marketing block inside the editor stage</strong>
        </div>
        <div className="ahtml-gallery-stage-toolbar-meta">
          <GalleryPreviewMeta label="Primary" value={tokens.primary} />
          <GalleryPreviewMeta label="Secondary" value={tokens.secondary} />
          <GalleryPreviewMeta label="Style" value={profile.id} />
        </div>
      </div>
      <div className="ahtml-gallery-pricing-shell">
        <div className="ahtml-gallery-pricing-header">
          <h4>Pricing</h4>
          <p>
            Check out affordable plans without leaving the preview workbench.
          </p>
          <div className="ahtml-gallery-pricing-toggle">
            <span>Monthly</span>
            <Switch checked={previewThemeMode === "dark"} />
            <span>Yearly</span>
          </div>
        </div>
        <div className="ahtml-gallery-pricing-grid">
          {[
            ["Plus", "$19", "For personal use", "outline"],
            ["Pro", "$49", "For professionals", "secondary"],
          ].map(([name, price, description, badgeVariant]) => (
            <Card
              {...getManualCardProps(profile, `manual.pricing.${name}`)}
              key={name}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <div className="ahtml-gallery-inline-metrics">
                  <CardTitle>{name}</CardTitle>
                  <Badge variant={badgeVariant as "outline" | "secondary"}>
                    {name === "Pro" ? "popular" : "solo"}
                  </Badge>
                </div>
                <p className="ahtml-gallery-custom-copy">{description}</p>
                <strong className="ahtml-gallery-goal-number">{price}</strong>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <Separator />
                <div className="ahtml-gallery-feature-list">
                  <label>
                    <Checkbox checked /> Shared presets
                  </label>
                  <label>
                    <Checkbox checked /> Gallery preview
                  </label>
                  <label>
                    <Checkbox checked={name === "Pro"} /> Priority support
                  </label>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
        <div className="ahtml-gallery-workbench-footer">
          <FieldRow label="Primary" value={tokens.primary} />
          <FieldRow label="Secondary" value={tokens.secondary} />
          <FieldRow
            label="Spacing"
            value={profile.globalStyle.typography.spacing}
          />
          <FieldRow label="Style" value={profile.id} />
        </div>
      </div>
    </div>
  )
}

export function GalleryPreviewPane({
  colorThemeSyncEnabled,
  copyCurrentArtifactProfile,
  draftProfile,
  focusEditorField,
  focusThemeToken,
  focusedToken,
  hasCopiedProfile,
  inspectorEnabled,
  inspectorState,
  isDirty,
  isPreviewFullscreen,
  isSaving,
  artifactProfileReference,
  openControlTab,
  previewMode,
  previewModeLabel,
  previewShellRef,
  previewSurfaceRef,
  previewThemeMode,
  resetDraft,
  saveProfile,
  setInspectorEnabled,
  setPreviewMode,
  setPreviewThemeMode,
  togglePreviewFullscreen,
  visiblePreviewSections,
  RendererNode,
}: {
  colorThemeSyncEnabled: boolean
  copyCurrentArtifactProfile: () => Promise<void>
  draftProfile: ArtifactProfile
  focusEditorField: (field: FocusedEditorField) => void
  focusThemeToken: (
    tokenName: ThemeTokenName,
    mode?: GalleryPreviewThemeMode,
  ) => void
  focusedToken: FocusedThemeToken | null
  hasCopiedProfile: boolean
  inspectorEnabled: boolean
  inspectorState: GalleryInspectorState | null
  isDirty: boolean
  isPreviewFullscreen: boolean
  isSaving: boolean
  artifactProfileReference: string
  openControlTab: (
    nextTab: "colors" | "typography" | "other" | "profile",
  ) => void
  previewMode: GalleryPreviewMode
  previewModeLabel: string
  previewShellRef: React.RefObject<HTMLDivElement | null>
  previewSurfaceRef: React.RefObject<HTMLDivElement | null>
  previewThemeMode: GalleryPreviewThemeMode
  resetDraft: () => void
  saveProfile: () => Promise<void>
  setInspectorEnabled: React.Dispatch<React.SetStateAction<boolean>>
  setPreviewMode: React.Dispatch<React.SetStateAction<GalleryPreviewMode>>
  setPreviewThemeMode: React.Dispatch<
    React.SetStateAction<GalleryPreviewThemeMode>
  >
  togglePreviewFullscreen: () => Promise<void>
  visiblePreviewSections: GalleryPreviewSection[]
  RendererNode: RendererNodeComponent
}) {
  return (
    <div
      className="ahtml-gallery-preview-shell"
      data-fullscreen={isPreviewFullscreen ? "true" : "false"}
      ref={previewShellRef}
    >
      <Tabs
        className="ahtml-gallery-preview-tabs"
        onValueChange={(value) => setPreviewMode(value as GalleryPreviewMode)}
        value={previewMode}
      >
        <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-topbar">
          <div className="ahtml-gallery-toolbar-copy">
            <span className="ahtml-gallery-toolbar-label">Preview actions</span>
            <span className="ahtml-gallery-toolbar-caption">
              Profile {artifactProfileReference} · Draft{" "}
              {isDirty ? "unsaved" : "synced"} · Theme {previewThemeMode}
            </span>
          </div>
          <div className="ahtml-gallery-preview-toolbar">
            <GalleryToolbarGroup label="Tools">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    aria-label="More editor tools"
                    className="ahtml-gallery-more-previews"
                    size="sm"
                    type="button"
                    variant="ghost"
                  >
                    <MoreVertical aria-hidden="true" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Editor tools</DropdownMenuLabel>
                  <DropdownMenuItem
                    onSelect={() => {
                      openControlTab("colors")
                      setPreviewMode("colors")
                    }}
                  >
                    Edit colors
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => {
                      openControlTab("typography")
                      setPreviewMode("typography")
                    }}
                  >
                    Edit typography
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openControlTab("other")}>
                    Edit geometry
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => openControlTab("profile")}>
                    Manage profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onSelect={() => setPreviewMode("components")}
                  >
                    Cards preview
                  </DropdownMenuItem>
                  <DropdownMenuItem onSelect={() => setPreviewMode("full")}>
                    Full component gallery
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Button
                onClick={() => void copyCurrentArtifactProfile()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {hasCopiedProfile ? (
                  <Check aria-hidden="true" />
                ) : (
                  <Copy aria-hidden="true" />
                )}
                {hasCopiedProfile ? "Copied" : "Copy"}
              </Button>
            </GalleryToolbarGroup>
            <GalleryToolbarGroup label="View">
              <div
                aria-label="Preview theme"
                className="ahtml-gallery-segmented-toggle"
                role="group"
              >
                <Button
                  aria-pressed={previewThemeMode === "light"}
                  className="ahtml-gallery-toggle-button"
                  onClick={() => setPreviewThemeMode("light")}
                  size="sm"
                  type="button"
                  variant={previewThemeMode === "light" ? "secondary" : "ghost"}
                >
                  Light
                </Button>
                <Button
                  aria-pressed={previewThemeMode === "dark"}
                  className="ahtml-gallery-toggle-button"
                  onClick={() => setPreviewThemeMode("dark")}
                  size="sm"
                  type="button"
                  variant={previewThemeMode === "dark" ? "secondary" : "ghost"}
                >
                  Dark
                </Button>
              </div>
              <Button
                aria-pressed={inspectorEnabled}
                className="ahtml-gallery-inspector-button"
                onClick={() => setInspectorEnabled((current) => !current)}
                size="sm"
                type="button"
                variant={inspectorEnabled ? "secondary" : "ghost"}
              >
                <Inspect aria-hidden="true" />
                {inspectorEnabled ? "Inspecting" : "Inspect"}
              </Button>
              <Button
                onClick={() => void togglePreviewFullscreen()}
                size="sm"
                type="button"
                variant="ghost"
              >
                {isPreviewFullscreen ? (
                  <Minimize2 aria-hidden="true" />
                ) : (
                  <Maximize2 aria-hidden="true" />
                )}
                {isPreviewFullscreen ? "Exit Fullscreen" : "Fullscreen"}
              </Button>
            </GalleryToolbarGroup>
            <GalleryToolbarGroup label="Persist">
              <Button
                disabled={isSaving || !isDirty}
                onClick={resetDraft}
                size="sm"
                type="button"
                variant="ghost"
              >
                Reset
              </Button>
              <Button
                disabled={isSaving}
                onClick={() => void saveProfile()}
                size="sm"
                type="button"
              >
                Save Profile
              </Button>
            </GalleryToolbarGroup>
          </div>
        </div>
        <div className="ahtml-gallery-toolbar ahtml-gallery-toolbar-border ahtml-gallery-preview-modebar">
          <div className="ahtml-gallery-preview-mode-tools">
            <ScrollArea className="ahtml-gallery-pill-scroll ahtml-gallery-preview-pill-scroll">
              <TabsList className="ahtml-gallery-pill-tabs">
                <GalleryTabsTriggerPill value="custom">
                  Custom
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="components">
                  Cards
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="dashboard">
                  Dashboard
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="mail">
                  Mail
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="pricing">
                  Pricing
                </GalleryTabsTriggerPill>
                <GalleryTabsTriggerPill value="colors">
                  Color Palette
                </GalleryTabsTriggerPill>
              </TabsList>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  className="ahtml-gallery-more-previews"
                  size="sm"
                  type="button"
                  variant="ghost"
                >
                  <MoreVertical aria-hidden="true" />
                  More previews
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuLabel>Preview catalog</DropdownMenuLabel>
                <DropdownMenuItem onSelect={() => setPreviewMode("forms")}>
                  Form controls
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("selection")}>
                  Selection patterns
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("disclosure")}>
                  Disclosure patterns
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => setPreviewMode("typography")}>
                  Typography audit
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => setPreviewMode("full")}>
                  Full component gallery
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
          <div className="ahtml-gallery-preview-context">
            <span>Mode</span>
            <strong>{previewModeLabel}</strong>
            <span>Draft</span>
            <strong>{isDirty ? "unsaved" : "synced"}</strong>
            <span>Style</span>
            <strong>{artifactProfileReference}</strong>
          </div>
        </div>
        <section className="ahtml-gallery-preview-stage">
          <ScrollArea className="ahtml-gallery-preview-canvas">
            <TabsContent
              className="ahtml-gallery-preview-panel"
              value={previewMode}
            >
              <GalleryExamplesPreviewContainer
                focusedToken={focusedToken}
                inspectorEnabled={inspectorEnabled}
                inspectorState={inspectorState}
                onInspectorTokenSelect={focusThemeToken}
                previewMode={previewMode}
                previewSurfaceRef={previewSurfaceRef}
                previewThemeMode={previewThemeMode}
              >
                {previewMode === "typography" ? (
                  <GalleryTypographyPanel
                    onSelectField={focusEditorField}
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "colors" ? (
                  <GalleryColorPreviewPanel
                    onActivateThemeMode={setPreviewThemeMode}
                    onSelectToken={focusThemeToken}
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                    themeSyncEnabled={colorThemeSyncEnabled}
                  />
                ) : previewMode === "custom" ? (
                  <GalleryCustomPreviewPanel profile={draftProfile} />
                ) : previewMode === "components" ? (
                  <GalleryCardsWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "dashboard" ? (
                  <GalleryDashboardWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "mail" ? (
                  <GalleryMailWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : previewMode === "pricing" ? (
                  <GalleryPricingWorkbenchPanel
                    profile={draftProfile}
                    previewThemeMode={previewThemeMode}
                  />
                ) : (
                  <DocumentArtifactShell
                    artifactProfile={draftProfile}
                    className="ahtml-gallery-preview-document"
                    layoutPolicy="gallery"
                  >
                    {visiblePreviewSections.map((section, index) => (
                      <RendererNode
                        key={`${section.mode}-${index}`}
                        node={section.node}
                        path={[index]}
                      />
                    ))}
                  </DocumentArtifactShell>
                )}
              </GalleryExamplesPreviewContainer>
            </TabsContent>
          </ScrollArea>
        </section>
      </Tabs>
    </div>
  )
}
