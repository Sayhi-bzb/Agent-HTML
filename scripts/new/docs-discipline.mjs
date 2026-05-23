import { readdir, readFile } from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const docsRootDir = "docs"

export const docsDisciplineRules = {
  allowedDocPaths: new Set([
    "architecture/architecture.md",
    "architecture/schema.md",
    "components.md",
    "details/README.md",
    "details/component-details.md",
    "details/current-contract-audit.md",
    "details/current-contract-component-matrix.md",
    "details/high-risk-runtime-bridges.md",
    "index.md",
    "layout.md",
    "roadmap.md",
    "syntax.md",
    "todo.md",
  ]),
  bannedEverywherePatterns: [
    {
      label: "phase summary label",
      regex: /\bPhase\s+\d(?:[A-Z])?\b/g,
    },
    {
      label: "phase summary range",
      regex: /\b\d[A-Z]-\d[A-Z]\b/g,
    },
    {
      label: "phase summary checkpoint",
      regex: /\b5C\b/g,
    },
    {
      label: "post-phase cleanup label",
      regex: /post-phase cleanup/gi,
    },
    {
      label: "legacy stage heading",
      regex: /阶段含义/g,
    },
  ],
}

export function normalizeDocsPath(filePath) {
  return filePath.split(path.sep).join("/")
}

export function listLineNumber(content, index) {
  return content.slice(0, index).split("\n").length
}

export function collectDocsDisciplineViolations(files) {
  const violations = []

  for (const file of files) {
    const relativePath = normalizeDocsPath(file.relativePath)
    const content = file.content

    if (!docsDisciplineRules.allowedDocPaths.has(relativePath)) {
      violations.push({
        relativePath,
        line: 1,
        label: "unexpected docs path",
        match: relativePath,
        message: `"${relativePath}" is not part of the current docs/ surface. Add it intentionally and update scripts/docs-discipline.mjs.`,
      })
      continue
    }

    for (const pattern of docsDisciplineRules.bannedEverywherePatterns) {
      for (const match of iteratePatternMatches(content, pattern.regex)) {
        violations.push({
          relativePath,
          line: listLineNumber(content, match.index ?? 0),
          label: pattern.label,
          match: match[0],
          message: `"${match[0]}" is no longer allowed in docs/.`,
        })
      }
    }
  }

  return violations
}

export function* iteratePatternMatches(content, pattern) {
  const regex = new RegExp(pattern.source, pattern.flags)

  for (const match of content.matchAll(regex)) {
    yield match
  }
}

export async function listDocsFiles(rootDir = process.cwd()) {
  const docsDir = path.join(rootDir, docsRootDir)
  return collectDocsFiles(docsDir, "")
}

async function collectDocsFiles(absoluteDir, relativeDir) {
  const entries = await readdir(absoluteDir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const nextRelativePath = relativeDir
      ? path.posix.join(relativeDir, entry.name)
      : entry.name
    const nextAbsolutePath = path.join(absoluteDir, entry.name)

    if (entry.isDirectory()) {
      files.push(...(await collectDocsFiles(nextAbsolutePath, nextRelativePath)))
      continue
    }

    if (!entry.isFile() || path.extname(entry.name) !== ".md") {
      continue
    }

    files.push({
      relativePath: nextRelativePath,
      content: await readFile(nextAbsolutePath, "utf8"),
    })
  }

  return files
}

export async function validateDocsDiscipline(rootDir = process.cwd()) {
  const files = await listDocsFiles(rootDir)
  return collectDocsDisciplineViolations(files)
}

const currentFilePath = fileURLToPath(import.meta.url)

if (process.argv[1] && path.resolve(process.argv[1]) === currentFilePath) {
  const violations = await validateDocsDiscipline()

  if (violations.length > 0) {
    for (const violation of violations) {
      console.error(
        `${docsRootDir}/${violation.relativePath}:${violation.line} ${violation.message}`,
      )
    }

    process.exitCode = 1
  }
}
