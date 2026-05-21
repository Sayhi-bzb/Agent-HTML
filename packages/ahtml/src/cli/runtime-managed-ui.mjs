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

export function getManagedRuntimeUiBundleDirectory() {
  return managedRuntimeUiSourceDir
}

export function getManagedRuntimeUiOverrideDirectory() {
  return managedRuntimeUiSourceDir
}

function listManagedRuntimeUiFiles(directory) {
  if (!existsSync(directory)) {
    return []
  }

  return readdirSync(directory)
    .filter((entry) => entry.endsWith(".tsx"))
    .sort()
}

export function listManagedRuntimeUiBundleFiles() {
  return listManagedRuntimeUiFiles(managedRuntimeUiSourceDir)
}

export function getManagedRuntimeUiBundleRegistry() {
  return listManagedRuntimeUiBundleFiles().map((fileName) => {
    const component = fileName.replace(/\.tsx$/, "")

    return {
      component,
      fileName,
      runtimeRelativePath: `src/components/ui/${fileName}`,
      sourcePath: path.join(managedRuntimeUiSourceDir, fileName),
      reason: managedRuntimeUiOverrideDefinitions[component]?.reason,
    }
  })
}

export function getManagedRuntimeUiOverrideRegistry() {
  return getManagedRuntimeUiBundleRegistry().filter((entry) => entry.reason)
}

export function assertManagedRuntimeUiBundleSourceDirectory() {
  const actualFiles = listManagedRuntimeUiBundleFiles()

  if (actualFiles.length === 0) {
    throw new Error(
      "runtime-host/components/ui must contain the managed runtime UI bundle.",
    )
  }

  return actualFiles
}

export function assertManagedRuntimeUiOverrideSourceDirectory() {
  assertManagedRuntimeUiBundleSourceDirectory()

  const expectedFiles = Object.keys(managedRuntimeUiOverrideDefinitions)
    .map((component) => `${component}.tsx`)
    .sort()
  const actualFiles = getManagedRuntimeUiOverrideRegistry()
    .map((entry) => entry.fileName)
    .sort()
  const expectedSet = new Set(expectedFiles)
  const actualSet = new Set(actualFiles)
  const missing = expectedFiles.filter((fileName) => !actualSet.has(fileName))
  const extra = actualFiles.filter((fileName) => !expectedSet.has(fileName))

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      [
        "runtime-host/components/ui override registry must match explicit managed overrides.",
        missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "",
        extra.length > 0 ? `Extra: ${extra.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }

  return actualFiles
}

export function getManagedRuntimeUiBundleEntries(components = []) {
  assertManagedRuntimeUiBundleSourceDirectory()

  if (!Array.isArray(components) || components.length === 0) {
    return getManagedRuntimeUiBundleRegistry()
  }

  const requestedComponents = new Set(components)

  return getManagedRuntimeUiBundleRegistry().filter((entry) =>
    requestedComponents.has(entry.component),
  )
}

export function getManagedRuntimeUiOverrideEntries(components = []) {
  assertManagedRuntimeUiOverrideSourceDirectory()

  if (!Array.isArray(components) || components.length === 0) {
    return getManagedRuntimeUiOverrideRegistry()
  }

  const requestedComponents = new Set(components)

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
