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
  const artifactsDir = path.join(root, "agent-html", "artifacts")
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
    .filter((entry) => entry.isFile() && entry.name.endsWith(".artifact.tsx"))
    .map((entry) => path.join(artifactsDir, entry.name))
    .sort((left, right) => left.localeCompare(right))
}

async function discoverFilesBySuffix(directory, suffix) {
  let entries

  try {
    entries = await fs.readdir(directory, { withFileTypes: true })
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return []
    }
    throw error
  }

  const files = await Promise.all(
    entries.map(async (entry) => {
      const entryPath = path.join(directory, entry.name)

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "build" ||
          entry.name === "dist" ||
          entry.name === ".vite"
        ) {
          return []
        }

        return discoverFilesBySuffix(entryPath, suffix)
      }

      return entry.isFile() && entry.name.endsWith(suffix) ? [entryPath] : []
    })
  )

  return files.flat().sort((left, right) => left.localeCompare(right))
}

export async function discoverReactBlockImplementations(root) {
  const workspaceRoot = path.join(root, "agent-html")
  const roots = [
    path.join(workspaceRoot, "artifacts"),
    path.join(workspaceRoot, "examples"),
  ]
  const files = await Promise.all(
    roots.map((sourceRoot) => discoverFilesBySuffix(sourceRoot, ".block.tsx"))
  )

  return files.flat().sort((left, right) => left.localeCompare(right))
}
