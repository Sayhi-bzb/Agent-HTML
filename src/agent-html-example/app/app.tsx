import * as React from "react"

import { AgentHtmlRuntimeTheme } from "@/agent-html"
import {
  exampleThemePresets,
  exampleThemeStorageKey,
  isExampleThemeId,
  type ExampleThemeId,
} from "@/agent-html-example/theme/theme-presets"
import { AgentHtmlRuntimePage } from "@/agent-html-example/features/runtime-preview/runtime-page"

export function AgentHtmlExampleApp() {
  const [theme, setTheme] = React.useState<ExampleThemeId>(() => {
    const storedTheme = window.localStorage.getItem(exampleThemeStorageKey)

    return storedTheme && isExampleThemeId(storedTheme)
      ? storedTheme
      : "default"
  })

  React.useEffect(() => {
    window.localStorage.setItem(exampleThemeStorageKey, theme)
  }, [theme])

  return (
    <AgentHtmlRuntimeTheme colorCssVariables={exampleThemePresets[theme]}>
      <AgentHtmlRuntimePage onThemeChange={setTheme} theme={theme} />
    </AgentHtmlRuntimeTheme>
  )
}
