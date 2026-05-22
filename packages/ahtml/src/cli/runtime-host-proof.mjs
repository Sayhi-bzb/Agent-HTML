import { createHash } from "node:crypto"
import { readFile, readdir } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  createRuntimeCssSource,
  transformRuntimeHostAppSource,
} from "./runtime-shell-sources.mjs"

const runtimeHostProofAlgorithm = "sha256"
const runtimeHostCodeFileExtensions = new Set([".ts", ".tsx"])
const cliDir = path.dirname(fileURLToPath(import.meta.url))
const runtimeHostSourceDir = path.join(cliDir, "runtime-host")
const runtimeHostProofRoots = [
  {
    runtimeRoot: "src/features",
    sourceRoot: path.join(runtimeHostSourceDir, "features"),
  },
  {
    runtimeRoot: "src/lib",
    sourceRoot: path.join(runtimeHostSourceDir, "lib"),
  },
]
const runtimeHostDirectFiles = [
  {
    runtimeRelativePath: "src/artifact-shell.tsx",
    sourcePath: path.join(runtimeHostSourceDir, "artifact-shell.tsx"),
  },
  {
    runtimeRelativePath: "src/host-styles.tsx",
    sourcePath: path.join(runtimeHostSourceDir, "host-styles.tsx"),
  },
  {
    runtimeRelativePath: "src/profile-theme.ts",
    sourcePath: path.join(runtimeHostSourceDir, "profile-theme.ts"),
  },
  {
    runtimeRelativePath: "src/render-ssr.tsx",
    sourcePath: path.join(runtimeHostSourceDir, "render-ssr.tsx"),
  },
  {
    runtimeRelativePath: "src/ssr.tsx",
    sourcePath: path.join(runtimeHostSourceDir, "ssr.tsx"),
  },
]

export async function createRuntimeHostSourceProof() {
  const files = {}

  for (const entry of runtimeHostDirectFiles) {
    files[entry.runtimeRelativePath] = createContentHash(
      await readFile(entry.sourcePath, "utf8"),
    )
  }

  files["src/app.tsx"] = createContentHash(
    transformRuntimeHostAppSource(
      await readFile(path.join(runtimeHostSourceDir, "app.tsx"), "utf8"),
    ),
  )
  files["src/styles.css"] = createContentHash(`${createRuntimeCssSource()}\n`)

  for (const root of runtimeHostProofRoots) {
    const nestedFiles = await collectRuntimeHostCodeFiles(root)

    for (const [runtimeRelativePath, source] of nestedFiles) {
      files[runtimeRelativePath] = createContentHash(source)
    }
  }

  return {
    algorithm: runtimeHostProofAlgorithm,
    files,
  }
}

export async function assertRuntimeHostSourceParity({ paths, proof }) {
  const actualProof = requireObject(
    proof,
    "surface ahtmlHostProof must be an object.",
  )
  const actualFiles = requireObject(
    actualProof.files,
    "surface ahtmlHostProof files must be an object.",
  )

  if (actualProof.algorithm !== runtimeHostProofAlgorithm) {
    throw new Error(
      `surface ahtmlHostProof algorithm must be ${runtimeHostProofAlgorithm}, got ${String(actualProof.algorithm)}.`,
    )
  }

  const expectedProof = await createRuntimeHostSourceProof()

  assertSameStringSet({
    actual: Object.keys(actualFiles),
    actualName: "surface ahtmlHostProof files",
    expected: Object.keys(expectedProof.files),
    expectedName: "expected runtime host source proof files",
  })

  for (const [runtimeRelativePath, expectedHash] of Object.entries(
    expectedProof.files,
  )) {
    if (actualFiles[runtimeRelativePath] !== expectedHash) {
      throw new Error(
        `surface ahtmlHostProof ${runtimeRelativePath} does not match checked-in runtime host source hash. Actual: ${String(actualFiles[runtimeRelativePath])} Expected: ${expectedHash}.`,
      )
    }

    const actualSource = await readFile(
      path.join(paths.runtimeDir, runtimeRelativePath.replaceAll("/", path.sep)),
      "utf8",
    )
    const actualHash = createContentHash(actualSource)

    if (actualHash !== expectedHash) {
      throw new Error(
        `runtime host file ${runtimeRelativePath} does not match checked-in runtime host source hash. Actual: ${actualHash} Expected: ${expectedHash}.`,
      )
    }
  }
}

async function collectRuntimeHostCodeFiles({ runtimeRoot, sourceRoot }) {
  const files = new Map()
  const entries = await readdir(sourceRoot, {
    recursive: true,
    withFileTypes: true,
  })

  for (const entry of entries) {
    if (entry.isDirectory()) {
      continue
    }

    const extension = path.extname(entry.name)

    if (!runtimeHostCodeFileExtensions.has(extension)) {
      continue
    }

    const sourceRelativePath = path.join(entry.parentPath, entry.name)
    const relativePath = path.relative(sourceRoot, sourceRelativePath)
    const runtimeRelativePath = path
      .join(runtimeRoot, relativePath)
      .replaceAll("\\", "/")

    files.set(runtimeRelativePath, await readFile(sourceRelativePath, "utf8"))
  }

  return files
}

function requireObject(value, message) {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(message)
  }

  return value
}

function assertSameStringSet({ actual, actualName, expected, expectedName }) {
  const actualSet = new Set(actual)
  const expectedSet = new Set(expected)
  const missing = expected.filter((item) => !actualSet.has(item))
  const extra = actual.filter((item) => !expectedSet.has(item))

  if (missing.length > 0 || extra.length > 0) {
    throw new Error(
      [
        `${actualName} does not match ${expectedName}.`,
        missing.length > 0 ? `Missing: ${missing.join(", ")}` : "",
        extra.length > 0 ? `Extra: ${extra.join(", ")}` : "",
      ]
        .filter(Boolean)
        .join(" "),
    )
  }
}

function createContentHash(source) {
  return createHash(runtimeHostProofAlgorithm).update(source).digest("hex")
}
