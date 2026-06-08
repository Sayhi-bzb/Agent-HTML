import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

import {
  canvasPromptDebugEventName,
  canvasPromptDebugStorageKey,
  publishCanvasPromptDebug,
} from "./prompt-debug"

describe("Canvas prompt debug", () => {
  const storage = new Map<string, string>()

  beforeEach(() => {
    storage.clear()
    const listeners = new Map<string, Array<(event: Event) => void>>()
    vi.stubGlobal("window", {
      addEventListener: (name: string, listener: EventListener) => {
        listeners.set(name, [...(listeners.get(name) ?? []), listener])
      },
      dispatchEvent: (event: Event) => {
        for (const listener of listeners.get(event.type) ?? []) {
          listener(event)
        }
      },
      localStorage: {
        clear: () => storage.clear(),
        getItem: (key: string) => storage.get(key) ?? null,
        setItem: (key: string, value: string) => {
          storage.set(key, value)
        },
      },
    })
  })

  afterEach(() => {
    delete window.__agentHtmlLastPrompt
    window.localStorage.clear()
    vi.unstubAllGlobals()
    vi.restoreAllMocks()
  })

  it("publishes the latest formatted prompt without logging by default", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    const prompts: string[] = []
    window.addEventListener(canvasPromptDebugEventName, (event) => {
      if (event instanceof CustomEvent) {
        prompts.push(event.detail.prompt)
      }
    })

    publishCanvasPromptDebug("Request:\nUpdate this block.")

    expect(window.__agentHtmlLastPrompt).toBe("Request:\nUpdate this block.")
    expect(prompts).toEqual(["Request:\nUpdate this block."])
    expect(info).not.toHaveBeenCalled()
  })

  it("logs prompts when the local debug flag is enabled", () => {
    const info = vi.spyOn(console, "info").mockImplementation(() => {})
    window.localStorage.setItem(canvasPromptDebugStorageKey, "true")

    publishCanvasPromptDebug("Request:\nUpdate this block.")

    expect(info).toHaveBeenCalledWith(
      "[agent-html] block prompt\n%s",
      "Request:\nUpdate this block."
    )
  })
})
