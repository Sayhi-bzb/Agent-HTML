import type { ButtonHTMLAttributes, ReactNode } from "react"

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  intent?: "primary" | "quiet" | "destructive"
}

export function Button({
  className = "",
  intent = "quiet",
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={`desktop-button desktop-button--${intent} ${className}`}
      type={type}
      {...props}
    />
  )
}

export function Status({
  children,
  kind = "neutral",
}: {
  children: ReactNode
  kind?: "neutral" | "error" | "success"
}) {
  return (
    <span className={`desktop-status desktop-status--${kind}`} role="status">
      <span aria-hidden="true" className="desktop-status__mark" />
      {children}
    </span>
  )
}
