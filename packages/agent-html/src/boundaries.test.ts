/// <reference types="node" />

import { readFileSync, readdirSync, statSync } from "node:fs"
import { join, relative } from "node:path"

import { describe, expect, it } from "vitest"

const root = process.cwd()

function filesUnder(directory: string): string[] {
  const absoluteDirectory = join(root, directory)
  const entries = readdirSync(absoluteDirectory, { withFileTypes: true })

  return entries.flatMap((entry) => {
    const absolutePath = join(absoluteDirectory, entry.name)
    const relativePath = relative(root, absolutePath).replace(/\\/g, "/")

    if (entry.isDirectory()) {
      return filesUnder(relativePath)
    }

    return statSync(absolutePath).isFile() ? [relativePath] : []
  })
}

function sourceFilesUnder(directory: string) {
  return filesUnder(directory).filter((file) => /\.(ts|tsx)$/.test(file))
}

describe("agent-html boundaries", () => {
  it("keeps the standalone example on explicit agent-html boundary imports", () => {
    const forbidden =
      /@\/agent-html\/(fixtures|examples|ui|runtime\/render|runtime\/ui)\b|@\/components\/ui\b/
    const offenders = sourceFilesUnder("apps/agent-html-example/src").filter(
      (file) => forbidden.test(readFileSync(join(root, file), "utf8"))
    )

    expect(offenders).toEqual([])
  })

  it("keeps the standalone example off the app frontend", () => {
    const forbidden = /@\/app\b|@\/app\/|src\/app|app\/index\.css/
    const offenders = sourceFilesUnder("apps/agent-html-example/src").filter(
      (file) => forbidden.test(readFileSync(join(root, file), "utf8"))
    )

    expect(offenders).toEqual([])
  })

  it("keeps gallery preview cards off agent-html runtime UI", () => {
    const forbidden = /@\/agent-html\/runtime\/ui/
    const offenders = sourceFilesUnder(
      "apps/agent-html-app/src/gallery/preview/cards"
    ).filter((file) => forbidden.test(readFileSync(join(root, file), "utf8")))

    expect(offenders).toEqual([])
  })
})
