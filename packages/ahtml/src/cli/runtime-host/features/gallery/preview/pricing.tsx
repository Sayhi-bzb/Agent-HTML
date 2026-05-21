import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Switch } from "@/components/ui/switch"

import { createGallerySurfaceShadow, getManualCardProps } from "../helpers"
import { FieldRow, GalleryPreviewMeta } from "../shared"
import type { PreviewSceneProps } from "./types"

export function GalleryPricingWorkbenchPanel({
  profile,
  previewThemeMode,
}: PreviewSceneProps) {
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
