import { describe, expect, it } from "vitest"

import { createTextEditChange } from "../../../../.agent-html/artifacts/interaction-state/state-change"

describe("interaction-state artifact interaction helpers", () => {
  it("creates input text diffs from focus start to blur value", () => {
    expect(
      createTextEditChange({
        component: "input",
        controlId: "input",
        from: "Canvas",
        semantic: "set-input-text",
        to: "Canvas revised",
      })
    ).toEqual({
      after: "Canvas revised",
      before: "Canvas",
      component: "input",
      controlId: "input",
      kind: "set",
      semantic: "set-input-text",
    })
  })

  it("creates textarea text diffs from focus start to blur value", () => {
    expect(
      createTextEditChange({
        component: "textarea",
        controlId: "textarea",
        from: "Try a short instruction.",
        semantic: "set-textarea-text",
        to: "Review this interaction prompt.",
      })
    ).toEqual({
      after: "Review this interaction prompt.",
      before: "Try a short instruction.",
      component: "textarea",
      controlId: "textarea",
      kind: "set",
      semantic: "set-textarea-text",
    })
  })

  it("omits unchanged text edits", () => {
    expect(
      createTextEditChange({
        component: "input",
        controlId: "input",
        from: "Canvas",
        semantic: "set-input-text",
        to: "Canvas",
      })
    ).toBeNull()
  })

})
