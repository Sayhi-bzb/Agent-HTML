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
        /from\s+["']#agent-html-playground\/(?!(?:components\/ui|theme)\/)/
      )
    ).toEqual([])
    expect(
      filesMatching("packages/cli/src/host", /@agent-html-playground\/components\/ui\//)
    ).toEqual([])
  })

  it("keeps React Canvas surfaces from bypassing local primitives", () => {
    const primitiveBypass = /<(?:button|input|table|thead|tbody|tr|th|td)\b/

    expect(filesMatching("agent-html/artifacts", primitiveBypass)).toEqual([])
    expect(filesMatching("agent-html/examples", primitiveBypass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", primitiveBypass)).toEqual([])
  })

  it("keeps artifact and example imports inside the React Canvas playground contract", () => {
    const allowedLocalImport =
      /^\.\.(?:\/\.\.)*\/(?:components\/(?:ui|code-block|kanban)|hooks|lib|schema|data|assets)(?:\/|$)/
    const forbiddenImport =
      /^(?:@\/|#agent-html-playground\/|@agent-html-playground\/|apps\/|packages\/|@\/app\/|@\/agent-html\/runtime)/

    for (const file of [
      ...implementationFilesUnder("agent-html/artifacts"),
      ...implementationFilesUnder("agent-html/examples"),
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
    const textSelectionOverride = /selection:(?:bg|text)-/

    expect(filesMatching("agent-html/artifacts", rawArtifactVisualClass)).toEqual([])
    expect(filesMatching("agent-html/examples", rawArtifactVisualClass)).toEqual([])
    expect(filesMatching("packages/cli/src/host", rawSurfaceVisualClass)).toEqual([])
    expect(filesMatching("agent-html", textSelectionOverride)).toEqual([])
    expect(filesMatching("packages/cli/src/host", textSelectionOverride)).toEqual([])
  })

  it("keeps the React API package independent from host and playground code", () => {
    const forbidden =
      /from\s+["'](?:packages\/cli|apps\/|@\/app\b|@\/app\/|\agent-html\/|#agent-html-playground\/)/

    expect(filesMatching("packages/react/src", forbidden)).toEqual([])
  })

  it("keeps apps from depending on the React Canvas CLI", () => {
    const forbidden =
      /from\s+["'](?:@agent-html\/cli|packages\/cli\/)|node\s+packages\/cli|agent-html\.mjs/

    expect(filesMatching("apps", forbidden)).toEqual([])
  })

  it("keeps agent-html as source-only playground content", () => {
    const playgroundPackage = JSON.parse(
      readFileSync(join(root, "agent-html", "package.json"), "utf8")
    )

    expect(playgroundPackage).toEqual({
      dependencies: {
        "@base-ui/react": "^1.5.0",
        "@dnd-kit/core": "^6.3.1",
        "@dnd-kit/modifiers": "^9.0.0",
        "@dnd-kit/sortable": "^10.0.0",
        "@dnd-kit/utilities": "^3.2.2",
        "@shikijs/transformers": "^4.1.0",
        cmdk: "^1.1.1",
        "date-fns": "^4.4.0",
        "embla-carousel-react": "^8.6.0",
        "input-otp": "^1.4.2",
        "radix-ui": "^1.4.3",
        "react-day-picker": "^10.0.1",
        "react-resizable-panels": "^4.11.2",
        recharts: "^3.8.1",
        shiki: "^4.1.0",
        vaul: "^1.1.2",
      },
      name: "@agent-html/react-canvas-workspace",
      private: true,
      type: "module",
    })
    expect(existsSync(join(root, "agent-html", "package-lock.json"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "pnpm-lock.yaml"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "yarn.lock"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "manifest.json"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "node_modules"))).toBe(false)
    expect(existsSync(join(root, "agent-html", ".vite"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "dist"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "build"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "assets"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "public"))).toBe(true)

    expect(filesMatching("agent-html", /packages\/cli|@agent-html\/cli/)).toEqual(
      []
    )
    expect(filesMatching("agent-html/artifacts", /from\s+["']\.\.\/public(?:\/|["'])/)).toEqual(
      []
    )
    expect(filesMatching("agent-html/examples", /from\s+["']\.\.\/public(?:\/|["'])/)).toEqual(
      []
    )
  })

  it("keeps Canvas theme presets off host sidebar token overrides", () => {
    expect(filesMatching("agent-html/theme", /"--sidebar(?:-[\w-]+)?"/)).toEqual(
      []
    )
  })

  it("keeps shadcn and TypeScript aliases scoped to their owners", () => {
    const rootComponents = JSON.parse(readSource("components.json"))
    const playgroundComponents = JSON.parse(
      readSource("agent-html/components.json")
    )
    const playgroundStyles = readSource("agent-html/styles/index.css")
    const playgroundBaseStyles = readSource("agent-html/styles/base.css")
    const playgroundTailwindTokens = readSource(
      "agent-html/styles/tokens/tailwind.css"
    )
    const playgroundFoundationTokens = readSource(
      "agent-html/styles/tokens/foundation.css"
    )
    const playgroundArtifactTokens = readSource(
      "agent-html/styles/tokens/artifact.css"
    )
    const playgroundHostTokens = readSource(
      "agent-html/styles/tokens/host.css"
    )
    const playgroundContentTokens = readSource(
      "agent-html/styles/tokens/content.css"
    )
    const playgroundThemeEditorTokens = readSource(
      "agent-html/styles/tokens/theme-editor.css"
    )
    const playgroundArtifactInternal = readSource(
      "agent-html/styles/internal/artifact.css"
    )
    const playgroundCodeBlockInternal = readSource(
      "agent-html/styles/internal/code-block.css"
    )
    const playgroundHostInternal = readSource(
      "agent-html/styles/internal/host.css"
    )
    const playgroundContent = readSource("agent-html/styles/content.css")
    const playgroundThemeEditorInternal = readSource(
      "agent-html/styles/internal/theme-editor.css"
    )
    const canvasMessageStore = readSource(
      "packages/cli/src/host/canvas-message-store.ts"
    )
    const canvasHostApp = readSource("packages/cli/src/host/app.tsx")
    const canvasInteractionStore = readSource(
      "packages/cli/src/host/interaction-store.ts"
    )
    const floatingPrompt = readSource(
      "packages/cli/src/host/floating-prompt.tsx"
    )
    const reactCanvasTsconfig = JSON.parse(
      readSource("config/tsconfig/tsconfig.react-canvas.json")
    )

    expect(rootComponents.tailwind.css).toBe("agent-html/styles/index.css")
    expect(rootComponents.aliases.ui).toBe("@/ui")
    expect(existsSync(join(root, "agent-html", "components.json"))).toBe(true)
    expect(existsSync(join(root, "agent-html", "tsconfig.json"))).toBe(true)
    expect(playgroundComponents.tailwind.css).toBe("styles/index.css")
    expect(playgroundComponents.aliases.components).toBe("@/components")
    expect(playgroundComponents.aliases.ui).toBe("@/components/ui")
    expect(existsSync(join(root, "agent-html", "styles.css"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "theme.css"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "features"))).toBe(
      false
    )
    expect(existsSync(join(root, "agent-html", "styles", "use"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "system"))).toBe(false)
    expect(existsSync(join(root, "agent-html", "styles", "bridge"))).toBe(false)
    expect(playgroundStyles).toContain('@import "tailwindcss"')
    expect(playgroundStyles).toContain('@import "tw-animate-css"')
    expect(playgroundStyles).toContain('@import "shadcn/tailwind.css"')
    expect(playgroundStyles).toContain('@import "@fontsource-variable/geist"')
    expect(playgroundStyles).toContain('@import "./tokens/index.css"')
    expect(playgroundStyles).toContain('@import "./tokens/tailwind.css"')
    expect(playgroundStyles).toContain('@import "./content.css"')
    expect(playgroundStyles).toContain('@import "./internal/code-block.css"')
    expect(playgroundStyles).toContain('@import "./internal/artifact.css"')
    expect(playgroundStyles).toContain('@import "./internal/host.css"')
    expect(playgroundStyles).toContain('@import "./internal/theme-editor.css"')
    expect(playgroundBaseStyles).toContain("::selection")
    expect(playgroundBaseStyles).toContain(
      "background: var(--agent-html-text-selection-background)"
    )
    expect(playgroundBaseStyles).toContain(
      "color: var(--agent-html-text-selection-foreground)"
    )
    expect(playgroundTailwindTokens).toContain("--font-sans: var(--font-sans)")
    expect(playgroundTailwindTokens).toContain(
      "--font-heading: var(--font-heading)"
    )
    expect(playgroundTailwindTokens).toContain("--color-background")
    expect(playgroundTailwindTokens).toContain("--color-sidebar")
    expect(playgroundTailwindTokens).toContain("--radius-lg: var(--radius)")
    expect(playgroundFoundationTokens).toContain("--font-sans")
    expect(playgroundFoundationTokens).toContain("--font-heading")
    expect(playgroundFoundationTokens).not.toContain("--font-sans-source")
    expect(playgroundFoundationTokens).not.toContain("--font-heading-source")
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-color\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-opacity\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-x\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-y\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-blur\s*:/)
    expect(playgroundFoundationTokens).not.toMatch(/--shadow-spread\s*:/)
    expect(playgroundFoundationTokens).toContain(
      "--agent-html-text-selection-background"
    )
    expect(playgroundFoundationTokens).toContain(
      "--agent-html-text-selection-foreground"
    )
    expect(playgroundFoundationTokens).toContain("--radius: 0.625rem")
    expect(playgroundFoundationTokens).not.toContain("--radius-base")
    expect(playgroundArtifactTokens).toContain("--canvas-artifact-max-width")
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-background"
    )
    expect(playgroundArtifactTokens).not.toContain(
      "--canvas-artifact-foreground"
    )
    expect(playgroundHostTokens).toContain("--canvas-surface-padding-inline")
    expect(playgroundHostTokens).toContain("--canvas-floating-prompt-width")
    expect(playgroundHostTokens).toContain(
      "--canvas-floating-prompt-backdrop-blur"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-block-highlight-radius"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-block-action-shadow"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-sidebar-select-padding"
    )
    expect(playgroundHostTokens).not.toContain(
      "--canvas-sidebar-select-item-padding-block"
    )
    expect(playgroundContentTokens).toContain("--canvas-content-gap-md")
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-panel-radius"
    )
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-panel-border"
    )
    expect(playgroundContentTokens).not.toContain(
      "--canvas-content-icon-box-radius"
    )
    expect(playgroundThemeEditorTokens).toContain(
      "--canvas-theme-editor-popover-width-lg"
    )
    expect(playgroundArtifactInternal).toContain(".agent-html-artifact")
    expect(playgroundCodeBlockInternal).toContain(".canvas-code-block")
    expect(playgroundHostInternal).toContain(".canvas-surface-frame")
    expect(playgroundHostInternal).toContain(".canvas-floating-prompt")
    expect(playgroundHostInternal).not.toContain(
      ".canvas-floating-prompt-composer"
    )
    expect(playgroundContent).toContain(".canvas-stack-md")
    expect(playgroundContent).toContain(".canvas-content-panel")
    expect(playgroundContent).toContain(".canvas-text-body")
    expect(playgroundThemeEditorInternal).toContain(
      ".canvas-theme-editor-option"
    )
    expect(canvasMessageStore).toContain("CanvasMessageHostSnapshot")
    expect(canvasMessageStore).toContain("subscribeCanvasMessageHost")
    expect(canvasHostApp).toContain("fetchBlockImplementation")
    expect(canvasHostApp).toContain("getCanvasInteractionSnapshot")
    expect(canvasHostApp).not.toContain("useArtifactInteraction")
    expect(canvasInteractionStore).toContain("agent-html:state-change")
    expect(canvasInteractionStore).toContain("recordCanvasInteractionChange")
    expect(floatingPrompt).toContain("value: string")
    expect(floatingPrompt).toContain("onDraftChange: (draft: string) => void")
    expect(floatingPrompt).not.toContain('React.useState("")')
    expect(reactCanvasTsconfig.compilerOptions.paths["@/app/*"]).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/*"]
    ).toEqual(["./agent-html/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/theme/*"]
    ).toEqual(["./agent-html/theme/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths[
        "#agent-html-playground/components/ui/*"
      ]
    ).toEqual(["./agent-html/components/ui/*"])
    expect(
      reactCanvasTsconfig.compilerOptions.paths["#agent-html-playground/ui/*"]
    ).toBeUndefined()
    expect(
      reactCanvasTsconfig.compilerOptions.paths["@agent-html-playground/*"]
    ).toBeUndefined()
  })

  it("keeps React Canvas package ownership explicit", () => {
    const rootPackage = JSON.parse(readSource("package.json"))
    const cliPackage = JSON.parse(readSource("packages/cli/package.json"))
    const reactPackage = JSON.parse(readSource("packages/react/package.json"))
    const archivedAppPackage = JSON.parse(
      readSource("_archive/apps/agent-html-app/package.json")
    )
    const examplePackage = JSON.parse(
      readSource("_archive/apps/agent-html-example/package.json")
    )
    const runtimePackage = JSON.parse(
      readSource("_archive/packages/agent-html/package.json")
    )
    const rootRuntimeDependencies = Object.keys(rootPackage.dependencies ?? {})
    const delegatedRuntimeDependencies = [
      "@dnd-kit/core",
      "@dnd-kit/sortable",
      "@dnd-kit/utilities",
      "@floating-ui/react",
      "@lingui/core",
      "@lingui/react",
      "@shikijs/transformers",
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
    expect(cliPackage.dependencies["@shikijs/transformers"]).toBeTruthy()
    expect(cliPackage.dependencies.esbuild).toBeUndefined()
    expect(cliPackage.dependencies.vite).toBeTruthy()
    expect(cliPackage.dependencies["@vitejs/plugin-react"]).toBeTruthy()
    expect(cliPackage.dependencies.tailwindcss).toBeTruthy()
    expect(cliPackage.dependencies["@tailwindcss/oxide"]).toBeTruthy()
    expect(reactPackage.peerDependencies.react).toBeTruthy()

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

  it("keeps React Canvas source helpers split by pipeline ownership", () => {
    expect(existsSync(join(root, "packages/cli/src/react-canvas/source.mjs"))).toBe(
      false
    )
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/block-tags.mjs"))
    ).toBe(true)
    expect(
      existsSync(
        join(root, "packages/cli/src/react-canvas/block-implementation.mjs")
      )
    ).toBe(true)
    expect(
      existsSync(join(root, "packages/cli/src/react-canvas/workspace-file.mjs"))
    ).toBe(true)
  })
})
