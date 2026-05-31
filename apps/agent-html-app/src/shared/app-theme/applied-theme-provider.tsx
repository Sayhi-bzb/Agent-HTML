import * as React from "react"

import {
  appliedAppThemeStorageKey,
  applyAppTheme,
} from "@/app/shared/app-theme/theme"
import { readAppliedAppTheme } from "@/app/shared/app-theme/applied-theme-hooks"

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
