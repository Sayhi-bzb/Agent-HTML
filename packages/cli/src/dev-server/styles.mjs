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

async function resolveAgentHtmlStyleEntry(root) {
  const agentHtmlRoot = path.join(root, "agent-html")
  const componentsSource = await readFileIfExists(
    path.join(agentHtmlRoot, "components.json")
  )
  const candidates = []

  if (componentsSource) {
    try {
      const components = JSON.parse(componentsSource)
      const configuredCss = components?.tailwind?.css

      if (typeof configuredCss === "string" && configuredCss) {
        candidates.push(path.join(agentHtmlRoot, configuredCss))
      }
    } catch {
      // Fall through to default entry candidates.
    }
  }

  candidates.push(
    path.join(agentHtmlRoot, "styles", "index.css"),
    path.join(agentHtmlRoot, "styles.css")
  )

  for (const candidate of [...new Set(candidates)]) {
    const content = await readFileIfExists(candidate)

    if (content) {
      return { content, path: candidate }
    }
  }

  return null
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
  const styleEntry = await resolveAgentHtmlStyleEntry(root)
  if (!styleEntry) {
    return ""
  }

  const stylePath = styleEntry.path
  const cssBase = path.dirname(stylePath)
  const hostSourcePath = path.relative(cssBase, hostRoot).replaceAll("\\", "/")
  const reactSourcePath = path
    .relative(cssBase, path.join(repoRoot, "packages", "react", "src"))
    .replaceAll("\\", "/")
  const sourceWithRuntimeScan = [
    styleEntry.content,
    `@source "${hostSourcePath}/**/*.{ts,tsx,js,jsx,css}";`,
    `@source "${reactSourcePath}/**/*.{ts,tsx,js,jsx}";`,
  ].join("\n")
  const compiler = await compile(sourceWithRuntimeScan, {
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
