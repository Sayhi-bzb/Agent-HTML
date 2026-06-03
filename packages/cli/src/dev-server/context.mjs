import path from "node:path"
import { createRequire } from "node:module"
import { fileURLToPath } from "node:url"

export const packageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  ".."
)
export const repoRoot = path.resolve(packageRoot, "..", "..")
export const hostRoot = path.join(packageRoot, "src", "host")
export const requireFromRepo = createRequire(path.join(repoRoot, "package.json"))
