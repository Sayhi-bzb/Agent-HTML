import { startDevHost } from "./dev-host.mjs"
import { runGuardCommand } from "./react-canvas/guard.mjs"

export async function runAgentHtmlCli(args) {
  const [command, ...rest] = args

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

  console.log(
    [
      "Usage:",
      "  agent-html guard [--root <path>]",
      "  agent-html dev [--root <path>] [--port <port>]",
    ].join("\n")
  )
}
