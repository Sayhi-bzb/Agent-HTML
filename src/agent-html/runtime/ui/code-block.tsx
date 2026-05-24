import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"
import type { BundledLanguage, ShikiTransformer } from "shiki"

import { cn } from "@/agent-html/lib/utils"
import { buttonVariants } from "@/agent-html/runtime/ui/button"

const lineNumberTransformer: ShikiTransformer = {
  name: "line-numbers",
  line(node, line) {
    node.children.unshift({
      type: "element",
      tagName: "span",
      properties: {
        className: [
          "inline-block",
          "min-w-10",
          "mr-4",
          "text-right",
          "select-none",
          "text-muted-foreground",
        ],
      },
      children: [{ type: "text", value: String(line) }],
    })
  },
}

function syntaxLanguageFor(language: string): BundledLanguage {
  if (language === "ahtml") return "xml"
  if (language === "react") return "tsx"
  return language as BundledLanguage
}

async function highlightCode(code: string, language: BundledLanguage) {
  const { codeToHtml } = await import("shiki")
  const transformers: ShikiTransformer[] = [lineNumberTransformer]

  return await Promise.all([
    codeToHtml(code, {
      lang: language,
      theme: "one-light",
      transformers,
    }),
    codeToHtml(code, {
      lang: language,
      theme: "one-dark-pro",
      transformers,
    }),
  ])
}

function CodeBlockFallback({ code }: { code: string }) {
  return (
    <pre className="m-0 min-w-max overflow-auto bg-background p-4 font-mono text-sm text-foreground">
      <code className="grid">
        {code.split("\n").map((line, index) => (
          <span className="line relative w-full px-0" key={index}>
            <span className="mr-4 inline-block min-w-10 select-none text-right text-muted-foreground">
              {index + 1}
            </span>
            {line}
          </span>
        ))}
      </code>
    </pre>
  )
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
  const [html, setHtml] = React.useState("")
  const [darkHtml, setDarkHtml] = React.useState("")
  const code = React.Children.toArray(children).join("")
  const label = title || language
  const syntaxLanguage = syntaxLanguageFor(language)

  React.useEffect(() => {
    let mounted = true

    setHtml("")
    setDarkHtml("")

    highlightCode(code, syntaxLanguage)
      .then(([light, dark]) => {
        if (!mounted) {
          return
        }

        setHtml(light)
        setDarkHtml(dark)
      })
      .catch(() => {
        if (!mounted) {
          return
        }

        setHtml("")
        setDarkHtml("")
      })

    return () => {
      mounted = false
    }
  }, [code, syntaxLanguage])

  const handleCopy = React.useCallback(() => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      return
    }

    navigator.clipboard.writeText(code).then(() => {
      setCopied(true)
      window.setTimeout(() => setCopied(false), 2000)
    })
  }, [code])

  const CopyStateIcon = copied ? CheckIcon : CopyIcon
  const hasHighlightedCode = html && darkHtml

  return (
    <figure
      className={cn(
        "overflow-hidden rounded-md border bg-background text-foreground",
        className
      )}
      data-slot="code-block"
    >
      <figcaption
        className="flex items-center justify-between gap-3 border-b bg-secondary p-1 pl-4"
        data-slot="code-block-header"
      >
        <span className="truncate text-muted-foreground text-xs">{label}</span>
        <button
          aria-label="Copy code"
          className={cn(
            buttonVariants({ size: "icon-sm", variant: "ghost" }),
            "shrink-0"
          )}
          data-slot="code-block-copy"
          onClick={handleCopy}
          type="button"
        >
          <CopyStateIcon className="text-muted-foreground" size={14} />
        </button>
      </figcaption>
      {hasHighlightedCode ? (
        <>
          <div
            className={cn(
              "overflow-auto dark:hidden",
              "[&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm",
              "[&_code]:font-mono [&_code]:text-sm"
            )}
            dangerouslySetInnerHTML={{ __html: html }}
          />
          <div
            className={cn(
              "hidden overflow-auto dark:block",
              "[&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm",
              "[&_code]:font-mono [&_code]:text-sm"
            )}
            dangerouslySetInnerHTML={{ __html: darkHtml }}
          />
        </>
      ) : (
        <CodeBlockFallback code={code} />
      )}
    </figure>
  )
}

export { CodeBlock }
