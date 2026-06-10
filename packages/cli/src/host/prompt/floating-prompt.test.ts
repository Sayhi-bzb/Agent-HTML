import { describe, expect, it } from "vitest"

import {
  shouldPublishPromptDraftChange,
  shouldSubmitPromptShortcut,
} from "./floating-prompt"

describe("FloatingPrompt IME composition", () => {
  it("keeps draft changes local while composition is active", () => {
    expect(shouldPublishPromptDraftChange({ isComposing: true })).toBe(false)
    expect(shouldPublishPromptDraftChange({ isComposing: false })).toBe(true)
  })

  it("does not submit keyboard shortcuts while composition is active", () => {
    expect(
      shouldSubmitPromptShortcut({
        ctrlKey: true,
        isComposing: true,
        key: "Enter",
        metaKey: false,
        nativeIsComposing: false,
      })
    ).toBe(false)
    expect(
      shouldSubmitPromptShortcut({
        ctrlKey: true,
        isComposing: false,
        key: "Enter",
        metaKey: false,
        nativeIsComposing: true,
      })
    ).toBe(false)
  })

  it("submits only command or control enter outside composition", () => {
    expect(
      shouldSubmitPromptShortcut({
        ctrlKey: true,
        isComposing: false,
        key: "Enter",
        metaKey: false,
        nativeIsComposing: false,
      })
    ).toBe(true)
    expect(
      shouldSubmitPromptShortcut({
        ctrlKey: false,
        isComposing: false,
        key: "Enter",
        metaKey: true,
        nativeIsComposing: false,
      })
    ).toBe(true)
    expect(
      shouldSubmitPromptShortcut({
        ctrlKey: false,
        isComposing: false,
        key: "Enter",
        metaKey: false,
        nativeIsComposing: false,
      })
    ).toBe(false)
  })
})
