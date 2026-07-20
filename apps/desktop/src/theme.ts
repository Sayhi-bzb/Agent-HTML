import {
  canvasThemeSyncVariableNames,
  readCanvasThemeChangeMessage,
  type CanvasThemeSnapshot,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"

export const desktopDarkModeMediaQuery = "(prefers-color-scheme: dark)"

export function resolveDesktopThemeDark({
  mode,
  systemDark,
}: {
  mode: CanvasThemeSnapshot["mode"]
  systemDark: boolean
}) {
  return mode === "dark" || (mode === "system" && systemDark)
}

export function resolveDesktopThemeVariables({
  snapshot,
  systemDark,
}: {
  snapshot: CanvasThemeSnapshot | null
  systemDark: boolean
}) {
  if (!snapshot) {
    return {}
  }

  const dark = resolveDesktopThemeDark({ mode: snapshot.mode, systemDark })
  return {
    ...snapshot.lightCssVariables,
    ...(dark ? snapshot.darkCssVariables : {}),
    ...snapshot.draftCssVariables,
  }
}

export function watchDesktopTheme({
  matchMedia = window.matchMedia.bind(window),
  root = document.documentElement,
  snapshot,
}: {
  matchMedia?: typeof window.matchMedia
  root?: HTMLElement
  snapshot: CanvasThemeSnapshot | null
}) {
  const systemTheme = matchMedia(desktopDarkModeMediaQuery)
  const mode = snapshot?.mode ?? "system"
  const apply = () => {
    const systemDark = systemTheme.matches
    root.classList.toggle(
      "dark",
      resolveDesktopThemeDark({ mode, systemDark })
    )

    for (const name of canvasThemeSyncVariableNames) {
      root.style.removeProperty(name)
    }
    for (const [name, value] of Object.entries(
      resolveDesktopThemeVariables({ snapshot, systemDark })
    )) {
      if (typeof value === "string") {
        root.style.setProperty(name, value)
      }
    }
  }

  apply()

  if (mode !== "system") {
    return
  }

  systemTheme.addEventListener("change", apply)
  return () => systemTheme.removeEventListener("change", apply)
}

export function readTrustedDesktopThemeMessage({
  event,
  expectedOrigin,
  expectedSource,
}: {
  event: MessageEvent<unknown>
  expectedOrigin: string
  expectedSource: MessageEventSource | null
}) {
  if (event.source !== expectedSource || event.origin !== expectedOrigin) {
    return null
  }

  return readCanvasThemeChangeMessage(event.data)?.snapshot ?? null
}
