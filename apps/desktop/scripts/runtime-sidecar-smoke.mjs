import fs from "node:fs/promises"
import path from "node:path"
import { spawn } from "node:child_process"
import { fileURLToPath } from "node:url"

const appRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const repoRoot = path.resolve(appRoot, "../..")
const workspaceRoot = process.env.AHTML_SMOKE_ROOT || repoRoot
const binariesRoot = path.join(appRoot, "src-tauri", "binaries")
const [binaryName] = process.env.AHTML_SIDECAR
  ? []
  : (await fs.readdir(binariesRoot)).filter((name) =>
      name.startsWith("agent-html-runtime-")
    )
if (!process.env.AHTML_SIDECAR && !binaryName) {
  throw new Error("Prepared runtime sidecar was not found")
}
const binaryPath =
  process.env.AHTML_SIDECAR || path.join(binariesRoot, binaryName)
const cliPath =
  process.env.AHTML_RUNTIME_CLI ||
  path.join(appRoot, "runtime/node_modules/agent-html/bin/agent-html.mjs")

const token = "desktop-sidecar-smoke-token-with-enough-entropy"
const child = spawn(
  binaryPath,
  [
    cliPath,
    "runtime",
    "--root",
    workspaceRoot,
    "--pipeline",
    "example",
  ],
  {
    env: { ...process.env, AGENT_HTML_RUNTIME_TOKEN: token },
    stdio: ["ignore", "pipe", "pipe"],
  }
)

let stderr = ""
child.stderr.on("data", (chunk) => {
  stderr += chunk
})

const ready = await Promise.race([
  new Promise((resolve, reject) => {
    let pending = ""
    child.stdout.on("data", (chunk) => {
      pending += chunk
      const lines = pending.split("\n")
      pending = lines.pop() ?? ""
      for (const line of lines) {
        try {
          const event = JSON.parse(line)
          if (event.type === "runtime-ready") resolve(event)
        } catch {
          // Ignore dependency diagnostics; readiness is the JSON protocol line.
        }
      }
    })
    child.once("exit", (code) =>
      reject(new Error(`Sidecar exited before ready (${code}): ${stderr}`))
    )
  }),
  new Promise((_, reject) =>
    setTimeout(() => reject(new Error(`Sidecar readiness timed out: ${stderr}`)), 45_000)
  ),
])

const health = await fetch(`${ready.url}/__agent-html/runtime/health`, {
  headers: { authorization: `Bearer ${token}` },
}).then((response) => response.json())
if (!health.ok || health.protocolVersion !== 1) {
  throw new Error(`Unexpected runtime health: ${JSON.stringify(health)}`)
}

await fetch(`${ready.url}/__agent-html/runtime/shutdown`, {
  headers: { authorization: `Bearer ${token}` },
  method: "POST",
})
await new Promise((resolve, reject) => {
  child.once("exit", resolve)
  setTimeout(() => {
    child.kill()
    reject(new Error("Sidecar did not stop gracefully"))
  }, 10_000)
})

console.log("Bundled Node sidecar smoke test passed")
