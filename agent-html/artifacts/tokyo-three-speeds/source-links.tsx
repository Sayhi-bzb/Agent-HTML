import type { SourceLink } from "./data"

export function SourceLinks({ links }: { links: SourceLink[] }) {
  return (
    <div className="canvas-stack-sm">
      {links.map((link) => (
        <a
          className="canvas-stack-xs text-muted-foreground underline underline-offset-4"
          href={link.url}
          key={link.url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="canvas-wrap-sm items-center">
            <span className="canvas-text-body">{link.label}</span>
          </span>
          <span className="canvas-text-caption">{link.note}</span>
        </a>
      ))}
    </div>
  )
}
