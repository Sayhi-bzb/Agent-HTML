import { createHash } from "node:crypto"
import fs from "node:fs"
import path from "node:path"

export const RUNTIME_DEPENDENCY_CONTRACT_VERSION = 2

const sourceExtensions = new Set([".js", ".jsx", ".mjs", ".mts", ".ts", ".tsx"])
const excludedDirectories = new Set([
  ".git",
  ".vite",
  "build",
  "dist",
  "node_modules",
])

export function packageNameFromImport(specifier) {
  const request = specifier.split(/[?#]/, 1)[0]
  if (
    !request ||
    request.startsWith(".") ||
    request.startsWith("/") ||
    request.startsWith("\\") ||
    request.startsWith("#") ||
    request.includes("\0") ||
    /^[a-z][a-z\d+.-]*:/i.test(request)
  ) {
    return null
  }

  const segments = request.split("/")
  const packageName = request.startsWith("@")
    ? segments.slice(0, 2).join("/")
    : segments[0]

  return /^(@[a-z\d._-]+\/[a-z\d._-]+|[a-z\d._-]+)$/i.test(packageName)
    ? packageName
    : null
}

function listCanvasSourceFiles(root) {
  const files = []
  const visit = (directory) => {
    for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
      if (entry.isDirectory() && excludedDirectories.has(entry.name)) continue
      const entryPath = path.join(directory, entry.name)
      if (entry.isDirectory()) {
        visit(entryPath)
      } else if (entry.isFile()) {
        const extension = path.extname(entry.name)
        if (sourceExtensions.has(extension) || extension === ".css") {
          files.push(entryPath)
        }
      }
    }
  }
  visit(root)
  return files.sort()
}

function javascriptImports(source) {
  const imports = []
  const importPattern =
    /import\s+(?!type\b)(?:[^"']+\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g
  let match
  while ((match = importPattern.exec(source)) !== null) {
    imports.push(match[1] ?? match[2])
  }
  return imports
}

function stylesheetImports(source) {
  return Array.from(source.matchAll(/@import\s+["']([^"']+)["']/g)).map(
    (match) => match[1]
  )
}

export function createRuntimeDependencyContract(canvasRoot) {
  const manifest = JSON.parse(
    fs.readFileSync(path.join(canvasRoot, "package.json"), "utf8")
  )
  const canvasDependencies = Object.keys(manifest.dependencies ?? {}).sort()
  const declared = new Set(canvasDependencies)
  const browserEntries = new Set()
  const styleEntries = new Set()
  const browserPackages = new Set()
  const stylePackages = new Set()

  for (const filePath of listCanvasSourceFiles(canvasRoot)) {
    const source = fs.readFileSync(filePath, "utf8")
    const extension = path.extname(filePath)
    const entries = extension === ".css" ? stylesheetImports(source) : javascriptImports(source)

    for (const specifier of entries) {
      const packageName = packageNameFromImport(specifier)
      if (!packageName) continue
      if (!declared.has(packageName)) {
        throw new Error(
          `Canvas source imports undeclared dependency "${specifier}" from ${path.relative(canvasRoot, filePath)}`
        )
      }

      const isStyleEntry = extension === ".css" || /\.css(?:[?#]|$)/i.test(specifier)
      if (isStyleEntry) {
        styleEntries.add(specifier)
        stylePackages.add(packageName)
      } else {
        browserEntries.add(specifier)
        browserPackages.add(packageName)
      }
    }
  }

  for (const dependency of canvasDependencies) {
    if (!browserPackages.has(dependency) && !stylePackages.has(dependency)) {
      browserEntries.add(dependency)
    }
  }

  const contract = {
    version: RUNTIME_DEPENDENCY_CONTRACT_VERSION,
    canvasDependencies,
    browserEntries: [...browserEntries].sort(),
    styleEntries: [...styleEntries].sort(),
  }
  return {
    ...contract,
    digest: createHash("sha256").update(JSON.stringify(contract)).digest("hex"),
  }
}
