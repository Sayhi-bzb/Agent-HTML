import { readFileSync, readdirSync, statSync } from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(__dirname, "..", "..")

const scanRoots = [
  path.join(repoRoot, "src", "gallery", "preview", "ui"),
  path.join(repoRoot, "src", "gallery", "preview", "cards"),
]

const typographyRules = [
  { category: "size", pattern: /\btext-(xs|sm|base|lg|xl|2xl)\b/g },
  { category: "weight", pattern: /\bfont-(medium|semibold|bold)\b/g },
  {
    category: "leading",
    pattern: /\bleading-(none|tight|6)\b/g,
  },
  { category: "tracking", pattern: /\btracking-(tight|widest)\b/g },
]

const allowedFragments = [
  "text-[length:var(--type-",
  "leading-[var(--type-",
  "font-heading",
  "type-heading-",
  "type-body",
  "type-supporting",
  "type-control",
  "type-label",
  "type-code",
]

const sourceExtensions = new Set([".ts", ".tsx"])

function walk(dir) {
  const entries = readdirSync(dir, { withFileTypes: true })
  const files = []

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      files.push(...walk(fullPath))
      continue
    }

    if (sourceExtensions.has(path.extname(entry.name))) {
      files.push(fullPath)
    }
  }

  return files
}

function getLineNumber(source, index) {
  let line = 1
  for (let i = 0; i < index; i += 1) {
    if (source[i] === "\n") {
      line += 1
    }
  }
  return line
}

function isAllowedContext(source, matchIndex) {
  const start = Math.max(0, matchIndex - 80)
  const end = Math.min(source.length, matchIndex + 120)
  const window = source.slice(start, end)

  return allowedFragments.some((fragment) => window.includes(fragment))
}

function collectViolations(filePath) {
  const source = readFileSync(filePath, "utf8")
  const violations = []

  for (const rule of typographyRules) {
    const matches = source.matchAll(rule.pattern)
    for (const match of matches) {
      const index = match.index ?? 0
      const token = match[0]

      if (isAllowedContext(source, index)) {
        continue
      }

      violations.push({
        category: rule.category,
        filePath,
        line: getLineNumber(source, index),
        token,
      })
    }
  }

  return violations
}

function toRepoRelative(filePath) {
  return path.relative(repoRoot, filePath).replaceAll("\\", "/")
}

function main() {
  const files = scanRoots.flatMap((root) => {
    if (!statSync(root, { throwIfNoEntry: false })) {
      return []
    }
    return walk(root)
  })

  const violations = files.flatMap(collectViolations)

  if (violations.length === 0) {
    console.log(
      `Typography check passed. Scanned ${files.length} files with no violations.`
    )
    return
  }

  for (const violation of violations) {
    console.log(
      `${toRepoRelative(violation.filePath)}:${violation.line}  ${violation.category}  ${violation.token}`
    )
  }

  console.log("")
  console.log(
    `Typography check failed. Scanned ${files.length} files, found ${violations.length} violations.`
  )
  process.exitCode = 1
}

main()
