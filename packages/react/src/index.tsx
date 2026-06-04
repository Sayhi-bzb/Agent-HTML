import type { ReactNode } from "react"


export type ArtifactProps = {
  children?: ReactNode
  title: string
}

export type BlockProps = {
  children?: ReactNode
  id: string
  title?: string
}

export function Artifact({ children, title }: ArtifactProps) {
  return (
    <main
      data-agent-html-artifact="true"
      data-agent-html-title={title}
      className="agent-html-artifact"
    >
      {children}
    </main>
  )
}

export function Block({ children, id, title }: BlockProps) {
  return (
    <section
      data-agent-html-block="true"
      data-agent-html-block-id={id}
      data-agent-html-block-title={title ?? id}
    >
      {children}
    </section>
  )
}
