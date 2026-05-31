import * as React from "react"

import {
  type AppThemeDraft,
  appliedAppThemeStorageKey,
  applyAppTheme,
  createDefaultAppThemeDraft,
  loadAppliedAppTheme,
  resolveAppThemeCssVariables,
} from "@/app/shared/app-theme/theme"
import { useTheme } from "@/app/shared/theme-provider"

function readAppliedAppTheme() {
  return loadAppliedAppTheme() ?? createDefaultAppThemeDraft()
}

export function AppliedAppThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  React.useEffect(() => {
    applyStoredAppTheme()

    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }
      if (event.key !== appliedAppThemeStorageKey) {
        return
      }

      applyStoredAppTheme()
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [])

  return children
}

function applyStoredAppTheme() {
  applyAppTheme(readAppliedAppTheme())
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
