import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { canvasRuntimeCatalog } from "../packages/kernel/src/runtime-catalog.mjs"

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const write = process.argv.includes("--write")

function sortedRecord(record) {
  return Object.fromEntries(
    Object.entries(record).sort(([left], [right]) => left.localeCompare(right))
  )
}

async function expectedManifest(relativePath, transform) {
  const filePath = path.join(repoRoot, relativePath)
  const current = JSON.parse(await fs.readFile(filePath, "utf8"))
  const expected = transform(current)
  return {
    current: `${JSON.stringify(current, null, 2)}\n`,
    expected: `${JSON.stringify(expected, null, 2)}\n`,
    filePath,
    relativePath
  }
}

const manifests = await Promise.all([
  expectedManifest("agent-html/package.json", (manifest) => ({
    ...manifest,
    dependencies: sortedRecord(canvasRuntimeCatalog)
  })),
  expectedManifest("packages/cli/package.json", (manifest) => ({
    ...manifest,
    dependencies: sortedRecord({
      ...manifest.dependencies,
      ...canvasRuntimeCatalog
    })
  }))
])

const changed = manifests.filter(({ current, expected }) => current !== expected)
if (write) {
  await Promise.all(
    changed.map(({ expected, filePath }) => fs.writeFile(filePath, expected))
  )
  console.log(`Synchronized ${changed.length} Canvas runtime manifest(s).`)
} else if (changed.length > 0) {
  for (const manifest of changed) {
    console.error(`${manifest.relativePath} differs from the Kernel runtime catalog.`)
  }
  process.exitCode = 1
} else {
  console.log("Canvas runtime manifests match the Kernel catalog.")
}
