import { useRef, useState } from "react"
import { MoreHorizontalIcon } from "lucide-react"

import type {
  SourceFocusReviewStatus,
  SourceFocusTarget,
} from "../../lib/source-focus"
import { Button } from "../ui/button"
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuSeparator,
  ContextMenuTrigger,
} from "../ui/context-menu"
import {
  SurfaceCard,
  SurfaceCardBody,
} from "../ui/surface-card"
import { StatusBadge } from "../ui/status-badge"
import {
  createSourceFocusTargetFromDiagnostic,
  getSourceSelectionRange,
} from "../../lib/source-focus"
import { getSourceFocusViewModel } from "../../lib/source-focus-view"
import { SourceEditor } from "../ui/source-editor"
import type { SourceValidationState } from "../../lib/types"
import { getSourceValidationViewModel } from "../../lib/source-validation-view"
import { formatTimestampLabel } from "../../lib/time"
import { copyText } from "../../lib/utils"

type SourcePanelProps = {
  source: string
  draftSource: string
  sourcePath: string
  sourceValidation: SourceValidationState
  activeSourceFocus?: SourceFocusTarget
  activeSourceFocusReviewStatus?: SourceFocusReviewStatus
  canRevealSourceOrigin: boolean
  onOpenSourceFocus: (target: SourceFocusTarget) => void
  onDraftChange: (nextSource: string) => void
  onClearSourceFocus: () => void
  onRefreshSourceFocus: () => void
  onRevealReviewTarget: () => void
  onSave: (nextSource: string) => Promise<void> | void
  isSaving: boolean
}

export function SourcePanel({
  source,
  draftSource,
  sourcePath,
  sourceValidation,
  activeSourceFocus,
  activeSourceFocusReviewStatus,
  canRevealSourceOrigin,
  onOpenSourceFocus,
  onDraftChange,
  onClearSourceFocus,
  onRefreshSourceFocus,
  onRevealReviewTarget,
  onSave,
  isSaving,
}: SourcePanelProps) {
  const [copiedKey, setCopiedKey] = useState<string>()
  const toolbarMenuRef = useRef<HTMLDivElement>(null)
  const validationMenuRef = useRef<HTMLDivElement>(null)
  const focusMenuRef = useRef<HTMLDivElement>(null)
  const sourceFocusView = getSourceFocusViewModel({
    sourceFocus: activeSourceFocus,
    reviewStatus: activeSourceFocusReviewStatus,
    canRevealSourceOrigin,
  })
  const sourceValidationView = getSourceValidationViewModel(sourceValidation)
  const primaryValidationDiagnostic = sourceValidationView.primaryDiagnostic
  const hasUnsavedChanges = draftSource !== source
  const hasValidationDiagnostics = sourceValidation.diagnostics.length > 0
  const sourceFocusSelection = activeSourceFocus
    ? {
        requestKey: activeSourceFocus.requestKey,
        ...getSourceSelectionRange(draftSource, activeSourceFocus),
      }
    : undefined
  const primaryFocusAction = sourceFocusView?.actions.canRevealSourceOrigin
    ? {
        label: "Origin",
        onSelect: onRevealReviewTarget,
      }
    : sourceFocusView?.actions.canRefreshFocus
      ? {
          label: "Refresh",
          onSelect: onRefreshSourceFocus,
        }
      : undefined

  return (
    <SurfaceCard className="source-panel" variant="workbench">
      <SurfaceCardBody className="source-panel-body source-panel-body-compact">
        <div className="source-worksurface">
          <ContextMenu>
            <ContextMenuTrigger asChild>
              <div
                className="source-toolbar panel-menu-shell source-toolbar-shell"
                ref={toolbarMenuRef}
              >
                <div className="source-toolbar-copy">
                  <div className="header-actions">
                    {hasUnsavedChanges ? (
                      <StatusBadge tone="dirty">Unsaved</StatusBadge>
                    ) : (
                      <StatusBadge>Saved</StatusBadge>
                    )}
                    <span className="inline-meta source-toolbar-file">
                      source.agent.html
                    </span>
                  </div>
                  <span className="inline-meta source-toolbar-path">
                    {sourcePath}
                  </span>
                </div>
                <div className="source-toolbar-actions">
                  <Button
                    aria-label="Source file actions"
                    className="panel-card-more"
                    onClick={(event) => {
                      event.preventDefault()
                      event.stopPropagation()
                      openSourceContextMenu(toolbarMenuRef.current)
                    }}
                    size="icon-xs"
                    type="button"
                    variant="ghost"
                  >
                    <MoreHorizontalIcon />
                  </Button>
                  <Button
                    disabled={isSaving || draftSource === source}
                    onClick={() => onSave(draftSource)}
                    size="sm"
                    type="button"
                  >
                    {isSaving ? "Saving..." : "Save"}
                  </Button>
                </div>
              </div>
            </ContextMenuTrigger>
            <ContextMenuContent className="session-context-menu" sideOffset={10}>
              <ContextMenuGroup>
                <ContextMenuItem
                  onSelect={() => {
                    void copyText(sourcePath).then((copied) => {
                      if (copied) {
                        setCopiedKey("source-path")
                      }
                    })
                  }}
                >
                  {copiedKey === "source-path"
                    ? "Copied source path"
                    : "Copy source path"}
                </ContextMenuItem>
              </ContextMenuGroup>
              <ContextMenuSeparator />
              <ContextMenuItem className="session-context-detail" disabled>
                <span className="session-context-detail-label">File</span>
                <span className="session-context-detail-value">
                  source.agent.html
                </span>
              </ContextMenuItem>
              <ContextMenuItem className="session-context-detail" disabled>
                <span className="session-context-detail-label">Path</span>
                <span className="session-context-detail-value">
                  {sourcePath}
                </span>
              </ContextMenuItem>
            </ContextMenuContent>
          </ContextMenu>

          <div className="source-status-stack">
            <ContextMenu>
              <ContextMenuTrigger asChild>
                <div className="panel-menu-shell" ref={validationMenuRef}>
                  <SurfaceCard
                    className="source-validation-strip"
                    variant="validation"
                  >
                    <SurfaceCardBody
                      className="source-validation-strip-body"
                      padding="compact"
                    >
                      <div className="source-validation-topline">
                        <div className="source-validation-copy">
                          <div className="proposal-meta-row">
                            <p className="eyebrow">Validation</p>
                            <StatusBadge
                              tone={statusToneForClassName(
                                sourceValidationView.pill.className,
                              )}
                            >
                              {sourceValidationView.pill.label}
                            </StatusBadge>
                          </div>
                          <p className="source-validation-headline">
                            {sourceValidationView.headline}
                          </p>
                        </div>
                        <div className="source-validation-actions">
                          <span className="inline-meta">
                            {sourceValidationView.validatedAt
                              ? `Last checked ${formatTimestampLabel(sourceValidationView.validatedAt)}`
                              : "No validation run yet"}
                          </span>
                          <span className="inline-meta">
                            {sourceValidationView.diagnosticsCount} diagnostic(s)
                          </span>
                          {sourceValidationView.primaryAction ===
                            "focus-first-issue" && primaryValidationDiagnostic ? (
                            <Button
                              aria-label="Validation actions"
                              className="panel-card-more"
                              onClick={(event) => {
                                event.preventDefault()
                                event.stopPropagation()
                                openSourceContextMenu(validationMenuRef.current)
                              }}
                              size="icon-xs"
                              type="button"
                              variant="ghost"
                            >
                              <MoreHorizontalIcon />
                            </Button>
                          ) : null}
                        </div>
                      </div>
                      {hasValidationDiagnostics ? (
                        <ul className="diagnostic-list source-validation-list">
                          {sourceValidation.diagnostics.map((diagnostic) => (
                            <SourceDiagnosticRow
                              diagnostic={diagnostic}
                              key={diagnostic.id}
                              onOpenSourceFocus={onOpenSourceFocus}
                            />
                          ))}
                        </ul>
                      ) : null}
                    </SurfaceCardBody>
                  </SurfaceCard>
                </div>
              </ContextMenuTrigger>
              {sourceValidationView.primaryAction === "focus-first-issue" &&
              primaryValidationDiagnostic ? (
                <ContextMenuContent
                  className="session-context-menu"
                  sideOffset={10}
                >
                  <ContextMenuGroup>
                    <ContextMenuItem
                      onSelect={() => {
                        const target = createSourceFocusTargetFromDiagnostic({
                          diagnostic: primaryValidationDiagnostic,
                        })
                        if (target) {
                          onOpenSourceFocus(target)
                        }
                      }}
                    >
                      Focus first issue
                    </ContextMenuItem>
                  </ContextMenuGroup>
                </ContextMenuContent>
              ) : null}
            </ContextMenu>

            {activeSourceFocus ? (
              <ContextMenu>
                <ContextMenuTrigger asChild>
                  <div className="panel-menu-shell" ref={focusMenuRef}>
                    <SurfaceCard
                      className="source-focus-banner source-focus-strip"
                      variant="inset"
                    >
                      <SurfaceCardBody
                        className="source-focus-banner-body"
                        padding="compact"
                      >
                        <div>
                          <h4>
                            {sourceFocusView?.label ?? activeSourceFocus.label}
                          </h4>
                          {sourceFocusView?.originLabel ||
                          sourceFocusView?.reviewOriginLabel ? (
                            <div className="proposal-meta-row">
                              {sourceFocusView?.originLabel ? (
                                <StatusBadge tone="accent">
                                  {sourceFocusView.originLabel}
                                </StatusBadge>
                              ) : null}
                              <StatusBadge>
                                {sourceFocusView?.selectionLabel}
                              </StatusBadge>
                              {sourceFocusView?.reviewOriginLabel ? (
                                <span className="inline-meta">
                                  From {sourceFocusView.reviewOriginLabel}
                                </span>
                              ) : null}
                            </div>
                          ) : null}
                          {sourceFocusView?.summary ? (
                            <div className="proposal-meta-row">
                              {sourceFocusView.statusPill ? (
                                <StatusBadge
                                  tone={statusToneForClassName(
                                    sourceFocusView.statusPill.className,
                                  )}
                                >
                                  {sourceFocusView.statusPill.label}
                                </StatusBadge>
                              ) : null}
                              <span className="inline-meta">
                                {sourceFocusView.summary}
                              </span>
                            </div>
                          ) : null}
                        </div>
                        <div className="source-focus-actions">
                          {primaryFocusAction ? (
                            <Button
                              onClick={primaryFocusAction.onSelect}
                              size="sm"
                              type="button"
                              variant="outline"
                            >
                              {primaryFocusAction.label}
                            </Button>
                          ) : null}
                          <Button
                            aria-label="Source focus actions"
                            className="panel-card-more"
                            onClick={(event) => {
                              event.preventDefault()
                              event.stopPropagation()
                              openSourceContextMenu(focusMenuRef.current)
                            }}
                            size="icon-xs"
                            type="button"
                            variant="ghost"
                          >
                            <MoreHorizontalIcon />
                          </Button>
                        </div>
                      </SurfaceCardBody>
                    </SurfaceCard>
                  </div>
                </ContextMenuTrigger>
                <ContextMenuContent
                  className="session-context-menu"
                  sideOffset={10}
                >
                  <ContextMenuGroup>
                    {sourceFocusView?.actions.canRevealSourceOrigin &&
                    primaryFocusAction?.label !== "Origin" ? (
                      <ContextMenuItem onSelect={onRevealReviewTarget}>
                        Origin
                      </ContextMenuItem>
                    ) : null}
                    {sourceFocusView?.actions.canRefreshFocus &&
                    primaryFocusAction?.label !== "Refresh" ? (
                      <ContextMenuItem onSelect={onRefreshSourceFocus}>
                        Refresh
                      </ContextMenuItem>
                    ) : null}
                    <ContextMenuItem onSelect={onClearSourceFocus}>
                      Clear
                    </ContextMenuItem>
                  </ContextMenuGroup>
                  {sourceFocusView?.originReference ? (
                    <>
                      <ContextMenuSeparator />
                      <ContextMenuItem className="session-context-detail" disabled>
                        <span className="session-context-detail-label">
                          Reference
                        </span>
                        <span className="session-context-detail-value">
                          {sourceFocusView.originReference}
                        </span>
                      </ContextMenuItem>
                    </>
                  ) : null}
                </ContextMenuContent>
              </ContextMenu>
            ) : null}
          </div>

          <div className="source-editor-shell">
            <div className="source-editor-topline">
              <div className="source-editor-copy">
                <p className="eyebrow">Editor</p>
                <span className="inline-meta">
                  Working copy stays local until you save it back to the session.
                </span>
              </div>
              {sourceFocusView?.selectionLabel ? (
                <StatusBadge>{sourceFocusView.selectionLabel}</StatusBadge>
              ) : (
                <span className="inline-meta">Draft surface</span>
              )}
            </div>
            <SourceEditor
              focusSelection={sourceFocusSelection}
              onChange={onDraftChange}
              value={draftSource}
            />
          </div>
        </div>
      </SurfaceCardBody>
    </SurfaceCard>
  )
}

function statusToneForClassName(
  className?: string,
): "default" | "accent" | "ready" | "dirty" | "error" | "building" {
  switch (className) {
    case "status-ready":
      return "ready"
    case "status-dirty":
      return "dirty"
    case "status-error":
      return "error"
    case "status-building":
      return "building"
    case "accent":
      return "accent"
    default:
      return "default"
  }
}

function SourceDiagnosticRow({
  diagnostic,
  onOpenSourceFocus,
}: {
  diagnostic: SourceValidationState["diagnostics"][number]
  onOpenSourceFocus: (target: SourceFocusTarget) => void
}) {
  const triggerRef = useRef<HTMLLIElement>(null)
  const sourceTarget = createSourceFocusTargetFromDiagnostic({ diagnostic })

  return (
    <ContextMenu>
      <ContextMenuTrigger asChild>
        <li
          className={`diagnostic-item diagnostic-item-compact severity-${diagnostic.severity}`}
          ref={triggerRef}
        >
          <div className="message-topline">
            <strong>{diagnostic.severity.toUpperCase()}</strong>
            {sourceTarget ? (
              <Button
                aria-label={`${diagnostic.severity} diagnostic actions`}
                className="panel-card-more"
                onClick={(event) => {
                  event.preventDefault()
                  event.stopPropagation()
                  openSourceContextMenu(triggerRef.current)
                }}
                size="icon-xs"
                type="button"
                variant="ghost"
              >
                <MoreHorizontalIcon />
              </Button>
            ) : null}
          </div>
          <span>{diagnostic.message}</span>
          {diagnostic.code ||
          diagnostic.source ||
          typeof diagnostic.line === "number" ? (
            <span className="inline-meta">
              {[
                typeof diagnostic.line === "number"
                  ? `line ${diagnostic.line}${
                      typeof diagnostic.column === "number"
                        ? `:${diagnostic.column}`
                        : ""
                    }`
                  : undefined,
                diagnostic.code,
                diagnostic.source,
              ]
                .filter(Boolean)
                .join(" · ")}
            </span>
          ) : null}
        </li>
      </ContextMenuTrigger>
      {sourceTarget ? (
        <ContextMenuContent className="session-context-menu" sideOffset={10}>
          <ContextMenuGroup>
            <ContextMenuItem onSelect={() => onOpenSourceFocus(sourceTarget)}>
              Focus in Source
            </ContextMenuItem>
          </ContextMenuGroup>
        </ContextMenuContent>
      ) : null}
    </ContextMenu>
  )
}

function openSourceContextMenu(element: HTMLElement | null) {
  if (!element) {
    return
  }

  const rect = element.getBoundingClientRect()
  element.dispatchEvent(
    new MouseEvent("contextmenu", {
      bubbles: true,
      cancelable: true,
      clientX: rect.right - 12,
      clientY: rect.top + 12,
      view: window,
    }),
  )
}
