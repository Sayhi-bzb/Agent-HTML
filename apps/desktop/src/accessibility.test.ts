import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const appSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "App.tsx"),
  "utf8"
)
const titleBarSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "title-bar.tsx"),
  "utf8"
)
const uiSource = fs.readFileSync(
  path.resolve(import.meta.dirname, "ui.tsx"),
  "utf8"
)
const styles = fs.readFileSync(
  path.resolve(import.meta.dirname, "styles.css"),
  "utf8"
)

describe("desktop accessibility contract", () => {
  it("names frames, icon-only controls, status, and recovery", () => {
    expect(appSource).toContain("title={`${title} Canvas`}")
    expect(appSource).toContain('role="alert"')
    expect(uiSource).toContain('role="status"')
    expect(titleBarSource).toContain('aria-label="Application title bar"')
    expect(titleBarSource).toContain('label="Minimize window"')
    expect(titleBarSource).toContain('"Maximize window"')
    expect(titleBarSource).toContain('label="Close window"')
    expect(titleBarSource).toContain("aria-label={`Delete ${displayedTitle}`}")
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
    expect(appSource).not.toContain("SettingsDialog")
    expect(appSource).not.toContain("Workspace settings")
    expect(appSource).not.toContain("desktop-dialog")
  })

  it("renders the ready Canvas without runtime-specific chrome", () => {
    expect(appSource).toContain('className="desktop-runtime__canvas"')
    expect(appSource.match(/<DesktopShell/g)).toHaveLength(2)
    expect(appSource).toContain("navigation={canvasNavigation}")
    expect(appSource).not.toContain("desktop-runtime__bar")
    expect(appSource).not.toContain("Runtime ready")
    expect(appSource).not.toContain("Switch workspace")
  })

  it("keeps visible focus and reduced-motion behavior", () => {
    expect(styles).toContain(":focus-visible")
    expect(styles).toContain("outline:")
    expect(styles).toContain("@media (prefers-reduced-motion: reduce)")
  })

  it("keeps tab hover feedback free of decorative lines", () => {
    expect(styles).toMatch(
      /\.desktop-titlebar__artifact\[data-active\]\s*\{[^}]*color: var\(--foreground\)[^}]*\}\s*\.desktop-titlebar__artifact:hover\s*\{[^}]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__artifact\[data-active\]\s*\{[^}]*(?:background|border|box-shadow):/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__artifact:hover\s*\{[^}]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__artifact:hover[^{}]*\{[^}]*background-image:/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__artifact:(?:hover|focus-within)[^{]*\.desktop-titlebar__artifact-title\s*\{[^}]*text-decoration/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__artifact\[data-active\][^{]*\.desktop-titlebar__artifact-title\s*\{[^}]*text-decoration/s
    )
  })

  it("keeps navigation icon plates compact without shrinking their hit area", () => {
    expect(styles).toContain(
      "--canvas-desktop-titlebar-icon-plate-size: 1.75rem"
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action\s*\{[^}]*position: relative[^}]*width: var\(--canvas-desktop-titlebar-control-width\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action::before\s*\{[^}]*height: var\(--canvas-desktop-titlebar-icon-plate-size\)[^}]*width: var\(--canvas-desktop-titlebar-icon-plate-size\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action:hover:not\(:disabled\)::before,\s*\.desktop-titlebar__navigation-action\[data-active\]::before\s*\{[^}]*background: var\(--accent\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__navigation-action:hover:not\(:disabled\)\s*\{[^}]*background:/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action:not\(:disabled\),\s*\.desktop-titlebar__artifact-close\s*\{[^}]*cursor: pointer/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__control\s*\{[^}]*cursor: default/s
    )
  })

  it("owns desktop overflow without blocking content gestures", () => {
    expect(styles).toContain("overscroll-behavior: none")
    expect(styles).toMatch(/\.desktop-home\s*\{[^}]*overflow: auto/s)
    expect(styles).toMatch(/\.desktop-runtime\s*\{[^}]*overflow: hidden/s)
    expect(styles).toContain("--canvas-desktop-touch-target-min: 2.75rem")
    expect(styles).toContain("--canvas-desktop-titlebar-height: 2.75rem")
    expect(styles).not.toContain("touch-action:")
    expect(styles).toMatch(
      /\.desktop-titlebar__artifact-title\s*\{[^}]*min-width: 0[^}]*overflow: hidden[^}]*text-overflow: ellipsis[^}]*white-space: nowrap/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__artifacts\s*\{[^}]*overflow-x: auto/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__artifact-close\s*\{[^}]*opacity: 0[^}]*pointer-events: none/s
    )
    expect(styles).toContain(
      ".desktop-titlebar__artifact:hover .desktop-titlebar__artifact-close"
    )
    expect(styles).toContain(".desktop-titlebar__artifact-close:focus-visible")
    expect(styles).not.toContain(
      ".desktop-titlebar__artifact:focus-within .desktop-titlebar__artifact-close"
    )
    expect(styles).not.toContain(
      ".desktop-titlebar__artifact[data-active] .desktop-titlebar__artifact-close"
    )
  })
})
