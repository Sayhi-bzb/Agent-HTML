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

  it("packages Node, CLI, and runtime dependencies as app resources", () => {
    const config = JSON.parse(
      fs.readFileSync(path.join(appRoot, "src-tauri/tauri.conf.json"), "utf8")
    )
    expect(config.bundle.externalBin).toEqual(["binaries/agent-html-runtime"])
    expect(config.bundle.resources).toMatchObject({
      "../runtime/node_modules": "runtime/node_modules",
    })
  })
})
