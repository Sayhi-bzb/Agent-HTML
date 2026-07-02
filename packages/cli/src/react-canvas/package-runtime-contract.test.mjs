import { describe, expect, it } from "vitest"

import {
  readSource,
  workspaceRuntimeImports,
} from "./test-contract-helpers.mjs"

describe("React Canvas package runtime contract", { timeout: 15000 }, () => {
  it("keeps root package dependencies out of delegated Canvas runtime ownership", () => {
    const rootPackage = JSON.parse(readSource("package.json"))
    const rootRuntimeDependencies = Object.keys(rootPackage.dependencies ?? {})
    const delegatedRuntimeDependencies = [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@floating-ui/react",
      "@lingui/core",
      "@lingui/react",
      "@shikijs/transformers",
      "@tanstack/react-table",
      "@tailwindcss/vite",
      "@tauri-apps/api",
      "@vitejs/plugin-react",
      "class-variance-authority",
      "clsx",
      "cmdk",
      "embla-carousel-react",
      "lucide-react",
      "media-chrome",
      "radix-ui",
      "react",
      "react-dom",
      "shiki",
      "tailwind-merge",
      "tailwindcss",
      "vite",
      "zod",
    ]

    expect(rootPackage.workspaces).toEqual(["apps/*", "packages/*"])
    expect(rootPackage.dependencies).toEqual({
      "@modelcontextprotocol/sdk": expect.any(String),
    })
    expect(
      rootRuntimeDependencies.filter((dependency) =>
        delegatedRuntimeDependencies.includes(dependency)
      )
    ).toEqual([])
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

    expect(missingWorkspaceDeps).toEqual([])
    expect(missingRuntimeDeps).toEqual([])
    expect(workspaceDepsWithoutRuntime).toEqual([])
  })

  it("keeps package publication boundaries explicit", () => {
    const cliPackage = JSON.parse(readSource("packages/cli/package.json"))
    const reactPackage = JSON.parse(readSource("packages/react/package.json"))

    expect(cliPackage.dependencies["@agent-html/react"]).toBe("0.2.1")
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
