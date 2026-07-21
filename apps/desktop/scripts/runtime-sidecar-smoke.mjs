import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawn, spawnSync } from "node:child_process"
import { pathToFileURL } from "node:url"

import {
  readCurrentRuntime,
  runtimeBundleRoot,
  runtimeStorePaths,
} from "./runtime-store.mjs"

const temporaryRoot = process.env.AHTML_SMOKE_ROOT
  ? null
  : await fs.mkdtemp(path.join(os.tmpdir(), "ahtml-runtime-smoke-"))
const workspaceRoot =
  process.env.AHTML_SMOKE_ROOT || path.join(temporaryRoot, "project")
await fs.mkdir(workspaceRoot, { recursive: true })
const storePaths = runtimeStorePaths()
const selection = await readCurrentRuntime(storePaths)
if (!selection) throw new Error("Prepared runtime selection was not found")
const runtimeRoot = runtimeBundleRoot(storePaths, selection.fingerprint)
const manifest = JSON.parse(
  await fs.readFile(path.join(runtimeRoot, "runtime-manifest.json"), "utf8")
)
if (manifest.schemaVersion !== 2 || manifest.runtimeProtocolVersion !== 1) {
  throw new Error(`Unexpected runtime manifest: ${JSON.stringify(manifest)}`)
}
const binaryPath = process.env.AHTML_SIDECAR || path.join(runtimeRoot, manifest.nodeEntry)
const cliPath =
  process.env.AHTML_RUNTIME_CLI || path.join(runtimeRoot, manifest.cliEntry)

const initialized = spawnSync(
  binaryPath,
  [cliPath, "init", "--root", workspaceRoot],
  { encoding: "utf8" }
)
if (initialized.status !== 0) {
  throw new Error(
    `Bundled workspace initializer failed: ${initialized.stderr || initialized.stdout}`
  )
}
const canvasRoot = path.join(workspaceRoot, "agent-html")
if (
  await fs
    .access(path.join(canvasRoot, "node_modules"))
    .then(() => true, () => false)
) {
  throw new Error("Bundled workspace initializer installed project dependencies")
}
const canvasManifestPath = path.join(canvasRoot, "package.json")
const canvasManifest = JSON.parse(await fs.readFile(canvasManifestPath, "utf8"))
canvasManifest.dependencies = { clsx: canvasManifest.dependencies.clsx }
await fs.writeFile(
  canvasManifestPath,
  `${JSON.stringify(canvasManifest, null, 2)}\n`
)

const token = "desktop-sidecar-smoke-token-with-enough-entropy"
const child = spawn(
  binaryPath,
  [cliPath, "runtime", "--root", workspaceRoot, "--pipeline", "example"],
  {
    env: {
      ...process.env,
      AGENT_HTML_RUNTIME_FINGERPRINT: manifest.fingerprint,
      AGENT_HTML_RUNTIME_MANIFEST: path.join(
        runtimeRoot,
        "runtime-manifest.json"
      ),
      AGENT_HTML_RUNTIME_TOKEN: token,
    },
    stdio: ["ignore", "pipe", "pipe"],
  }
)
const terminateChild = () => {
  if (child.exitCode === null && child.signalCode === null) child.kill()
}
process.once("exit", terminateChild)
process.once("SIGINT", () => {
  terminateChild()
  process.exit(130)
})
process.once("SIGTERM", () => {
  terminateChild()
  process.exit(143)
})

let stderr = ""
child.stderr.on("data", (chunk) => {
  stderr += chunk
})
const runtimeFetch = (url, options = {}) =>
  fetch(url, { ...options, signal: AbortSignal.timeout(20_000) })

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
    setTimeout(
      () => reject(new Error(`Sidecar readiness timed out: ${stderr}`)),
      45_000
    )
  ),
])

const health = await runtimeFetch(`${ready.url}/__agent-html/runtime/health`, {
  headers: { authorization: `Bearer ${token}` },
}).then((response) => response.json())
if (!health.ok || health.protocolVersion !== 1) {
  throw new Error(`Unexpected runtime health: ${JSON.stringify(health)}`)
}

const timelinePath = path
  .resolve(canvasRoot, "components", "timeline.tsx")
  .replaceAll(path.sep, "/")
const timelineResponse = await runtimeFetch(`${ready.url}/@fs/${timelinePath}`, {
  headers: { authorization: `Bearer ${token}` },
})
if (!timelineResponse.ok) {
  throw new Error(
    `Bundled runtime could not compile timeline.tsx (${timelineResponse.status}): ${await timelineResponse.text()}`
  )
}

const radixPrimitivePath = path
  .resolve(
    runtimeRoot,
    "node_modules",
    "@radix-ui",
    "react-primitive",
    "dist",
    "index.mjs"
  )
  .replaceAll(path.sep, "/")
const radixPrimitiveResponse = await runtimeFetch(
  `${ready.url}/@fs/${radixPrimitivePath}`,
  {
    headers: { authorization: `Bearer ${token}` },
  }
)
if (!radixPrimitiveResponse.ok) {
  throw new Error(
    `Bundled runtime could not compile Radix primitive (${radixPrimitiveResponse.status}): ${await radixPrimitiveResponse.text()}`
  )
}

const areaChartPath = path
  .resolve(
    canvasRoot,
    "components",
    "chart",
    "area-chart.tsx"
  )
  .replaceAll(path.sep, "/")
const areaChartResponse = await runtimeFetch(`${ready.url}/@fs/${areaChartPath}`, {
  headers: { authorization: `Bearer ${token}` },
})
const areaChartModule = await areaChartResponse.text()
if (!areaChartResponse.ok) {
  throw new Error(
    `Bundled runtime could not compile area-chart.tsx (${areaChartResponse.status}): ${areaChartModule}`
  )
}
if (
  !areaChartModule.includes("agent-html-vite-v6") ||
  !areaChartModule.includes("@visx_xychart.js") ||
  areaChartModule.includes("node_modules/reduce-css-calc/index.js")
) {
  throw new Error(`Bundled chart dependencies were not optimized: ${areaChartModule}`)
}
const runtimeViteModule = await import(
  pathToFileURL(
    path.join(
      runtimeRoot,
      "node_modules",
      "agent-html",
      "src",
      "dev-server",
      "vite.mjs"
    )
  ).href
)
const dependencyCache = runtimeViteModule.cacheDirForRoot(
  workspaceRoot,
  manifest.fingerprint,
  manifest.dependencyContractDigest
)
const classnamesPath = path.join(dependencyCache, "deps", "classnames.js")
const classnamesModule = await fs.readFile(classnamesPath, "utf8")
if (!/export\s+default\b/.test(classnamesModule)) {
  throw new Error(
    `Bundled runtime did not prebundle the classnames default export: ${classnamesModule}`
  )
}
const dependencyChunks = await fs.readdir(path.join(dependencyCache, "deps"))
const reduceCssCalcBundled = await Promise.all(
  dependencyChunks
    .filter((entry) => entry.endsWith(".js"))
    .map((entry) => fs.readFile(path.join(dependencyCache, "deps", entry), "utf8"))
).then((sources) => sources.some((source) => source.includes("reduce-css-calc")))
if (!reduceCssCalcBundled) {
  throw new Error("Bundled runtime did not include reduce-css-calc in the browser cache")
}

await runtimeFetch(`${ready.url}/__agent-html/runtime/shutdown`, {
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
process.removeListener("exit", terminateChild)
if (temporaryRoot) {
  await fs.rm(temporaryRoot, { force: true, recursive: true })
}
