import type { ReactNode } from "react"

import { ShellEmptyCanvas } from "@/features/app-shell/components/shell-content"

type PreviewFrameProps = {
  html?: string
  title: string
  empty?: ReactNode
}

export function PreviewFrame({
  html,
  title,
  empty = "Blank",
}: PreviewFrameProps) {
  return (
    <div className="app-shell-preview-frame">
      {html ? (
        <iframe className="app-shell-preview-canvas" srcDoc={html} title={title} />
      ) : (
        <ShellEmptyCanvas>{empty}</ShellEmptyCanvas>
      )}
    </div>
  )
}
