import {
  canvasThemeFontStylesheetPath,
  canvasThemeSyncVariableNames,
  readCanvasThemeChangeMessage,
  readCanvasThemeRequestMessage,
  type CanvasThemeSnapshot,
} from "../../../packages/cli/src/host/theme/theme-sync-contract"

export const desktopDarkModeMediaQuery = "(prefers-color-scheme: dark)"
const desktopThemeFontSelector = 'link[data-desktop-canvas-theme-font="true"]'

export function resolveDesktopRuntimeOrigin(runtimeUrl: string) {
  let url: URL
  try {
    url = new URL(runtimeUrl)
  } catch {
    return null
  }

  if (
    url.protocol !== "http:" ||
    url.hostname !== "127.0.0.1" ||
    !url.port ||
    url.username ||
    url.password
  ) {
    return null
  }

  return url.origin
}

export function resolveDesktopThemeFontStylesheetHrefs({
  paths,
  runtimeOrigin,
}: {
  paths: readonly string[]
  runtimeOrigin: string | null
}) {
  if (
    !runtimeOrigin ||
    resolveDesktopRuntimeOrigin(runtimeOrigin) !== runtimeOrigin
  ) {
    return []
  }

  return paths.flatMap((path) => {
    let url: URL
    try {
      url = new URL(path, runtimeOrigin)
    } catch {
      return []
    }

    if (
      !path.startsWith(`${canvasThemeFontStylesheetPath}?url=`) ||
      url.origin !== runtimeOrigin ||
      url.pathname !== canvasThemeFontStylesheetPath ||
      url.hash
    ) {
      return []
    }

    return [url.toString()]
  })
}

function syncDesktopThemeFontLinks({
  fontDocument,
  hrefs,
}: {
  fontDocument: Document
  hrefs: readonly string[]
}) {
  const managedLinks = Array.from(
    fontDocument.querySelectorAll<HTMLLinkElement>(desktopThemeFontSelector)
  )
  const nextHrefs = new Set(hrefs)

  for (const link of managedLinks) {
    if (!nextHrefs.has(link.href)) {
      link.remove()
    }
  }

  const currentHrefs = new Set(
    Array.from(
      fontDocument.querySelectorAll<HTMLLinkElement>(desktopThemeFontSelector)
    ).map((link) => link.href)
  )
  for (const href of hrefs) {
    if (currentHrefs.has(href)) {
      continue
    }

    const link = fontDocument.createElement("link")
    link.dataset.desktopCanvasThemeFont = "true"
    link.rel = "stylesheet"
    link.crossOrigin = "anonymous"
    link.href = href
    fontDocument.head.appendChild(link)
  }
}

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
  fontDocument,
  matchMedia = window.matchMedia.bind(window),
  root = document.documentElement,
  runtimeOrigin = null,
  snapshot,
}: {
  fontDocument?: Document
  matchMedia?: typeof window.matchMedia
  root?: HTMLElement
  runtimeOrigin?: string | null
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

  const activeDocument =
    fontDocument ?? (typeof document === "undefined" ? null : document)
  if (activeDocument) {
    syncDesktopThemeFontLinks({
      fontDocument: activeDocument,
      hrefs: resolveDesktopThemeFontStylesheetHrefs({
        paths: snapshot?.fontStylesheetPaths ?? [],
        runtimeOrigin,
      }),
    })
  }

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

export function readTrustedDesktopThemeRequest({
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

  return readCanvasThemeRequestMessage(event.data)
}
