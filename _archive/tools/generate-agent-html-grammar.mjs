import { readFileSync } from "node:fs"
import { readFile, writeFile } from "node:fs/promises"
import {
  registerHooks,
  stripTypeScriptTypes,
} from "node:module"
import { resolve } from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

process.removeAllListeners("warning")
process.on("warning", (warning) => {
  if (warning.name !== "ExperimentalWarning") {
    console.warn(warning)
  }
})

const repoRoot = fileURLToPath(new URL("../", import.meta.url))
const sourceRoot = resolve(repoRoot, "packages/agent-html/src")
const promptPath = resolve(sourceRoot, "schema/prompt.md")
const promptGrammarPath = resolve(sourceRoot, "schema/prompt-grammar.ts")

function parseOutputPath(args) {
  const outIndex = args.indexOf("--out")

  if (outIndex === -1) {
    return undefined
  }

  const outputPath = args[outIndex + 1]
  if (!outputPath) {
    throw new Error("Missing value for --out")
  }

  return resolve(repoRoot, outputPath)
}

registerHooks({
  resolve(specifier, context, nextResolve) {
    if (specifier.startsWith("@/agent-html/")) {
      const resolvedPath = resolve(
        sourceRoot,
        specifier.replace("@/agent-html/", "")
      )

      return {
        shortCircuit: true,
        url: pathToFileURL(`${resolvedPath}.ts`).href,
      }
    }

    return nextResolve(specifier, context)
  },
  load(url, context, nextLoad) {
    if (!url.endsWith(".ts")) {
      return nextLoad(url, context)
    }

    const source = readFileSyncFromUrl(url)

    return {
      format: "module",
      shortCircuit: true,
      source: stripTypeScriptTypes(source),
    }
  },
})

function readFileSyncFromUrl(url) {
  return readFileSync(fileURLToPath(url), "utf8")
}

const sourcePrompt = await readFile(promptPath, "utf8")
const { buildAgentHtmlPromptDocument } = await import(
  pathToFileURL(promptGrammarPath).href
)
const output = `${buildAgentHtmlPromptDocument(sourcePrompt).trim()}\n`
const outputPath = parseOutputPath(process.argv.slice(2))

if (outputPath) {
  try {
    await writeFile(outputPath, output, "utf8")
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error)
    throw new Error(`Unable to write generated grammar to ${outputPath}: ${message}`)
  }
} else {
  process.stdout.write(output)
}
