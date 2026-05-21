import { cloneElement, isValidElement, type ReactElement, type ReactNode } from "react"
import { LoaderCircleIcon } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardAction,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import type {
  BuildRunSummary,
  DiagnosticSeverity,
  RuntimeReport,
  SessionStatus,
  SourceValidationSnapshot,
} from "@/lib/types"
import { cn } from "@/lib/utils"

type ShellCardCopyProps = {
  title: ReactNode
  titleClassName?: string
  truncateTitle?: boolean
}

export function ShellCardCopy({
  title,
  titleClassName,
  truncateTitle = false,
}: ShellCardCopyProps) {
  return (
    <div className="app-shell-card-copy">
      <CardTitle className={cn(truncateTitle && "truncate", titleClassName)}>
        {title}
      </CardTitle>
    </div>
  )
}

type ShellCardHeaderProps = {
  title: ReactNode
  titleClassName?: string
  titleSize?: "default" | "sm"
  truncateTitle?: boolean
  action?: ReactNode
  actionClassName?: string
  actionLayout?: "default" | "compact"
  className?: string
}

export function ShellCardHeader({
  title,
  titleClassName,
  titleSize = "default",
  truncateTitle = false,
  action,
  actionClassName,
  actionLayout = "default",
  className,
}: ShellCardHeaderProps) {
  return (
    <CardHeader className={cn("app-shell-card-header", className)}>
      <ShellCardCopy
        title={title}
        titleClassName={cn(titleSize === "sm" && "app-shell-card-heading", titleClassName)}
        truncateTitle={truncateTitle}
      />
      {action ? (
        <CardAction
          className={cn(
            actionLayout === "compact" && "app-shell-stack-compact",
            actionClassName,
          )}
        >
          {action}
        </CardAction>
      ) : null}
    </CardHeader>
  )
}

type ShellPaneLabelProps = {
  icon: ReactNode
  title: ReactNode
}

export function ShellPaneLabel({ icon, title }: ShellPaneLabelProps) {
  return (
    <div className="app-shell-pane-label">
      {icon}
      <span className="app-shell-panel-title">{title}</span>
    </div>
  )
}

type ShellActionGroupProps = {
  children: ReactNode
}

export function ShellActionGroup({ children }: ShellActionGroupProps) {
  return <div className="app-shell-action-group">{children}</div>
}

function withTooltip(
  element: ReactElement,
  tooltip?: ReactNode,
  disabled = false,
  side: "top" | "right" | "bottom" | "left" = "top",
) {
  if (!tooltip) {
    return element
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        {disabled ? <span className="inline-flex">{element}</span> : element}
      </TooltipTrigger>
      <TooltipContent side={side}>{tooltip}</TooltipContent>
    </Tooltip>
  )
}

type ShellActionButtonProps = {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  ariaLabel?: string
  variant?: "outline" | "ghost"
  className?: string
  tooltip?: ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

export function ShellActionButton({
  children,
  disabled = false,
  onClick,
  ariaLabel,
  variant = "outline",
  className,
  tooltip,
  tooltipSide,
}: ShellActionButtonProps) {
  const button = (
    <Button
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      onClick={onClick}
      size="sm"
      type="button"
      variant={variant}
    >
      {children}
    </Button>
  )

  return withTooltip(button, tooltip, disabled, tooltipSide)
}

type ShellIconButtonProps = {
  children: ReactNode
  disabled?: boolean
  onClick?: () => void
  ariaLabel: string
  variant?: "outline" | "ghost"
  size?: "icon-sm" | "icon-xs"
  className?: string
  tooltip?: ReactNode
  tooltipSide?: "top" | "right" | "bottom" | "left"
}

export function ShellIconButton({
  children,
  disabled = false,
  onClick,
  ariaLabel,
  variant = "outline",
  size = "icon-sm",
  className,
  tooltip,
  tooltipSide,
}: ShellIconButtonProps) {
  const button = (
    <Button
      aria-label={ariaLabel}
      className={className}
      disabled={disabled}
      onClick={onClick}
      size={size}
      type="button"
      variant={variant}
    >
      {children}
    </Button>
  )

  return withTooltip(button, tooltip, disabled, tooltipSide)
}

type ShellSearchFieldProps = {
  icon: ReactElement<{ className?: string }>
  value: string
  disabled?: boolean
  placeholder?: string
  onChange: (value: string) => void
}

export function ShellSearchField({
  icon,
  value,
  disabled = false,
  placeholder = "Search",
  onChange,
}: ShellSearchFieldProps) {
  const searchIcon = isValidElement(icon)
    ? cloneElement(icon, {
        className: cn("app-shell-search-icon", icon.props.className),
      })
    : icon

  return (
    <div className="app-shell-search-field">
      {searchIcon}
      <Input
        className="app-shell-search-input"
        disabled={disabled}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        value={value}
      />
    </div>
  )
}

type ShellSplitRowProps = {
  children: ReactNode
  gap?: "compact" | "base"
  align?: "center" | "start"
  className?: string
}

export function ShellSplitRow({
  children,
  gap = "compact",
  align = "center",
  className,
}: ShellSplitRowProps) {
  return (
    <div
      className={cn(
        gap === "base" ? "app-shell-split-row-base" : "app-shell-split-row",
        align === "start" && "app-shell-split-row-start",
        className,
      )}
    >
      {children}
    </div>
  )
}

type ShellPaneHeaderProps = {
  leading: ReactNode
  trailing?: ReactNode
  gap?: "compact" | "base"
}

export function ShellPaneHeader({
  leading,
  trailing,
  gap = "compact",
}: ShellPaneHeaderProps) {
  return (
    <ShellSplitRow gap={gap}>
      {leading}
      {trailing ? <ShellActionGroup>{trailing}</ShellActionGroup> : null}
    </ShellSplitRow>
  )
}

type ShellMetaRowProps = {
  copy?: ReactNode
  action?: ReactNode
}

export function ShellMetaRow({ copy, action }: ShellMetaRowProps) {
  return (
    <ShellSplitRow className="w-full">
      {copy ? <span className="app-shell-supporting-copy">{copy}</span> : <span />}
      {action ?? null}
    </ShellSplitRow>
  )
}

type ShellLoadingRowProps = {
  children: ReactNode
}

export function ShellLoadingRow({ children }: ShellLoadingRowProps) {
  return (
    <div className="app-shell-loading-row" role="status">
      <LoaderCircleIcon className="app-shell-spinner" />
      <span>{children}</span>
    </div>
  )
}

type ShellEmptyCardProps = {
  children: ReactNode
  className?: string
}

export function ShellEmptyCard({ children, className }: ShellEmptyCardProps) {
  return (
    <Card className={className} size="sm">
      <CardContent className="app-shell-empty-state app-shell-supporting-copy">
        {children}
      </CardContent>
    </Card>
  )
}

type ShellEmptyCanvasProps = {
  children: ReactNode
}

export function ShellEmptyCanvas({ children }: ShellEmptyCanvasProps) {
  return <div className="app-shell-empty-canvas">{children}</div>
}

type ShellMetricListProps = {
  items: Array<{
    key: string
    label: ReactNode
    value: ReactNode
  }>
  className?: string
}

export function ShellMetricList({ items, className }: ShellMetricListProps) {
  return (
    <CardContent className={cn("app-shell-metric-strip app-shell-card-body", className)}>
      {items.map((item) => (
        <div className="app-shell-metric-row" key={item.key}>
          <span className="app-shell-metric-label">{item.label}</span>
          <span className="app-shell-metric-value">{item.value}</span>
        </div>
      ))}
    </CardContent>
  )
}

type ShellPaneScaffoldProps = {
  header?: ReactNode
  content?: ReactNode
  footer?: ReactNode
  footerClassName?: string
}

export function ShellPaneScaffold({
  header,
  content,
  footer,
  footerClassName,
}: ShellPaneScaffoldProps) {
  return (
    <div className="app-shell-pane">
      {header ? <div className="app-shell-pane-header">{header}</div> : null}
      {content ? <div className="app-shell-pane-content">{content}</div> : null}
      {footer ? <div className={cn("app-shell-pane-footer", footerClassName)}>{footer}</div> : null}
    </div>
  )
}

type ShellSurfaceItemProps = {
  children: ReactNode
}

export function ShellSurfaceItem({ children }: ShellSurfaceItemProps) {
  return <div className="app-shell-surface-item">{children}</div>
}

type ShellSectionLabelProps = {
  children: ReactNode
}

export function ShellSectionLabel({ children }: ShellSectionLabelProps) {
  return <p className="app-shell-kicker">{children}</p>
}

type ShellStatusRowProps = {
  children: ReactNode
}

export function ShellStatusRow({ children }: ShellStatusRowProps) {
  return <div className="app-shell-status-row">{children}</div>
}

type ShellScrollSurfaceProps = {
  children: ReactNode
  density?: "base" | "roomy"
  className?: string
}

export function ShellScrollSurface({
  children,
  density = "base",
  className,
}: ShellScrollSurfaceProps) {
  return (
    <ScrollArea className="app-shell-scroll-pane">
      <div
        className={cn(
          density === "roomy"
            ? "app-shell-scroll-surface-roomy"
            : "app-shell-scroll-surface",
          className,
        )}
      >
        {children}
      </div>
    </ScrollArea>
  )
}

type ShellStatusBadgeVariant =
  | "default"
  | "secondary"
  | "outline"
  | "destructive"
  | "ghost"

function getSessionStatusBadgeVariant(status: SessionStatus): ShellStatusBadgeVariant {
  if (status === "error") {
    return "destructive"
  }

  if (status === "draft") {
    return "secondary"
  }

  return "outline"
}

function getSessionStatusLabel(status: SessionStatus): string {
  if (status === "dirty") {
    return "stale"
  }

  if (status === "building") {
    return "build"
  }

  if (status === "error") {
    return "issue"
  }

  return status
}

function getValidationStatusBadgeVariant(
  status: SourceValidationSnapshot["status"],
): ShellStatusBadgeVariant {
  return status === "valid" ? "outline" : "destructive"
}

function getValidationStatusLabel(status: SourceValidationSnapshot["status"]): string {
  return status === "valid" ? "ready" : "issue"
}

function getBuildStatusBadgeVariant(
  status: BuildRunSummary["status"],
): ShellStatusBadgeVariant {
  return status === "succeeded" ? "outline" : "outline"
}

function getBuildStatusLabel(status: BuildRunSummary["status"]): string {
  if (status === "running") {
    return "build"
  }

  if (status === "failed") {
    return "issue"
  }

  if (status === "succeeded") {
    return "ready"
  }

  return "idle"
}

function getRuntimeStatusBadgeVariant(
  status: RuntimeReport["status"],
): ShellStatusBadgeVariant {
  return status === "ok" ? "outline" : "destructive"
}

function getRuntimeStatusLabel(status: RuntimeReport["status"]): string {
  return status === "ok" ? "ready" : "issue"
}

function getDiagnosticStatusBadgeVariant(
  severity: DiagnosticSeverity,
): ShellStatusBadgeVariant {
  if (severity === "error") {
    return "destructive"
  }

  if (severity === "warning") {
    return "outline"
  }

  return "secondary"
}

function getDiagnosticStatusLabel(severity: DiagnosticSeverity): string {
  if (severity === "warning") {
    return "warn"
  }

  return severity
}

type ShellStatusBadgeProps = {
  label: ReactNode
  variant: ShellStatusBadgeVariant
}

export function ShellStatusBadge({ label, variant }: ShellStatusBadgeProps) {
  return <Badge variant={variant}>{label}</Badge>
}

type ShellSessionStatusBadgeProps = {
  status: SessionStatus
}

export function ShellSessionStatusBadge({ status }: ShellSessionStatusBadgeProps) {
  return <ShellStatusBadge label={getSessionStatusLabel(status)} variant={getSessionStatusBadgeVariant(status)} />
}

type ShellValidationStatusBadgeProps = {
  status: SourceValidationSnapshot["status"]
}

export function ShellValidationStatusBadge({
  status,
}: ShellValidationStatusBadgeProps) {
  return <ShellStatusBadge label={getValidationStatusLabel(status)} variant={getValidationStatusBadgeVariant(status)} />
}

type ShellBuildStatusBadgeProps = {
  status: BuildRunSummary["status"]
}

export function ShellBuildStatusBadge({ status }: ShellBuildStatusBadgeProps) {
  return <ShellStatusBadge label={getBuildStatusLabel(status)} variant={getBuildStatusBadgeVariant(status)} />
}

type ShellRuntimeStatusBadgeProps = {
  status: RuntimeReport["status"]
}

export function ShellRuntimeStatusBadge({ status }: ShellRuntimeStatusBadgeProps) {
  return <ShellStatusBadge label={getRuntimeStatusLabel(status)} variant={getRuntimeStatusBadgeVariant(status)} />
}

type ShellDiagnosticStatusBadgeProps = {
  severity: DiagnosticSeverity
}

export function ShellDiagnosticStatusBadge({
  severity,
}: ShellDiagnosticStatusBadgeProps) {
  return <ShellStatusBadge label={getDiagnosticStatusLabel(severity)} variant={getDiagnosticStatusBadgeVariant(severity)} />
}
