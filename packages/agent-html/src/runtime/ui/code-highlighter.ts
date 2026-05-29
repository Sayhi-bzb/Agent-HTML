import { createHighlighterCore, type ShikiTransformer } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"

import bash from "shiki/langs/bash.mjs"
import html from "shiki/langs/html.mjs"
import javascript from "shiki/langs/javascript.mjs"
import json from "shiki/langs/json.mjs"
import jsx from "shiki/langs/jsx.mjs"
import tsx from "shiki/langs/tsx.mjs"
import typescript from "shiki/langs/typescript.mjs"
import xml from "shiki/langs/xml.mjs"
import oneDarkPro from "shiki/themes/one-dark-pro.mjs"
import oneLight from "shiki/themes/one-light.mjs"

type HighlightLanguage =
  | "bash"
  | "html"
  | "javascript"
  | "json"
  | "jsx"
  | "tsx"
  | "typescript"
  | "xml"

export type HighlightedCode = {
  darkHtml: string
  html: string
}

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
        "data-selection": "none",
      },
      children: [{ type: "text", value: String(line) }],
    })
  },
}

const languageAliases: Record<string, HighlightLanguage> = {
  ahtml: "xml",
  bash: "bash",
  html: "html",
  js: "javascript",
  json: "json",
  jsx: "jsx",
  react: "tsx",
  ts: "typescript",
  tsx: "tsx",
}

const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [bash, html, javascript, json, jsx, tsx, typescript, xml],
  themes: [oneLight, oneDarkPro],
})

export function canHighlightCode(language: string) {
  return language in languageAliases
}

export async function highlightCode(
  code: string,
  language: string
): Promise<HighlightedCode | null> {
  const syntaxLanguage = languageAliases[language]

  if (!syntaxLanguage) {
    return null
  }

  const highlighterInstance = await highlighter
  const transformers: ShikiTransformer[] = [lineNumberTransformer]

  return {
    html: highlighterInstance.codeToHtml(code, {
      lang: syntaxLanguage,
      theme: "one-light",
      transformers,
    }),
    darkHtml: highlighterInstance.codeToHtml(code, {
      lang: syntaxLanguage,
      theme: "one-dark-pro",
      transformers,
    }),
  }
}
