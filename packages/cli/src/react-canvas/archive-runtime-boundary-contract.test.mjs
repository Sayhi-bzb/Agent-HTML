import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import { readSource, root } from "./test-contract-helpers.mjs"

describe("React Canvas archive runtime boundary contract", { timeout: 15000 }, () => {
  it("keeps archived runtime packages outside current workspace ownership", () => {
    const archivedAppPackage = JSON.parse(
      readSource("_archive/apps/agent-html-app/package.json")
    )
    const examplePackage = JSON.parse(
      readSource("_archive/apps/agent-html-example/package.json")
    )
    const runtimePackage = JSON.parse(
      readSource("_archive/packages/agent-html/package.json")
    )

    expect(existsSync(join(root, "apps", "agent-html-app"))).toBe(false)
    expect(existsSync(join(root, "apps", "agent-html-example"))).toBe(false)
    expect(existsSync(join(root, "packages", "agent-html"))).toBe(false)
    expect(archivedAppPackage.version).toBe("0.0.0")
    expect(archivedAppPackage.dependencies.react).toBeTruthy()
    expect(archivedAppPackage.dependencies["@tauri-apps/api"]).toBeTruthy()
    expect(archivedAppPackage.dependencies["@lingui/core"]).toBeTruthy()
    expect(archivedAppPackage.dependencies.cmdk).toBeTruthy()

    expect(examplePackage.version).toBe("0.0.0")
    expect(examplePackage.dependencies.react).toBeTruthy()
    expect(examplePackage.dependencies["@floating-ui/react"]).toBeTruthy()

    expect(runtimePackage.dependencies.react).toBeTruthy()
    expect(runtimePackage.dependencies["@dnd-kit/core"]).toBeTruthy()
    expect(runtimePackage.dependencies.shiki).toBeTruthy()
  })
})
