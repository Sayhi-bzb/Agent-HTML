import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const appSource = fs.readFileSync(path.resolve(import.meta.dirname, "App.tsx"), "utf8")
const uiSource = fs.readFileSync(path.resolve(import.meta.dirname, "ui.tsx"), "utf8")
const styles = fs.readFileSync(path.resolve(import.meta.dirname, "styles.css"), "utf8")

describe("desktop accessibility contract", () => {
  it("names frames, dialogs, icon-only controls, status, and recovery", () => {
    expect(appSource).toContain('title={`${title} Canvas`}')
    expect(appSource).toContain("dialog?.showModal()")
    expect(appSource).toContain("onCancel=")
    expect(appSource).toContain("autoFocus")
    expect(appSource).toContain('aria-label="Close settings"')
    expect(appSource).toContain('role="alert"')
    expect(uiSource).toContain('role="status"')
  })

  it("keeps visible focus and reduced-motion behavior", () => {
    expect(styles).toContain(":focus-visible")
    expect(styles).toContain("outline:")
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)")
  })
})
