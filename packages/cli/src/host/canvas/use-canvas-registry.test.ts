// @vitest-environment jsdom

import { act, createElement } from "react"
import { createRoot } from "react-dom/client"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"

const fetchCanvases = vi.fn()
vi.mock("../api/api", () => ({ fetchCanvases }))

describe("Canvas registry hook contract", () => {
  beforeEach(() => {
    fetchCanvases.mockReset()
    vi.stubGlobal("IS_REACT_ACT_ENVIRONMENT", true)
  })
  afterEach(() => vi.unstubAllGlobals())

  it("loads entries from the dedicated Canvas registry route", async () => {
    fetchCanvases.mockResolvedValue({
      canvases: [
        {
          filePath: "agent-html/canvases/demo/demo.canvas.tsx",
          title: "Demo",
        },
      ],
      version: 2,
    })
    const { canvasesUpdatedEventName, useCanvasRegistry } =
      await import("./use-canvas-registry")
    let latest: ReturnType<typeof useCanvasRegistry> | null = null
    function Harness() {
      latest = useCanvasRegistry()
      return null
    }
    const element = document.createElement("div")
    const root = createRoot(element)

    await act(async () => {
      root.render(createElement(Harness))
    })

    expect(canvasesUpdatedEventName).toBe("agent-html:canvases-updated")
    expect(fetchCanvases).toHaveBeenCalledOnce()
    expect(latest).toMatchObject({
      canvasLoadError: null,
      canvasRegistryVersion: 2,
      canvasesLoading: false,
      canvases: [
        {
          filePath: "agent-html/canvases/demo/demo.canvas.tsx",
          title: "Demo",
        },
      ],
    })

    await act(async () => root.unmount())
  })
})
