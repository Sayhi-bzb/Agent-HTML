import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"

import { createGallerySurfaceShadow, getManualCardProps } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
import { FieldRow } from "../shared/form-controls"
import type { PreviewSceneProps } from "./types"

export function GalleryCardsWorkbenchPanel({
  profile,
  previewThemeMode,
}: PreviewSceneProps) {
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
