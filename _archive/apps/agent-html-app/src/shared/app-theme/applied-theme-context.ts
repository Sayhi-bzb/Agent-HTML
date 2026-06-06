import * as React from "react"

import type { AgentHtmlColorCssVariables } from "@/agent-html"
import type { AppThemeDraft } from "@/app/shared/app-theme/theme"

export type AppliedAppThemeProviderState = {
  appliedThemeCssVariables: AgentHtmlColorCssVariables
  appliedThemeDraft: AppThemeDraft
  saveAppliedThemeDraft: (draft: AppThemeDraft) => void
}

export const AppliedAppThemeProviderContext = React.createContext<
  AppliedAppThemeProviderState | undefined
>(undefined)

export function useAppliedAppTheme() {
  const context = React.useContext(AppliedAppThemeProviderContext)

  if (context === undefined) {
    throw new Error(
      "useAppliedAppTheme must be used within an AppliedAppThemeProvider"
    )
  }

  return context
}
