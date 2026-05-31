import { i18n } from "@lingui/core"
import { I18nProvider } from "@lingui/react"
import * as React from "react"

import { messages as enMessages } from "@/app/locales/en/messages.mjs"
import { messages as zhMessages } from "@/app/locales/zh/messages.mjs"

export type AppLanguage = "en" | "system" | "zh"
export type ResolvedAppLocale = "en" | "zh"

type LanguageProviderState = {
  language: AppLanguage
  resolvedLocale: ResolvedAppLocale
  setLanguage: (language: AppLanguage) => void
}

const LANGUAGE_STORAGE_KEY = "agent-html.language"
const LANGUAGE_VALUES: AppLanguage[] = ["system", "en", "zh"]

const LanguageProviderContext = React.createContext<
  LanguageProviderState | undefined
>(undefined)

i18n.load({
  en: enMessages,
  zh: zhMessages,
})
i18n.activate("en")

function isLanguage(value: string | null): value is AppLanguage {
  if (value === null) {
    return false
  }

  return LANGUAGE_VALUES.includes(value as AppLanguage)
}

function getSystemLocale(): ResolvedAppLocale {
  const languages =
    navigator.languages.length > 0 ? navigator.languages : [navigator.language]

  return languages.some((language) =>
    language.toLowerCase().startsWith("zh")
  )
    ? "zh"
    : "en"
}

function getInitialLanguage(
  storageKey: string,
  defaultLanguage: AppLanguage
): AppLanguage {
  const storedLanguage = localStorage.getItem(storageKey)
  if (isLanguage(storedLanguage)) {
    return storedLanguage
  }

  return defaultLanguage
}

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

function activateLocale(locale: ResolvedAppLocale) {
  document.documentElement.lang = locale === "zh" ? "zh-CN" : "en"
  i18n.activate(locale)
}

export function LanguageProvider({
  children,
  defaultLanguage = "system",
  storageKey = LANGUAGE_STORAGE_KEY,
}: {
  children: React.ReactNode
  defaultLanguage?: AppLanguage
  storageKey?: string
}) {
  const [language, setLanguageState] = React.useState<AppLanguage>(() =>
    getInitialLanguage(storageKey, defaultLanguage)
  )
  const [systemLocale, setSystemLocale] = React.useState<ResolvedAppLocale>(
    getSystemLocale
  )
  const resolvedLocale = language === "system" ? systemLocale : language

  const setLanguage = React.useCallback(
    (nextLanguage: AppLanguage) => {
      localStorage.setItem(storageKey, nextLanguage)
      setLanguageState(nextLanguage)
    },
    [storageKey]
  )

  React.useEffect(() => {
    activateLocale(resolvedLocale)
  }, [resolvedLocale])

  React.useEffect(() => {
    if (language !== "system") {
      return undefined
    }

    const handleLanguageChange = () => {
      setSystemLocale(getSystemLocale())
    }

    window.addEventListener("languagechange", handleLanguageChange)

    return () => {
      window.removeEventListener("languagechange", handleLanguageChange)
    }
  }, [language])

  React.useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.storageArea !== localStorage) {
        return
      }

      if (event.key !== storageKey) {
        return
      }

      setLanguageState(
        isLanguage(event.newValue) ? event.newValue : defaultLanguage
      )
    }

    window.addEventListener("storage", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
    }
  }, [defaultLanguage, storageKey])

  const value = React.useMemo(
    () => ({
      language,
      resolvedLocale,
      setLanguage,
    }),
    [language, resolvedLocale, setLanguage]
  )

  return (
    <LanguageProviderContext.Provider value={value}>
      <I18nProvider i18n={i18n}>{children}</I18nProvider>
    </LanguageProviderContext.Provider>
  )
}

export function useLanguage() {
  const context = React.useContext(LanguageProviderContext)

  if (context === undefined) {
    throw new Error("useLanguage must be used within a LanguageProvider")
  }

  return context
}
