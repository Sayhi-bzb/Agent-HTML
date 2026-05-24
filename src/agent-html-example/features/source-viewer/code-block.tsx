import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"
import { type BundledLanguage, codeToHtml, type ShikiTransformer } from "shiki"

import type { SourceTabValue } from "@/agent-html-example/features/source-viewer/types"
import { cn } from "@/agent-html-example/lib/utils"
import { Button } from "@/agent-html-example/ui/button"

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

async function highlightCode(code: string, language: BundledLanguage) {
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

export const CodeBlock = React.memo(function CodeBlock({
  language,
  source,
}: {
  language: SourceTabValue
  source: string
}) {
  const syntaxLanguage: BundledLanguage =
    language === "react" ? "tsx" : language === "html" ? "html" : "xml"
  const [html, setHtml] = React.useState("")
  const [darkHtml, setDarkHtml] = React.useState("")
  const [isCopied, setIsCopied] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    highlightCode(source, syntaxLanguage).then(([light, dark]) => {
      if (!mounted) {
        return
      }

      setHtml(light)
      setDarkHtml(dark)
    })

    return () => {
      mounted = false
    }
  }, [source, syntaxLanguage])

  const copyToClipboard = React.useCallback(async () => {
    if (typeof window === "undefined" || !navigator?.clipboard?.writeText) {
      return
    }

    await navigator.clipboard.writeText(source)
    setIsCopied(true)
    window.setTimeout(() => setIsCopied(false), 2000)
  }, [source])

  const CopyStateIcon = isCopied ? CheckIcon : CopyIcon

  return (
    <div className="group relative min-w-max overflow-hidden bg-background text-foreground">
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
      <Button
        aria-label="Copy source"
        className="absolute top-2 right-2 opacity-0 transition-opacity group-hover:opacity-100 focus-visible:opacity-100"
        onClick={copyToClipboard}
        size="icon"
        variant="ghost"
      >
        <CopyStateIcon size={14} />
      </Button>
    </div>
  )
})
