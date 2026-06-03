import fs from "node:fs/promises"
import path from "node:path"

export function parseRootArg({ args, cwd }) {
  const rootIndex = args.indexOf("--root")
  if (rootIndex === -1) {
    return path.resolve(cwd)
  }

  const root = args[rootIndex + 1]
  if (!root) {
    throw new Error("--root requires a path")
  }

  return path.resolve(cwd, root)
}

export function toPosixPath(value) {
  return value.split(path.sep).join("/")
}

export function workspaceRelativePath(root, filePath) {
  return toPosixPath(path.relative(root, filePath))
}

export async function discoverReactArtifacts(root) {
  const artifactsDir = path.join(root, ".agent-html", "artifacts")
  let entries

  try {
    entries = await fs.readdir(artifactsDir, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return []
    }
    throw error
  }

  return entries
    .filter((entry) => entry.isFile() && entry.name.endsWith(".agent.tsx"))
    .map((entry) => path.join(artifactsDir, entry.name))
    .sort((left, right) => left.localeCompare(right))
}
