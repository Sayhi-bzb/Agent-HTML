import type { SourceLink } from "./data"

export function SourceLinks({ links }: { links: SourceLink[] }) {
  return (
    <div className="canvas-wrap-sm text-muted-foreground">
      {links.map((link) => (
        <a
          className="canvas-wrap-sm items-center underline underline-offset-4"
          href={link.url}
          key={link.url}
          rel="noreferrer"
          target="_blank"
        >
          <span className="canvas-text-caption">{link.label}</span>
        </a>
      ))}
    </div>
  )
}
