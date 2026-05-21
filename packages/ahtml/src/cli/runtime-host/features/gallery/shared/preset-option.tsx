import { Badge } from "@/components/ui/badge"

import { isBuiltinArtifactProfileReference } from "../helpers"
import type { ArtifactProfile, GalleryPreviewThemeMode } from "../types"

export function renderPresetChooserOption({
  artifactProfileId,
  builtinArtifactProfileReferences,
  currentArtifactProfileReference,
  currentProfile,
  isDraftDirty,
  onSelectArtifactProfileReference,
  previewThemeMode,
}: {
  artifactProfileId: string
  builtinArtifactProfileReferences: string[]
  currentArtifactProfileReference: string
  currentProfile: ArtifactProfile
  isDraftDirty: boolean
  onSelectArtifactProfileReference: (artifactProfileId: string) => void
  previewThemeMode: GalleryPreviewThemeMode
}) {
  const isCurrent = artifactProfileId === currentArtifactProfileReference
  const isBuiltIn = isBuiltinArtifactProfileReference(
    artifactProfileId,
    builtinArtifactProfileReferences,
  )
  const kindLabel = isBuiltIn ? "Built-in" : "Custom"
  const summary = isBuiltIn
    ? "Read-only baseline preset"
    : "Saved custom preset"
  const accessLabel = isBuiltIn ? "Locked" : "Editable"
  const currentLabel = isCurrent
    ? isDraftDirty
      ? "Current draft"
      : "Current preset"
    : "Open in gallery"

  return (
    <button
      className={["ahtml-gallery-preset-option", isCurrent ? "is-active" : null]
        .filter(Boolean)
        .join(" ")}
      key={artifactProfileId}
      onClick={() => onSelectArtifactProfileReference(artifactProfileId)}
      title={`${artifactProfileId} • ${summary}`}
      type="button"
    >
      <span className="ahtml-gallery-preset-option-swatch-row">
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].primary
              : "var(--primary)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].accent
              : "var(--accent)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].secondary
              : "var(--secondary)",
          }}
        />
        <span
          className="ahtml-gallery-preset-swatch"
          style={{
            background: isCurrent
              ? currentProfile.globalStyle.tokenSets[previewThemeMode].border
              : "var(--border)",
          }}
        />
      </span>
      <span className="ahtml-gallery-preset-option-copy">
        <span className="ahtml-gallery-preset-option-copy-top">
          <strong>{artifactProfileId}</strong>
          <span className="ahtml-gallery-preset-option-kicker">{summary}</span>
        </span>
        <span className="ahtml-gallery-preset-option-copy-meta">
          <span>{accessLabel}</span>
          <span>{previewThemeMode} preview</span>
          <span>{currentLabel}</span>
        </span>
      </span>
      <span className="ahtml-gallery-preset-option-status">
        <Badge variant={isCurrent ? "secondary" : "outline"}>
          {isCurrent ? "Current" : kindLabel}
        </Badge>
        {!isCurrent ? (
          <Badge variant={isBuiltIn ? "outline" : "secondary"}>
            {accessLabel}
          </Badge>
        ) : null}
      </span>
    </button>
  )
}
