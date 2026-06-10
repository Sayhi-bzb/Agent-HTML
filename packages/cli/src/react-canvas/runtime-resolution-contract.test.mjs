import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  cacheDirForRoot,
  clearInvalidOptimizedDependencyCache,
  createPlaygroundDependencyAliases,
  createPlaygroundOptimizeDepsInclude,
  createReactModuleResolutionAliases,
  createViteFsAllowList,
  findInvalidOptimizedDependencyCacheFiles,
  isInvalidOptimizedDependencyCacheFile,
  resolvePackageImportModule,
} from "../dev-server/vite.mjs"

describe("React Canvas runtime resolution contract", () => {
  it("pins React module resolution to one canonical renderer instance", () => {
    const aliases = createReactModuleResolutionAliases()

    expect(aliases).toEqual([
      {
        find: "react-dom/client",
        replacement: expect.stringContaining("react-dom"),
      },
      {
        find: "react/jsx-runtime",
        replacement: expect.stringContaining("react"),
      },
      {
        find: "react/jsx-dev-runtime",
        replacement: expect.stringContaining("react"),
      },
      {
        find: /^react$/,
        replacement: expect.stringContaining("react"),
      },
    ])
    expect(aliases.map((alias) => String(alias.find))).toEqual([
      "react-dom/client",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "/^react$/",
    ])
  })

  it("pins playground dependencies outside the source workspace", () => {
    const aliases = createPlaygroundDependencyAliases(process.cwd())
    const radixAlias = aliases.find(
      (alias) => String(alias.find) === "/^radix-ui$/"
    )
    const clsxAlias = aliases.find((alias) => String(alias.find) === "/^clsx$/")
    const tailwindMergeAlias = aliases.find(
      (alias) => String(alias.find) === "/^tailwind-merge$/"
    )
    const cvaAlias = aliases.find(
      (alias) => String(alias.find) === "/^class-variance-authority$/"
    )

    expect(radixAlias).toEqual({
      find: /^radix-ui$/,
      replacement: expect.stringContaining("node_modules"),
    })
    expect(radixAlias.replacement.replaceAll("\\", "/")).not.toContain(
      "/agent-html/node_modules/"
    )
    expect(clsxAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/clsx/dist/clsx.mjs"
    )
    expect(tailwindMergeAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/tailwind-merge/dist/bundle-mjs.mjs"
    )
    expect(cvaAlias.replacement.replaceAll("\\", "/")).toContain(
      "/node_modules/class-variance-authority/dist/index.mjs"
    )
  })

  it("resolves playground package imports with ESM import entries first", () => {
    expect(resolvePackageImportModule("clsx").replaceAll("\\", "/")).toContain(
      "/node_modules/clsx/dist/clsx.mjs"
    )
    expect(
      resolvePackageImportModule("tailwind-merge").replaceAll("\\", "/")
    ).toContain("/node_modules/tailwind-merge/dist/bundle-mjs.mjs")
  })

  it("provides runtime exports used by playground source imports", async () => {
    const runtimeExportChecks = [
      ["class-variance-authority", ["cva"]],
      ["clsx", ["clsx"]],
      ["tailwind-merge", ["twMerge"]],
    ]

    for (const [specifier, exportNames] of runtimeExportChecks) {
      const module = await import(resolvePackageImportModule(specifier))

      for (const exportName of exportNames) {
        expect(module, `${specifier} should export ${exportName}`).toHaveProperty(
          exportName
        )
      }
    }
  })

  it("keeps playground optimize deps explicit and resolvable", () => {
    const optimizeDeps = createPlaygroundOptimizeDepsInclude()

    expect(optimizeDeps).toEqual([
      "react",
      "react/jsx-dev-runtime",
      "react-dom/client",
      "class-variance-authority",
      "clsx",
      "lucide-react",
      "shiki/bundle/web",
      "tailwind-merge",
    ])
    expect(
      optimizeDeps.map((specifier) => [
        specifier,
        resolvePackageImportModule(specifier).replaceAll("\\", "/"),
      ])
    ).toEqual([
      ["react", expect.stringContaining("/node_modules/react/index.js")],
      [
        "react/jsx-dev-runtime",
        expect.stringContaining("/node_modules/react/jsx-dev-runtime.js"),
      ],
      [
        "react-dom/client",
        expect.stringContaining("/node_modules/react-dom/client.js"),
      ],
      [
        "class-variance-authority",
        expect.stringContaining(
          "/node_modules/class-variance-authority/dist/index.mjs"
        ),
      ],
      ["clsx", expect.stringContaining("/node_modules/clsx/dist/clsx.mjs")],
      [
        "lucide-react",
        expect.stringContaining("/node_modules/lucide-react/dist/cjs/lucide-react.js"),
      ],
      [
        "shiki/bundle/web",
        expect.stringContaining("/node_modules/shiki/dist/bundle-web.mjs"),
      ],
      [
        "tailwind-merge",
        expect.stringContaining("/node_modules/tailwind-merge/dist/bundle-mjs.mjs"),
      ],
    ])
  })

  it("detects corrupt optimized dependency cache files", () => {
    expect(isInvalidOptimizedDependencyCacheFile(Buffer.alloc(0))).toBe(true)
    expect(isInvalidOptimizedDependencyCacheFile(Buffer.from([0, 0, 0, 0]))).toBe(
      true
    )
    expect(
      isInvalidOptimizedDependencyCacheFile(
        Buffer.from("export const ok = true;\n", "utf8")
      )
    ).toBe(false)
  })

  it("finds invalid optimized dependency files only under deps", async () => {
    const cacheDir = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-cache-"))
    await fs.mkdir(path.join(cacheDir, "deps"), { recursive: true })
    await fs.writeFile(
      path.join(cacheDir, "deps", "react_jsx-dev-runtime.js"),
      Buffer.alloc(16)
    )
    await fs.writeFile(
      path.join(cacheDir, "deps", "react.js"),
      "export default {}\n"
    )
    await fs.writeFile(path.join(cacheDir, "outside.js"), Buffer.alloc(16))

    await expect(
      findInvalidOptimizedDependencyCacheFiles(cacheDir)
    ).resolves.toEqual([
      path.join(cacheDir, "deps", "react_jsx-dev-runtime.js"),
    ])
  })

  it("clears only the current root optimized dependency cache when corrupt", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-root-"))
    const currentCacheDir = cacheDirForRoot(root)
    const siblingCacheDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "agent-html-cache-sibling-")
    )
    await fs.mkdir(path.join(currentCacheDir, "deps"), { recursive: true })
    await fs.writeFile(
      path.join(currentCacheDir, "deps", "react_jsx-dev-runtime.js"),
      Buffer.alloc(16)
    )
    await fs.writeFile(path.join(siblingCacheDir, "marker.js"), "ok\n")

    await expect(
      clearInvalidOptimizedDependencyCache({ cacheDir: currentCacheDir })
    ).resolves.toMatchObject({
      cleared: true,
      invalidFiles: [
        path.join(currentCacheDir, "deps", "react_jsx-dev-runtime.js"),
      ],
    })
    await expect(fs.stat(currentCacheDir)).rejects.toThrow()
    await expect(
      fs.readFile(path.join(siblingCacheDir, "marker.js"), "utf8")
    ).resolves.toBe("ok\n")
  })

  it("allows workspace, package, and dependency roots without exposing project root", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-deps-"))
    const reactProtocolEntry = path.join(
      root,
      "node_modules",
      "@agent-html",
      "react",
      "src",
      "index.tsx"
    )

    expect(
      createViteFsAllowList({
        reactProtocolEntry,
        root,
      })
    ).toEqual(
      expect.arrayContaining([
        path.resolve(root, "agent-html"),
        path.resolve(root, "node_modules"),
      ])
    )
    expect(
      createViteFsAllowList({
        reactProtocolEntry,
        root,
      })
    ).not.toContain(path.resolve(root))
  })
})
