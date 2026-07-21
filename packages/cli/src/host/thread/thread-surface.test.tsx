import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it } from "vitest"

import { HostI18nProvider } from "../i18n/host-i18n"
import { CodexThreadSurface } from "./thread-surface"

describe("CodexThreadSurface", () => {
  it("renders a named read-only surface with a stable loading state", () => {
    const markup = renderToStaticMarkup(
      createElement(
        HostI18nProvider,
        { language: "en" },
        createElement(CodexThreadSurface, {
          thread: {
            id: "thread-1",
            name: "Persistent tabs",
            status: "idle",
          },
        })
      )
    )

    expect(markup).toContain("Persistent tabs")
    expect(markup).toContain("Read-only Codex thread history.")
    expect(markup).toContain('class="canvas-thread-manager-skeleton"')
    expect(markup).toContain('aria-label="Refresh threads"')
  })
})
