import { afterEach, describe, expect, it, vi } from "vitest"

import {
  CANVAS_HOST_PREFERENCES_STORAGE_KEY,
  readCanvasHostPreferences,
  readCanvasMessageDraft,
  writeCanvasHostPreferences,
  writeCanvasMessageDraft,
} from "./canvas-host-preferences"
import type { Artifact } from "../host-contracts"

function stubStorage(initialValue?: string) {
  const values = new Map<string, string>()
  if (initialValue) {
    values.set(CANVAS_HOST_PREFERENCES_STORAGE_KEY, initialValue)
  }

  const storage = {
    getItem(key: string) {
      return values.get(key) ?? null
    },
    setItem(key: string, value: string) {
      values.set(key, value)
    },
  }

  vi.stubGlobal("localStorage", storage)
  vi.stubGlobal("window", {})

  return values
}

function readStored(values: Map<string, string>) {
  return JSON.parse(
    values.get(CANVAS_HOST_PREFERENCES_STORAGE_KEY) ?? "{}"
  ) as Record<string, unknown>
}

describe("canvas host preferences", () => {
  afterEach(() => {
    vi.unstubAllGlobals()
  })

  it("returns defaults when browser storage is unavailable", () => {
    expect(readCanvasHostPreferences()).toMatchObject({
      activeCodexThreadId: null,
      activeFilePath: null,
      activeLanguage: "system",
      activeSidebarView: "artifacts",
      activeThemeEditorSectionId: "color",
      activeThemeMode: "system",
      activeThemePresetId: "claude-plus",
      leftSidebarOpen: true,
      messageDrafts: {},
    })
  })

  it("falls back from malformed storage values", () => {
    stubStorage("{bad")

    expect(readCanvasHostPreferences().leftSidebarOpen).toBe(true)
  })

  it("validates stored preference values", () => {
    stubStorage(
      JSON.stringify({
        activeFilePath: "agent-html/artifacts/example.artifact.tsx",
        activeCodexThreadId: 42,
        activeLanguage: "bad",
        activeSidebarView: "bad",
        activeThemeEditorSectionId: "missing",
        activeThemeMode: "bad",
        activeThemePresetId: "missing",
        createArtifactJob: {
          filePath: "agent-html/artifacts/new.artifact.tsx",
          phase: "waiting-for-artifact",
          request: "Build a dashboard",
          startedAt: 123,
          threadId: "thread-1",
          turnId: "turn-1",
        },
        leftSidebarOpen: false,
        messageDrafts: {
          valid: "draft",
          invalid: 42,
        },
      })
    )

    expect(readCanvasHostPreferences()).toEqual({
      activeCodexThreadId: null,
      activeFilePath: "agent-html/artifacts/example.artifact.tsx",
      activeLanguage: "system",
      activeSidebarView: "artifacts",
      activeThemeEditorSectionId: "color",
      activeThemeMode: "system",
      activeThemePresetId: "claude-plus",
      createArtifactJob: {
        filePath: "agent-html/artifacts/new.artifact.tsx",
        phase: "waiting-for-artifact",
        request: "Build a dashboard",
        startedAt: 123,
        threadId: "thread-1",
        turnId: "turn-1",
      },
      leftSidebarOpen: false,
      messageDrafts: {
        valid: "draft",
      },
    })
  })

  it("restores the gallery sidebar view", () => {
    stubStorage(
      JSON.stringify({
        activeSidebarView: "gallery",
      })
    )

    expect(readCanvasHostPreferences().activeSidebarView).toBe("gallery")
  })

  it("restores an active Codex thread id", () => {
    stubStorage(
      JSON.stringify({
        activeCodexThreadId: "thread-1",
      })
    )

    expect(readCanvasHostPreferences().activeCodexThreadId).toBe("thread-1")
  })

  it("falls back from invalid create artifact jobs", () => {
    stubStorage(
      JSON.stringify({
        createArtifactJob: {
          filePath: "agent-html/artifacts/new.artifact.tsx",
          phase: "done",
          request: "Build a dashboard",
        },
      })
    )

    expect(readCanvasHostPreferences().createArtifactJob).toBeNull()
  })

  it("restores host theme and language settings", () => {
    stubStorage(
      JSON.stringify({
        activeLanguage: "zh",
        activeThemeMode: "dark",
      })
    )

    expect(readCanvasHostPreferences()).toMatchObject({
      activeLanguage: "zh",
      activeThemeMode: "dark",
    })
  })

  it("maps the legacy theme sidebar view to gallery", () => {
    stubStorage(
      JSON.stringify({
        activeSidebarView: "theme",
      })
    )

    expect(readCanvasHostPreferences().activeSidebarView).toBe("gallery")
  })

  it("restores an active file only when it still exists", () => {
    stubStorage(
      JSON.stringify({
        activeFilePath: "agent-html/artifacts/missing.artifact.tsx",
      })
    )
    const artifacts: Artifact[] = [
      {
        filePath: "agent-html/artifacts/example.artifact.tsx",
      },
    ]

    expect(readCanvasHostPreferences({ artifacts }).activeFilePath).toBeNull()
  })

  it("writes preference patches without clearing message drafts", () => {
    const values = stubStorage()

    writeCanvasMessageDraft({
      blockId: "summary",
      draft: "Improve this",
      filePath: "agent-html/artifacts/example.artifact.tsx",
    })
    writeCanvasHostPreferences({
      activeCodexThreadId: "thread-2",
      activeSidebarView: "gallery",
      createArtifactJob: {
        filePath: "agent-html/artifacts/new.artifact.tsx",
        phase: "starting",
        request: "Build a dashboard",
        startedAt: 456,
      },
      leftSidebarOpen: false,
    })

    expect(readCanvasHostPreferences()).toMatchObject({
      activeSidebarView: "gallery",
      activeCodexThreadId: "thread-2",
      createArtifactJob: {
        filePath: "agent-html/artifacts/new.artifact.tsx",
        phase: "starting",
        request: "Build a dashboard",
        startedAt: 456,
      },
      leftSidebarOpen: false,
      messageDrafts: expect.any(Object),
    })
    expect(Object.keys(readStored(values).messageDrafts as object)).toHaveLength(1)
  })

  it("persists and clears message drafts per artifact block", () => {
    stubStorage()

    writeCanvasMessageDraft({
      blockId: "summary",
      draft: "Improve summary",
      filePath: "agent-html/artifacts/example.artifact.tsx",
    })
    writeCanvasMessageDraft({
      blockId: "details",
      draft: "Improve details",
      filePath: "agent-html/artifacts/example.artifact.tsx",
    })

    expect(
      readCanvasMessageDraft({
        blockId: "summary",
        filePath: "agent-html/artifacts/example.artifact.tsx",
      })
    ).toBe("Improve summary")
    expect(
      readCanvasMessageDraft({
        blockId: "details",
        filePath: "agent-html/artifacts/example.artifact.tsx",
      })
    ).toBe("Improve details")

    writeCanvasMessageDraft({
      blockId: "summary",
      draft: "",
      filePath: "agent-html/artifacts/example.artifact.tsx",
    })

    expect(
      readCanvasMessageDraft({
        blockId: "summary",
        filePath: "agent-html/artifacts/example.artifact.tsx",
      })
    ).toBe("")
    expect(
      readCanvasMessageDraft({
        blockId: "details",
        filePath: "agent-html/artifacts/example.artifact.tsx",
      })
    ).toBe("Improve details")
  })
})
