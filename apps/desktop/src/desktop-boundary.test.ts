import fs from "node:fs"
import path from "node:path"

import { describe, expect, it } from "vitest"

const appRoot = path.resolve(import.meta.dirname, "..")

describe("desktop package boundary", () => {
  it("does not depend on archive or selected-workspace UI source", () => {
    const files = [
      "src/App.tsx",
      "src/desktop-api.ts",
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
})
