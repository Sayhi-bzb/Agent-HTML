import { existsSync, readFileSync, readdirSync, statSync } from "node:fs"
import { dirname, join, normalize, relative } from "node:path"

export const root = process.cwd()

export function filesUnder(directory) {
  if (!existsSync(join(root, directory))) {
    return []
  }

  return readdirSync(join(root, directory), { withFileTypes: true }).flatMap(
    (entry) => {
      const absolutePath = join(root, directory, entry.name)
      const relativePath = relative(root, absolutePath).replace(/\\/g, "/")

      if (entry.isDirectory()) {
        if (
          entry.name === "node_modules" ||
          entry.name === "build" ||
          entry.name === "dist"
        ) {
          return []
        }

        return filesUnder(relativePath)
      }

      return statSync(absolutePath).isFile() ? [relativePath] : []
    }
  )
}

export function sourceFilesUnder(directory) {
  return filesUnder(directory).filter((file) => /\.(mjs|ts|tsx)$/.test(file))
}

export function cssFilesUnder(directory) {
  return filesUnder(directory).filter((file) => /\.css$/.test(file))
}

export function implementationFilesUnder(directory) {
  return sourceFilesUnder(directory).filter(
    (file) => !/\.(test|spec)\.(mjs|ts|tsx)$/.test(file)
  )
}

export function readSource(file) {
  return readFileSync(join(root, file), "utf8")
}

export function filesMatching(directory, pattern) {
  return implementationFilesUnder(directory).filter((file) =>
    pattern.test(readSource(file))
  )
}

export function filesMatchingAny(files, pattern) {
  return files.filter((file) => pattern.test(readSource(file)))
}

export function importedSpecifiers(source) {
  const imports = []
  const importPattern =
    /import\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']|import\(\s*["']([^"']+)["']\s*\)/g
  let match

  while ((match = importPattern.exec(source)) !== null) {
    imports.push(match[1] ?? match[2])
  }

  return imports
}

export function typeOnlyImportedSpecifiers(source) {
  return Array.from(
    source.matchAll(/import\s+type\s+(?:[^"']+\s+from\s+)?["']([^"']+)["']/g)
  ).map((match) => match[1])
}

export function sourceImportRecords(directory) {
  return implementationFilesUnder(directory).flatMap((file) =>
    importedSpecifiers(readSource(file)).map((specifier) => ({
      file,
      specifier,
      target: normalizedImportTarget(file, specifier),
    }))
  )
}

export function normalizedImportTarget(file, specifier) {
  if (!specifier.startsWith(".")) {
    return specifier
  }

  return normalize(join(dirname(file), specifier)).replace(/\\/g, "/")
}

export function stylesheetImportSpecifiers(source) {
  return Array.from(source.matchAll(/@import\s+["']([^"']+)["']/g)).map(
    (match) => match[1]
  )
}

export function runtimePackageName(specifier) {
  if (
    specifier.startsWith(".") ||
    specifier.startsWith("/") ||
    specifier.startsWith("@/") ||
    specifier.startsWith("#agent-html-playground/") ||
    specifier.startsWith("@agent-html-playground/")
  ) {
    return null
  }

  return specifier.startsWith("@")
    ? specifier.split("/").slice(0, 2).join("/")
    : specifier.split("/")[0]
}

export function workspaceRuntimeImports() {
  return [
    ...implementationFilesUnder("agent-html").flatMap((file) => {
      const source = readSource(file)
      const typeOnlySpecifiers = new Set(typeOnlyImportedSpecifiers(source))

      return importedSpecifiers(source)
        .filter((specifier) => !typeOnlySpecifiers.has(specifier))
        .map((specifier) => ({
          file,
          specifier,
        }))
    }),
    ...cssFilesUnder("agent-html").flatMap((file) =>
      stylesheetImportSpecifiers(readSource(file)).map((specifier) => ({
        file,
        specifier,
      }))
    ),
  ]
    .map(({ file, specifier }) => ({
      file,
      packageName: runtimePackageName(specifier),
      specifier,
    }))
    .filter((entry) => entry.packageName)
}
