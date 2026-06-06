import fs from "node:fs/promises"
import path from "node:path"

import { resolveWorkspaceTemplateRoot } from "./dev-server/context.mjs"
import { parseRootArg } from "./react-canvas/paths.mjs"

const excludedTemplateEntries = new Set([
  ".git",
  ".vite",
  "build",
  "dist",
  "manifest.json",
  "node_modules",
  "package-lock.json",
  "pnpm-lock.yaml",
  "yarn.lock",
])

async function pathExists(filePath) {
  try {
    await fs.access(filePath)
    return true
  } catch (error) {
    if (error && error.code === "ENOENT") {
      return false
    }

    throw error
  }
}

function shouldCopyTemplatePath(filePath) {
  return !filePath
    .split(path.sep)
    .some((segment) => excludedTemplateEntries.has(segment))
}

export async function initializeAgentHtmlWorkspace({
  root,
  templateRoot = resolveWorkspaceTemplateRoot(),
}) {
  const targetRoot = path.join(root, "agent-html")

  if (!(await pathExists(templateRoot))) {
    throw new Error(`Agent HTML template not found: ${templateRoot}`)
  }

  if (await pathExists(targetRoot)) {
    throw new Error("agent-html/ already exists")
  }

  await fs.mkdir(root, { recursive: true })
  await fs.cp(templateRoot, targetRoot, {
    recursive: true,
    errorOnExist: true,
    filter(source) {
      const relativePath = path.relative(templateRoot, source)
      return shouldCopyTemplatePath(relativePath)
    },
  })

  return {
    targetRoot,
    templateRoot,
  }
}

export async function runInitCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const result = await initializeAgentHtmlWorkspace({ root })

  console.log(`Created agent-html workspace at ${result.targetRoot}`)
  console.log("Run `npx agent-html dev` to start the Canvas host.")

  return result
}
