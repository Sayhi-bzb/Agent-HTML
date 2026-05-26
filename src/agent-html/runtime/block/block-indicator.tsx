import { cn } from "@/agent-html/lib/utils"
import { useAgentHtmlBlockRuntime } from "@/agent-html/runtime/block/block-runtime-provider"

export function AgentHtmlBlockIndicator() {
  const runtime = useAgentHtmlBlockRuntime()
  const { indicator } = runtime

  if (!indicator) {
    return null
  }

  const target = runtime.getBlockElement(indicator.targetPath)
  const overlayElement = runtime.getOverlayElement()

  if (!target || !overlayElement) {
    return null
  }

  const rect = target.getBoundingClientRect()
  const overlayRect = overlayElement.getBoundingClientRect()
  const isColumn = indicator.type.startsWith("column")
  const localLeft = rect.left - overlayRect.left
  const localRight = rect.right - overlayRect.left
  const localTop = rect.top - overlayRect.top
  const localBottom = rect.bottom - overlayRect.top
  const style = isColumn
    ? {
        height: rect.height,
        left:
          indicator.type === "column-before"
            ? localLeft
            : localRight,
        top: localTop,
      }
    : {
        left: localLeft,
        top:
          indicator.type === "before"
            ? localTop
            : localBottom,
        width: rect.width,
      }

  return (
    <div
      className={cn(
        "pointer-events-none absolute z-30 rounded-full bg-[color-mix(in_oklab,var(--primary)_28%,transparent)] shadow-[0_0_0_3px_color-mix(in_oklab,var(--primary)_28%,transparent)]",
        isColumn ? "w-0.5 -translate-x-1/2" : "h-0.5 -translate-y-1/2"
      )}
      data-agent-html-block-indicator={indicator.type}
      data-agent-html-block-indicator-target={indicator.targetPath}
      style={style}
    />
  )
}
