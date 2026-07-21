import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const appRoot = path.resolve(import.meta.dirname, "..")

describe("desktop package boundary", () => {
  it("does not depend on archive or selected-workspace UI source", () => {
    const files = [
      "src/App.tsx",
      "src/desktop-api.ts",
      "src/desktop-window.ts",
      "src/title-bar.tsx",
      "src/ui.tsx",
      "src-tauri/src/lib.rs",
      "src-tauri/src/runtime.rs",
    ]
    for (const file of files) {
      const source = fs.readFileSync(path.join(appRoot, file), "utf8")
      expect(source, file).not.toContain("_archive")
      expect(source, file).not.toContain("agent-html/components/ui")
    }
  })

  it("packages an immutable runtime seed without staging it during dev", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(appRoot, "src-tauri/tauri.conf.json"), "utf8")
    )
    expect(config.bundle).not.toHaveProperty("externalBin")
    expect(config.bundle.resources).toEqual({
      "../runtime-bundle": "runtime",
    })
    expect(config.build.beforeDevCommand).toBe(
      "npm run runtime:ensure && npm run dev"
    )
    expect(config.build.beforeBuildCommand).toContain("npm run runtime:stage")
  })

  it("uses a custom title bar with the minimum window permissions", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(appRoot, "src-tauri/tauri.conf.json"), "utf8")
    )
    const capability = JSON.parse(
      fs.readFileSync(
        path.join(appRoot, "src-tauri/capabilities/default.json"),
        "utf8"
      )
    )

    expect(config.app.windows[0].decorations).toBe(false)
    expect(config.app.security.csp).toContain(
      "style-src 'self' 'unsafe-inline' http://127.0.0.1:*"
    )
    expect(config.app.security.csp).toContain(
      "font-src 'self' data: http://127.0.0.1:*"
    )
    expect(config.app.security.csp).not.toContain("fonts.googleapis.com")
    expect(config.app.security.csp).not.toContain("fonts.gstatic.com")
    expect(config.app.security.csp).not.toContain("fontsapi.zeoseven.com")
    expect(capability.permissions).toEqual(
      expect.arrayContaining([
        "core:window:allow-close",
        "core:window:allow-minimize",
        "core:window:allow-start-dragging",
        "core:window:allow-toggle-maximize",
      ])
    )
  })

  it("does not expose the removed settings surface or its IPC commands", () => {
    const appSource = fs.readFileSync(path.join(appRoot, "src/App.tsx"), "utf8")
    const apiSource = fs.readFileSync(
      path.join(appRoot, "src/desktop-api.ts"),
      "utf8"
    )
    const rustSource = fs.readFileSync(
      path.join(appRoot, "src-tauri/src/lib.rs"),
      "utf8"
    )

    for (const source of [appSource, apiSource, rustSource]) {
      expect(source).not.toContain("save_preferences")
      expect(source).not.toContain("show_runtime_log")
    }
    expect(appSource).not.toContain("SettingsDialog")
    expect(apiSource).not.toContain("savePreferences")
    expect(apiSource).not.toContain("showLog")
    expect(apiSource).not.toContain("logPath")
    expect(apiSource).not.toContain("version: string")
  })
})
