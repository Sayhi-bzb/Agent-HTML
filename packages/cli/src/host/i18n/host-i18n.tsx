import * as React from "react"

import type { CanvasHostLanguage } from "../preferences/canvas-host-preferences"
import {
  hostMessages,
  type HostMessageKey,
  type HostMessageValues,
} from "./messages"

export type CanvasHostLocale = keyof typeof hostMessages

export type HostTranslator = (
  key: HostMessageKey,
  values?: HostMessageValues
) => string

type HostI18nContextValue = {
  language: CanvasHostLanguage
  locale: CanvasHostLocale
  t: HostTranslator
}

const HostI18nContext = React.createContext<HostI18nContextValue | null>(null)

export function resolveCanvasHostLocale({
  language,
  navigatorLanguage,
}: {
  language: CanvasHostLanguage
  navigatorLanguage?: string | null
}): CanvasHostLocale {
  if (language === "en" || language === "zh") {
    return language
  }

  const detectedLanguage =
    navigatorLanguage ??
    (typeof navigator !== "undefined" ? navigator.language : "")

  return detectedLanguage.toLowerCase().startsWith("zh") ? "zh" : "en"
}

export function formatHostMessage(
  template: string,
  values: HostMessageValues = {}
) {
  return template.replace(/\{([a-zA-Z0-9_]+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match
  )
}

export function createHostTranslator(locale: CanvasHostLocale): HostTranslator {
  return (key, values) => formatHostMessage(hostMessages[locale][key], values)
}

export function HostI18nProvider({
  children,
  language,
  navigatorLanguage,
}: {
  children: React.ReactNode
  language: CanvasHostLanguage
  navigatorLanguage?: string | null
}) {
  const value = React.useMemo(() => {
    const locale = resolveCanvasHostLocale({ language, navigatorLanguage })

    return {
      language,
      locale,
      t: createHostTranslator(locale),
    }
  }, [language, navigatorLanguage])

  return (
    <HostI18nContext.Provider value={value}>
      {children}
    </HostI18nContext.Provider>
  )
}

export function useHostI18n() {
  const value = React.useContext(HostI18nContext)

  if (!value) {
    throw new Error("useHostI18n must be used inside HostI18nProvider.")
  }

  return value
}

