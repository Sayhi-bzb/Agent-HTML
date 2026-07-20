import { spawn } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

import { terminateProcessTree } from "./runtime-process.mjs"

const ensureScript = fileURLToPath(new URL("runtime-ensure.mjs", import.meta.url))
const temporaryRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), "ahtml-runtime-interruption-")
)
const children = new Set()

function spawnEnsure() {
  const child = spawn(process.execPath, [ensureScript], {
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
  return { child, output: () => output }
}

function waitForExit(run) {
  return new Promise((resolve, reject) => {
    run.child.once("error", reject)
    run.child.once("exit", (code, signal) => {
      children.delete(run.child)
      resolve({ code, output: run.output(), signal })
    })
  })
}

async function waitForOwnedBuild() {
  const deadline = Date.now() + 30_000
  while (Date.now() < deadline) {
    const lockNames = await fs.readdir(path.join(temporaryRoot, "locks")).catch(
      (error) => {
        if (error?.code === "ENOENT") return []
        throw error
      }
    )
    for (const lockName of lockNames) {
      try {
        const owner = JSON.parse(
          await fs.readFile(
            path.join(temporaryRoot, "locks", lockName, "owner.json"),
            "utf8"
          )
        )
        if (owner.childPids?.length && owner.temporaryPaths?.length) return owner
      } catch (error) {
        if (error?.code !== "ENOENT" && !(error instanceof SyntaxError)) throw error
      }
    }
    await new Promise((resolve) => setTimeout(resolve, 50))
  }
  throw new Error("Interrupted ensure did not publish its owned process metadata")
}

function isProcessActive(pid) {
  try {
    process.kill(pid, 0)
    return true
  } catch (error) {
    if (error?.code === "ESRCH") return false
    throw error
  }
}

function terminateChildren() {
  for (const child of children) terminateProcessTree(child.pid)
}

process.once("exit", terminateChildren)
try {
  const interrupted = spawnEnsure()
  const interruptedExit = waitForExit(interrupted)
  const owner = await waitForOwnedBuild()
  process.kill(interrupted.child.pid, "SIGTERM")
  await interruptedExit
  if (owner.childPids.some(isProcessActive)) {
    throw new Error("Interrupted ensure left an npm process alive")
  }

  const recovery = spawnEnsure()
  const recoveryExit = await waitForExit(recovery)
  if (recoveryExit.code !== 0) {
    throw new Error(`Recovery ensure failed: ${recoveryExit.output}`)
  }
  for (const temporaryPath of owner.temporaryPaths) {
    await fs.access(temporaryPath).then(
      () => {
        throw new Error(`Recovery ensure left temporary path: ${temporaryPath}`)
      },
      (error) => {
        if (error?.code !== "ENOENT") throw error
      }
    )
  }
  const [locks, staging, runtimes] = await Promise.all([
    fs.readdir(path.join(temporaryRoot, "locks")),
    fs.readdir(path.join(temporaryRoot, "staging")),
    fs.readdir(path.join(temporaryRoot, "runtimes")),
  ])
  if (locks.length || staging.length || runtimes.length !== 1) {
    throw new Error("Recovery ensure did not publish one clean runtime")
  }
  console.log("Immutable runtime interruption recovery smoke test passed")
} finally {
  terminateChildren()
  process.removeListener("exit", terminateChildren)
  await fs.rm(temporaryRoot, { force: true, recursive: true })
}
