import * as React from "react"

import {
  resolveAppThemeCssVariables,
  type AppThemeDraft,
} from "@/app/shared/app-theme/theme"
import { useColorMode } from "@/app/shared/color-mode-context"

export function AppThemeScope({
  children,
  themeDraft,
}: {
  children: React.ReactNode
  themeDraft: AppThemeDraft
}) {
  const { resolvedColorMode } = useColorMode()
  const themeStyle = React.useMemo(
    () =>
      resolveAppThemeCssVariables(
        themeDraft,
        resolvedColorMode
      ) as React.CSSProperties,
    [resolvedColorMode, themeDraft]
  )

  return (
    <div
      className="flex h-svh min-h-svh flex-col overflow-hidden"
      style={themeStyle}
    >
      {children}
    </div>
  )
}
