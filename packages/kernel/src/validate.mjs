import { parse } from "@babel/parser"

import { titleizeBlockId } from "./artifact.mjs"
import {
  CANVAS_POLICY_VERSION,
  canvasDiagnosticCategories,
  canvasDiagnosticCodes,
  canvasUnsafeClassPatterns,
} from "./policy.mjs"

const unsafeClassPatterns = canvasUnsafeClassPatterns.map(
  (pattern) => new RegExp(pattern)
)
const nativeControls = new Set(["button", "input"])
const nativeTableElements = new Set([
  "table",
  "thead",
  "tbody",
  "tr",
  "th",
  "td",
])
const unstableBlockIds = new Set([
  "block1",
  "block2",
  "section1",
  "section2",
  "temp",
  "top",
])

function locationOf(node) {
  return {
    column: (node?.loc?.start?.column ?? 0) + 1,
    line: node?.loc?.start?.line ?? 1,
  }
}

function createDiagnostic({
  category,
  code,
  filePath,
  message,
  node,
  suggestion,
}) {
  return {
    category,
    code,
    ...locationOf(node),
    filePath,
    message,
    policyVersion: CANVAS_POLICY_VERSION,
    ...(suggestion ? { suggestion } : {}),
  }
}

function parseSource({ filePath, source }) {
  try {
    return {
      ast: parse(source, {
        errorRecovery: false,
        plugins: ["jsx", "typescript"],
        sourceFilename: filePath,
        sourceType: "module",
      }),
      diagnostics: [],
    }
  } catch (error) {
    const node = {
      loc: {
        start: {
          column: error.loc?.column ?? 0,
          line: error.loc?.line ?? 1,
        },
      },
    }
    return {
      ast: null,
      diagnostics: [
        createDiagnostic({
          category: canvasDiagnosticCategories.protocol,
          code: canvasDiagnosticCodes.parseError,
          filePath,
          message: `Canvas source could not be parsed: ${error.message}`,
          node,
          suggestion: "Fix the TypeScript or JSX syntax before validation.",
        }),
      ],
    }
  }
}

function walk(node, visitor) {
  if (!node || typeof node !== "object") return
  visitor(node)
  for (const [key, value] of Object.entries(node)) {
    if (key === "loc" || key === "start" || key === "end") continue
    if (Array.isArray(value)) {
      for (const child of value) walk(child, visitor)
    } else if (
      value &&
      typeof value === "object" &&
      typeof value.type === "string"
    ) {
      walk(value, visitor)
    }
  }
}

function jsxName(node) {
  return node?.type === "JSXIdentifier" ? node.name : null
}

function staticClassValues(node) {
  if (!node) return []
  if (node.type === "StringLiteral") return [node.value]
  if (node.type === "TemplateLiteral" && node.expressions.length === 0) {
    return [
      node.quasis.map((part) => part.value.cooked ?? part.value.raw).join(""),
    ]
  }
  if (node.type === "JSXExpressionContainer")
    return staticClassValues(node.expression)
  if (node.type === "CallExpression") {
    return node.arguments.flatMap((argument) => staticClassValues(argument))
  }
  if (
    node.type === "LogicalExpression" ||
    node.type === "ConditionalExpression"
  ) {
    return Object.values(node).flatMap((value) =>
      value && typeof value === "object" ? staticClassValues(value) : []
    )
  }
  if (node.type === "ArrayExpression") {
    return node.elements.flatMap((element) => staticClassValues(element))
  }
  return []
}

function compactClassName(value) {
  return value.length <= 95 ? value : `${value.slice(0, 94)}…`
}

function importDiagnostics({ ast, filePath }) {
  const diagnostics = []
  let reportedControl = false
  let reportedTable = false

  walk(ast, (node) => {
    if (node.type === "ImportDeclaration") {
      const specifier = node.source.value
      if (
        specifier.startsWith("@/app/") ||
        specifier.startsWith("@/agent-html/") ||
        /(?:^|\/)apps\//.test(specifier)
      ) {
        diagnostics.push(
          createDiagnostic({
            category: canvasDiagnosticCategories.workspace,
            code: canvasDiagnosticCodes.forbiddenImport,
            filePath,
            message: "Import crosses the React Canvas boundary.",
            node,
            suggestion:
              "Import from @agent-html/react or local agent-html source.",
          })
        )
      }
      if (/^(?:\.\.?\/)+public(?:\/|$)/.test(specifier)) {
        diagnostics.push(
          createDiagnostic({
            category: canvasDiagnosticCategories.workspace,
            code: canvasDiagnosticCodes.publicImport,
            filePath,
            message: "Public files must be referenced by URL, not imported.",
            node,
            suggestion: "Use agent-html/lib/public-url helpers.",
          })
        )
      }
    }

    if (node.type === "JSXOpeningElement") {
      const name = jsxName(node.name)
      if (!reportedControl && nativeControls.has(name)) {
        reportedControl = true
        diagnostics.push(
          createDiagnostic({
            category: canvasDiagnosticCategories.workspace,
            code: canvasDiagnosticCodes.nativeControl,
            filePath,
            message: "Native form control bypasses local UI primitives.",
            node,
            suggestion: "Use the matching agent-html/components/ui primitive.",
          })
        )
      }
      if (!reportedTable && nativeTableElements.has(name)) {
        reportedTable = true
        diagnostics.push(
          createDiagnostic({
            category: canvasDiagnosticCategories.workspace,
            code: canvasDiagnosticCodes.nativeTable,
            filePath,
            message: "Native table bypasses local UI table primitives.",
            node,
            suggestion: "Use agent-html/components/ui/table.",
          })
        )
      }
    }
  })

  return diagnostics
}

function visualDiagnostics({ ast, filePath }) {
  const diagnostics = []
  walk(ast, (node) => {
    if (node.type !== "JSXAttribute") return
    const name = jsxName(node.name)
    if (name === "style") {
      diagnostics.push(
        createDiagnostic({
          category: canvasDiagnosticCategories.style,
          code: canvasDiagnosticCodes.inlineStyle,
          filePath,
          message:
            "Inline visual style is not allowed in React Canvas artifacts.",
          node,
          suggestion: "Move visual treatment into local UI primitives.",
        })
      )
      return
    }
    if (name !== "className") return
    for (const value of staticClassValues(node.value)) {
      if (!unsafeClassPatterns.some((pattern) => pattern.test(value))) continue
      diagnostics.push(
        createDiagnostic({
          category: canvasDiagnosticCategories.style,
          code: canvasDiagnosticCodes.unsafeClassName,
          filePath,
          message: `Unsafe className: ${compactClassName(value)}`,
          node,
          suggestion: "Use semantic token classes.",
        })
      )
    }
  })
  return diagnostics
}

function propertyByName(objectNode, name) {
  return objectNode?.properties?.find(
    (property) =>
      property.type === "ObjectProperty" &&
      ((property.key.type === "Identifier" && property.key.name === name) ||
        (property.key.type === "StringLiteral" && property.key.value === name))
  )
}

function blockDefinition(item) {
  if (item?.type === "StringLiteral") {
    return { id: item.value, node: item, title: titleizeBlockId(item.value) }
  }
  if (item?.type !== "ObjectExpression") return null
  const id = propertyByName(item, "id")?.value
  if (id?.type !== "StringLiteral") return null
  const title = propertyByName(item, "title")?.value
  return {
    id: id.value,
    node: id,
    title:
      title?.type === "StringLiteral" && title.value.trim()
        ? title.value
        : titleizeBlockId(id.value),
  }
}

function inspectArtifactProtocol({ ast, filePath }) {
  const diagnostics = []
  const metadata = { blocks: [], title: null }
  let defaultExport = null
  let definitionCall = null

  for (const node of ast.program.body) {
    if (node.type !== "ExportDefaultDeclaration") continue
    defaultExport = node
    if (
      node.declaration.type === "CallExpression" &&
      node.declaration.callee.type === "Identifier" &&
      node.declaration.callee.name === "defineArtifact"
    ) {
      definitionCall = node.declaration
    }
  }

  if (!defaultExport) {
    diagnostics.push(
      createDiagnostic({
        category: canvasDiagnosticCategories.protocol,
        code: canvasDiagnosticCodes.artifactDefaultExport,
        filePath,
        message: "Artifact file must have a default export.",
        node: ast.program,
        suggestion: "Default export defineArtifact({ title, blocks }).",
      })
    )
  }
  if (!definitionCall) {
    diagnostics.push(
      createDiagnostic({
        category: canvasDiagnosticCategories.protocol,
        code: canvasDiagnosticCodes.artifactDefinition,
        filePath,
        message: "Artifact entry must use defineArtifact.",
        node: defaultExport ?? ast.program,
        suggestion:
          'Default export defineArtifact({ title: "...", blocks: ["summary"] }).',
      })
    )
    return { diagnostics, metadata }
  }

  const definition = definitionCall.arguments[0]
  const title =
    definition?.type === "ObjectExpression"
      ? propertyByName(definition, "title")
      : null
  if (title?.value?.type !== "StringLiteral" || !title.value.value.trim()) {
    diagnostics.push(
      createDiagnostic({
        category: canvasDiagnosticCategories.protocol,
        code: canvasDiagnosticCodes.artifactTitle,
        filePath,
        message: "Artifact definition is missing a static title.",
        node: title ?? definitionCall,
        suggestion: "Set title to a non-empty string literal.",
      })
    )
  } else {
    metadata.title = title.value.value
  }

  const blocksProperty =
    definition?.type === "ObjectExpression"
      ? propertyByName(definition, "blocks")
      : null
  const blockItems =
    blocksProperty?.value?.type === "ArrayExpression"
      ? blocksProperty.value.elements
      : []
  const blocks = blockItems.map(blockDefinition).filter(Boolean)
  metadata.blocks = blocks.map(({ id, title }) => ({ id, title }))
  if (blocks.length === 0) {
    diagnostics.push(
      createDiagnostic({
        category: canvasDiagnosticCategories.protocol,
        code: canvasDiagnosticCodes.artifactBlocks,
        filePath,
        message: "Artifact definition must contain at least one block id.",
        node: blocksProperty ?? definitionCall,
        suggestion: 'Add a readable block id such as "summary".',
      })
    )
    return { diagnostics, metadata }
  }

  const counts = new Map()
  for (const block of blocks)
    counts.set(block.id, (counts.get(block.id) ?? 0) + 1)
  for (const block of blocks) {
    if (
      !/^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(block.id) ||
      unstableBlockIds.has(block.id)
    ) {
      diagnostics.push(
        createDiagnostic({
          category: canvasDiagnosticCategories.protocol,
          code: canvasDiagnosticCodes.blockIdFormat,
          filePath,
          message: `Block id "${block.id}" must be stable, readable kebab-case.`,
          node: block.node,
          suggestion:
            "Use a subject-specific id such as summary or trip-volume.",
        })
      )
    }
    if ((counts.get(block.id) ?? 0) > 1) {
      diagnostics.push(
        createDiagnostic({
          category: canvasDiagnosticCategories.protocol,
          code: canvasDiagnosticCodes.blockIdDuplicate,
          filePath,
          message: `Duplicate Block id: ${block.id}.`,
          node: block.node,
          suggestion: "Use a unique id for every block.",
        })
      )
    }
  }
  return { diagnostics, metadata }
}

export function replaceArtifactTitle({ filePath, source, title }) {
  const normalizedTitle = typeof title === "string" ? title.trim() : ""
  if (!normalizedTitle) {
    throw new Error("Artifact title is required")
  }
  if (normalizedTitle.length > 512) {
    throw new Error("Artifact title must be 512 characters or fewer")
  }

  const { ast, diagnostics } = parseSource({ filePath, source })
  if (!ast) {
    throw new Error(
      diagnostics[0]?.message ?? "Canvas source could not be parsed"
    )
  }

  let titleNode = null
  for (const node of ast.program.body) {
    if (
      node.type !== "ExportDefaultDeclaration" ||
      node.declaration.type !== "CallExpression" ||
      node.declaration.callee.type !== "Identifier" ||
      node.declaration.callee.name !== "defineArtifact"
    ) {
      continue
    }

    const definition = node.declaration.arguments[0]
    const titleProperty =
      definition?.type === "ObjectExpression"
        ? propertyByName(definition, "title")
        : null
    titleNode =
      titleProperty?.value?.type === "StringLiteral"
        ? titleProperty.value
        : null
  }

  if (
    !titleNode ||
    !Number.isInteger(titleNode.start) ||
    !Number.isInteger(titleNode.end)
  ) {
    throw new Error("Artifact definition is missing a static title")
  }

  return {
    source:
      source.slice(0, titleNode.start) +
      JSON.stringify(normalizedTitle) +
      source.slice(titleNode.end),
    title: normalizedTitle,
  }
}

export function inspectArtifactEntry({ filePath, source }) {
  const { ast, diagnostics } = parseSource({ filePath, source })
  if (!ast) {
    return { diagnostics, metadata: { blocks: [], title: null } }
  }
  const inspection = inspectArtifactProtocol({ ast, filePath })
  return {
    diagnostics: [
      ...inspection.diagnostics,
      ...importDiagnostics({ ast, filePath }),
    ],
    metadata: inspection.metadata,
  }
}

export function validateArtifactEntry(input) {
  return inspectArtifactEntry(input).diagnostics
}

export function validateBlockImplementation({ filePath, source }) {
  const { ast, diagnostics } = parseSource({ filePath, source })
  if (!ast) return diagnostics
  return [
    ...importDiagnostics({ ast, filePath }),
    ...visualDiagnostics({ ast, filePath }),
  ]
}
