import * as React from "react"

import { cn } from "@/agent-html/lib/utils"

export const BlockSummaryCode = React.memo(function BlockSummaryCode({
  className,
  summary,
}: {
  className?: string
  summary: string
}) {
  const [html, setHtml] = React.useState("")
  const [darkHtml, setDarkHtml] = React.useState("")

  React.useEffect(() => {
    let mounted = true

    setHtml("")
    setDarkHtml("")
    import("@/agent-html/runtime/ui/code-highlighter")
      .then(({ highlightCodeToHtml }) => highlightCodeToHtml(summary, "xml"))
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
  }, [summary])

  const codeClassName = cn(
    "overflow-hidden whitespace-pre-wrap font-mono text-[11px] leading-4 text-[var(--card-foreground)]",
    className
  )

  const highlightedCodeClassName = cn(
    codeClassName,
    "[&>pre]:m-0 [&>pre]:overflow-hidden [&>pre]:whitespace-pre-wrap [&>pre]:bg-transparent! [&>pre]:font-mono [&>pre]:text-[11px] [&>pre]:leading-4"
  )

  if (!html || !darkHtml) {
    return <pre className={codeClassName}>{summary}</pre>
  }

  return (
    <>
      <div
        className={cn(highlightedCodeClassName, "dark:hidden")}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      <div
        className={cn(highlightedCodeClassName, "hidden dark:block")}
        dangerouslySetInnerHTML={{ __html: darkHtml }}
      />
    </>
  )
})
