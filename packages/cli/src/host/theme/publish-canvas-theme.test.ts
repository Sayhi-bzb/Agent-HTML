import { describe, expect, it, vi } from "vitest"

import { publishCanvasTheme } from "./publish-canvas-theme"

describe("publish canvas theme", () => {
  it("publishes preset, mode, and live draft variables", () => {
    const postMessage = vi.fn()
    const message = publishCanvasTheme({
      draft: { cssVariables: { "--radius": "0.8rem" } },
      mode: "dark",
      preset: {
        darkCssVariables: { "--background": "#111111" },
        id: "test-preset",
        label: "Test",
        lightCssVariables: { "--background": "#ffffff" },
        layout: {
          fonts: [
            { family: "Inter", provider: "google", variable: "--font-sans" },
          ],
        },
      },
      target: { postMessage } as unknown as Window,
    })

    expect(postMessage).toHaveBeenCalledWith(message, "*")
    expect(message.snapshot).toMatchObject({
      darkCssVariables: { "--background": "#111111" },
      draftCssVariables: { "--radius": "0.8rem" },
      fontStylesheetPaths: [
        expect.stringMatching(
          /^\/__agent-html\/font-stylesheet\?url=https%3A%2F%2Ffonts\.googleapis\.com%2Fcss2/
        ),
      ],
      lightCssVariables: { "--background": "#ffffff" },
      mode: "dark",
      presetId: "test-preset",
    })
  })
})
