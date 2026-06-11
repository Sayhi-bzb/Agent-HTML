export type SourceLinkItem = {
  label: string
  note?: string
  url: string
}

export function SourceLinks({
  density = "comfortable",
  links,
}: {
  density?: "compact" | "comfortable"
  links: SourceLinkItem[]
}) {
  const isCompact = density === "compact"

  return (
    <div
      className={
        isCompact ? "canvas-wrap-sm text-muted-foreground" : "canvas-stack-sm"
      }
    >
      {links.map((link) => (
        <a
          className={
            isCompact
              ? "canvas-wrap-sm items-center underline underline-offset-4"
              : "canvas-stack-xs text-muted-foreground underline underline-offset-4"
          }
          href={link.url}
          key={link.url}
          rel="noreferrer"
          target="_blank"
        >
          <span
            className={isCompact ? "canvas-text-caption" : "canvas-text-body"}
          >
            {link.label}
          </span>
          {link.note ? (
            <span className="canvas-text-caption">{link.note}</span>
          ) : null}
        </a>
      ))}
    </div>
  )
}
