import * as React from "react"

import {
  resolveGalleryThemeCssVariables,
  type GalleryThemeDraft,
} from "@/app/gallery/theme-apply"
import { useTheme } from "@/app/shared/theme-provider"

export function GalleryThemeScope({
  children,
  themeDraft,
}: {
  children: React.ReactNode
  themeDraft: GalleryThemeDraft
}) {
  const { resolvedTheme } = useTheme()
  const themeStyle = React.useMemo(
    () =>
      resolveGalleryThemeCssVariables(
        themeDraft,
        resolvedTheme
      ) as React.CSSProperties,
    [resolvedTheme, themeDraft]
  )

  React.useEffect(() => {
    if (typeof document === "undefined") {
      return undefined
    }

    const previousValues = Object.entries(themeStyle).map(([name, value]) => {
      const previousValue = document.body.style.getPropertyValue(name)
      document.body.style.setProperty(name, String(value))

      return [name, previousValue] as const
    })

    return () => {
      for (const [name, previousValue] of previousValues) {
        if (previousValue) {
          document.body.style.setProperty(name, previousValue)
        } else {
          document.body.style.removeProperty(name)
        }
      }
    }
  }, [themeStyle])

  return (
    <div
      className="flex h-svh min-h-svh flex-col overflow-hidden"
      style={themeStyle}
    >
      {children}
    </div>
  )
}
