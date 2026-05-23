import * as React from "react"

import { cn } from "@/lib/utils"

type TokenKind =
  | "plain"
  | "tag"
  | "attr"
  | "string"
  | "punctuation"
  | "keyword"
  | "identifier"
  | "import"

type HighlightToken = {
  kind: TokenKind
  value: string
}

function tokenizeXml(source: string) {
  const pattern =
    /<\/?[A-Za-z][A-Za-z0-9-]*|[A-Za-z][A-Za-z0-9-]*(?==)|"[^"]*"|\/?>|=|[^<>=\s"]+|\s+/g
  const parts = source.match(pattern) ?? []

  return parts.map<HighlightToken>((part) => {
    if (/^\s+$/.test(part)) {
      return { kind: "plain", value: part }
    }
    if (/^(=|\/?>)$/.test(part)) {
      return { kind: "punctuation", value: part }
    }
    if (/^<\/?[A-Za-z][A-Za-z0-9-]*$/.test(part)) {
      return { kind: "tag", value: part }
    }
    if (/^"[^"]*"$/.test(part)) {
      return { kind: "string", value: part }
    }
    if (/^[A-Za-z][A-Za-z0-9-]*$/.test(part)) {
      return { kind: "attr", value: part }
    }
    return { kind: "plain", value: part }
  })
}

function tokenizeTsx(source: string) {
  const pattern =
    /\b(import|from|export|function|return|const)\b|<\/?[A-Za-z_][A-Za-z0-9_.-]*|[A-Za-z_][A-Za-z0-9_.-]*(?==)|"[^"]*"|'[^']*'|\/?>|=|[{}()[\].,:;]|[^<>=\s"'{}()[\].,:;]+|\s+/g
  const parts = source.match(pattern) ?? []

  return parts.map<HighlightToken>((part) => {
    if (/^\s+$/.test(part)) {
      return { kind: "plain", value: part }
    }
    if (/^(import|from|export)$/.test(part)) {
      return { kind: "import", value: part }
    }
    if (/^(function|return|const)$/.test(part)) {
      return { kind: "keyword", value: part }
    }
    if (/^<\/?[A-Za-z_][A-Za-z0-9_.-]*$/.test(part)) {
      return { kind: "tag", value: part }
    }
    if (/^[A-Za-z_][A-Za-z0-9_.-]*$/.test(part)) {
      return { kind: "identifier", value: part }
    }
    if (/^"[^"]*"|'[^']*'$/.test(part)) {
      return { kind: "string", value: part }
    }
    if (/^(=|\/?>|[{}()[\].,:;])$/.test(part)) {
      return { kind: "punctuation", value: part }
    }
    return { kind: "plain", value: part }
  })
}

const tokenClassName: Record<TokenKind, string> = {
  plain: "text-muted-foreground",
  tag: "text-foreground",
  attr: "text-primary",
  string: "text-secondary-foreground",
  punctuation: "text-muted-foreground/80",
  keyword: "text-primary",
  identifier: "text-foreground",
  import: "text-destructive",
}

export function CodeBlock({
  className,
  language,
  source,
}: {
  className?: string
  language: "ahtml" | "html" | "react"
  source: string
}) {
  const tokens = React.useMemo(
    () => (language === "react" ? tokenizeTsx(source) : tokenizeXml(source)),
    [language, source]
  )

  return (
    <pre
      className={cn(
        "inline-block min-w-max px-5 py-4 text-[length:var(--type-xs)] leading-[calc(var(--type-base-line-height)*0.9)]",
        className
      )}
    >
      <code>
        {tokens.map((token, index) => (
          <span
            key={`${language}:${index}:${token.kind}`}
            className={tokenClassName[token.kind]}
          >
            {token.value}
          </span>
        ))}
      </code>
    </pre>
  )
}
