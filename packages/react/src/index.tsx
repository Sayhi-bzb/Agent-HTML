import type { HTMLAttributes, ReactNode } from "react"

export const agentHtmlActionEventName = "agent-html:action"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export type ArtifactProps = {
  children?: ReactNode
  title: string
}

export type BlockProps = {
  children?: ReactNode
  id: string
  title?: string
}

export type ActionIntent = {
  prompt: string
  target: string
}

export type ActionProps = ActionIntent &
  Omit<HTMLAttributes<HTMLSpanElement>, "children"> & {
  children?: ReactNode
  disabled?: boolean
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

export function Action({
  children,
  className,
  disabled = false,
  prompt,
  target,
  ...props
}: ActionProps) {
  function handleClick() {
    if (disabled || typeof window === "undefined") {
      return
    }

    window.dispatchEvent(
      new CustomEvent<ActionIntent>(agentHtmlActionEventName, {
        detail: { prompt, target },
      })
    )
  }

  return (
    <span
      data-agent-html-action="true"
      data-agent-html-action-target={target}
      aria-disabled={disabled}
      className={cn(className)}
      onClick={handleClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault()
          handleClick()
        }
      }}
      role="button"
      tabIndex={disabled ? -1 : 0}
      {...props}
    >
      {children ?? "Run action"}
    </span>
  )
}
