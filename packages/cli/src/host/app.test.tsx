import { describe, expect, it } from "vitest"

import {
  canvasHostCompactDesktopMediaQuery,
  shouldAutoCollapseCanvasHostSidebar,
} from "./app"
import { resolveArtifactRefreshState } from "./artifact/artifact-refresh-state"
import {
  canvasHostMobileDocsUrl,
  canvasHostMobileMediaQuery,
  shouldRedirectCanvasHostToDocs,
} from "./mobile-docs-redirect"

describe("ReactCanvasHostApp mobile docs redirect", () => {
  it("uses the public docs start route for mobile host visits", () => {
    expect(canvasHostMobileDocsUrl).toBe("https://agent-html.org/docs/start")
  })

  it("redirects only when the mobile media query matches", () => {
    const createViewport = (matches: boolean) => ({
      matchMedia: (query: string) => {
        expect(query).toBe(canvasHostMobileMediaQuery)
        return { matches }
      },
    })

    expect(shouldRedirectCanvasHostToDocs(createViewport(true))).toBe(true)
    expect(shouldRedirectCanvasHostToDocs(createViewport(false))).toBe(false)
    expect(shouldRedirectCanvasHostToDocs(null)).toBe(false)
  })
})

describe("ReactCanvasHostApp compact desktop sidebar", () => {
  it("uses the compact desktop media query for auto collapse", () => {
    expect(canvasHostCompactDesktopMediaQuery).toBe(
      "(min-width: 768px) and (max-width: 1099px)"
    )
  })

  it("auto collapses only when the compact desktop query matches", () => {
    const createViewport = (matches: boolean) => ({
      matchMedia: (query: string) => {
        expect(query).toBe(canvasHostCompactDesktopMediaQuery)
        return { matches }
      },
    })

    expect(shouldAutoCollapseCanvasHostSidebar(createViewport(true))).toBe(true)
    expect(shouldAutoCollapseCanvasHostSidebar(createViewport(false))).toBe(false)
    expect(shouldAutoCollapseCanvasHostSidebar(null)).toBe(false)
  })
})

describe("resolveArtifactRefreshState", () => {
  const artifacts = [
    {
      blocks: [],
      filePath: "agent-html/artifacts/current.artifact.tsx",
    },
    {
      blocks: [],
      filePath: "agent-html/artifacts/pending.artifact.tsx",
    },
  ]

  it("activates a pending artifact once it appears in the registry", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts,
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: "agent-html/artifacts/pending.artifact.tsx",
        storedFilePath: null,
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/pending.artifact.tsx",
      pendingReady: true,
    })
  })

  it("keeps the current artifact when it remains available", () => {
    expect(
      resolveArtifactRefreshState({
        artifacts,
        currentFilePath: "agent-html/artifacts/current.artifact.tsx",
        pendingFilePath: null,
        storedFilePath: "agent-html/artifacts/pending.artifact.tsx",
      })
    ).toEqual({
      activeFilePath: "agent-html/artifacts/current.artifact.tsx",
      pendingReady: false,
    })
  })
})
