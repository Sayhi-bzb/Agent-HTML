import { createHash } from "node:crypto"
import { createRequire } from "node:module"
import fs from "node:fs"
import path from "node:path"

export const RUNTIME_DEPENDENCY_CONTRACT_VERSION = 2
export const HOST_BROWSER_DEPENDENCY_CONTRACT_VERSION = 1

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

function javascriptModuleSpecifiers(source) {
  const specifiers = javascriptImports(source)
  const exportPattern =
    /export\s+(?!type\b)(?:\*|\{[^}]*\})\s+from\s+["']([^"']+)["']/g
  let match
  while ((match = exportPattern.exec(source)) !== null) {
    specifiers.push(match[1])
  }
  return specifiers
}

function isHostProductionSource(filePath) {
  const fileName = path.basename(filePath)
  return (
    !/\.(?:test|spec)\.[cm]?[jt]sx?$/i.test(fileName) &&
    !/\.d\.[cm]?ts$/i.test(fileName)
  )
}

export function createHostBrowserDependencyContract({ packagePath, root }) {
  const manifest = JSON.parse(fs.readFileSync(packagePath, "utf8"))
  const declared = manifest.dependencies ?? {}
  const requireFromHostPackage = createRequire(packagePath)
  const browserEntries = new Set()
  const styleEntries = new Set()

  for (const filePath of listCanvasSourceFiles(root).filter(
    isHostProductionSource
  )) {
    const source = fs.readFileSync(filePath, "utf8")
    const extension = path.extname(filePath)
    const entries =
      extension === ".css"
        ? stylesheetImports(source)
        : javascriptModuleSpecifiers(source)

    for (const specifier of entries) {
      if (/^node:/i.test(specifier)) {
        throw new Error(
          `Host browser source imports Node built-in "${specifier}" from ${path.relative(root, filePath)}`
        )
      }

      const packageName = packageNameFromImport(specifier)
      if (!packageName) continue
      if (!Object.hasOwn(declared, packageName)) {
        throw new Error(
          `Host browser source imports undeclared dependency "${specifier}" from ${path.relative(root, filePath)}`
        )
      }

      try {
        requireFromHostPackage.resolve(specifier)
      } catch {
        throw new Error(
          `Host browser dependency "${specifier}" is unavailable from ${packagePath}`
        )
      }

      const isStyleEntry =
        extension === ".css" || /\.css(?:[?#]|$)/i.test(specifier)
      ;(isStyleEntry ? styleEntries : browserEntries).add(specifier)
    }
  }

  const contract = {
    version: HOST_BROWSER_DEPENDENCY_CONTRACT_VERSION,
    browserEntries: [...browserEntries].sort(),
    styleEntries: [...styleEntries].sort(),
  }
  return {
    ...contract,
    digest: createHash("sha256").update(JSON.stringify(contract)).digest("hex"),
  }
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
