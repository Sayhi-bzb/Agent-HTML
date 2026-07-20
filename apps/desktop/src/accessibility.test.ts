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
    expect(appSource.match(/aria-label="Workspace settings"/g)).toHaveLength(1)
    expect(appSource).toContain('className="desktop-home__settings"')
    expect(appSource).toContain('role="alert"')
    expect(uiSource).toContain('role="status"')
  })

  it("keeps the workspace home concise and hides an empty recent list", () => {
    expect(appSource).toContain("<h1>AHTML</h1>")
    expect(appSource).toContain("Open project")
    expect(appSource).toContain("Create workspace")
    expect(appSource).toContain("snapshot.recents.length > 0")
    expect(appSource).not.toContain("Artifact workbench")
    expect(appSource).not.toContain("Open a project. Shape the artifact.")
    expect(appSource).not.toContain("No recent projects yet.")
    expect(appSource).not.toContain('<Field label="Theme">')
  })

  it("renders the ready Canvas without desktop chrome", () => {
    expect(appSource).toContain('className="desktop-runtime__canvas"')
    expect(appSource).not.toContain("desktop-runtime__bar")
    expect(appSource).not.toContain("Runtime ready")
    expect(appSource).not.toContain("Switch workspace")
  })

  it("keeps visible focus and reduced-motion behavior", () => {
    expect(styles).toContain(":focus-visible")
    expect(styles).toContain("outline:")
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)")
  })

  it("owns desktop overflow without blocking content gestures", () => {
    expect(styles).toContain("overscroll-behavior: none")
    expect(styles).toMatch(/\.desktop-home\s*\{[^}]*overflow: auto/s)
    expect(styles).toMatch(/\.desktop-runtime\s*\{[^}]*overflow: hidden/s)
    expect(styles).toContain("--canvas-desktop-touch-target-min: 2.75rem")
    expect(styles).not.toContain("touch-action:")
  })
})
