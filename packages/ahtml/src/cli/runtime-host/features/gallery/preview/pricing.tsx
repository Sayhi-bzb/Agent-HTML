import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { createGallerySurfaceShadow, getManualCardProps } from "../helpers"
import { GalleryPreviewMeta } from "../shared/chrome"
import { FieldRow } from "../shared/form-controls"
import type { PreviewSceneProps } from "./types"

export function GalleryPricingWorkbenchPanel({
  profile,
  previewThemeMode,
}: PreviewSceneProps) {
  const tokens = profile.globalStyle.tokenSets[previewThemeMode]
  const surfaceShadow = createGallerySurfaceShadow(profile)

  return (
    <div className="ahtml-gallery-stage-panel ahtml-gallery-workbench-panel">
      <div className="ahtml-gallery-pricing-shell">
        <div className="ahtml-gallery-pricing-browser">
          <header className="ahtml-gallery-workbench-header ahtml-gallery-stage-toolbar ahtml-gallery-stage-toolbar-inset">
            <div className="ahtml-gallery-workbench-header-copy">
              <span className="ahtml-gallery-stage-panel-kicker">
                Pricing workbench
              </span>
              <h4>Commercial surface review</h4>
              <p>
                Evaluate tier hierarchy, comparison rhythm, and conversion
                emphasis without leaving the gallery workbench.
              </p>
            </div>
            <div className="ahtml-gallery-stage-toolbar-meta">
              <GalleryPreviewMeta label="Primary" value={tokens.primary} />
              <GalleryPreviewMeta label="Secondary" value={tokens.secondary} />
              <GalleryPreviewMeta label="Style" value={profile.id} />
            </div>
          </header>

          <div className="ahtml-gallery-pricing-utility-strip">
            <div className="ahtml-gallery-pricing-toggle">
              <span>Monthly</span>
              <Switch checked={previewThemeMode === "dark"} />
              <span>Yearly</span>
            </div>
            <div className="ahtml-gallery-custom-badges">
              <Badge variant="secondary">Conversion reviewed</Badge>
              <Badge variant="outline">Theme aware</Badge>
              <Badge variant="outline">Shared surface</Badge>
            </div>
          </div>
        </div>

        <div className="ahtml-gallery-workbench-intro">
          <div className="ahtml-gallery-workbench-intro-copy">
            <span className="ahtml-gallery-stage-panel-kicker">
              Pricing gallery
            </span>
            <h3>Tier cards, comparison tables, and conversion support in one stage</h3>
            <p>
              Review plan hierarchy, comparison clarity, and call-to-action
              emphasis in the same commercial surface the team ships to
              customers.
            </p>
          </div>
          <div className="ahtml-gallery-workbench-intro-meta">
            <GalleryPreviewMeta label="Layout" value="commercial-review" />
            <GalleryPreviewMeta label="Cards" value="3 tiers" />
            <GalleryPreviewMeta label="State" value="embedded" />
          </div>
        </div>

        <div className="ahtml-gallery-pricing-grid">
          {[
            {
              name: "Starter",
              price: "$19",
              description: "For personal use",
              badgeVariant: "outline",
              features: [
                ["Shared presets", true],
                ["Theme previews", true],
                ["Priority support", false],
              ] as const,
            },
            {
              name: "Pro",
              price: "$49",
              description: "For professionals",
              badgeVariant: "secondary",
              features: [
                ["Shared presets", true],
                ["Theme previews", true],
                ["Priority support", true],
              ] as const,
            },
            {
              name: "Enterprise",
              price: "$129",
              description: "For teams shipping governed artifacts",
              badgeVariant: "outline",
              features: [
                ["Release governance", true],
                ["Review surfaces", true],
                ["Dedicated onboarding", true],
              ] as const,
            },
          ].map(({ name, price, description, badgeVariant, features }) => (
            <Card
              {...getManualCardProps(
                profile,
                `manual.pricing.${name}`,
                [
                  "ahtml-gallery-pricing-card",
                  name === "Pro"
                    ? "ahtml-gallery-pricing-card-feature"
                    : undefined,
                ]
                  .filter(Boolean)
                  .join(" "),
              )}
              key={name}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <div className="ahtml-gallery-inline-metrics">
                  <CardTitle>{name}</CardTitle>
                  <Badge variant={badgeVariant as "outline" | "secondary"}>
                    {name === "Pro"
                      ? "popular"
                      : name === "Enterprise"
                        ? "scale"
                        : "solo"}
                  </Badge>
                </div>
                <p className="ahtml-gallery-custom-copy">{description}</p>
                <strong className="ahtml-gallery-goal-number">{price}</strong>
              </CardHeader>
              <CardContent className="ahtml-gallery-custom-stack">
                <Separator />
                <div className="ahtml-gallery-feature-list">
                  {features.map(([label, checked]) => (
                    <label key={String(label)}>
                      <Checkbox checked={Boolean(checked)} /> {label}
                    </label>
                  ))}
                </div>
                <FieldRow
                  label="CTA"
                  value={
                    name === "Pro"
                      ? "Primary emphasis"
                      : name === "Enterprise"
                        ? "Contact sales"
                        : "Self-serve"
                  }
                />
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="ahtml-gallery-pricing-lower">
          <Card
            {...getManualCardProps(profile, "manual.pricing.comparison")}
            style={{ boxShadow: surfaceShadow }}
          >
            <CardHeader>
              <CardTitle>Tier comparison</CardTitle>
            </CardHeader>
            <CardContent className="ahtml-gallery-pricing-comparison">
              <div className="ahtml-gallery-pricing-comparison-row is-head">
                <span>Capability</span>
                <span>Starter</span>
                <span>Pro</span>
                <span>Enterprise</span>
              </div>
              {[
                ["Saved profiles", "1", "10", "Unlimited"],
                ["Review surfaces", "Basic", "Advanced", "Governed"],
                ["Team seats", "1", "5", "25+"],
              ].map(([label, starter, pro, enterprise]) => (
                <div className="ahtml-gallery-pricing-comparison-row" key={label}>
                  <strong>{label}</strong>
                  <span>{starter}</span>
                  <span>{pro}</span>
                  <span>{enterprise}</span>
                </div>
              ))}
            </CardContent>
          </Card>

          <div className="ahtml-gallery-workbench-side-stack">
            <Card
              {...getManualCardProps(profile, "manual.pricing.notes")}
              style={{ boxShadow: surfaceShadow }}
            >
              <CardHeader>
                <CardTitle>Conversion checklist</CardTitle>
              </CardHeader>
              <CardContent className="ahtml-gallery-workbench-checklist">
                <div className="ahtml-gallery-workbench-checklist-item">
                  <strong>Hierarchy</strong>
                  <span>Featured tier should read stronger without breaking surface consistency.</span>
                </div>
                <div className="ahtml-gallery-workbench-checklist-item">
                  <strong>Density</strong>
                  <span>Comparison details stay compact and still scannable in the commercial surface.</span>
                </div>
                <div className="ahtml-gallery-workbench-checklist-item">
                  <strong>Theme shift</strong>
                  <span>CTA and surface contrast react to the active artifact profile.</span>
                </div>
              </CardContent>
            </Card>

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
      </div>
    </div>
  )
}
