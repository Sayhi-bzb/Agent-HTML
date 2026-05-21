import type { ReactNode } from "react"

type WorkbenchCardProps = {
  children: ReactNode
}

export function WorkbenchCard({ children }: WorkbenchCardProps) {
  return (
    <section className="app-shell-workbench-surface">
      <div className="app-shell-workbench-body">{children}</div>
    </section>
  )
}
