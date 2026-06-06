import {
  discoverReactArtifacts,
  discoverReactBlockImplementations,
  parseRootArg,
  workspaceRelativePath,
} from "./paths.mjs"
import { collectBlockIds, readBlockOpenTags } from "./block-tags.mjs"
import { readTextFile } from "./workspace-file.mjs"

export const reactCanvasGuardScopes = {
  artifactEntryProtocol: "artifact-entry-protocol",
  blockImplementationSource: "block-implementation-source",
  workspaceBoundary: "workspace-boundary",
}

const unstableBlockIds = new Set(["block1", "block2", "section1", "section2", "temp", "top"])
const rawColorPattern = /\b(?:bg|text|border|from|to|via)-(?:slate|gray|zinc|neutral|stone|red|orange|amber|yellow|lime|green|emerald|teal|cyan|sky|blue|indigo|violet|purple|fuchsia|pink|rose)-\d{2,3}\b/
const unsafeClassPattern = /\b(?:gradient|shadow-(?:lg|xl|2xl)|rounded-(?:xl|2xl|3xl)|text-(?:[3-9]xl|[1-9][0-9]xl)|font-\w+|tracking-\w+|\[[^\]]+\])\b/
const forbiddenImportPattern = /from\s+["'](?:@\/app\/|.*apps\/agent-html-app|@\/agent-html\/runtime\/ui|@\/agent-html\/runtime["'])/g
const forbiddenPublicImportPattern = /from\s+["']\.\.\/public(?:\/|["'])/g
const forbiddenRuntimeApiPattern = /\b(?:renderAgentHtml|renderInteractiveAgentHtml)\b/g
const nativeControlPattern = /<(?:button|input)\b/
const nativeTablePattern = /<(?:table|thead|tbody|tr|th|td)\b/
const maxClassNameMessageLength = 96

function createIssue({
  filePath,
  guardScope,
  line = 1,
  message,
  severity = "warning",
  suggestion,
}) {
  return {
    filePath,
    guardScope,
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

function compactClassNameForMessage(classValue) {
  if (classValue.length <= maxClassNameMessageLength) {
    return classValue
  }

  return `${classValue.slice(0, maxClassNameMessageLength - 1)}…`
}

function hasDefaultExport(source) {
  return /export\s+default\s+/.test(source)
}

function hasReactComponentDefaultExport(source) {
  return /export\s+default\s+function\s+[A-Z]/.test(source) ||
    /function\s+[A-Z][A-Za-z0-9_]*\s*\(/.test(source) ||
    /const\s+[A-Z][A-Za-z0-9_]*\s*=/.test(source)
}

function collectVisualIssues({
  guardScope = reactCanvasGuardScopes.blockImplementationSource,
  relativePath,
  source,
}) {
  const issues = []
  const stylePattern = /\bstyle\s*=\s*\{/g
  const classPattern = /\bclassName\s*=\s*(?:"([^"]*)"|'([^']*)'|`([^`]*)`|\{([^}]*)\})/g
  let match

  while ((match = stylePattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope,
        line: lineForIndex(source, match.index),
        message: "Inline visual style is not allowed in React Canvas artifacts.",
        suggestion: "Move visual treatment into local UI primitives.",
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
          guardScope,
          line: lineForIndex(source, match.index),
          message: `Unsafe className: ${classValue ? compactClassNameForMessage(classValue) : "dynamic value"}`,
          suggestion: "Use semantic token classes.",
        })
      )
    }
  }

  return issues
}

function collectWorkspaceBoundaryIssues({ relativePath, source }) {
  const issues = []
  let match

  while ((match = forbiddenImportPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.workspaceBoundary,
        line: lineForIndex(source, match.index),
        message: "Import crosses the React Canvas boundary.",
        severity: "error",
        suggestion: "Import from @agent-html/react or local agent-html source.",
      })
    )
    forbiddenImportPattern.lastIndex = match.index + 1
  }

  while ((match = forbiddenPublicImportPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.workspaceBoundary,
        line: lineForIndex(source, match.index),
        message: "Public files must be referenced by URL, not imported.",
        severity: "error",
        suggestion: "Reference public files through /__agent-html/public/<file>.",
      })
    )
    forbiddenPublicImportPattern.lastIndex = match.index + 1
  }

  while ((match = forbiddenRuntimeApiPattern.exec(source)) !== null) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.workspaceBoundary,
        line: lineForIndex(source, match.index),
        message: "Old AHTML render API is not allowed in React Canvas artifacts.",
        severity: "error",
        suggestion: "Render normal React through Artifact and Block markers.",
      })
    )
    forbiddenRuntimeApiPattern.lastIndex = match.index + 1
  }

  const controlMatch = nativeControlPattern.exec(source)
  if (controlMatch) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.workspaceBoundary,
        line: lineForIndex(source, controlMatch.index),
        message: "Native form control bypasses local UI primitives.",
        suggestion: "Use the matching agent-html/components/ui primitive.",
      })
    )
  }

  const tableMatch = nativeTablePattern.exec(source)
  if (tableMatch) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.workspaceBoundary,
        line: lineForIndex(source, tableMatch.index),
        message: "Native table bypasses local UI table primitives.",
        suggestion: "Use agent-html/components/ui/table.",
      })
    )
  }

  return issues
}

function collectArtifactProtocolIssues({ relativePath, source }) {
  const issues = []
  const artifactPattern = /<Artifact\b([^>]*)>/g
  let match

  while ((match = artifactPattern.exec(source)) !== null) {
    if (/\b(?:className|style)\s*=/.test(match[1])) {
      issues.push(
        createIssue({
          filePath: relativePath,
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
          line: lineForIndex(source, match.index),
          message: "Artifact owns token-configured reading layout and must not receive className or style.",
          severity: "error",
          suggestion: "Remove visual props from Artifact; put content layout inside Blocks and local UI primitives.",
        })
      )
    }

    artifactPattern.lastIndex = match.index + 1
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
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
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

export function analyzeArtifactEntryProtocol({ filePath, relativePath, source }) {
  const issues = []

  if (!hasDefaultExport(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
        message: "Artifact file must have a default export.",
        severity: "error",
        suggestion: "Default export a React component.",
      })
    )
  } else if (!hasReactComponentDefaultExport(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
        message: "Default export should be a React component.",
        suggestion: "Use a PascalCase function or component constant.",
      })
    )
  }

  if (!/<Artifact\b/.test(source)) {
    issues.push(
      createIssue({
        filePath: relativePath,
        guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
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
        guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
        message: "Artifact must contain at least one Block.",
        severity: "error",
        suggestion: 'Wrap major semantic regions in <Block id="summary">.',
      })
    )
  }

  const seen = new Map()
  for (const block of blocks) {
    if (!block.id) {
      const hasDynamicId = block.hasIdAttribute
      issues.push(
        createIssue({
          filePath: relativePath,
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
          line: lineForIndex(source, block.index),
          message: hasDynamicId
            ? "Block id must be a static string literal."
            : "Block is missing a stable id.",
          severity: "error",
          suggestion: hasDynamicId
            ? 'Use a readable literal id that survives regeneration, such as id="next-steps".'
            : 'Add a readable kebab-case id, such as id="next-steps".',
        })
      )
      continue
    }

    if (!isKebabCase(block.id)) {
      issues.push(
        createIssue({
          filePath: relativePath,
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
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
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
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
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
          line: lineForIndex(source, block.index),
          message: `Duplicate Block id: ${block.id}`,
          severity: "error",
          suggestion: "Every Block id must be unique within one artifact.",
        })
      )
      issues.push(
        createIssue({
          filePath: relativePath,
          guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
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
        guardScope: reactCanvasGuardScopes.artifactEntryProtocol,
        line: lineForIndex(source, blocks[0].index),
        message: "Artifact appears to use one giant Block.",
        suggestion: "Split major semantic regions into separate Blocks.",
      })
    )
  }

  return [
    ...issues,
    ...collectArtifactProtocolIssues({ relativePath, source }),
    ...collectBlockProtocolIssues({ relativePath, source }),
  ]
}

export function analyzeReactCanvasSourceBoundary({
  guardScope = reactCanvasGuardScopes.blockImplementationSource,
  relativePath,
  source,
}) {
  return [
    ...analyzeWorkspaceBoundarySource({ relativePath, source }),
    ...collectVisualIssues({ guardScope, relativePath, source }),
  ]
}

export function analyzeWorkspaceBoundarySource({ relativePath, source }) {
  return collectWorkspaceBoundaryIssues({ relativePath, source })
}

export function analyzeBlockImplementationSource({ relativePath, source }) {
  return analyzeReactCanvasSourceBoundary({
    guardScope: reactCanvasGuardScopes.blockImplementationSource,
    relativePath,
    source,
  })
}

export function analyzeReactCanvasArtifact({ filePath, relativePath, source }) {
  return [
    ...analyzeArtifactEntryProtocol({ filePath, relativePath, source }),
    ...analyzeReactCanvasSourceBoundary({
      guardScope: reactCanvasGuardScopes.blockImplementationSource,
      relativePath,
      source,
    }),
  ]
}

export async function runGuard({ root }) {
  const artifacts = await discoverReactArtifacts(root)
  const blockImplementations = await discoverReactBlockImplementations(root)
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

  for (const filePath of blockImplementations) {
    const source = await readTextFile(filePath)
    issues.push(
      ...analyzeBlockImplementationSource({
        relativePath: workspaceRelativePath(root, filePath),
        source,
      })
    )
  }

  return { artifacts, blockImplementations, issues }
}

export async function runGuardCommand({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const report = await runGuard({ root })

  if (report.artifacts.length === 0) {
    console.log("No React Canvas artifacts found.")
    return { issueCount: 0 }
  }

  if (report.issues.length === 0) {
    console.log(
      `Guard passed ${report.artifacts.length} artifact(s), ${report.blockImplementations.length} block implementation(s).`
    )
    return { issueCount: 0 }
  }

  for (const issue of report.issues) {
    console.log(
      [
        `${issue.severity.toUpperCase()} ${issue.filePath}:${issue.line}`,
        issue.guardScope ? `Guard: ${issue.guardScope}` : null,
        issue.message,
        issue.suggestion ? `Fix: ${issue.suggestion}` : null,
        "",
      ].filter(Boolean).join("\n")
    )
  }

  return { issueCount: report.issues.length }
}
