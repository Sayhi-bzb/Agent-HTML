function isColorPreviewable(value: string) {
  const trimmed = value.trim()
  return (
    trimmed.startsWith("#") ||
    trimmed.startsWith("rgb") ||
    trimmed.startsWith("hsl") ||
    trimmed.startsWith("oklch") ||
    trimmed.startsWith("color-mix") ||
    trimmed.startsWith("var(")
  )
}

export function HostSwatch({
  color,
  size = "xs",
}: {
  color: string
  size?: "sm" | "xs"
}) {
  return (
    <span
      aria-hidden="true"
      className="canvas-host-swatch"
      data-size={size}
      style={{ backgroundColor: isColorPreviewable(color) ? color : "" }}
    />
  )
}
