import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism"

export function CodeBlock({
  language,
  source,
}: {
  language: "ahtml" | "html" | "react"
  source: string
}) {
  const syntaxLanguage = language === "react" ? "tsx" : "markup"

  return (
    <SyntaxHighlighter
      customStyle={{
        background: "transparent",
        display: "block",
        margin: 0,
        minWidth: "max-content",
        padding: "1rem 1.25rem",
      }}
      language={syntaxLanguage}
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
      {source}
    </SyntaxHighlighter>
  )
}
