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

export function getManagedRuntimeUiOverrideRegistry() {
  return Object.entries(managedRuntimeUiOverrideDefinitions).map(
    ([component, definition]) => ({
      component,
      fileName: `${component}.tsx`,
      runtimeRelativePath: `src/components/ui/${component}.tsx`,
      sourcePath: path.join(managedRuntimeUiSourceDir, `${component}.tsx`),
      reason: definition.reason,
    }),
  )
}

export function assertManagedRuntimeUiOverrideSourceDirectory() {
  const expectedFiles = getManagedRuntimeUiOverrideRegistry()
    .map((entry) => entry.fileName)
    .sort()
  const actualFiles = existsSync(managedRuntimeUiSourceDir)
    ? readdirSync(managedRuntimeUiSourceDir)
        .filter((entry) => entry.endsWith(".tsx"))
        .sort()
    : []
  const expectedSet = new Set(expectedFiles)
  const actualSet = new Set(actualFiles)
  const missing = expectedFiles.filter((fileName) => !actualSet.has(fileName))
  const extra = actualFiles.filter((fileName) => !expectedSet.has(fileName))

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      [
        "runtime-host/components/ui must match the explicit managed override registry.",
        missing.length > 0 ? `Missing: ${missing.join(", ")}.` : "",
        extra.length > 0 ? `Extra: ${extra.join(", ")}.` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }

  return actualFiles
}

export function getManagedRuntimeUiOverrideEntries(components = []) {
  assertManagedRuntimeUiOverrideSourceDirectory()
  const requestedComponents = new Set(components)

  return getManagedRuntimeUiOverrideRegistry().filter((entry) => {
    if (!requestedComponents.has(entry.component)) {
      return false
    }

    return existsSync(entry.sourcePath)
  })
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

  for (const entry of getManagedRuntimeUiOverrideEntries(components)) {
    files[entry.runtimeRelativePath] = createContentHash(
      await readFile(entry.sourcePath, "utf8"),
    )
    reasons[entry.runtimeRelativePath] = entry.reason
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
