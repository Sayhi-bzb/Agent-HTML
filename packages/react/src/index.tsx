import type { HTMLAttributes, ReactNode } from "react"

export const agentHtmlActionEventName = "agent-html:action"

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export type ArtifactProps = Omit<
  HTMLAttributes<HTMLElement>,
  "title"
> & {
  title: string
}

export type BlockProps = Omit<HTMLAttributes<HTMLElement>, "id"> & {
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

export function Artifact({ children, className, title, ...props }: ArtifactProps) {
  return (
    <main
      data-agent-html-artifact="true"
      data-agent-html-title={title}
      className={cn(
        "mx-auto flex w-full max-w-6xl flex-col gap-4 bg-background text-foreground",
        className
      )}
      {...props}
    >
      {children}
    </main>
  )
}

export function Block({ children, className, id, title, ...props }: BlockProps) {
  return (
    <section
      data-agent-html-block="true"
      data-agent-html-block-id={id}
      data-agent-html-block-title={title ?? id}
      className={cn("min-w-0 scroll-mt-4", className)}
      {...props}
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
