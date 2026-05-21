import { Button } from "@/components/ui/button"

import { formatThemeTokenLabel } from "../helpers"
import { GalleryPreviewMeta } from "../shared"
import type {
  ArtifactProfile,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "../types"
import type { ColorPreviewPanelProps } from "./types"

export function GalleryColorPreviewPanel({
  onActivateThemeMode,
  onSelectToken,
  profile,
  previewThemeMode,
  themeSyncEnabled,
}: ColorPreviewPanelProps) {
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
