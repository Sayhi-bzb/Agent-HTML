import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const floatingPromptPath = fileURLToPath(
  new URL("./floating-prompt.tsx", import.meta.url)
)
const floatingPromptSource = readFileSync(floatingPromptPath, "utf8")

describe("FloatingPrompt copy", () => {
  it("uses block-edit prompt copy", () => {
    expect(floatingPromptSource).toContain('placeholder="Edit this block..."')
    expect(floatingPromptSource).not.toContain("Ask, Search or Chat")
  })

  it("does not expose an unimplemented add-context action", () => {
    expect(floatingPromptSource).not.toContain("Add context")
    expect(floatingPromptSource).not.toContain("PlusIcon")
  })

  it("keeps IME composition local until composition ends", () => {
    expect(floatingPromptSource).toContain("onCompositionStart")
    expect(floatingPromptSource).toContain("onCompositionEnd")
    expect(floatingPromptSource).toContain("isComposingRef")
    expect(floatingPromptSource).toContain("event.nativeEvent.isComposing")
  })
})
