import { startDevHost } from "./dev-host.mjs"
import { buildDemoHost } from "./demo-build.mjs"
import { runInitCommand } from "./init.mjs"
import { runGuardCommand } from "./react-canvas/guard.mjs"
import { runRuntimeSidecar } from "./dev-server/runtime-command.mjs"
import { runRuntimePrepareCommand } from "./dev-server/runtime-prepare.mjs"

export async function runAgentHtmlCli(args) {
  const [command, ...rest] = args

  if (command === "init") {
    await runInitCommand({ args: rest, cwd: process.cwd() })
    return
  }

  if (command === "guard") {
    const result = await runGuardCommand({ args: rest, cwd: process.cwd() })
    if (result.issueCount > 0) {
      process.exitCode = 1
    }
    return
  }

  if (command === "dev") {
    await startDevHost({ args: rest, cwd: process.cwd() })
    return
  }

  if (command === "runtime") {
    await runRuntimeSidecar({ args: rest, cwd: process.cwd() })
    return
  }

  if (command === "runtime-prepare") {
    await runRuntimePrepareCommand({ args: rest, cwd: process.cwd() })
    return
  }

  if (command === "demo-build") {
    await buildDemoHost({ args: rest, cwd: process.cwd() })
    return
  }

  console.log(
    [
      "Usage:",
      "  agent-html init [--root <path>]",
      "  agent-html guard [--root <path>]",
      "  agent-html dev [--root <path>] [--port <port>] [--pipeline codex|example]",
      "  agent-html runtime [--root <path>] [--pipeline codex|example]",
      "  agent-html runtime-prepare [--root <path>]",
      "  agent-html demo-build [--root <path>] [--out-dir <path>]",
    ].join("\n")
  )
}
