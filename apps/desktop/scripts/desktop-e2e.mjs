import { execFileSync, spawn, spawnSync } from "node:child_process"
import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

const appRoot = path.resolve(fileURLToPath(new URL("..", import.meta.url)))
const releaseRoot = path.join(appRoot, "src-tauri", "target", "release")
const application =
  process.env.AHTML_DESKTOP_BINARY || path.join(releaseRoot, "ahtml-desktop")
const sidecar =
  process.env.AHTML_SIDECAR || path.join(releaseRoot, "agent-html-runtime")
const cli =
  process.env.AHTML_RUNTIME_CLI ||
  path.join(
    releaseRoot,
    "runtime",
    "node_modules",
    "agent-html",
    "bin",
    "agent-html.mjs"
  )
const driver = process.env.AHTML_TAURI_DRIVER || "tauri-driver"
const nativeDriver =
  process.env.AHTML_NATIVE_DRIVER || "/usr/bin/WebKitWebDriver"
const driverPort = Number(process.env.AHTML_WEBDRIVER_PORT || 4444)
const driverUrl = `http://127.0.0.1:${driverPort}`
const temporaryRoot = await fs.mkdtemp(
  path.join(os.tmpdir(), "ahtml-desktop-e2e-")
)
const projectRoot = path.join(temporaryRoot, "project")
const configRoot = path.join(temporaryRoot, "config")
let driverLog = ""
let driverExit
let sessionId

await fs.mkdir(projectRoot)
const initialized = spawnSync(sidecar, [cli, "init", "--root", projectRoot], {
  encoding: "utf8",
})
if (initialized.status !== 0) {
  throw new Error(
    `Unable to initialize E2E workspace: ${initialized.stderr || initialized.stdout}`
  )
}
const desktopConfigRoot = path.join(configRoot, "dev.ahtml.desktop")
await fs.mkdir(desktopConfigRoot, { recursive: true })
await fs.writeFile(
  path.join(desktopConfigRoot, "desktop.json"),
  JSON.stringify({
    preferences: {
      automaticUpdates: false,
      externalEditor: "",
      language: "en",
      pipeline: "example",
      theme: "system",
    },
    recents: [
      {
        available: true,
        lastOpenedAt: Math.floor(Date.now() / 1000),
        name: "E2E project",
        path: projectRoot,
      },
    ],
  })
)

const driverProcess = spawn(
  "xvfb-run",
  [
    "-a",
    driver,
    "--port",
    String(driverPort),
    "--native-driver",
    nativeDriver,
  ],
  {
    detached: process.platform !== "win32",
    env: { ...process.env, XDG_CONFIG_HOME: configRoot },
    stdio: ["ignore", "pipe", "pipe"],
  }
)
driverProcess.once("exit", (code, signal) => {
  driverExit = { code, signal }
})
for (const stream of [driverProcess.stdout, driverProcess.stderr]) {
  stream.on("data", (chunk) => {
    driverLog += chunk
  })
}

async function webdriver(method, route, body) {
  const response = await fetch(`${driverUrl}${route}`, {
    body: body === undefined ? undefined : JSON.stringify(body),
    headers: body === undefined ? undefined : { "content-type": "application/json" },
    method,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || payload.value?.error) {
    throw new Error(
      `WebDriver ${method} ${route} failed: ${JSON.stringify(payload)}`
    )
  }
  return payload.value
}

async function waitFor(check, description, timeout = 60_000) {
  const deadline = Date.now() + timeout
  let lastError
  while (Date.now() < deadline) {
    try {
      const result = await check()
      if (result) return result
    } catch (error) {
      lastError = error
    }
    await new Promise((resolve) => setTimeout(resolve, 200))
  }
  throw new Error(
    `Timed out waiting for ${description}${lastError ? `: ${lastError}` : ""}`
  )
}

async function execute(script, args = []) {
  return webdriver("POST", `/session/${sessionId}/execute/sync`, {
    args,
    script,
  })
}

async function find(using, value) {
  return webdriver("POST", `/session/${sessionId}/element`, { using, value })
}

async function click(using, value) {
  const element = await find(using, value)
  await webdriver(
    "POST",
    `/session/${sessionId}/element/${element["element-6066-11e4-a52e-4f735466cecf"]}/click`,
    {}
  )
}

try {
  await waitFor(
    () => {
      if (driverExit) {
        throw new Error(`tauri-driver exited: ${JSON.stringify(driverExit)}`)
      }
      return fetch(`${driverUrl}/status`).then((response) => response.ok)
    },
    "tauri-driver"
  )
  const session = await webdriver("POST", "/session", {
    capabilities: {
      alwaysMatch: {
        "tauri:options": { application },
      },
    },
  })
  sessionId = session.sessionId

  await waitFor(
    () => execute("return document.body.innerText").then((text) => text.includes("Open folder")),
    "Workspace Home",
    15_000
  )

  await click("xpath", "//button[normalize-space(.)='Settings']")
  await waitFor(
    () => execute("return Boolean(document.querySelector('dialog[open]'))"),
    "open Settings dialog"
  )
  const focusedControl = await execute(
    "return document.activeElement?.getAttribute('aria-label')"
  )
  if (focusedControl !== "Close settings") {
    throw new Error(`Settings initial focus was ${JSON.stringify(focusedControl)}`)
  }
  await click("css selector", "button[aria-label='Close settings']")

  await click(
    "xpath",
    `//button[.//small[normalize-space(.)=${JSON.stringify(projectRoot)}]]`
  )

  await waitFor(
    () =>
      execute("return document.body.innerText").then((text) =>
        text.includes("Runtime ready")
      ),
    "authenticated Canvas runtime",
    90_000
  )
  const frameTitle = await execute(
    "return document.querySelector('iframe')?.getAttribute('title')"
  )
  if (!frameTitle?.endsWith(" Canvas")) {
    throw new Error(`Canvas iframe was not named: ${JSON.stringify(frameTitle)}`)
  }

  const runtimeProcess = execFileSync("ps", ["-eo", "pid=,args="], {
    encoding: "utf8",
  })
    .split("\n")
    .map((line) => line.trim())
    .find(
      (line) =>
        line.includes("agent-html.mjs runtime") && line.includes(projectRoot)
    )
  if (!runtimeProcess) {
    throw new Error("The supervised Canvas runtime process was not found")
  }
  const runtimePid = Number(runtimeProcess.split(/\s+/, 1)[0])
  process.kill(runtimePid, "SIGTERM")
  await waitFor(
    () =>
      execute("return document.body.innerText").then(
        (text) => text.includes("Canvas runtime exited") && text.includes("Retry")
      ),
    "recoverable runtime crash"
  )
  await click("xpath", "//button[contains(normalize-space(.), 'Retry')]")
  await waitFor(
    () =>
      execute("return document.body.innerText").then((text) =>
        text.includes("Runtime ready")
      ),
    "runtime recovery",
    90_000
  )

  await click("xpath", "//button[contains(normalize-space(.), 'Switch workspace')]")
  await waitFor(
    () => execute("return document.body.innerText").then((text) => text.includes("Recent projects")),
    "Workspace Home after graceful shutdown"
  )
  await new Promise((resolve) => setTimeout(resolve, 750))
  const homeText = await execute("return document.body.innerText")
  if (homeText.includes("Canvas runtime exited")) {
    throw new Error("Graceful shutdown was reported as a runtime crash")
  }

  console.log("Packaged Tauri Desktop E2E passed")
} catch (error) {
  if (sessionId) {
    const [title, body, source] = await Promise.all([
      webdriver("GET", `/session/${sessionId}/title`).catch(String),
      execute("return document.body?.innerText").catch(String),
      webdriver("GET", `/session/${sessionId}/source`).catch(String),
    ])
    driverLog += `\nPage title: ${JSON.stringify(title)}`
    driverLog += `\nPage body: ${JSON.stringify(body)}`
    driverLog += `\nPage source: ${String(source).slice(0, 4000)}`
  }
  throw new Error(`${error.message}\n\nDriver output:\n${driverLog}`)
} finally {
  if (sessionId) {
    await webdriver("DELETE", `/session/${sessionId}`).catch(() => {})
  }
  try {
    if (process.platform === "win32") {
      driverProcess.kill()
    } else {
      process.kill(-driverProcess.pid, "SIGTERM")
    }
  } catch {
    // The driver process group may already have exited after session deletion.
  }
  driverProcess.stdout.destroy()
  driverProcess.stderr.destroy()
  await fs.rm(temporaryRoot, { force: true, recursive: true })
}
