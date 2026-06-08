import type {
  CanvasThemePreset,
  CanvasThemePresetFont,
} from "#agent-html-playground/theme/presets"

const canvasThemePresetFontLinkId = "react-canvas-theme-preset-fonts"
const canvasThemePresetAntialiasClass = "antialiased"
const allowedBodyClassNames = new Set([canvasThemePresetAntialiasClass])

function googleFontFamilyQuery(family: string) {
  return family.trim().replaceAll(" ", "+")
}

function uniqueGoogleFonts(fonts: readonly CanvasThemePresetFont[] = []) {
  return Array.from(
    new Set(
      fonts
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

function applyCanvasThemePresetFonts(preset: CanvasThemePreset) {
  const fontUrl = getCanvasThemePresetFontUrl(preset)
  const existingLink = document.getElementById(canvasThemePresetFontLinkId)

  if (!fontUrl) {
    existingLink?.remove()
    return
  }

  const linkElement =
    existingLink instanceof HTMLLinkElement
      ? existingLink
      : document.createElement("link")

  linkElement.id = canvasThemePresetFontLinkId
  linkElement.rel = "stylesheet"
  linkElement.href = fontUrl

  if (!existingLink) {
    document.head.appendChild(linkElement)
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
