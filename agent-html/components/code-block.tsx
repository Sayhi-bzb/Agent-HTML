import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { highlightCode, type CodeBlockLanguage } from "../lib/shiki-highlighter"
import { Button } from "./ui/button"

type CodeBlockProps = {
  caption?: string
  className?: string
  code: string
  language?: CodeBlockLanguage
  showLineNumbers?: boolean
  title?: string
  wrap?: boolean
}

function getDiffLineClass(line: string) {
  if (line.startsWith("+++") || line.startsWith("---")) {
    return "line diff"
  }

  if (line.startsWith("+")) {
    return "line diff add"
  }

  if (line.startsWith("-")) {
    return "line diff remove"
  }

  return "line"
}

function isDiffLanguage(language: CodeBlockLanguage) {
  return language === "diff" || language === "patch"
}

function CodeLines({
  code,
  isDiff,
  showLineNumbers,
  wrap,
}: {
  code: string
  isDiff: boolean
  showLineNumbers: boolean
  wrap: boolean
}) {
  const lines = code.split("\n")

  if (!showLineNumbers && !isDiff) {
    return <code>{code}</code>
  }

  return (
    <code className="grid">
      {lines.map((line, index) =>
        showLineNumbers ? (
          <span
            className={cn(
              "grid grid-cols-[1.5rem_1fr] gap-2",
              isDiff && getDiffLineClass(line)
            )}
            key={index}
          >
            <span className="select-none text-right text-muted-foreground">
              {index + 1}
            </span>
            <span className={cn("min-w-0", wrap && "whitespace-pre-wrap")}>
              {line || " "}
            </span>
          </span>
        ) : (
          <span className={getDiffLineClass(line)} key={index}>
            {line || " "}
          </span>
        )
      )}
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
  const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(
    null
  )
  const [copied, setCopied] = React.useState(false)
  const copyTimeoutRef = React.useRef<number | null>(null)
  const label = title || language
  const CopyStateIcon = copied ? CheckIcon : CopyIcon
  const isDiff = isDiffLanguage(language)

  React.useEffect(() => {
    let isCurrent = true

    setHighlightedHtml(null)

    void highlightCode({ code, language })
      .then((html) => {
        if (isCurrent) {
          setHighlightedHtml(html)
        }
      })
      .catch(() => {
        if (isCurrent) {
          setHighlightedHtml(null)
        }
      })

    return () => {
      isCurrent = false
    }
  }, [code, language])

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

    void navigator.clipboard
      .writeText(code)
      .then(() => {
        setCopied(true)

        if (copyTimeoutRef.current !== null) {
          window.clearTimeout(copyTimeoutRef.current)
        }

        copyTimeoutRef.current = window.setTimeout(() => {
          setCopied(false)
          copyTimeoutRef.current = null
        }, 1600)
      })
      .catch(() => {})
  }

  return (
    <figure
      className={cn(
        "canvas-code-block overflow-hidden rounded-md border bg-background text-foreground",
        className
      )}
      data-line-numbers={showLineNumbers ? "true" : undefined}
      data-slot="code-block"
      data-wrap={wrap ? "true" : undefined}
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

      <div className="canvas-code-block-scroll overflow-x-auto">
        {highlightedHtml ? (
          <div
            className="canvas-code-block-highlight"
            dangerouslySetInnerHTML={{ __html: highlightedHtml }}
          />
        ) : (
          <pre
            className={cn(
              "m-0 p-4 text-sm",
              wrap
                ? "whitespace-pre-wrap break-words"
                : "min-w-max whitespace-pre",
              isDiff && "has-diff"
            )}
          >
            <CodeLines
              code={code}
              isDiff={isDiff}
              showLineNumbers={showLineNumbers}
              wrap={wrap}
            />
          </pre>
        )}
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
