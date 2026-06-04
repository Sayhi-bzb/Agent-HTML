import { discoverReactArtifacts, parseRootArg, workspaceRelativePath } from "./paths.mjs"
import { collectBlockIds, readBlockOpenTags, readTextFile } from "./source.mjs"

const unstableBlockIds = new Set(["block1", "block2", "section1", "section2", "temp", "top"])
const rawColorPattern = /\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/
const unsafeClassPattern = /\b(?:gradient|shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl)|text-(?:[3-9]xl|[1-9][0-9]xl)|font-\w+|tracking-\w+|\[[^\]]+\])\b/
const forbiddenImportPattern = /from\s+["'](?:@\/app\/|.*apps\/agent-html-app|@\/agent-html\/runtime\/ui|@\/agent-html\/runtime["'])/g
const forbiddenRuntimeApiPattern = /\b(?:renderAgentHtml|renderInteractiveAgentHtml)\b/g
const primitiveBypassPattern = /<(?:button|input|table|thead|tbody|tr|th|td)\b/g

function createIssue({ filePath, line = 1, message, severity = "warning", suggestion }) {
  return {
    filePath,
    line,
    message,
    severity,
    suggestion,
  }
}

function lineForIndex(source, index) {
  return source.slice(0, index).split(/\r?\n/).length
}

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)
}

function hasDefaultExport(source) {
  return /export\s+default\s+/.test(source)
}

function hasReactComponentDefaultExport(source) {
  return /export\s+default\s+function\s+[A-Z]/.test(source) ||
    /function\s+[A-Z][A-Za-z0-9_]*\s*\(/.test(source) ||
    /const\s+[A-Z][A-Za-z0-9_]*\s*=/.test(source)
}

function collectVisualIssues({ relativePath, source }) {
  const issues = []
  const stylePattern = /\bstyle\s*=\s*\{/g
  const classPattern = /\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|\{([^}]*)\})/g
  let match

  while ((match = stylePattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        line: lineForIndex(source, match.index),
        message: "Inline visual style is not allowed in React Canvas artifacts.",
        suggestion: "Use local UI primitives, semantic token classes, or Canvas scale utilities.",
      })
    )
  }

  while ((match = classPattern.exec(source)) !== null) {
    const classValue = match.slice(1).find(Boolean) ?? ""
    const unsafe =
      classValue === "" ||
      rawColorPattern.test(classValue) ||
      unsafeClassPattern.test(classValue)

    if (unsafe) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, match.index),
          message: `Unsafe className in artifact source: ${classValue || "dynamic className"}`,
          suggestion: "Use semantic tokens and compact Canvas scale utilities; keep visual treatment in local UI primitives.",
        })
      )
    }
  }

  return issues
}

function collectBoundaryIssues({ relativePath, source }) {
  const issues = []
  let match

  while ((match = forbiddenImportPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        line: lineForIndex(source, match.index),
        message: "Forbidden app or old runtime import in React Canvas artifact.",
        severity: "error",
        suggestion: "Use @agent-html/react and local .agent-html/ui, hooks, lib, schema, or data imports.",
      })
    )
    forbiddenImportPattern.lastIndex = match.index + 1
  }

  while ((match = forbiddenRuntimeApiPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        line: lineForIndex(source, match.index),
        message: "Old AHTML render API is not allowed in React Canvas artifacts.",
        severity: "error",
        suggestion: "Render normal React through Artifact, Block, and Action markers.",
      })
    )
    forbiddenRuntimeApiPattern.lastIndex = match.index + 1
  }

  while ((match = primitiveBypassPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        line: lineForIndex(source, match.index),
        message: `Primitive bypass in artifact source: ${match[0]}`,
        suggestion: "Use local .agent-html/ui primitives instead of hand-written common controls or tables.",
      })
    )
    primitiveBypassPattern.lastIndex = match.index + 1
  }

  return issues
}

function collectBlockProtocolIssues({ relativePath, source }) {
  const issues = []

  for (const block of readBlockOpenTags(source)) {
    if (/\b(?:className|style)\s*=/.test(block.attrs)) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, block.index),
          message: "Block is protocol-only and must not receive className or style.",
          severity: "error",
          suggestion: "Move layout and visual treatment inside the Block content.",
        })
      )
    }
  }

  return issues
}

export function analyzeReactCanvasArtifact({ filePath, relativePath, source }) {
  const issues = []

  if (!hasDefaultExport(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        message: "Artifact file must have a default export.",
        severity: "error",
        suggestion: "Default export a React component.",
      })
    )
  } else if (!hasReactComponentDefaultExport(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        message: "Default export should be a React component.",
        suggestion: "Use a PascalCase function or component constant.",
      })
    )
  }

  if (!/<Artifact\b/.test(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        message: "Artifact must use the Artifact wrapper.",
        severity: "error",
        suggestion: 'Wrap content in <Artifact title="...">.',
      })
    )
  }

  const blocks = collectBlockIds(source)
  if (blocks.length === 0) {
    issues.push(
      createIssue({
        filePath: relativePath,
        message: "Artifact must contain at least one Block.",
        severity: "error",
        suggestion: 'Wrap major semantic regions in <Block id="summary">.',
      })
    )
  }

  const seen = new Map()
  for (const block of blocks) {
    if (!block.id) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, block.index),
          message: "Block is missing a stable id.",
          severity: "error",
          suggestion: 'Add a readable kebab-case id, such as id="next-steps".',
        })
      )
      continue
    }

    if (!isKebabCase(block.id)) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, block.index),
          message: `Block id is not readable kebab-case: ${block.id}`,
          suggestion: "Use a stable semantic id like competitor-map or risk-table.",
        })
      )
    }

    if (unstableBlockIds.has(block.id)) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, block.index),
          message: `Block id is unstable or positional: ${block.id}`,
          suggestion: "Use a semantic id that survives reordering.",
        })
      )
    }

    const firstIndex = seen.get(block.id)
    if (firstIndex !== undefined) {
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, block.index),
          message: `Duplicate Block id: ${block.id}`,
          severity: "error",
          suggestion: "Every Block id must be unique within one artifact.",
        })
      )
      issues.push(
        createIssue({
          filePath: relativePath,
          line: lineForIndex(source, firstIndex),
          message: `Duplicate Block id first appears here: ${block.id}`,
          severity: "error",
          suggestion: "Rename one of the duplicate blocks.",
        })
      )
    } else {
      seen.set(block.id, block.index)
    }
  }

  if (blocks.length === 1 && source.length > 1800) {
    issues.push(
      createIssue({
        filePath: relativePath,
        line: lineForIndex(source, blocks[0].index),
        message: "Artifact appears to use one giant Block.",
        suggestion: "Split major semantic regions into separate Blocks.",
      })
    )
  }

  return [
    ...issues,
    ...collectBoundaryIssues({ relativePath, source }),
    ...collectBlockProtocolIssues({ relativePath, source }),
    ...collectVisualIssues({ relativePath, source }),
  ]
}

export async function runGuard({ root }) {
  const artifacts = await discoverReactArtifacts(root)
  const issues = []

  for (const filePath of artifacts) {
    const source = await readTextFile(filePath)
    issues.push(
      ...analyzeReactCanvasArtifact({
        filePath,
        relativePath: workspaceRelativePath(root, filePath),
        source,
      })
    )
  }

  return { artifacts, issues }
}

export async function runGuardCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const report = await runGuard({ root })

  if (report.artifacts.length === 0) {
    console.log("No React Canvas artifacts found.")
    return { issueCount: 0 }
  }

  if (report.issues.length === 0) {
    console.log(`Guard passed ${report.artifacts.length} artifact(s).`)
    return { issueCount: 0 }
  }

  for (const issue of report.issues) {
    console.log(
      [
        `${issue.severity.toUpperCase()} ${issue.filePath}:${issue.line}`,
        issue.message,
        issue.suggestion ? `Fix: ${issue.suggestion}` : null,
        "",
      ].filter(Boolean).join("\n")
    )
  }

  return { issueCount: report.issues.length }
}
