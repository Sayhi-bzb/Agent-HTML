import * as React from "react"

export type AppLanguage = "en" | "system" | "zh"
export type ResolvedAppLocale = "en" | "zh"

export type LanguageProviderState = {
  language: AppLanguage
  resolvedLocale: ResolvedAppLocale
  setLanguage: (language: AppLanguage) => void
}

export const LanguageProviderContext = React.createContext<
  LanguageProviderState | undefined
>(undefined)

export function getResolvedAppLocaleLabel(locale: ResolvedAppLocale) {
  return locale === "zh" ? "中文" : "English"
}

export function getAppLanguageLabel(
  language: AppLanguage,
  resolvedLocale: ResolvedAppLocale
) {
  if (language === "system") {
    return `System · ${getResolvedAppLocaleLabel(resolvedLocale)}`
  }

  return getResolvedAppLocaleLabel(language)
}

export function useLanguage() {
  const context = React.useContext(LanguageProviderContext)

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
