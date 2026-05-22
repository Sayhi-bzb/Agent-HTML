import { createHash } from "node:crypto"
import { existsSync, readdirSync } from "node:fs"
import { cp, mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const managedRuntimeUiProofAlgorithm = "sha256"
const managedRuntimeUiSourceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "runtime-host",
  "components",
  "ui",
)
const managedRuntimeUiOverrideDefinitions = {
  slider: {
    reason:
      "Adds runtime-specific field semantics passthrough for single-thumb slider accessibility.",
  },
}
const managedRuntimeUiComponentDependencies = {
  combobox: ["input-group"],
  field: ["label", "separator"],
  "input-group": ["button", "input", "textarea"],
}

export function getManagedRuntimeUiBundleDirectory() {
  return managedRuntimeUiSourceDir
}

export function getManagedRuntimeUiOverrideDirectory() {
  return managedRuntimeUiSourceDir
}

function listManagedRuntimeUiFiles(directory, allowedComponents = null) {
  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory)
    .filter((entry) => {
      if (!entry.endsWith(".tsx")) {
        return false
      }

      if (!allowedComponents) {
        return true
      }

      return allowedComponents.has(entry.replace(/\.tsx$/, ""))
    })
    .sort()
}

export function listManagedRuntimeUiBundleFiles(components = []) {
  return listManagedRuntimeUiFiles(
    managedRuntimeUiSourceDir,
    resolveManagedRuntimeUiComponents(components),
  )
}

export function listManagedRuntimeUiOverrideFiles() {
  return listManagedRuntimeUiFiles(
    managedRuntimeUiSourceDir,
    new Set(Object.keys(managedRuntimeUiOverrideDefinitions)),
  )
}

export function getManagedRuntimeUiOverrideRegistry() {
  return Object.entries(managedRuntimeUiOverrideDefinitions)
    .map(([component, metadata]) => ({
      component,
      fileName: `${component}.tsx`,
      runtimeRelativePath: `src/components/ui/${component}.tsx`,
      sourcePath: path.join(managedRuntimeUiSourceDir, `${component}.tsx`),
      reason: metadata.reason,
    }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName))
}

export function getManagedRuntimeUiBundleRegistry(components = []) {
  const overrideRegistry = new Map(
    getManagedRuntimeUiOverrideRegistry().map((entry) => [
      entry.component,
      entry,
    ]),
  )

  return listManagedRuntimeUiBundleFiles(components).map((fileName) => {
    const component = fileName.replace(/\.tsx$/, "")
    const overrideEntry = overrideRegistry.get(component)

    return {
      component,
      fileName,
      runtimeRelativePath: `src/components/ui/${fileName}`,
      sourcePath: path.join(managedRuntimeUiSourceDir, fileName),
      reason: overrideEntry?.reason,
    }
  })
}

export function assertManagedRuntimeUiBundleSourceDirectory() {
  const actualFiles = listManagedRuntimeUiBundleFiles()

  if (actualFiles.length === 0) {
    throw new Error(
      "packages/ahtml/src/cli/runtime-host/components/ui must contain the managed runtime UI bundle.",
    )
  }

  return actualFiles
}

export function assertManagedRuntimeUiOverrideSourceDirectory() {
  const expectedFiles = Object.keys(managedRuntimeUiOverrideDefinitions)
    .map((component) => `${component}.tsx`)
    .sort()
  const actualFiles = listManagedRuntimeUiOverrideFiles()
  const expectedSet = new Set(expectedFiles)
  const actualSet = new Set(actualFiles)
  const missing = expectedFiles.filter((fileName) => !actualSet.has(fileName))

  if (missing.length > 0) {
    throw new Error(
      [
        "runtime-host/components/ui must contain every managed UI component with override metadata.",
        missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }

  return actualFiles
}

export function getManagedRuntimeUiBundleEntries(components = []) {
  assertManagedRuntimeUiBundleSourceDirectory()
  assertManagedRuntimeUiOverrideSourceDirectory()

  return getManagedRuntimeUiBundleRegistry(components)
}

export function getManagedRuntimeUiOverrideEntries(components = []) {
  assertManagedRuntimeUiOverrideSourceDirectory()

  if (!Array.isArray(components) || components.length === 0) {
    return getManagedRuntimeUiOverrideRegistry()
  }

  const requestedComponents = resolveManagedRuntimeUiComponents(components)

  return getManagedRuntimeUiOverrideRegistry().filter((entry) =>
    requestedComponents.has(entry.component),
  )
}

export async function provisionManagedRuntimeUiBundle({
  components = [],
  paths,
}) {
  const entries = getManagedRuntimeUiBundleEntries(components)

  if (entries.length === 0) {
    return []
  }

  await mkdir(paths.runtimeComponentsDir, { recursive: true })

  for (const entry of entries) {
    await cp(
      entry.sourcePath,
      path.join(paths.runtimeComponentsDir, entry.fileName),
    )
  }

  return entries
}

export async function applyManagedRuntimeUiOverrides({
  components = [],
  paths,
}) {
  const entries = getManagedRuntimeUiOverrideEntries(components)

  if (entries.length === 0) {
    return []
  }

  await mkdir(paths.runtimeComponentsDir, { recursive: true })

  for (const entry of entries) {
    await cp(
      entry.sourcePath,
      path.join(paths.runtimeComponentsDir, entry.fileName),
    )
  }

  return entries
}

export async function createManagedRuntimeUiProof(components = []) {
  const files = {}
  const reasons = {}

  for (const entry of getManagedRuntimeUiBundleEntries(components)) {
    files[entry.runtimeRelativePath] = createContentHash(
      await readFile(entry.sourcePath, "utf8"),
    )

    if (entry.reason) {
      reasons[entry.runtimeRelativePath] = entry.reason
    }
  }

  return {
    algorithm: managedRuntimeUiProofAlgorithm,
    files,
    reasons,
  }
}

function createContentHash(source) {
  return createHash(managedRuntimeUiProofAlgorithm).update(source).digest("hex")
}

function resolveManagedRuntimeUiComponents(components = []) {
  if (!Array.isArray(components) || components.length === 0) {
    return null
  }

  const resolvedComponents = new Set()
  const pendingComponents = [...new Set(components)]

  while (pendingComponents.length > 0) {
    const component = pendingComponents.shift()

    if (!component || resolvedComponents.has(component)) {
      continue
    }

    resolvedComponents.add(component)

    for (const dependency of managedRuntimeUiComponentDependencies[component] ??
      []) {
      if (!resolvedComponents.has(dependency)) {
        pendingComponents.push(dependency)
      }
    }
  }

  return resolvedComponents
}
