import * as React from "react"

export type ColorMode = "dark" | "light" | "system"
export type ResolvedColorMode = "dark" | "light"

export type ColorModeProviderState = {
  colorMode: ColorMode
  resolvedColorMode: ResolvedColorMode
  setColorMode: (colorMode: ColorMode) => void
}

export const ColorModeProviderContext = React.createContext<
  ColorModeProviderState | undefined
>(undefined)

export const useColorMode = () => {
  const context = React.useContext(ColorModeProviderContext)

  if (context === undefined) {
    throw new Error("useColorMode must be used within a ColorModeProvider")
  }

  return context
}
