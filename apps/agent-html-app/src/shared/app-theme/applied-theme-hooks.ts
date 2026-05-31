import * as React from "react"

import {
  type AppThemeDraft,
  appliedAppThemeStorageKey,
  createDefaultAppThemeDraft,
  loadAppliedAppTheme,
  resolveAppThemeCssVariables,
} from "@/app/shared/app-theme/theme"
import { useTheme } from "@/app/shared/theme-context"

export function readAppliedAppTheme() {
  return loadAppliedAppTheme() ?? createDefaultAppThemeDraft()
}

export function useAppliedAppThemeCssVariables() {
  const { resolvedTheme } = useTheme()
  const [appliedAppThemeDraft, setAppliedAppThemeDraft] =
    React.useState<AppThemeDraft>(readAppliedAppTheme)

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }
      if (event.key !== appliedAppThemeStorageKey) {
        return
      }

      setAppliedAppThemeDraft(readAppliedAppTheme())
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return React.useMemo(
    () => resolveAppThemeCssVariables(appliedAppThemeDraft, resolvedTheme),
    [appliedAppThemeDraft, resolvedTheme]
  )
}
