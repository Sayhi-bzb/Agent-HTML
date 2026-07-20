import { spawn, spawnSync } from "node:child_process"

const activeProcessIds = new Set()
let signalHandlersInstalled = false

export function terminateProcessTree(pid) {
  if (!Number.isInteger(pid) || pid <= 0) return
  if (process.platform === "win32") {
    spawnSync("taskkill.exe", ["/PID", String(pid), "/T", "/F"], {
      stdio: "ignore",
      windowsHide: true,
    })
    return
  }
  try {
    process.kill(-pid, "SIGKILL")
  } catch (error) {
    if (error?.code !== "ESRCH") throw error
  }
}

export async function runOwnedProcess(
  command,
  args,
  { capture = false, environment = process.env, lease, stdio } = {}
) {
  installSignalHandlers()
  const child = spawn(command, args, {
    detached: process.platform !== "win32",
    env: environment,
    stdio: stdio || (capture ? ["ignore", "pipe", "pipe"] : "inherit"),
    windowsHide: true,
  })
  activeProcessIds.add(child.pid)
  await lease?.registerChild(child.pid)

  let stdout = ""
  let stderr = ""
  if (capture) {
    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk
    })
  }

  try {
    return await new Promise((resolve, reject) => {
      child.once("error", reject)
      child.once("exit", (code, signal) => {
        if (code === 0) {
          resolve({ stderr, stdout })
          return
        }
        const error = new Error(
          `Command failed (${code ?? signal}): ${command} ${args.join(" ")}`
        )
        error.code = code
        error.signal = signal
        error.stderr = stderr
        error.stdout = stdout
        reject(error)
      })
    })
  } finally {
    activeProcessIds.delete(child.pid)
    await lease?.unregisterChild(child.pid)
  }
}

function installSignalHandlers() {
  if (signalHandlersInstalled) return
  signalHandlersInstalled = true

  for (const [signal, exitCode] of [
    ["SIGINT", 130],
    ["SIGTERM", 143],
  ]) {
    process.once(signal, () => {
      for (const pid of activeProcessIds) terminateProcessTree(pid)
      process.exit(exitCode)
    })
  }
}
