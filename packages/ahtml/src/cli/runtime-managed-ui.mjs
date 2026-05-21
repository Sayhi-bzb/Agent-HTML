import { createHash } from "node:crypto"
import { existsSync, readdirSync } from "node:fs"
import { cp, mkdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const managedRuntimeUiProofAlgorithm = "sha256"
const managedRuntimeUiBundleSourceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
  "..",
  "..",
  "scripts",
  "verify-pack",
  "shadcn-test-fixtures",
  "components",
  "ui",
)
const managedRuntimeUiOverrideSourceDir = path.join(
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
  return managedRuntimeUiBundleSourceDir
}

export function getManagedRuntimeUiOverrideDirectory() {
  return managedRuntimeUiOverrideSourceDir
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
  return listManagedRuntimeUiFiles(managedRuntimeUiBundleSourceDir)
}

export function listManagedRuntimeUiOverrideFiles() {
  return listManagedRuntimeUiFiles(managedRuntimeUiOverrideSourceDir)
}

export function getManagedRuntimeUiOverrideRegistry() {
  return Object.entries(managedRuntimeUiOverrideDefinitions)
    .map(([component, metadata]) => ({
      component,
      fileName: `${component}.tsx`,
      runtimeRelativePath: `src/components/ui/${component}.tsx`,
      sourcePath: path.join(
        managedRuntimeUiOverrideSourceDir,
        `${component}.tsx`,
      ),
      reason: metadata.reason,
    }))
    .sort((left, right) => left.fileName.localeCompare(right.fileName))
}

export function getManagedRuntimeUiBundleRegistry() {
  const overrideRegistry = new Map(
    getManagedRuntimeUiOverrideRegistry().map((entry) => [
      entry.component,
      entry,
    ]),
  )

  return listManagedRuntimeUiBundleFiles().map((fileName) => {
    const component = fileName.replace(/\.tsx$/, "")
    const baselineSourcePath = path.join(
      managedRuntimeUiBundleSourceDir,
      fileName,
    )
    const overrideEntry = overrideRegistry.get(component)
    const hasOverride = Boolean(
      overrideEntry && existsSync(overrideEntry.sourcePath),
    )

    return {
      component,
      fileName,
      runtimeRelativePath: `src/components/ui/${fileName}`,
      sourcePath: hasOverride ? overrideEntry.sourcePath : baselineSourcePath,
      reason: hasOverride ? overrideEntry.reason : undefined,
    }
  })
}

export function assertManagedRuntimeUiBundleSourceDirectory() {
  const actualFiles = listManagedRuntimeUiBundleFiles()

  if (actualFiles.length === 0) {
    throw new Error(
      "scripts/verify-pack/shadcn-test-fixtures/components/ui must contain the managed runtime UI baseline bundle.",
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
  const extra = actualFiles.filter((fileName) => !expectedSet.has(fileName))

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      [
        "runtime-host/components/ui override registry must match explicit managed overrides only.",
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
  assertManagedRuntimeUiOverrideSourceDirectory()

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
