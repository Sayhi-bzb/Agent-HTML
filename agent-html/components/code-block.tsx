import * as React from "react"
import { CheckIcon, CopyIcon } from "lucide-react"

import { cn } from "../lib/cn"
import { highlightCode, type CodeBlockLanguage } from "../lib/shiki-highlighter"
import { Button } from "./ui/button"
import { Tabs, TabsList, TabsTrigger } from "./ui/tabs"

type CodeBlockTab = {
  caption?: string
  code: string
  language?: CodeBlockLanguage
  title: string
  value: string
}

type CodeBlockBaseProps = {
  className?: string
  showLineNumbers?: boolean
  wrap?: boolean
}

type CodeBlockSingleProps = CodeBlockBaseProps & {
  caption?: string
  code: string
  language?: CodeBlockLanguage
  tabs?: never
  title?: string
}

type CodeBlockTabbedProps = CodeBlockBaseProps & {
  caption?: never
  code?: never
  language?: never
  tabs: readonly [CodeBlockTab, ...CodeBlockTab[]]
  title?: never
}

type CodeBlockProps = CodeBlockSingleProps | CodeBlockTabbedProps

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

function resolveCodeBlockState({
  activeTabValue,
  props,
}: {
  activeTabValue: string
  props: CodeBlockProps
}) {
  if (props.tabs !== undefined) {
    const activeTab =
      props.tabs.find((tab) => tab.value === activeTabValue) ?? props.tabs[0]

    return {
      activeTab,
      caption: activeTab.caption,
      code: activeTab.code,
      label: activeTab.title,
      language: activeTab.language ?? "text",
    }
  }

  const language = props.language ?? "text"

  return {
    activeTab: undefined,
    caption: props.caption,
    code: props.code,
    label: props.title ?? language,
    language,
  }
}

function CodeBlock({
  className,
  showLineNumbers = false,
  wrap = false,
  ...props
}: CodeBlockProps) {
  const tabs = "tabs" in props ? props.tabs : undefined
  const [activeTabValue, setActiveTabValue] = React.useState(
    tabs?.[0].value ?? ""
  )
  const [highlightedHtml, setHighlightedHtml] = React.useState<string | null>(
    null
  )
  const [copied, setCopied] = React.useState(false)
  const copyTimeoutRef = React.useRef<number | null>(null)
  const resolved = resolveCodeBlockState({ activeTabValue, props })
  const CopyStateIcon = copied ? CheckIcon : CopyIcon
  const isDiff = isDiffLanguage(resolved.language)

  React.useEffect(() => {
    if (!tabs?.length) {
      return
    }

    if (!tabs.some((tab) => tab.value === activeTabValue)) {
      setActiveTabValue(tabs[0].value)
    }
  }, [activeTabValue, tabs])

  React.useEffect(() => {
    let isCurrent = true

    setHighlightedHtml(null)

    if (isDiff) {
      return () => {
        isCurrent = false
      }
    }

    void highlightCode({ code: resolved.code, language: resolved.language })
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
  }, [isDiff, resolved.code, resolved.language])

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
      .writeText(resolved.code)
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
        {tabs?.length ? (
          <Tabs
            className="min-w-0"
            onValueChange={(value) => {
              setActiveTabValue(value)
              setCopied(false)
            }}
            value={resolved.activeTab?.value}
          >
            <TabsList className="flex-wrap" variant="line">
              {tabs.map((tab) => (
                <TabsTrigger
                  key={tab.value}
                  onClick={() => {
                    setActiveTabValue(tab.value)
                    setCopied(false)
                  }}
                  value={tab.value}
                >
                  {tab.value}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        ) : (
          <span className="truncate text-sm text-muted-foreground">
            {resolved.label}
          </span>
        )}
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
              code={resolved.code}
              isDiff={isDiff}
              showLineNumbers={showLineNumbers}
              wrap={wrap}
            />
          </pre>
        )}
      </div>

      {resolved.caption ? (
        <figcaption className="border-t px-3 py-2 text-sm text-muted-foreground">
          {resolved.caption}
        </figcaption>
      ) : null}
    </figure>
  )
}

export { CodeBlock }
export type { CodeBlockProps, CodeBlockTab }
