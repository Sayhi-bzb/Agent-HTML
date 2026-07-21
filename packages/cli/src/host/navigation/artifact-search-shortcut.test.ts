import { describe, expect, it } from "vitest"

import { isArtifactSearchShortcut } from "./artifact-search-shortcut"

function shortcutInput(
  overrides: Partial<Parameters<typeof isArtifactSearchShortcut>[0]> = {}
) {
  return {
    altKey: false,
    ctrlKey: false,
    isComposing: false,
    key: "k",
    metaKey: false,
    shiftKey: false,
    ...overrides,
  }
}

describe("Artifact search shortcut", () => {
  it("accepts Cmd/Ctrl K", () => {
    expect(isArtifactSearchShortcut(shortcutInput({ metaKey: true }))).toBe(
      true
    )
    expect(isArtifactSearchShortcut(shortcutInput({ ctrlKey: true }))).toBe(
      true
    )
  })

  it("rejects modified, composing, and unrelated shortcuts", () => {
    expect(
      isArtifactSearchShortcut(shortcutInput({ ctrlKey: true, shiftKey: true }))
    ).toBe(false)
    expect(
      isArtifactSearchShortcut(shortcutInput({ altKey: true, metaKey: true }))
    ).toBe(false)
    expect(
      isArtifactSearchShortcut(
        shortcutInput({ isComposing: true, metaKey: true })
      )
    ).toBe(false)
    expect(
      isArtifactSearchShortcut(shortcutInput({ key: "p", metaKey: true }))
    ).toBe(false)
  })
})
