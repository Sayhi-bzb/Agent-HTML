import { createElement } from "react"
import { renderToStaticMarkup } from "react-dom/server"
import { describe, expect, it, vi } from "vitest"

import { HostI18nProvider } from "../i18n/host-i18n"
import { CodexThreadManagerSurface } from "./thread-manager-surface"

const thread = {
  id: "thread_1234567890_abcdefghijklmnop",
  name: "Navigation polish",
  preview: "Refine the title bar interactions",
  status: "idle",
}

function renderSurface(
  overrides: Partial<Parameters<typeof CodexThreadManagerSurface>[0]> = {}
) {
  return renderToStaticMarkup(
    createElement(
      HostI18nProvider,
      { language: "en" },
      createElement(CodexThreadManagerSurface, {
        activeThreadId: null,
        error: null,
        loading: false,
        onRefresh: vi.fn(),
        onSelectThread: vi.fn(),
        threads: [thread],
        ...overrides,
      })
    )
  )
}

describe("CodexThreadManagerSurface", () => {
  it("renders New thread first and marks the active thread", () => {
    const markup = renderSurface({ activeThreadId: thread.id })

    expect(markup.indexOf("New thread")).toBeLessThan(
      markup.indexOf("Navigation polish")
    )
    expect(markup).toContain('aria-pressed="true"')
    expect(markup).toContain("Refine the title bar interactions")
  })

  it("keeps stable loading, error recovery, and missing-active states", () => {
    expect(renderSurface({ loading: true, threads: [] })).toContain(
      'class="canvas-thread-manager-skeleton"'
    )

    const errorMarkup = renderSurface({ error: "Codex offline", threads: [] })
    expect(errorMarkup).toContain("Threads are unavailable.")
    expect(errorMarkup).toContain("Retry")

    const missingMarkup = renderSurface({
      activeThreadId: "thread_missing_1234567890",
      threads: [],
    })
    expect(missingMarkup).toContain("thread_mis...567890")
    expect(missingMarkup).toContain(
      "Current thread is not available in the latest list."
    )
  })
})
