import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { Button } from "./ui/button"

type CodeBlockProps = {
  caption?: string
  className?: string
  code: string
  language?: string
  showLineNumbers?: boolean
  title?: string
  wrap?: boolean
}

function CodeLines({
  code,
  showLineNumbers,
  wrap,
}: {
  code: string
  showLineNumbers: boolean
  wrap: boolean
}) {
  const lines = code.split("\n")

  if (!showLineNumbers) {
    return <code>{code}</code>
  }

  return (
    <code className="grid">
      {lines.map((line, index) => (
        <span className="grid grid-cols-[auto_1fr] gap-4" key={index}>
          <span className="select-none text-right text-muted-foreground">
            {index + 1}
          </span>
          <span className={cn("min-w-0", wrap && "whitespace-pre-wrap")}>
            {line || " "}
          </span>
        </span>
      ))}
    </code>
  )
}

function CodeBlock({
  caption,
  className,
  code,
  language = "text",
  showLineNumbers = false,
  title,
  wrap = false,
}: CodeBlockProps) {
  const [copied, setCopied] = React.useState(false)
  const copyTimeoutRef = React.useRef<number | null>(null)
  const label = title || language
  const CopyStateIcon = copied ? CheckIcon : CopyIcon

  React.useEffect(() => {
    return () => {
      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }
    }
  }, [])

  function handleCopy() {
    if (!navigator.clipboard?.writeText) {
      return
    }

    void navigator.clipboard.writeText(code).then(() => {
      setCopied(true)

      if (copyTimeoutRef.current !== null) {
        window.clearTimeout(copyTimeoutRef.current)
      }

      copyTimeoutRef.current = window.setTimeout(() => {
        setCopied(false)
        copyTimeoutRef.current = null
      }, 1600)
    })
  }

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-md border bg-background text-foreground",
        className
      )}
      data-slot="code-block"
    >
      <div className="flex items-center justify-between gap-3 border-b bg-muted/30 px-3 py-2">
        <span className="truncate text-sm text-muted-foreground">{label}</span>
        <Button
          aria-label={copied ? "Code copied" : "Copy code"}
          onClick={handleCopy}
          size="icon-sm"
          type="button"
          variant="ghost"
        >
          <CopyStateIcon />
        </Button>
      </div>

      <div className="overflow-x-auto">
        <pre
          className={cn(
            "m-0 p-4 text-sm",
            wrap ? "whitespace-pre-wrap break-words" : "min-w-max whitespace-pre"
          )}
        >
          <CodeLines
            code={code}
            showLineNumbers={showLineNumbers}
            wrap={wrap}
          />
        </pre>
      </div>

      {caption ? (
        <figcaption className="border-t px-3 py-2 text-sm text-muted-foreground">
          {caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export { CodeBlock }
export type { CodeBlockProps }
