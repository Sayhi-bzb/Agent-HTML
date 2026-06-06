import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import { initializeAgentHtmlWorkspace } from "./init.mjs"

async function exists(filePath) {
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

async function createTemplateRoot() {
  const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-template-"))
  const templateRoot = path.join(root, "agent-html")

  await fs.mkdir(path.join(templateRoot, "artifacts"), { recursive: true })
  await fs.mkdir(path.join(templateRoot, "styles"), { recursive: true })
  await fs.mkdir(path.join(templateRoot, "node_modules", "left-pad"), {
    recursive: true,
  })
  await fs.mkdir(path.join(templateRoot, ".vite"), { recursive: true })
  await fs.writeFile(path.join(templateRoot, "README.md"), "# Agent HTML\n")
  await fs.writeFile(
    path.join(templateRoot, "artifacts", "example.artifact.tsx"),
    "export default function Example() { return null }\n"
  )
  await fs.writeFile(path.join(templateRoot, "styles", "index.css"), "")
  await fs.writeFile(path.join(templateRoot, "package-lock.json"), "{}")
  await fs.writeFile(
    path.join(templateRoot, "node_modules", "left-pad", "index.js"),
    ""
  )
  await fs.writeFile(path.join(templateRoot, ".vite", "cache.json"), "{}")

  return templateRoot
}

describe("agent-html init", () => {
  it("creates an agent-html workspace from the template", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-init-"))
    const templateRoot = await createTemplateRoot()

    const result = await initializeAgentHtmlWorkspace({ root, templateRoot })

    expect(result.targetRoot).toBe(path.join(root, "agent-html"))
    await expect(
      fs.readFile(path.join(root, "agent-html", "README.md"), "utf8")
    ).resolves.toContain("Agent HTML")
    expect(
      await exists(
        path.join(root, "agent-html", "artifacts", "example.artifact.tsx")
      )
    ).toBe(true)
    expect(await exists(path.join(root, "agent-html", "package-lock.json"))).toBe(
      false
    )
    expect(await exists(path.join(root, "agent-html", "node_modules"))).toBe(
      false
    )
    expect(await exists(path.join(root, "agent-html", ".vite"))).toBe(false)
  })

  it("fails without changing files when agent-html already exists", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-init-"))
    const templateRoot = await createTemplateRoot()
    const existingReadme = path.join(root, "agent-html", "README.md")

    await fs.mkdir(path.join(root, "agent-html"), { recursive: true })
    await fs.writeFile(existingReadme, "existing\n")

    await expect(
      initializeAgentHtmlWorkspace({ root, templateRoot })
    ).rejects.toThrow("agent-html/ already exists")
    await expect(fs.readFile(existingReadme, "utf8")).resolves.toBe("existing\n")
  })
})
