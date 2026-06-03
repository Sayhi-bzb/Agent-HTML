import fs from "node:fs/promises"
import path from "node:path"
import { createRequire } from "node:module"

import { Scanner } from "@tailwindcss/oxide"
import { compile } from "tailwindcss"

import { hostRoot, repoRoot, requireFromRepo } from "./context.mjs"

const requireFromCli = createRequire(import.meta.url)

async function readFileIfExists(filePath) {
  try {
    return await fs.readFile(filePath, "utf8")
  } catch (error) {
    if (error && (error.code === "ENOENT" || error.code === "EISDIR")) {
      return ""
    }

    throw error
  }
}

function resolvePackageStylesheet(id) {
  try {
    return requireFromRepo.resolve(id)
  } catch {
    try {
      return requireFromCli.resolve(id)
    } catch {
      return null
    }
  }
}

async function loadTailwindStylesheet(id, base) {
  const packageRoot = id.startsWith("@")
    ? id.split("/").slice(0, 2).join("/")
    : id.split("/")[0]
  const candidates = [
    id === "tailwindcss"
      ? path.join(repoRoot, "node_modules", "tailwindcss", "index.css")
      : null,
    id === "shadcn/tailwind.css"
      ? path.join(repoRoot, "node_modules", "shadcn", "dist", "tailwind.css")
      : null,
    id === "tw-animate-css"
      ? path.join(
          repoRoot,
          "node_modules",
          "tw-animate-css",
          "dist",
          "tw-animate.css"
        )
      : null,
    resolvePackageStylesheet(id),
    path.resolve(base, id),
    path.resolve(base, `${id}.css`),
    path.join(repoRoot, "node_modules", id),
    path.join(repoRoot, "node_modules", id, "index.css"),
    path.join(repoRoot, "node_modules", packageRoot, "index.css"),
    path.join(repoRoot, "packages", "cli", "node_modules", id, "index.css"),
    path.join(
      repoRoot,
      "packages",
      "cli",
      "node_modules",
      packageRoot,
      "index.css"
    ),
  ].filter(Boolean)

  for (const candidate of candidates) {
    const content = await readFileIfExists(candidate)
    if (content) {
      return {
        base: path.dirname(candidate),
        content,
        path: candidate,
      }
    }
  }

  if (id.startsWith("@fontsource") || id.startsWith("@fontsource-variable")) {
    return {
      base,
      content: "",
      path: path.resolve(base, `${id}.css`),
    }
  }

  throw new Error(`Unable to resolve stylesheet import "${id}" from ${base}`)
}

async function compileAgentHtmlCss(root) {
  const stylePath = path.join(root, ".agent-html", "styles.css")
  const source = await readFileIfExists(stylePath)
  if (!source) {
    return ""
  }

  const cssBase = path.join(root, ".agent-html")
  const hostSourcePath = path.relative(cssBase, hostRoot).replaceAll("\\", "/")
  const sourceWithHostScan = `${source}\n@source "${hostSourcePath}/**/*.{ts,tsx,js,jsx,css}";\n`
  const compiler = await compile(sourceWithHostScan, {
    base: cssBase,
    from: stylePath,
    loadStylesheet: loadTailwindStylesheet,
  })
  const scanner = new Scanner({ sources: compiler.sources })
  return compiler.build(scanner.scan())
}

export async function loadHostStyles(root) {
  const hostCss = await fs.readFile(path.join(hostRoot, "styles.css"), "utf8")
  const artifactCss = await compileAgentHtmlCss(root)
  return `${artifactCss}\n${hostCss}`
}
