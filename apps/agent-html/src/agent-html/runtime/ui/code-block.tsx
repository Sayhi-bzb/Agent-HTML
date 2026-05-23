import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"

import { cn } from "@/lib/utils"

function syntaxLanguageFor(language: string) {
  if (language === "ahtml" || language === "html") return "markup"
  if (language === "jsx" || language === "tsx") return "tsx"
  return language
}

function CodeBlock({
  children,
  className,
  language,
  title,
}: {
  children?: React.ReactNode
  className?: string
  language: string
  title?: string
}) {
  const [copied, setCopied] = React.useState(false)
  const code = React.Children.toArray(children).join("")
  const label = title || language

  const handleCopy = React.useCallback(() => {
    if (!navigator.clipboard) {
      return
    }

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 1200)
    })
  }, [code])

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-xl border bg-card text-card-foreground",
        className
      )}
      data-slot="code-block"
    >
      <figcaption
        className="flex items-center justify-between gap-3 border-b bg-muted/50 px-4 py-2 text-sm"
        data-slot="code-block-header"
      >
        <span className="truncate font-medium">{label}</span>
        <button
          className="inline-flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-background hover:text-foreground"
          data-slot="code-block-copy"
          onClick={handleCopy}
          type="button"
        >
          {copied ? <CheckIcon className="size-4" /> : <CopyIcon className="size-4" />}
          <span className="sr-only">Copy code</span>
        </button>
      </figcaption>
      <SyntaxHighlighter
        customStyle={{
          background: "transparent",
          display: "block",
          margin: 0,
          minWidth: "max-content",
          padding: "1rem",
        }}
        language={syntaxLanguageFor(language)}
        lineNumberStyle={{
          color: "var(--muted-foreground)",
        }}
        lineProps={{
          style: {
            whiteSpace: "pre",
          },
        }}
        showLineNumbers
        style={oneLight}
        wrapLongLines={false}
      >
        {code}
      </SyntaxHighlighter>
    </figure>
  )
}

export { CodeBlock }
