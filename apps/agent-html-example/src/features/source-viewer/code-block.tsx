import { CheckIcon, CopyIcon } from "lucide-react"
import * as React from "react"

import type { SourceTabValue } from "@example/features/source-viewer/types"
import { Button } from "@example/ui/button"

export const CodeBlock = React.memo(function CodeBlock({
  language,
  source,
}: {
  language: SourceTabValue
  source: string
}) {
  const syntaxLanguage =
    language === "react" ? "tsx" : language === "html" ? "html" : "xml"
  const [html, setHtml] = React.useState("")
  const [darkHtml, setDarkHtml] = React.useState("")
  const [isCopied, setIsCopied] = React.useState(false)

  React.useEffect(() => {
    let mounted = true

    import("@/agent-html/code-highlight")
      .then(({ highlightCodeToHtml }) =>
        highlightCodeToHtml(source, syntaxLanguage)
      )
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
        className="overflow-auto dark:hidden [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm"
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        className="hidden overflow-auto dark:block [&>pre]:m-0 [&>pre]:bg-background! [&>pre]:p-4 [&>pre]:text-foreground! [&>pre]:text-sm [&_code]:font-mono [&_code]:text-sm"
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
