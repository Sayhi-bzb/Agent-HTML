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
        if (entry.name === "node_modules") {
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

function filesMatchingExcept(directory, pattern, allowedFiles) {
  return filesMatching(directory, pattern).filter(
    (file) => !allowedFiles.includes(file)
  )
}

describe("React Canvas architecture boundaries", () => {
  it("keeps the CLI off app, docs, example, and legacy runtime imports", () => {
    const forbidden =
      /from\s+["'](?:apps\/|@\/app\b|@\/app\/|@\/agent-html\b|@\/agent-html\/|packages\/agent-html\/|@example\b|@example\/)|Codex app-server|__agent-html\/render|new Function|transpileModule/

    expect(filesMatching("packages/cli/src", forbidden)).toEqual([])
  })

  it("keeps the CLI host off app and playground aliases", () => {
    expect(filesMatching("packages/cli/src/host", /from\s+["']@\/[^"']/)).toEqual(
      []
    )
    expect(
      filesMatching("packages/cli/src/host", /#agent-html-playground\/ui\//)
    ).toEqual([])
    expect(
      filesMatching("packages/cli/src/host", /@agent-html-playground\/ui\//)
    ).toEqual([])
  })

  it("keeps React Canvas surfaces from bypassing local primitives", () => {
    const primitiveBypass = /<(?:button|input|table|thead|tbody|tr|th|td)\b/

    expect(filesMatching(".agent-html/artifacts", primitiveBypass)).toEqual([])
    expect(filesMatching(".agent-html/examples", primitiveBypass)).toEqual([])
    expect(
      filesMatchingExcept("packages/cli/src/host", primitiveBypass, [
        "packages/cli/src/host/ui.tsx",
      ])
    ).toEqual([])
  })

  it("keeps React Canvas surfaces on semantic token classes", () => {
    const rawVisualClass =
      /className=["'][^"']*(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}|className=["'][^"']*(?:shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl))/

    expect(filesMatching(".agent-html/artifacts", rawVisualClass)).toEqual([])
    expect(filesMatching(".agent-html/examples", rawVisualClass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", rawVisualClass)).toEqual([])
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

  it("keeps shadcn and TypeScript aliases scoped to their owners", () => {
    const rootComponents = JSON.parse(readSource("components.json"))
    const playgroundComponents = JSON.parse(
      readSource(".agent-html/components.json")
    )
    const reactCanvasTsconfig = JSON.parse(
      readSource("config/tsconfig/tsconfig.react-canvas.json")
    )

    expect(rootComponents.tailwind.css).toBe("apps/agent-html-app/src/index.css")
    expect(rootComponents.aliases.ui).toBe("@/app/shared/ui")
    expect(playgroundComponents.tailwind.css).toBe("styles.css")
    expect(playgroundComponents.aliases.ui).toBe("@/ui")
    expect(reactCanvasTsconfig.compilerOptions.paths["@/app/*"]).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/*"]
    ).toEqual(["./.agent-html/*"])
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
