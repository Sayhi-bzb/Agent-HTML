import { existsSync } from "node:fs"
import { join } from "node:path"

import { describe, expect, it } from "vitest"

import {
  filesMatching,
  importedSpecifiers,
  implementationFilesUnder,
  readSource,
  root,
  workspaceRuntimeImports,
} from "./test-contract-helpers.mjs"

describe("React Canvas workspace contract", { timeout: 15000 }, () => {
  it("keeps artifact and example imports inside the React Canvas playground contract", () => {
    const allowedLocalImport =
      /^\.\.(?:\/\.\.)*\/(?:components\/(?:ui\/[a-z0-9-]+|[a-z0-9-]+)|hooks|lib|schema|data|assets)(?:\/|$)/
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

  it("keeps agent-html as source-only playground content", () => {
    const playgroundPackage = JSON.parse(readSource("agent-html/package.json"))

    expect(playgroundPackage.name).toBe("@agent-html/react-canvas-workspace")
    expect(playgroundPackage.private).toBe(true)
    expect(playgroundPackage.type).toBe("module")
    expect(playgroundPackage).not.toHaveProperty("scripts")
    expect(playgroundPackage).not.toHaveProperty("devDependencies")
    expect(playgroundPackage.dependencies).toMatchObject({
      "@agent-html/react": expect.any(String),
      "@base-ui/react": expect.any(String),
      "@fontsource-variable/geist": expect.any(String),
      "@dnd-kit/core": expect.any(String),
      "@tanstack/react-table": expect.any(String),
      "class-variance-authority": expect.any(String),
      clsx: expect.any(String),
      "embla-carousel-react": expect.any(String),
      "lucide-react": expect.any(String),
      "maplibre-gl": expect.any(String),
      "media-chrome": expect.any(String),
      "radix-ui": expect.any(String),
      react: expect.any(String),
      "react-dom": expect.any(String),
      recharts: expect.any(String),
      shiki: expect.any(String),
      "tailwind-merge": expect.any(String),
      tailwindcss: expect.any(String),
      "tw-animate-css": expect.any(String),
      zod: expect.any(String),
    })
    expect(
      workspaceRuntimeImports().filter(
        ({ packageName }) => !playgroundPackage.dependencies[packageName]
      )
    ).toEqual([])
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
})
