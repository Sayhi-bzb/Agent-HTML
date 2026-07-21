import { describe, expect, it } from "vitest"

import { canvasRuntimeCatalog } from "@agent-html/kernel"

import {
  readSource,
  workspaceRuntimeImports,
} from "./test-contract-helpers.mjs"
import { resolvePackageImportModule } from "../dev-server/vite.mjs"

describe("React Canvas package runtime contract", { timeout: 15000 }, () => {
  it("keeps the private root package free of runtime dependencies", () => {
    const rootPackage = JSON.parse(readSource("package.json"))

    expect(rootPackage.workspaces).toEqual(["apps/*", "packages/*"])
    expect(rootPackage.dependencies ?? {}).toEqual({})
  })

  it("keeps workspace runtime imports declared by the workspace and supplied by the CLI", () => {
    const cliPackage = JSON.parse(readSource("packages/cli/package.json"))
    const playgroundPackage = JSON.parse(readSource("agent-html/package.json"))
    const imports = workspaceRuntimeImports()
    const missingWorkspaceDeps = imports.filter(
      ({ packageName }) => !playgroundPackage.dependencies[packageName]
    )
    const missingRuntimeDeps = imports.filter(
      ({ packageName }) => !cliPackage.dependencies[packageName]
    )
    const workspaceDepsWithoutRuntime = Object.keys(
      playgroundPackage.dependencies
    ).filter((dependency) => !cliPackage.dependencies[dependency])
    const unresolvableRuntimeImports = imports
      .filter(({ file }) => !file.endsWith(".css"))
      .filter(({ specifier }) => {
        try {
          resolvePackageImportModule(specifier)
          return false
        } catch {
          return true
        }
      })

    expect(missingWorkspaceDeps).toEqual([])
    expect(missingRuntimeDeps).toEqual([])
    expect(workspaceDepsWithoutRuntime).toEqual([])
    expect(unresolvableRuntimeImports).toEqual([])
    expect(playgroundPackage.dependencies).toEqual(canvasRuntimeCatalog)
    expect(
      Object.fromEntries(
        Object.keys(canvasRuntimeCatalog).map((dependency) => [
          dependency,
          cliPackage.dependencies[dependency],
        ])
      )
    ).toEqual(canvasRuntimeCatalog)
  })

  it("keeps package publication boundaries explicit", () => {
    const cliPackage = JSON.parse(readSource("packages/cli/package.json"))
    const reactPackage = JSON.parse(readSource("packages/react/package.json"))

    expect(cliPackage.dependencies["@agent-html/react"]).toBe("0.3.0")
    expect(cliPackage.dependencies["@agent-html/kernel"]).toBe("0.3.0")
    expect(cliPackage.dependencies["@shikijs/transformers"]).toBeTruthy()
    expect(cliPackage.dependencies["@tanstack/react-table"]).toBeTruthy()
    expect(cliPackage.dependencies.esbuild).toBeUndefined()
    expect(cliPackage.dependencies.vite).toBeTruthy()
    expect(cliPackage.dependencies["@vitejs/plugin-react"]).toBeTruthy()
    expect(cliPackage.dependencies.tailwindcss).toBeTruthy()
    expect(cliPackage.dependencies["@tailwindcss/oxide"]).toBeTruthy()
    expect(cliPackage.dependencies.shadcn).toBeTruthy()
    expect(cliPackage.dependencies["class-variance-authority"]).toBeTruthy()
    expect(cliPackage.dependencies.clsx).toBeTruthy()
    expect(cliPackage.dependencies["maplibre-gl"]).toBeTruthy()
    expect(cliPackage.dependencies["media-chrome"]).toBeTruthy()
    expect(cliPackage.dependencies.shiki).toBeTruthy()
    expect(cliPackage.dependencies["tailwind-merge"]).toBeTruthy()
    expect(cliPackage.files).toContain("src/**/*.html")
    expect(cliPackage.files).toContain("src/**/*.css")
    expect(cliPackage.files).toContain("!src/**/*.test.tsx")
    expect(reactPackage.files).toContain("!src/**/*.test.tsx")
    expect(reactPackage.peerDependencies.react).toBeTruthy()
  })
})
