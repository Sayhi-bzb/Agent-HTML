import { Separator } from "@/components/ui/separator"

import { extractFontName } from "../helpers"
import { FieldRow, GalleryPreviewMeta } from "../shared"
import type { TypographyPanelProps } from "./types"

export function GalleryTypographyPanel({
  onSelectField,
  profile,
  previewThemeMode,
}: TypographyPanelProps) {
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
