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
    expect(titleBarSource).toContain("aria-label={`Close ${displayedTitle}`}")
    expect(titleBarSource).toContain(
      "onRequestDeleteArtifact(artifact.filePath)"
    )
    expect(titleBarSource).toContain('aria-label="Agent menu"')
    expect(titleBarSource).toContain('aria-keyshortcuts="Meta+K Control+K"')
    expect(titleBarSource).toContain("<span>Search</span>")
    expect(titleBarSource).not.toContain("Search Artifacts")
    expect(titleBarSource).not.toContain("<kbd")
    expect(titleBarSource).toContain("disabled={!onSearchArtifacts}")
    expect(titleBarSource).toContain(
      'title={activeCodexThreadLabel ?? "New thread"}'
    )
  })

  it("keeps the workspace home concise and hides an empty recent list", () => {
    expect(appSource).toContain('<h1 className="desktop-home__brand">')
    expect(appSource).toContain("<AgentHtmlGhostIcon")
    expect(appSource).toContain("{agentHtmlBrandName}")
    expect(appSource).toContain("Open project")
    expect(appSource).toContain("Create workspace")
    expect(appSource).not.toContain("Preparing ")
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

  it("keeps project loading feedback inside stable control slots", () => {
    expect(appSource).toContain("pendingWorkspaceAction")
    expect(appSource).toContain("desktop-button__icon-slot")
    expect(appSource).toContain("desktop-button__trailing-slot")
    expect(appSource).toContain('className="desktop-spinner"')
    expect(appSource).toContain("aria-busy={pendingWorkspaceAction")
    expect(styles).toMatch(
      /\.desktop-button__icon-slot,[\s\S]*\.desktop-button__trailing-slot\s*\{[^}]*height: 1\.0625rem[^}]*min-width: 1\.0625rem/s
    )
    expect(styles).toMatch(
      /@media \(prefers-reduced-motion: reduce\)[\s\S]*\.desktop-spinner\s*\{[^}]*animation: none/s
    )
  })

  it("routes Artifact search through the Ghost menu and global shortcut", () => {
    expect(appSource).toContain("isArtifactSearchShortcut(event)")
    expect(appSource).toContain('type: "open-artifact-search"')
    expect(appSource).toContain("onSearchArtifacts={() =>")
    expect(titleBarSource).toContain("<DropdownMenu.Item")
    expect(titleBarSource).not.toContain("shortcutLabel")
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-item\[data-highlighted\],[\s\S]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
  })

  it("organizes embedded Canvas utility actions as a standard menu", () => {
    expect(titleBarSource).toContain("<DropdownMenu.Root>")
    expect(titleBarSource).toContain("desktop-titlebar__agent-menu-separator")
    expect(titleBarSource).toContain("<DropdownMenu.Sub>")
    expect(titleBarSource).toContain("<DropdownMenu.RadioGroup")
    expect(titleBarSource).toContain("<DropdownMenu.RadioItem")
    expect(titleBarSource).not.toContain("<DropdownMenu.ItemIndicator>")
    expect(titleBarSource).toContain('aria-label="Theme"')
    expect(titleBarSource).toContain('aria-label="Language"')
    expect(titleBarSource).toContain('href="https://agent-html.org/docs"')
    expect(titleBarSource).toContain(
      'href="https://github.com/Sayhi-bzb/Agent-HTML"'
    )
    expect(appSource).toContain('type: "set-theme-mode"')
    expect(appSource).toContain('type: "set-language"')
    expect(titleBarSource.indexOf("<span>Search</span>")).toBeLessThan(
      titleBarSource.indexOf("<MessageSquareText")
    )
    expect(titleBarSource.indexOf("<MessageSquareText")).toBeLessThan(
      titleBarSource.indexOf("<span>Theme</span>")
    )
    expect(titleBarSource.indexOf("<span>Theme</span>")).toBeLessThan(
      titleBarSource.indexOf("<span>Language</span>")
    )
    expect(titleBarSource.indexOf("<span>Language</span>")).toBeLessThan(
      titleBarSource.indexOf("<span>Documentation</span>")
    )
    expect(titleBarSource.indexOf("<span>Documentation</span>")).toBeLessThan(
      titleBarSource.indexOf("<span>GitHub</span>")
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-separator\s*\{[^}]*background: var\(--border\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-item\s*\{[^}]*display: grid[^}]*min-height: 1\.75rem[^}]*width: 100%/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-content,\s*\.desktop-titlebar__agent-menu-subcontent\s*\{[^}]*border: 1px solid var\(--input\)[^}]*outline: none/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-radio-item\[data-state="checked"\]\s*\{[^}]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-radio-item\s*\{[^}]*grid-template-columns: minmax\(0, 1fr\)/s
    )
    expect(styles).not.toContain("desktop-titlebar__agent-menu-footer")
    expect(styles).not.toContain("desktop-titlebar__agent-menu-icon-action")
    expect(styles).not.toContain(
      "desktop-titlebar__agent-menu-language-popover"
    )
  })

  it("keeps tab hover feedback free of decorative lines", () => {
    expect(styles).toMatch(
      /\.desktop-titlebar__tab\[data-active\]\s*\{[^}]*color: var\(--foreground\)[^}]*\}\s*\.desktop-titlebar__tab:hover\s*\{[^}]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__tab\[data-active\]\s*\{[^}]*(?:background|border|box-shadow):/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__tab:hover\s*\{[^}]*background: var\(--accent\)[^}]*color: var\(--accent-foreground\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__tab:hover[^{}]*\{[^}]*background-image:/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__tab:(?:hover|focus-within)[^{]*\.desktop-titlebar__tab-title\s*\{[^}]*text-decoration/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__tab\[data-active\][^{]*\.desktop-titlebar__tab-title\s*\{[^}]*text-decoration/s
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
      /\.desktop-titlebar__navigation-action svg\s*\{[^}]*height: 1rem[^}]*width: 1rem/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__agent-menu-trigger\[data-state="open"\]::before\s*\{[^}]*background: var\(--accent\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action:hover:not\(:disabled\)::before,\s*\.desktop-titlebar__navigation-action\[data-active\]::before,\s*\.desktop-titlebar__agent-menu-trigger\[data-state="open"\]::before\s*\{[^}]*background: var\(--accent\)/s
    )
    expect(styles).not.toMatch(
      /\.desktop-titlebar__navigation-action:hover:not\(:disabled\)\s*\{[^}]*background:/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__navigation-action:not\(:disabled\),\s*\.desktop-titlebar__tab-close\s*\{[^}]*cursor: pointer/s
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
    expect(styles).toContain("--canvas-desktop-titlebar-height: 2.25rem")
    expect(styles).toContain("--canvas-desktop-titlebar-control-width: 2.5rem")
    expect(styles).not.toContain("touch-action:")
    expect(styles).toMatch(
      /\.desktop-titlebar__tab-title\s*\{[^}]*min-width: 0[^}]*overflow: hidden[^}]*text-overflow: ellipsis[^}]*white-space: nowrap/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__tabs\s*\{[^}]*overflow-x: auto/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__tab-close\s*\{[^}]*opacity: 0[^}]*pointer-events: none/s
    )
    expect(styles).toContain(
      ".desktop-titlebar__tab:hover .desktop-titlebar__tab-close"
    )
    expect(styles).toContain(".desktop-titlebar__tab-close:focus-visible")
    expect(styles).not.toContain(
      ".desktop-titlebar__tab:focus-within .desktop-titlebar__tab-close"
    )
    expect(styles).not.toContain(
      ".desktop-titlebar__tab[data-active] .desktop-titlebar__tab-close"
    )
    expect(styles).not.toContain("desktop-titlebar__thread-close")
  })

  it("uses one fixed geometry for every workspace tab kind", () => {
    expect(styles).toContain("--canvas-desktop-workspace-tab-width: 10rem")
    expect(styles).toMatch(
      /\.desktop-titlebar__tab\s*\{[^}]*flex: 0 0 var\(--canvas-desktop-workspace-tab-width\)[^}]*max-width: var\(--canvas-desktop-workspace-tab-width\)[^}]*min-width: var\(--canvas-desktop-workspace-tab-width\)[^}]*width: var\(--canvas-desktop-workspace-tab-width\)/s
    )
    expect(styles).toMatch(
      /\.desktop-titlebar__tab-input\s*\{[^}]*box-sizing: border-box[^}]*min-width: 0[^}]*width: calc\(100% - 2 \* var\(--canvas-desktop-space-1\)\)/s
    )
  })
})
