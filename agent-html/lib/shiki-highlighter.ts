import {
  createHighlighter,
  type BundledLanguage,
  type BundledTheme,
  type Highlighter,
} from "shiki/bundle/web"
import { transformerNotationDiff } from "@shikijs/transformers"

const shikiLanguages = [
  "bash",
  "css",
  "html",
  "js",
  "json",
  "jsx",
  "mdx",
  "ts",
  "tsx",
] as const satisfies readonly BundledLanguage[]

const shikiThemes = [
  "one-light",
  "one-dark-pro",
] as const satisfies readonly BundledTheme[]

const languageAliases = {
  javascript: "js",
  markdown: "mdx",
  plain: "text",
  shell: "bash",
  sh: "bash",
  typescript: "ts",
} as const

type ShikiLanguage = (typeof shikiLanguages)[number]
type ShikiTheme = (typeof shikiThemes)[number]
type CodeBlockLanguage = ShikiLanguage | "text"

let highlighterPromise: Promise<Highlighter> | null = null

function getHighlighter() {
  highlighterPromise ??= createHighlighter({
    langs: [...shikiLanguages],
    themes: [...shikiThemes],
  })

  return highlighterPromise
}

function normalizeLanguage(language: string): ShikiLanguage | null {
  const key = language.trim().toLowerCase()
  const aliased = key in languageAliases
    ? languageAliases[key as keyof typeof languageAliases]
    : key

  if (aliased === "text" || aliased === "") {
    return null
  }

  return shikiLanguages.includes(aliased as ShikiLanguage)
    ? (aliased as ShikiLanguage)
    : null
}

async function highlightCode({
  code,
  language,
}: {
  code: string
  language: string
}) {
  const normalizedLanguage = normalizeLanguage(language)

  if (!normalizedLanguage) {
    return null
  }

  const highlighter = await getHighlighter()

  return highlighter.codeToHtml(code, {
    lang: normalizedLanguage,
    themes: {
      light: "one-light",
      dark: "one-dark-pro",
    },
    transformers: [transformerNotationDiff()],
  })
}

export { highlightCode, normalizeLanguage }
export type { CodeBlockLanguage, ShikiLanguage, ShikiTheme }
