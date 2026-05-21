import type { ReactNode } from "react"

type MessageBodyProps = {
  children: ReactNode
}

export function MessageBody({ children }: MessageBodyProps) {
  return <p className="app-shell-body-copy">{children}</p>
}
