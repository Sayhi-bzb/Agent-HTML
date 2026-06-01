import * as React from "react"

import type { AgentHtmlColorCssVariables } from "@/agent-html"
import {
  AppliedAppThemeProviderContext,
} from "@/app/shared/app-theme/applied-theme-context"
import {
  appliedAppThemeStorageKey,
  applyAppliedAppThemeToDocument,
  createDefaultAppThemeDraft,
  parseAppliedAppTheme,
  resolveAppThemeCssVariables,
  serializeAppliedAppTheme,
  type AppThemeDraft,
} from "@/app/shared/app-theme/theme"
import { useColorMode } from "@/app/shared/color-mode-context"
import {
  readSyncedStorageValue,
  subscribeSyncedStorageKey,
  writeSyncedStorageValue,
} from "@/app/shared/storage-sync"

function readAppliedThemeDraft() {
  return readSyncedStorageValue({
    defaultValue: createDefaultAppThemeDraft(),
    parse: parseAppliedAppTheme,
    storageKey: appliedAppThemeStorageKey,
  })
}

function writeAppliedThemeDraft(draft: AppThemeDraft) {
  writeSyncedStorageValue({
    storageKey: appliedAppThemeStorageKey,
    value: serializeAppliedAppTheme(draft),
  })
}

export function AppliedAppThemeProvider({
  children,
}: {
  children: React.ReactNode
}) {
  const { resolvedColorMode } = useColorMode()
  const [appliedThemeDraft, setAppliedThemeDraft] =
    React.useState<AppThemeDraft>(readAppliedThemeDraft)

  React.useEffect(() => {
    return subscribeSyncedStorageKey(appliedAppThemeStorageKey, () => {
      setAppliedThemeDraft(readAppliedThemeDraft())
    })
  }, [])

  React.useEffect(() => {
    applyAppliedAppThemeToDocument(appliedThemeDraft)
  }, [appliedThemeDraft])

  const saveAppliedThemeDraft = React.useCallback((draft: AppThemeDraft) => {
    writeAppliedThemeDraft(draft)
  }, [])

  const appliedThemeCssVariables = React.useMemo(
    () =>
      resolveAppThemeCssVariables(
        appliedThemeDraft,
        resolvedColorMode
      ) as AgentHtmlColorCssVariables,
    [appliedThemeDraft, resolvedColorMode]
  )

  const value = React.useMemo(
    () => ({
      appliedThemeCssVariables,
      appliedThemeDraft,
      saveAppliedThemeDraft,
    }),
    [appliedThemeCssVariables, appliedThemeDraft, saveAppliedThemeDraft]
  )

  return (
    <AppliedAppThemeProviderContext.Provider value={value}>
      {children}
    </AppliedAppThemeProviderContext.Provider>
  )
}
