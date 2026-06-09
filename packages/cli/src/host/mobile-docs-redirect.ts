export const canvasHostMobileDocsUrl = "https://agent-html.org/docs/start"
export const canvasHostMobileMediaQuery = "(max-width: 767px)"

export function shouldRedirectCanvasHostToDocs(
  viewport:
    | {
        matchMedia?: (query: string) => { matches: boolean }
      }
    | null
    | undefined
) {
  return Boolean(viewport?.matchMedia?.(canvasHostMobileMediaQuery).matches)
}
