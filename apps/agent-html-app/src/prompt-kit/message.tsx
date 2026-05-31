import type * as React from "react"

import { Markdown } from "@/app/prompt-kit/markdown"
import { cn } from "@/app/shared/lib/utils"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/app/shared/ui/avatar"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/app/shared/ui/tooltip"

export type MessageProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const Message = ({ children, className, ...props }: MessageProps) => (
  <div className={cn("flex gap-3", className)} {...props}>
    {children}
  </div>
)

export type MessageAvatarProps = {
  src: string
  alt: string
  fallback?: string
  delayMs?: number
  className?: string
}

const MessageAvatar = ({
  src,
  alt,
  fallback,
  delayMs,
  className,
}: MessageAvatarProps) => {
  return (
    <Avatar className={cn("h-8 w-8 shrink-0", className)}>
      <AvatarImage src={src} alt={alt} />
      {fallback && (
        <AvatarFallback delayMs={delayMs}>{fallback}</AvatarFallback>
      )}
    </Avatar>
  )
}

type BaseMessageContentProps = {
  className?: string
} & Omit<React.HTMLProps<HTMLDivElement>, "children">

export type MessageContentProps =
  | ({
      children: string
      markdown: true
    } & BaseMessageContentProps)
  | ({
      children: React.ReactNode
      markdown?: false
    } & BaseMessageContentProps)

const MessageContent = (props: MessageContentProps) => {
  const { className } = props
  const classNames = cn(
    "rounded-lg p-2 text-foreground bg-secondary prose break-words whitespace-normal",
    className
  )

  if (props.markdown) {
    return <Markdown className={classNames} children={props.children} />
  }

  const { children, markdown: _markdown, ...divProps } = props

  return (
    <div className={classNames} {...divProps}>
      {children}
    </div>
  )
}

export type MessageActionsProps = {
  children: React.ReactNode
  className?: string
} & React.HTMLProps<HTMLDivElement>

const MessageActions = ({
  children,
  className,
  ...props
}: MessageActionsProps) => (
  <div
    className={cn("text-muted-foreground flex items-center gap-2", className)}
    {...props}
  >
    {children}
  </div>
)

export type MessageActionProps = {
  className?: string
  tooltip: React.ReactNode
  children: React.ReactNode
  side?: "top" | "bottom" | "left" | "right"
} & React.ComponentProps<typeof Tooltip>

const MessageAction = ({
  tooltip,
  children,
  className,
  side = "top",
  ...props
}: MessageActionProps) => {
  return (
    <TooltipProvider>
      <Tooltip {...props}>
        <TooltipTrigger asChild>{children}</TooltipTrigger>
        <TooltipContent side={side} className={className}>
          {tooltip}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}

export {
  Message,
  MessageAvatar,
  MessageContent,
  MessageActions,
  MessageAction,
}
