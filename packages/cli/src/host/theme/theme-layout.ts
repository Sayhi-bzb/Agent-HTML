import type {
  CanvasThemePreset,
  CanvasThemePresetFont,
  CanvasThemePresetFontFamily,
} from "#agent-html-playground/theme/presets"

const canvasThemePresetFontLinkId = "react-canvas-theme-preset-fonts"
const canvasThemePresetFontLinkIdPrefix = `${canvasThemePresetFontLinkId}-`
const canvasThemePresetFontStylesheetRoute =
  "/__agent-html/font-stylesheet"
const canvasThemePresetAntialiasClass = "antialiased"
const allowedBodyClassNames = new Set([canvasThemePresetAntialiasClass])

function googleFontFamilyQuery(family: string) {
  return family.trim().replaceAll(" ", "+")
}

function getFontFamilies(font: CanvasThemePresetFont) {
  if (font.families) {
    return font.families
  }

  if (!font.family || !font.provider) {
    return []
  }

  if (font.provider === "zeoseven") {
    return [
      {
        family: font.family,
        provider: font.provider,
        stylesheetUrl: font.stylesheetUrl,
      },
    ]
  }

  return [
    {
      family: font.family,
      provider: font.provider,
    },
  ] satisfies CanvasThemePresetFontFamily[]
}

function getPresetFontFamilies(fonts: readonly CanvasThemePresetFont[] = []) {
  return fonts.flatMap(getFontFamilies)
}

function uniqueGoogleFonts(fonts: readonly CanvasThemePresetFont[] = []) {
  return Array.from(
    new Set(
      getPresetFontFamilies(fonts)
        .filter((font) => font.provider === "google")
        .map((font) => font.family.trim())
        .filter(Boolean)
    )
  )
}

export function getCanvasThemePresetFontUrl(preset: CanvasThemePreset) {
  const googleFonts = uniqueGoogleFonts(preset.layout?.fonts)

  if (googleFonts.length === 0) {
    return ""
  }

  const familyQuery = googleFonts
    .map(
      (family) => `family=${googleFontFamilyQuery(family)}:wght@400;500;600;700`
    )
    .join("&")

  return `https://fonts.googleapis.com/css2?${familyQuery}&display=swap`
}

function getCanvasThemePresetZeosevenFontUrls(preset: CanvasThemePreset) {
  return Array.from(
    new Set(
      (preset.layout?.fonts ?? []).flatMap((font) =>
        getFontFamilies(font).flatMap((fontFamily) =>
          fontFamily.provider === "zeoseven" &&
          fontFamily.stylesheetUrl.trim()
            ? [fontFamily.stylesheetUrl.trim()]
            : []
        )
      )
    )
  )
}

function getManagedFontLinks() {
  return Array.from(
    document.querySelectorAll<HTMLLinkElement>(
      `link[data-canvas-theme-preset-font="true"]`
    )
  )
}

function removeStaleFontLinks(nextIds: Set<string>) {
  for (const linkElement of getManagedFontLinks()) {
    if (!nextIds.has(linkElement.id)) {
      linkElement.remove()
    }
  }
}

function getOrCreateFontLink(id: string) {
  const existingLink = document.getElementById(id)

  if (existingLink instanceof HTMLLinkElement) {
    return existingLink
  }

  const linkElement = document.createElement("link")
  linkElement.id = id
  linkElement.dataset.canvasThemePresetFont = "true"
  document.head.appendChild(linkElement)

  return linkElement
}

function configureGoogleFontLink(id: string, href: string) {
  const linkElement = getOrCreateFontLink(id)
  linkElement.rel = "stylesheet"
  linkElement.href = href
  linkElement.removeAttribute("as")
  linkElement.removeAttribute("crossorigin")
  linkElement.onload = null
}

function configureZeosevenFontLink(id: string, href: string) {
  const linkElement = getOrCreateFontLink(id)
  linkElement.rel = "preload"
  linkElement.as = "style"
  linkElement.href = `${canvasThemePresetFontStylesheetRoute}?url=${encodeURIComponent(href)}`
  linkElement.crossOrigin = "anonymous"
  linkElement.onload = () => {
    linkElement.rel = "stylesheet"
  }
}

function applyCanvasThemePresetFonts(preset: CanvasThemePreset) {
  const googleFontUrl = getCanvasThemePresetFontUrl(preset)
  const zeosevenFontUrls = getCanvasThemePresetZeosevenFontUrls(preset)
  const nextIds = new Set<string>()

  if (googleFontUrl) {
    nextIds.add(canvasThemePresetFontLinkId)
    configureGoogleFontLink(canvasThemePresetFontLinkId, googleFontUrl)
  }

  zeosevenFontUrls.forEach((fontUrl, index) => {
    const id = `${canvasThemePresetFontLinkIdPrefix}zeoseven-${index}`
    nextIds.add(id)
    configureZeosevenFontLink(id, fontUrl)
  })

  removeStaleFontLinks(nextIds)

  if (!googleFontUrl) {
    document.getElementById(canvasThemePresetFontLinkId)?.remove()
  }
}

function applyCanvasThemePresetBodyClass(preset: CanvasThemePreset) {
  for (const className of allowedBodyClassNames) {
    document.body.classList.remove(className)
  }

  const classNames = preset.layout?.bodyClassName?.split(/\s+/) ?? []

  for (const className of classNames) {
    if (allowedBodyClassNames.has(className)) {
      document.body.classList.add(className)
    }
  }
}

export function applyCanvasThemePresetLayout(preset: CanvasThemePreset) {
  applyCanvasThemePresetFonts(preset)
  applyCanvasThemePresetBodyClass(preset)
}
