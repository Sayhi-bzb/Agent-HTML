import * as React from "react"

import {
  type ColorMode,
  ColorModeProviderContext,
  type ResolvedColorMode,
} from "@/app/shared/color-mode-context"
import {
  readSyncedStorageValue,
  subscribeSyncedStorageKey,
  writeSyncedStorageValue,
} from "@/app/shared/storage-sync"

type ColorModeProviderProps = {
  children: React.ReactNode
  defaultColorMode?: ColorMode
  storageKey?: string
  disableTransitionOnChange?: boolean
}

const COLOR_SCHEME_QUERY = "(prefers-color-scheme: dark)"
const COLOR_MODE_VALUES: ColorMode[] = ["dark", "light", "system"]

function isColorMode(value: string | null): value is ColorMode {
  if (value === null) {
    return false
  }

  return COLOR_MODE_VALUES.includes(value as ColorMode)
}

function getSystemColorMode(): ResolvedColorMode {
  if (window.matchMedia(COLOR_SCHEME_QUERY).matches) {
    return "dark"
  }

  return "light"
}

function disableTransitionsTemporarily() {
  const style = document.createElement("style")
  style.appendChild(
    document.createTextNode(
      "*,*::before,*::after{-webkit-transition:none!important;transition:none!important}"
    )
  )
  document.head.appendChild(style)

  return () => {
    window.getComputedStyle(document.body)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        style.remove()
      })
    })
  }
}

function isEditableTarget(target: EventTarget | null) {
  if (!(target instanceof HTMLElement)) {
    return false
  }

  if (target.isContentEditable) {
    return true
  }

  const editableParent = target.closest(
    "input, textarea, select, [contenteditable='true']"
  )
  if (editableParent) {
    return true
  }

  return false
}

function readColorMode(storageKey: string, defaultColorMode: ColorMode) {
  return readSyncedStorageValue({
    defaultValue: defaultColorMode,
    parse: (value) => (isColorMode(value) ? value : null),
    storageKey,
  })
}

function writeColorMode(storageKey: string, colorMode: ColorMode) {
  writeSyncedStorageValue({
    storageKey,
    value: colorMode,
  })
}

export function ColorModeProvider({
  children,
  defaultColorMode = "system",
  storageKey = "theme",
  disableTransitionOnChange = true,
  ...props
}: ColorModeProviderProps) {
  const [colorMode, setColorModeState] = React.useState<ColorMode>(() =>
    readColorMode(storageKey, defaultColorMode)
  )
  const [systemColorMode, setSystemColorMode] =
    React.useState<ResolvedColorMode>(getSystemColorMode)
  const resolvedColorMode =
    colorMode === "system" ? systemColorMode : colorMode

  React.useEffect(() => {
    const root = document.documentElement
    const restoreTransitions = disableTransitionOnChange
      ? disableTransitionsTemporarily()
      : null

    root.classList.remove("light", "dark")
    root.classList.add(resolvedColorMode)

    if (restoreTransitions) {
      restoreTransitions()
    }
  }, [disableTransitionOnChange, resolvedColorMode])

  const setColorMode = React.useCallback(
    (nextColorMode: ColorMode) => {
      writeColorMode(storageKey, nextColorMode)
    },
    [storageKey]
  )

  React.useEffect(() => {
    if (colorMode !== "system") {
      return undefined
    }

    const mediaQuery = window.matchMedia(COLOR_SCHEME_QUERY)
    const handleChange = () => {
      setSystemColorMode(getSystemColorMode())
    }

    mediaQuery.addEventListener("change", handleChange)

    return () => {
      mediaQuery.removeEventListener("change", handleChange)
    }
  }, [colorMode])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.repeat) {
        return
      }

      if (event.metaKey || event.ctrlKey || event.altKey) {
        return
      }

      if (isEditableTarget(event.target)) {
        return
      }

      if (event.key.toLowerCase() !== "d") {
        return
      }

      setColorModeState((currentColorMode) => {
        const nextColorMode =
          currentColorMode === "dark"
            ? "light"
            : currentColorMode === "light"
              ? "dark"
              : getSystemColorMode() === "dark"
                ? "light"
                : "dark"

        writeColorMode(storageKey, nextColorMode)
        return nextColorMode
      })
    }

    window.addEventListener("keydown", handleKeyDown)

    return () => {
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [storageKey])

  React.useEffect(() => {
    return subscribeSyncedStorageKey(storageKey, () => {
      setColorModeState(readColorMode(storageKey, defaultColorMode))
    })
  }, [defaultColorMode, storageKey])

  const value = React.useMemo(
    () => ({
      colorMode,
      resolvedColorMode,
      setColorMode,
    }),
    [colorMode, resolvedColorMode, setColorMode]
  )

  return (
    <ColorModeProviderContext.Provider {...props} value={value}>
      {children}
    </ColorModeProviderContext.Provider>
  )
}
