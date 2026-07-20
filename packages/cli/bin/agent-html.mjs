#!/usr/bin/env node
import { runAgentHtmlCli } from "../src/index.mjs"

runAgentHtmlCli(process.argv.slice(2)).catch((error) => {
  console.error(error instanceof Error ? error.message : String(error))
  process.exitCode = 1
})
