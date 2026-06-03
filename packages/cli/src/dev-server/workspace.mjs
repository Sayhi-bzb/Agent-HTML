import path from "node:path"

import { requireFromRepo } from "./context.mjs"

export function assertInsideWorkspace(root, filePath) {
  const absoluteRoot = path.resolve(root)
  const absolutePath = path.resolve(root, filePath)

  if (!absolutePath.startsWith(absoluteRoot)) {
    throw new Error("Artifact path must stay inside workspace root")
  }

  return absolutePath
}

export function resolveLocalModuleFromDir(baseDir, specifier) {
  const base = path.resolve(baseDir, specifier)
  const candidates = [
    base,
    `${base}.tsx`,
    `${base}.ts`,
    `${base}.jsx`,
    `${base}.js`,
    `${base}.json`,
    path.join(base, "index.tsx"),
    path.join(base, "index.ts"),
  ]

  for (const candidate of candidates) {
    try {
      return requireFromRepo.resolve(candidate)
    } catch {
      continue
    }
  }

  return null
}

export function resolveAgentHtmlModule(root, specifier) {
  const agentHtmlSpecifier = specifier.replace(
    /^#agent-html-playground\//,
    ""
  )
  const resolvedPath = resolveLocalModuleFromDir(
    path.join(root, ".agent-html"),
    `./${agentHtmlSpecifier.replace(/^@\//, "")}`
  )

  if (!resolvedPath) {
    throw new Error(`Unable to resolve ${specifier} from .agent-html`)
  }

  return resolvedPath
}
