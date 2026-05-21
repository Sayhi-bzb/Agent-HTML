import type { ReactNode } from "react"

type WorkbenchCardProps = {
  header: ReactNode
  children: ReactNode
}

export function WorkbenchCard({ header, children }: WorkbenchCardProps) {
  return (
    <section className="app-shell-workbench-surface">
      {header}
      <div className="app-shell-workbench-body">{children}</div>
    </section>
  )
}
