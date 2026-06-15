import { execFileSync } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const cliRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)
const repoRoot = path.resolve(cliRoot, "..", "..")
const templateRoot = path.join(cliRoot, "template", "agent-html")
const excludedSegments = new Set([
  ".git",
  ".vite",
  "build",
  "dist",
  "manifest.json",
  "node_modules",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
])

function shouldCopy(relativePath) {
  return !relativePath
    .split(/[\\/]/)
    .some((segment) => excludedSegments.has(segment))
}

const output = execFileSync(
  "git",
  ["ls-files", "-z", "--cached", "--others", "--exclude-standard", "--", "agent-html"],
  {
    cwd: repoRoot,
  }
)
const files = output
  .toString("utf8")
  .split("\0")
  .filter(Boolean)
  .filter(shouldCopy)

await fs.rm(templateRoot, { force: true, recursive: true })

for (const file of files) {
  const relativePath = path.relative("agent-html", file)
  const targetPath = path.join(templateRoot, relativePath)
  const sourcePath = path.join(repoRoot, file)

  try {
    const stat = await fs.stat(sourcePath)
    if (!stat.isFile()) {
      continue
    }
  } catch (error) {
    if (error && error.code === "ENOENT") {
      continue
    }

    throw error
  }

  await fs.mkdir(path.dirname(targetPath), { recursive: true })
  await fs.copyFile(sourcePath, targetPath)
}

console.log(`Prepared agent-html template with ${files.length} files.`)
