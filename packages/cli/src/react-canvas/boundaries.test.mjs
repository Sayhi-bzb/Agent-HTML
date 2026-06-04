import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

const root = process.cwd()

function filesUnder(directory) {
  if (!existsSync(join(root, directory))) {
    return []
  }

  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const absolutePath = join(root, directory, entry.name)
      const relativePath = relative(root, absolutePath).replace(/\\/g, "/")

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "build" ||
          entry.name === "dist"
        ) {
          return []
        }

        return filesUnder(relativePath)
      }

      return statSync(absolutePath).isFile() ? [relativePath] : []
    }
  )
}

function sourceFilesUnder(directory) {
  return filesUnder(directory).filter((file) => /\.(mjs|ts|tsx)$/.test(file))
}

function implementationFilesUnder(directory) {
  return sourceFilesUnder(directory).filter(
    (file) => !/\.(test|spec)\.(mjs|ts|tsx)$/.test(file)
  )
}

function readSource(file) {
  return readFileSync(join(root, file), "utf8")
}

function filesMatching(directory, pattern) {
  return implementationFilesUnder(directory).filter((file) =>
    pattern.test(readSource(file))
  )
}

function importedSpecifiers(source) {
  const imports = []
  const importPattern =
    /import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g
  let match

  while ((match = importPattern.exec(source)) !== null) {
    imports.push(match[1] ?? match[2])
  }

  return imports
}

describe("React Canvas architecture boundaries", { timeout: 15000 }, () => {
  it("keeps the CLI off app, docs, example, and legacy runtime imports", () => {
    const forbidden =
      /from\s+["'](?:apps\/|@\/app\b|@\/app\/|@\/agent-html\b|@\/agent-html\/|packages\/agent-html\/|@example\b|@example\/)|Codex app-server|__agent-html\/render|new Function|transpileModule/

    expect(filesMatching("packages/cli/src", forbidden)).toEqual([])
  })

  it("keeps the CLI host off app aliases while using local React Canvas UI primitives", () => {
    expect(filesMatching("packages/cli/src/host", /from\s+["']@\/[^"']/)).toEqual(
      []
    )
    expect(
      filesMatching(
        "packages/cli/src/host",
        /from\s+["']#agent-html-playground\/(?!(?:ui|theme)\/)/
      )
    ).toEqual([])
    expect(
      filesMatching("packages/cli/src/host", /@agent-html-playground\/ui\//)
    ).toEqual([])
  })

  it("keeps React Canvas surfaces from bypassing local primitives", () => {
    const primitiveBypass = /<(?:button|input|table|thead|tbody|tr|th|td)\b/

    expect(filesMatching(".agent-html/artifacts", primitiveBypass)).toEqual([])
    expect(filesMatching(".agent-html/examples", primitiveBypass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", primitiveBypass)).toEqual([])
  })

  it("keeps artifact and example imports inside the React Canvas playground contract", () => {
    const allowedLocalImport =
      /^\.\.\/(?:ui|hooks|lib|schema|data)(?:\/|$)/
    const forbiddenImport =
      /^(?:@\/|#agent-html-playground\/|@agent-html-playground\/|apps\/|packages\/|@\/app\/|@\/agent-html\/runtime)/

    for (const file of [
      ...implementationFilesUnder(".agent-html/artifacts"),
      ...implementationFilesUnder(".agent-html/examples"),
    ]) {
      const specifiers = importedSpecifiers(readSource(file))
      const invalid = specifiers.filter((specifier) => {
        if (specifier === "@agent-html/react") {
          return false
        }

        if (specifier.startsWith("../")) {
          return !allowedLocalImport.test(specifier)
        }

        return forbiddenImport.test(specifier)
      })

      expect({ file, invalid }).toEqual({ file, invalid: [] })
    }
  })

  it("keeps React Canvas surfaces on semantic token classes", () => {
    const rawSurfaceVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl))/
    const rawArtifactVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl)|text-(?:[3-9]xl|[1-9][0-9]xl)|font-\w+|tracking-\w+|\[[^\]]+\])/

    expect(filesMatching(".agent-html/artifacts", rawArtifactVisualClass)).toEqual([])
    expect(filesMatching(".agent-html/examples", rawArtifactVisualClass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", rawSurfaceVisualClass)).toEqual([])
  })

  it("keeps the React API package independent from host and playground code", () => {
    const forbidden =
      /from\s+["'](?:packages\/cli|apps\/|@\/app\b|@\/app\/|\.agent-html\/|#agent-html-playground\/)/

    expect(filesMatching("packages/react/src", forbidden)).toEqual([])
  })

  it("keeps apps from depending on the React Canvas CLI", () => {
    const forbidden =
      /from\s+["'](?:@agent-html\/cli|packages\/cli\/)|node\s+packages\/cli|agent-html\.mjs/

    expect(filesMatching("apps", forbidden)).toEqual([])
  })

  it("keeps .agent-html as source-only playground content", () => {
    expect(existsSync(join(root, ".agent-html", "package.json"))).toBe(false)
    expect(existsSync(join(root, ".agent-html", "package-lock.json"))).toBe(
      false
    )
    expect(existsSync(join(root, ".agent-html", "node_modules"))).toBe(false)

    expect(filesMatching(".agent-html", /packages\/cli|@agent-html\/cli/)).toEqual(
      []
    )
  })

  it("keeps Canvas theme presets off host sidebar token overrides", () => {
    expect(filesMatching(".agent-html/theme", /"--sidebar(?:-[\w-]+)?"/)).toEqual(
      []
    )
  })

  it("keeps shadcn and TypeScript aliases scoped to their owners", () => {
    const rootComponents = JSON.parse(readSource("components.json"))
    const playgroundComponents = JSON.parse(
      readSource(".agent-html/components.json")
    )
    const playgroundStyles = readSource(".agent-html/styles.css")
    const playgroundTheme = readSource(".agent-html/styles/theme.css")
    const reactCanvasTsconfig = JSON.parse(
      readSource("config/tsconfig/tsconfig.react-canvas.json")
    )

    expect(rootComponents.tailwind.css).toBe("apps/agent-html-app/src/index.css")
    expect(rootComponents.aliases.ui).toBe("@/app/shared/ui")
    expect(playgroundComponents.tailwind.css).toBe("styles.css")
    expect(playgroundComponents.aliases.ui).toBe("@/ui")
    expect(playgroundStyles).toContain('@import "tailwindcss"')
    expect(playgroundStyles).toContain('@import "tw-animate-css"')
    expect(playgroundStyles).toContain('@import "shadcn/tailwind.css"')
    expect(playgroundStyles).toContain('@import "@fontsource-variable/geist"')
    expect(playgroundStyles).toContain("--font-sans: var(--font-sans-source)")
    expect(playgroundStyles).toContain("--font-heading: var(--font-heading-source)")
    expect(playgroundStyles).toContain("--color-background")
    expect(playgroundStyles).toContain("--color-sidebar")
    expect(playgroundStyles).toContain("--radius-lg: var(--radius)")
    expect(playgroundTheme).toContain("--font-sans-source")
    expect(playgroundTheme).toContain("--font-heading-source")
    expect(playgroundTheme).toContain("--radius-base")
    expect(playgroundTheme).toContain("--radius: var(--radius-base)")
    expect(reactCanvasTsconfig.compilerOptions.paths["@/app/*"]).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/*"]
    ).toEqual(["./.agent-html/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/theme/*"]
    ).toEqual(["./.agent-html/theme/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["@agent-html-playground/*"]
    ).toBeUndefined()
  })

  it("keeps React Canvas package ownership explicit", () => {
    const rootPackage = JSON.parse(readSource("package.json"))
    const cliPackage = JSON.parse(readSource("packages/cli/package.json"))
    const reactPackage = JSON.parse(readSource("packages/react/package.json"))
    const appPackage = JSON.parse(readSource("apps/agent-html-app/package.json"))
    const examplePackage = JSON.parse(
      readSource("apps/agent-html-example/package.json")
    )
    const runtimePackage = JSON.parse(
      readSource("packages/agent-html/package.json")
    )
    const rootRuntimeDependencies = Object.keys(rootPackage.dependencies ?? {})
    const delegatedRuntimeDependencies = [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@floating-ui/react",
      "@lingui/core",
      "@lingui/react",
      "@tailwindcss/vite",
      "@tauri-apps/api",
      "@vitejs/plugin-react",
      "class-variance-authority",
      "clsx",
      "cmdk",
      "embla-carousel-react",
      "lucide-react",
      "radix-ui",
      "react",
      "react-dom",
      "recharts",
      "shiki",
      "tailwind-merge",
      "tailwindcss",
      "vite",
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

    expect(cliPackage.dependencies["@agent-html/react"]).toBe("0.0.1")
    expect(cliPackage.dependencies.esbuild).toBeTruthy()
    expect(cliPackage.dependencies.tailwindcss).toBeTruthy()
    expect(cliPackage.dependencies["@tailwindcss/oxide"]).toBeTruthy()
    expect(reactPackage.peerDependencies.react).toBeTruthy()

    expect(appPackage.version).toBe("0.0.0")
    expect(appPackage.dependencies.react).toBeTruthy()
    expect(appPackage.dependencies["@tauri-apps/api"]).toBeTruthy()
    expect(appPackage.dependencies["@lingui/core"]).toBeTruthy()
    expect(appPackage.dependencies.cmdk).toBeTruthy()

    expect(examplePackage.version).toBe("0.0.0")
    expect(examplePackage.dependencies.react).toBeTruthy()
    expect(examplePackage.dependencies["@floating-ui/react"]).toBeTruthy()

    expect(runtimePackage.dependencies.react).toBeTruthy()
    expect(runtimePackage.dependencies["@dnd-kit/core"]).toBeTruthy()
    expect(runtimePackage.dependencies.shiki).toBeTruthy()
  })
})
