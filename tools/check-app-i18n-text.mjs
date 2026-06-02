import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const appSrc = path.join(root, "apps", "agent-html-app", "src")
const baselinePath = path.join(root, "config", "app-i18n-text-baseline.json")
const shouldUpdateBaseline = process.argv.includes("--update-baseline")

const excludedPathParts = [
  `${path.sep}locales${path.sep}`,
  `${path.sep}workspace${path.sep}fixtures${path.sep}`,
]

const uiAttributeNames = new Set([
  "aria-label",
  "alt",
  "placeholder",
  "title",
])

const uiPropertyNames = new Set([
  "description",
  "emptyText",
  "label",
  "message",
  "name",
  "placeholder",
  "subtitle",
  "text",
  "title",
  "tooltip",
])

function fail(message) {
  console.error(`i18n:text failed: ${message}`)
  process.exit(1)
}

function toRepoPath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/")
}

function isExcludedFile(filePath) {
  return (
    filePath.endsWith(".test.ts") ||
    filePath.endsWith(".test.tsx") ||
    excludedPathParts.some((part) => filePath.includes(part))
  )
}

function readSourceFiles(dir) {
  const files = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...readSourceFiles(entryPath))
      continue
    }

    if (
      (entry.name.endsWith(".ts") || entry.name.endsWith(".tsx")) &&
      !isExcludedFile(entryPath)
    ) {
      files.push(entryPath)
    }
  }

  return files.sort()
}

function normalizeText(text) {
  return text.replace(/\s+/g, " ").trim()
}

function hasHumanText(text) {
  const normalized = normalizeText(text)

  return /[A-Za-z\u4e00-\u9fff]/.test(normalized)
}

function getPropertyNameText(name) {
  if (ts.isIdentifier(name) || ts.isStringLiteral(name)) {
    return name.text
  }

  return null
}

function getJsxTagNameText(name) {
  if (ts.isIdentifier(name)) {
    return name.text
  }

  if (ts.isPropertyAccessExpression(name)) {
    return name.name.text
  }

  return null
}

function hasTransAncestor(node) {
  let current = node.parent

  while (current) {
    if (ts.isJsxElement(current)) {
      const tag = getJsxTagNameText(current.openingElement.tagName)

      if (tag === "Trans") {
        return true
      }
    }

    if (ts.isJsxSelfClosingElement(current)) {
      const tag = getJsxTagNameText(current.tagName)

      if (tag === "Trans") {
        return true
      }
    }

    current = current.parent
  }

  return false
}

function hasLinguiCallAncestor(node) {
  let current = node.parent

  while (current) {
    if (ts.isCallExpression(current)) {
      const expression = current.expression

      if (
        ts.isIdentifier(expression) &&
        (expression.text === "t" || expression.text === "_")
      ) {
        return true
      }
    }

    current = current.parent
  }

  return false
}

function getLine(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function addFinding(findings, sourceFile, filePath, kind, text, node) {
  const normalized = normalizeText(text)

  if (!hasHumanText(normalized)) {
    return
  }

  findings.push({
    file: toRepoPath(filePath),
    kind,
    line: getLine(sourceFile, node),
    text: normalized,
  })
}

function collectFindings(filePath) {
  const source = fs.readFileSync(filePath, "utf8")
  const sourceFile = ts.createSourceFile(
    filePath,
    source,
    ts.ScriptTarget.Latest,
    true,
    filePath.endsWith(".tsx") ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
  )
  const findings = []

  function visit(node) {
    if (ts.isJsxText(node) && !hasTransAncestor(node)) {
      addFinding(findings, sourceFile, filePath, "jsx-text", node.getText(), node)
    }

    if (
      ts.isJsxAttribute(node) &&
      uiAttributeNames.has(node.name.text) &&
      node.initializer &&
      ts.isStringLiteral(node.initializer) &&
      !hasTransAncestor(node)
    ) {
      addFinding(
        findings,
        sourceFile,
        filePath,
        `jsx-attribute:${node.name.text}`,
        node.initializer.text,
        node,
      )
    }

    if (
      ts.isPropertyAssignment(node) &&
      ts.isStringLiteral(node.initializer) &&
      !hasLinguiCallAncestor(node)
    ) {
      const propertyName = getPropertyNameText(node.name)

      if (propertyName && uiPropertyNames.has(propertyName)) {
        addFinding(
          findings,
          sourceFile,
          filePath,
          `property:${propertyName}`,
          node.initializer.text,
          node,
        )
      }
    }

    ts.forEachChild(node, visit)
  }

  visit(sourceFile)

  return findings
}

function signature(entry) {
  return `${entry.file}\0${entry.kind}\0${entry.text}`
}

function readBaseline() {
  if (!fs.existsSync(baselinePath)) {
    return []
  }

  const parsed = JSON.parse(fs.readFileSync(baselinePath, "utf8"))

  if (!Array.isArray(parsed.entries)) {
    fail("baseline must contain an entries array")
  }

  return parsed.entries
}

function writeBaseline(entries) {
  const content = `${JSON.stringify(
    {
      version: 1,
      entries: entries.map(({ file, kind, text }) => ({ file, kind, text })),
    },
    null,
    2,
  )}\n`

  fs.writeFileSync(baselinePath, content)
}

function formatEntry(entry) {
  return `${entry.file}:${entry.line ?? "?"} ${entry.kind} ${JSON.stringify(
    entry.text,
  )}`
}

const findings = readSourceFiles(appSrc)
  .flatMap((filePath) => collectFindings(filePath))
  .sort((a, b) => signature(a).localeCompare(signature(b)))

if (shouldUpdateBaseline) {
  writeBaseline(findings)
  console.log(`i18n:text baseline updated (${findings.length} entries)`)
  process.exit(0)
}

const baseline = readBaseline()
const baselineSignatures = new Set(baseline.map(signature))
const findingSignatures = new Set(findings.map(signature))
const newFindings = findings.filter((finding) => !baselineSignatures.has(signature(finding)))
const staleEntries = baseline.filter((entry) => !findingSignatures.has(signature(entry)))

if (newFindings.length > 0 || staleEntries.length > 0) {
  if (newFindings.length > 0) {
    console.error("\nNew untranslated UI text:")
    for (const finding of newFindings.slice(0, 30)) {
      console.error(`- ${formatEntry(finding)}`)
    }
  }

  if (staleEntries.length > 0) {
    console.error("\nStale i18n text baseline entries:")
    for (const entry of staleEntries.slice(0, 30)) {
      console.error(`- ${formatEntry(entry)}`)
    }
  }

  fail(
    "wrap stable UI text with Lingui, or run npm run i18n:text:update after approving baseline changes",
  )
}

console.log(`i18n:text passed (${findings.length} baseline entries)`)
