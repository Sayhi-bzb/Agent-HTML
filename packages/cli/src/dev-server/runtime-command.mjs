import crypto from "node:crypto"

import { startDevHost } from "./server.mjs"

export const runtimeTokenEnvironmentVariable = "AGENT_HTML_RUNTIME_TOKEN"
const forcedRuntimeExitDelayMs = 2_500

export function createRuntimeToken() {
  return crypto.randomBytes(32).toString("base64url")
}

export async function runRuntimeSidecar({
  args,
  cwd,
  env = process.env,
  writeLine = (line) => process.stdout.write(`${line}\n`),
}) {
  const token = env[runtimeTokenEnvironmentVariable]
  if (!token) {
    throw new Error(`${runtimeTokenEnvironmentVariable} is required`)
  }

  const runtime = await startDevHost({
    args,
    cwd,
    runtime: {
      allowShutdown: true,
      authToken: token,
      machineReadable: true,
      port: 0,
      writeLine,
    },
  })

  let stopping = false
  const stop = () => {
    if (stopping) {
      return
    }

    stopping = true
    runtime.server.close(() => {})
  }

  process.once("SIGINT", stop)
  process.once("SIGTERM", stop)
  runtime.server.once("close", () => {
    process.off("SIGINT", stop)
    process.off("SIGTERM", stop)

    const forcedExit = setTimeout(() => {
      process.exit(0)
    }, forcedRuntimeExitDelayMs)
    forcedExit.unref()
  })

  return runtime
}
