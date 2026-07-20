import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { terminateProcessTree } from "./runtime-process.mjs"

const scriptPath = fileURLToPath(new URL("runtime-ensure.mjs", import.meta.url))
const temporaryRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), "ahtml-runtime-concurrency-")
)
const children = new Set()

function runEnsure() {
  const child = spawn(process.execPath, [scriptPath], {
    env: { ...process.env, AHTML_RUNTIME_HOME: temporaryRoot },
    stdio: ["ignore", "pipe", "pipe"],
    windowsHide: true,
  })
  children.add(child)
  let output = ""
  child.stdout.on("data", (chunk) => {
    output += chunk
  })
  child.stderr.on("data", (chunk) => {
    output += chunk
  })
  return new Promise((resolve, reject) => {
    child.once("error", reject)
    child.once("exit", (code) => {
      children.delete(child)
      if (code === 0) resolve(output)
      else reject(new Error(`Concurrent ensure failed (${code}): ${output}`))
    })
  })
}

function terminateChildren() {
  for (const child of children) terminateProcessTree(child.pid)
}

process.once("exit", terminateChildren)
try {
  const outputs = await Promise.all([runEnsure(), runEnsure()])
  const combined = outputs.join("\n")
  const builtCount = combined.match(/Built immutable Desktop runtime:/g)?.length || 0
  const reusedCount =
    combined.match(/Immutable Desktop runtime is up to date:/g)?.length || 0
  const runtimeDirectories = await fs.readdir(path.join(temporaryRoot, "runtimes"))
  const stagingDirectories = await fs.readdir(path.join(temporaryRoot, "staging"))
  const lockDirectories = await fs.readdir(path.join(temporaryRoot, "locks"))

  if (builtCount !== 1 || reusedCount !== 1 || runtimeDirectories.length !== 1) {
    throw new Error(`Runtime ensure was not single-flight: ${combined}`)
  }
  if (stagingDirectories.length !== 0 || lockDirectories.length !== 0) {
    throw new Error("Runtime ensure left staging directories or locks")
  }
  console.log("Immutable runtime concurrency smoke test passed")
} finally {
  terminateChildren()
  process.removeListener("exit", terminateChildren)
  await fs.rm(temporaryRoot, { force: true, recursive: true })
}
