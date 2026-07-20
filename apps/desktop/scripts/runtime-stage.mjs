import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

import {
  readCurrentRuntime,
  runtimeBundleRoot,
  runtimeStorePaths,
} from "./runtime-store.mjs"

const appRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const destination = path.join(appRoot, "runtime-bundle")
const paths = runtimeStorePaths()
const selection = await readCurrentRuntime(paths)
if (!selection) throw new Error("No selected Desktop runtime; run runtime:ensure")
const source = runtimeBundleRoot(paths, selection.fingerprint)

// This is an ephemeral packaging input, not a published runtime. Copying the
// selected immutable bundle directly avoids Windows directory-rename failures
// caused by antivirus/indexer handles. Tauri only reads it after this command
// exits successfully.
await fs.rm(destination, { force: true, recursive: true })
await fs.cp(source, destination, { recursive: true })
await fs.writeFile(path.join(destination, ".gitkeep"), "")

console.log(`Staged packaged Desktop runtime: ${destination}`)
