import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import path from "node:path"

import {
  readCurrentRuntime,
  runtimeBundleRoot,
  runtimeStorePaths,
} from "./runtime-store.mjs"

const paths = runtimeStorePaths()
const selection = await readCurrentRuntime(paths)
if (!selection) throw new Error("No selected Desktop runtime; run runtime:ensure")
const runtimeRoot = runtimeBundleRoot(paths, selection.fingerprint)
const manifest = JSON.parse(
  await fs.readFile(path.join(runtimeRoot, "runtime-manifest.json"), "utf8")
)
const child = spawn(
  path.join(runtimeRoot, manifest.nodeEntry),
  [path.join(runtimeRoot, manifest.cliEntry), ...process.argv.slice(2)],
  {
    env: {
      ...process.env,
      AGENT_HTML_RUNTIME_FINGERPRINT: manifest.fingerprint,
      AGENT_HTML_RUNTIME_MANIFEST: path.join(
        runtimeRoot,
        "runtime-manifest.json"
      ),
    },
    stdio: "inherit",
    windowsHide: true,
  }
)
child.once("exit", (code, signal) => {
  process.exitCode = code ?? (signal ? 1 : 0)
})
