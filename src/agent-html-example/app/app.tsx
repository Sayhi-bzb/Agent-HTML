import * as React from "react"

import { AgentHtmlRuntimeTheme } from "@/agent-html"
import {
  exampleThemePresets,
  exampleThemeStorageKey,
  isExampleThemeId,
  type ExampleThemeId,
} from "@/agent-html-example/theme/theme-presets"
import {
  agentHtmlExampleCases,
  type AgentHtmlExampleLocale,
} from "@/agent-html-example/cases"
import { AgentHtmlRuntimePage } from "@/agent-html-example/features/runtime-preview/runtime-page"

function prefersChineseLocale() {
  const languages =
    navigator.languages.length > 0 ? navigator.languages : [navigator.language]

  return languages.some((language) =>
    language.toLowerCase().startsWith("zh")
  )
}

function getInitialLocale(): AgentHtmlExampleLocale {
  if (window.location.pathname.startsWith("/agent-html/zh")) {
    return "zh"
  }

  return prefersChineseLocale() ? "zh" : "en"
}

function localePath(locale: AgentHtmlExampleLocale) {
  return locale === "zh" ? "/agent-html/zh" : "/agent-html/"
}

export function AgentHtmlExampleApp() {
  const [theme, setTheme] = React.useState<ExampleThemeId>(() => {
    const storedTheme = window.localStorage.getItem(exampleThemeStorageKey)

    return storedTheme && isExampleThemeId(storedTheme)
      ? storedTheme
      : "claude"
  })
  const [locale, setLocale] = React.useState<AgentHtmlExampleLocale>(
    getInitialLocale
  )
  const activeCase =
    agentHtmlExampleCases.find((exampleCase) => exampleCase.locale === locale) ??
    agentHtmlExampleCases[0]

  React.useEffect(() => {
    window.localStorage.setItem(exampleThemeStorageKey, theme)
  }, [theme])

  React.useEffect(() => {
    if (locale === "zh" && window.location.pathname === "/agent-html/") {
      window.history.replaceState(null, "", localePath(locale))
    }
  }, [locale])

  const handleLocaleChange = React.useCallback(
    (nextLocale: AgentHtmlExampleLocale) => {
      if (nextLocale === locale) {
        return
      }

      window.history.pushState(null, "", localePath(nextLocale))
      setLocale(nextLocale)
    },
    [locale]
  )

  React.useEffect(() => {
    const handlePopState = () => {
      setLocale(getInitialLocale())
    }

    window.addEventListener("popstate", handlePopState)

    return () => {
      window.removeEventListener("popstate", handlePopState)
    }
  }, [])

  return (
    <AgentHtmlRuntimeTheme colorCssVariables={exampleThemePresets[theme]}>
      <AgentHtmlRuntimePage
        activeCase={activeCase}
        locale={locale}
        onLocaleChange={handleLocaleChange}
        onThemeChange={setTheme}
        theme={theme}
      />
    </AgentHtmlRuntimeTheme>
  )
}
