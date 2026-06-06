import path from "node:path"
import { createRequire } from "node:module"
import { existsSync } from "node:fs"
import { fileURLToPath } from "node:url"

export const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)
export const repoRoot = path.resolve(packageRoot, "..", "..")
export const hostRoot = path.join(packageRoot, "src", "host")
export const requireFromPackage = createRequire(
  path.join(packageRoot, "package.json")
)
export const requireFromRepo = createRequire(path.join(repoRoot, "package.json"))

export function resolvePackageModule(specifier) {
  try {
    return requireFromPackage.resolve(specifier)
  } catch {
    return requireFromRepo.resolve(specifier)
  }
}

export function resolveWorkspaceTemplateRoot() {
  const packageTemplateRoot = path.join(packageRoot, "template", "agent-html")

  if (existsSync(packageTemplateRoot)) {
    return packageTemplateRoot
  }

  return path.join(repoRoot, "agent-html")
}
