import { createHighlighterCore, type ShikiTransformer } from "shiki/core"
import { createJavaScriptRegexEngine } from "shiki/engine/javascript"
import type { LanguageInput, ThemeInput } from "shiki/types"

type HighlightLanguage =
  | "bash"
  | "html"
  | "javascript"
  | "json"
  | "jsx"
  | "tsx"
  | "typescript"
  | "xml"

type HighlightTheme = "one-light" | "one-dark-pro"

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

const languageLoaders: Record<HighlightLanguage, () => Promise<LanguageInput>> = {
  bash: () => import("shiki/langs/bash.mjs"),
  html: () => import("shiki/langs/html.mjs"),
  javascript: () => import("shiki/langs/javascript.mjs"),
  json: () => import("shiki/langs/json.mjs"),
  jsx: () => import("shiki/langs/jsx.mjs"),
  tsx: () => import("shiki/langs/tsx.mjs"),
  typescript: () => import("shiki/langs/typescript.mjs"),
  xml: () => import("shiki/langs/xml.mjs"),
}

const themeLoaders: Record<HighlightTheme, () => Promise<ThemeInput>> = {
  "one-dark-pro": () => import("shiki/themes/one-dark-pro.mjs"),
  "one-light": () => import("shiki/themes/one-light.mjs"),
}

const highlighter = createHighlighterCore({
  engine: createJavaScriptRegexEngine(),
  langs: [],
  themes: [],
})

const loadedLanguages = new Set<HighlightLanguage>()
const loadedThemes = new Set<HighlightTheme>()

async function loadDefaultThemes() {
  const highlighterInstance = await highlighter
  const themes = await Promise.all(
    (["one-light", "one-dark-pro"] as const)
      .filter((theme) => !loadedThemes.has(theme))
      .map(async (theme) => {
        const themeModule = await themeLoaders[theme]()
        loadedThemes.add(theme)
        return themeModule
      })
  )

  if (themes.length > 0) {
    await highlighterInstance.loadTheme(...themes)
  }

  return highlighterInstance
}

async function loadLanguage(language: HighlightLanguage) {
  const highlighterInstance = await loadDefaultThemes()

  if (!loadedLanguages.has(language)) {
    const languageModule = await languageLoaders[language]()
    await highlighterInstance.loadLanguage(languageModule)
    loadedLanguages.add(language)
  }

  return highlighterInstance
}

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

  const highlighterInstance = await loadLanguage(syntaxLanguage)
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
