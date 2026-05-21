import type { PropsWithChildren, RefObject } from "react"

import { resolveFocusableThemeToken } from "../helpers"
import type {
  FocusedThemeToken,
  GalleryInspectorState,
  GalleryPreviewMode,
  GalleryPreviewThemeMode,
  ThemeTokenName,
} from "../types"
import { GalleryPreviewMeta } from "./chrome"

function renderInspectorTokenChip({
  focusedToken,
  keyPrefix,
  onSelect,
  previewThemeMode,
  token,
}: {
  focusedToken: FocusedThemeToken | null
  keyPrefix: string
  onSelect: (tokenName: ThemeTokenName, mode: GalleryPreviewThemeMode) => void
  previewThemeMode: GalleryPreviewThemeMode
  token: string
}) {
  const resolvedToken = resolveFocusableThemeToken(token)
  const isFocused =
    resolvedToken !== null &&
    focusedToken?.mode === previewThemeMode &&
    focusedToken?.tokenName === resolvedToken

  if (!resolvedToken) {
    return (
      <span
        className="ahtml-gallery-inspector-token"
        key={`${keyPrefix}-${token}`}
      >
        {token}
      </span>
    )
  }

  return (
    <button
      className={[
        "ahtml-gallery-inspector-token",
        "is-action",
        isFocused ? "is-focused" : null,
      ]
        .filter(Boolean)
        .join(" ")}
      key={`${keyPrefix}-${token}`}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        onSelect(resolvedToken, previewThemeMode)
      }}
      title={`Jump to ${previewThemeMode} ${resolvedToken} token`}
      type="button"
    >
      {token}
    </button>
  )
}

export function GalleryExamplesPreviewContainer({
  children,
  focusedToken,
  inspectorEnabled,
  onInspectorTokenSelect,
  inspectorState,
  previewMode,
  previewThemeMode,
  previewSurfaceRef,
}: PropsWithChildren<{
  focusedToken: FocusedThemeToken | null
  inspectorEnabled: boolean
  onInspectorTokenSelect: (
    tokenName: ThemeTokenName,
    mode: GalleryPreviewThemeMode,
  ) => void
  inspectorState: GalleryInspectorState | null
  previewMode: GalleryPreviewMode
  previewThemeMode: GalleryPreviewThemeMode
  previewSurfaceRef: RefObject<HTMLDivElement | null>
}>) {
  const classes = [
    "ahtml-gallery-stage-frame",
    `ahtml-gallery-stage-frame-${previewMode}`,
  ].join(" ")

  return (
    <div className={classes}>
      <div
        className="ahtml-gallery-preview-surface"
        data-inspector={inspectorEnabled ? "true" : "false"}
        data-theme-mode={previewThemeMode}
        ref={previewSurfaceRef}
      >
        {inspectorEnabled ? (
          <div className="ahtml-gallery-inspector-overlay">
            {inspectorState ? (
              <div
                className="ahtml-gallery-inspector-outline"
                style={{
                  height: `${inspectorState.height}px`,
                  left: `${inspectorState.left}px`,
                  top: `${inspectorState.top}px`,
                  width: `${inspectorState.width}px`,
                }}
              >
                <div className="ahtml-gallery-inspector-outline-label">
                  {inspectorState.component}
                </div>
              </div>
            ) : null}
            <div
              className="ahtml-gallery-inspector-panel"
              onClick={(event) => event.stopPropagation()}
              onPointerDown={(event) => event.stopPropagation()}
            >
              <span className="ahtml-gallery-inspector-kicker">Inspector</span>
              <strong>{inspectorState?.component ?? "Hover a component"}</strong>
              <span>
                {inspectorState
                  ? `${inspectorState.label} · ${inspectorState.treatment}`
                  : "Move over a rendered component to inspect its role and treatment."}
              </span>
              <div className="ahtml-gallery-inspector-grid">
                <GalleryPreviewMeta
                  label="Render"
                  value={inspectorState?.renderKind ?? "structural"}
                />
                <GalleryPreviewMeta
                  label="Source"
                  value={inspectorState?.source ?? "ahtml-standard"}
                />
                <GalleryPreviewMeta
                  label="Path"
                  value={inspectorState?.path ?? "0"}
                />
                <GalleryPreviewMeta
                  label="Slot"
                  value={inspectorState?.slot ?? "component-root"}
                />
                <GalleryPreviewMeta
                  label="Tag"
                  value={inspectorState?.tagName ?? "n/a"}
                />
                <GalleryPreviewMeta
                  label="Frame"
                  value={
                    inspectorState
                      ? `${Math.round(inspectorState.width)}×${Math.round(
                          inspectorState.height,
                        )}`
                      : "n/a"
                  }
                />
              </div>
              <div className="ahtml-gallery-inspector-token-group">
                <span className="ahtml-gallery-inspector-token-label">
                  Classes
                </span>
                <div className="ahtml-gallery-inspector-token-list">
                  {(inspectorState?.classTokens.length
                    ? inspectorState.classTokens
                    : ["No class tokens"]
                  ).map((token) =>
                    renderInspectorTokenChip({
                      focusedToken,
                      keyPrefix: "class",
                      onSelect: onInspectorTokenSelect,
                      previewThemeMode,
                      token,
                    }),
                  )}
                </div>
              </div>
              <div className="ahtml-gallery-inspector-token-group">
                <span className="ahtml-gallery-inspector-token-label">
                  Source tokens
                </span>
                <div className="ahtml-gallery-inspector-token-list">
                  {(inspectorState?.sourceTokens.length
                    ? inspectorState.sourceTokens
                    : ["No source tokens"]
                  ).map((token) =>
                    renderInspectorTokenChip({
                      focusedToken,
                      keyPrefix: "source",
                      onSelect: onInspectorTokenSelect,
                      previewThemeMode,
                      token,
                    }),
                  )}
                </div>
              </div>
              <span className="ahtml-gallery-inspector-hint">
                {inspectorState?.pinned
                  ? "Pinned. Press Esc to release. Click a token to jump to matching controls."
                  : "Click to pin the current component. Token pills also jump into matching controls."}
              </span>
            </div>
          </div>
        ) : null}
        <div className="ahtml-gallery-preview-surface-inner">{children}</div>
      </div>
    </div>
  )
}
