import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  cacheDirForRoot,
  clearInvalidOptimizedDependencyCache,
  createPlaygroundDependencyAliases,
  createPlaygroundDependencyResolver,
  createPlaygroundOptimizeDepsInclude,
  createReactModuleResolutionAliases,
  createViteFsAllowList,
  findInvalidOptimizedDependencyCacheFiles,
  isInvalidOptimizedDependencyCacheFile,
  readRuntimeDependencyContract,
  resolvePackageImportModule,
} from "../dev-server/vite.mjs"
import { packageNameFromImport } from "../dev-server/runtime-dependency-contract.mjs"

describe("React Canvas runtime resolution contract", () => {
  it("pins React module resolution to one canonical renderer instance", () => {
    const aliases = createReactModuleResolutionAliases()

    expect(aliases).toEqual([
      {
        find: "react-dom/client",
        replacement: expect.stringContaining("react-dom"),
      },
      {
        find: /^react-dom$/,
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
      "/^react-dom$/",
      "react/jsx-runtime",
      "react/jsx-dev-runtime",
      "/^react$/",
    ])
  })

  it("resolves declared package roots and subpaths from the CLI runtime", async () => {
    const resolver = createPlaygroundDependencyResolver(process.cwd())
    const resolveFromRuntime = async (source) => ({
      id: resolvePackageImportModule(source),
    })
    const context = { resolve: resolveFromRuntime }

    expect(resolver).toMatchObject({
      enforce: "pre",
      name: "agent-html-playground-dependencies",
    })
    const mergeProps = await resolver.resolveId.call(
      context,
      "@base-ui/react/merge-props",
      path.join(process.cwd(), "agent-html", "components", "timeline.tsx"),
      {}
    )
    const useRender = await resolver.resolveId.call(
      context,
      "@base-ui/react/use-render",
      path.join(process.cwd(), "agent-html", "components", "timeline.tsx"),
      {}
    )
    const classnames = await resolver.resolveId.call(
      context,
      "classnames",
      path.join(
        process.cwd(),
        "node_modules",
        "@visx",
        "shape",
        "esm",
        "shapes",
        "Area.js"
      ),
      {}
    )

    expect(mergeProps).toBeNull()
    expect(useRender).toBeNull()
    expect(classnames).toBeNull()
    await expect(
      resolver.resolveId.call(
        context,
        "react/jsx-runtime",
        path.join(process.cwd(), "agent-html", "components", "timeline.tsx"),
        {}
      )
    ).resolves.toBeNull()
    await expect(
      resolver.resolveId.call(
        context,
        "not-declared",
        path.join(process.cwd(), "agent-html", "components", "timeline.tsx"),
        {}
      )
    ).rejects.toThrow(
      'Canvas source imports undeclared dependency "not-declared"'
    )
  })

  it("keeps older workspaces compatible with canonical template dependencies", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-legacy-"))
    const canvasRoot = path.join(root, "agent-html")
    await fs.mkdir(canvasRoot, { recursive: true })
    await fs.writeFile(
      path.join(canvasRoot, "package.json"),
      JSON.stringify({
        dependencies: {
          clsx: "^2.1.1",
        },
      })
    )
    const resolver = createPlaygroundDependencyResolver(root)
    const context = {
      resolve: async (source) => ({
        id: resolvePackageImportModule(source),
      }),
    }

    await expect(
      resolver.resolveId.call(
        context,
        "@visx/curve",
        path.join(canvasRoot, "components", "chart", "area-chart.tsx"),
        {}
      )
    ).resolves.toBeNull()
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
        expect(
          module,
          `${specifier} should export ${exportName}`
        ).toHaveProperty(exportName)
      }
    }
  })

  it("keeps playground optimize deps explicit and resolvable", () => {
    const contract = readRuntimeDependencyContract()
    const aliases = createPlaygroundDependencyAliases(contract)
    const optimizeDeps = createPlaygroundOptimizeDepsInclude(contract)

    expect(contract.version).toBe(2)
    expect(contract.digest).toMatch(/^[a-f\d]{64}$/)
    expect(optimizeDeps).toEqual(
      contract.browserEntries.filter(
        (entry) => !["@agent-html/react", "react", "react-dom"].includes(
          entry.split("/").slice(0, entry.startsWith("@") ? 2 : 1).join("/")
        )
      )
    )
    expect(optimizeDeps).toEqual(
      expect.arrayContaining(["@visx/axis", "@visx/text"].filter((entry) =>
        contract.browserEntries.includes(entry)
      ))
    )
    expect(optimizeDeps).toContain("@visx/axis")
    expect(optimizeDeps).toContain("@visx/xychart")
    expect(contract.styleEntries).toContain("maplibre-gl/dist/maplibre-gl.css")
    expect(aliases.map((alias) => alias.replacement)).toEqual(
      expect.arrayContaining([
        expect.stringContaining(path.join("node_modules", "@visx", "axis")),
      ])
    )
  })

  it("classifies every declared Canvas dependency into the browser contract", () => {
    const contract = readRuntimeDependencyContract()
    const coveredPackages = new Set(
      [...contract.browserEntries, ...contract.styleEntries]
        .map(packageNameFromImport)
        .filter(Boolean)
    )

    expect([...coveredPackages].sort()).toEqual(
      [...contract.canvasDependencies].sort()
    )
  })

  it("loads dependency ownership and prebundling from the runtime manifest", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-manifest-"))
    const manifestPath = path.join(root, "runtime-manifest.json")
    await fs.writeFile(
      manifestPath,
      JSON.stringify({
        dependencyContractVersion: 2,
        dependencyContractDigest: "digest",
        canvasDependencies: ["@visx/curve"],
        browserEntries: ["@visx/curve"],
        styleEntries: ["maplibre-gl/dist/maplibre-gl.css"],
      })
    )

    expect(readRuntimeDependencyContract(manifestPath)).toEqual({
      browserEntries: ["@visx/curve"],
      canvasDependencies: ["@visx/curve"],
      digest: "digest",
      styleEntries: ["maplibre-gl/dist/maplibre-gl.css"],
      version: 2,
    })
    expect(
      createPlaygroundOptimizeDepsInclude(
        readRuntimeDependencyContract(manifestPath)
      )
    ).toEqual(["@visx/curve"])
  })

  it("detects corrupt optimized dependency cache files", () => {
    expect(isInvalidOptimizedDependencyCacheFile(Buffer.alloc(0))).toBe(true)
    expect(
      isInvalidOptimizedDependencyCacheFile(Buffer.from([0, 0, 0, 0]))
    ).toBe(true)
    expect(
      isInvalidOptimizedDependencyCacheFile(
        Buffer.from("export const ok = true;\n", "utf8")
      )
    ).toBe(false)
  })

  it("finds invalid optimized dependency files only under deps", async () => {
    const cacheDir = await fs.mkdtemp(
      path.join(os.tmpdir(), "agent-html-cache-")
    )
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

  it("versions the Vite cache when dependency interop changes", () => {
    expect(cacheDirForRoot(process.cwd()).replaceAll("\\", "/")).toContain(
      "/agent-html-vite-v6/"
    )
    expect(cacheDirForRoot(process.cwd(), "runtime-a")).not.toBe(
      cacheDirForRoot(process.cwd(), "runtime-b")
    )
    expect(cacheDirForRoot("D:\\workspace-a", "runtime-a")).toBe(
      cacheDirForRoot("D:\\workspace-b", "runtime-a")
    )
    expect(cacheDirForRoot("D:\\workspace-a", "source")).not.toBe(
      cacheDirForRoot("D:\\workspace-b", "source")
    )
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
