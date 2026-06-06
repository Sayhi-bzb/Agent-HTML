import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlTag,
} from "@/agent-html/ast/types"
import {
  walkAgentHtmlElementPaths,
} from "@/agent-html/ast/paths"
import {
  agentHtmlExplicitBlockTags,
} from "@/agent-html/schema/interaction-roles"
import type {
  AgentHtmlInteractionDiagnostics,
  AgentHtmlInteractionUnit,
  AgentHtmlInteractionUnits,
} from "@/agent-html/interaction/types"

type IndexedElement = {
  node: AgentHtmlElementNode
  parentPath?: string
  parentTag?: AgentHtmlElementNode["tag"]
  path: string
}

function stableStringHash(value: string) {
  let hash = 5381

  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 33) ^ value.charCodeAt(index)
  }

  return (hash >>> 0).toString(36)
}

function nodeMotionSignature(node: AgentHtmlElementNode): string {
  const attrs = Object.entries(node.attrs)
    .sort(([left], [right]) => left.localeCompare(right))
    .map(([key, value]) => `${key}=${value}`)
    .join(";")
  const children = node.children
    .map((child) =>
      child.type === "text"
        ? `#text:${child.value.replace(/\s+/g, " ").trim()}`
        : nodeMotionSignature(child)
    )
    .join("|")

  return `${node.tag}[${attrs}](${children})`
}

function getMotionKey(node: AgentHtmlElementNode) {
  return `${node.tag}:${stableStringHash(nodeMotionSignature(node))}`
}

function toInteractionUnit(
  indexed: IndexedElement
): AgentHtmlInteractionUnit {
  return {
    kind: "block",
    motionKey: getMotionKey(indexed.node),
    parentPath: indexed.parentPath,
    parentTag: indexed.parentTag,
    path: indexed.path,
    role: "flow-block",
    tag: indexed.node.tag,
  }
}

function uniqueByPath(units: AgentHtmlInteractionUnit[]) {
  const seen = new Set<string>()
  return units.filter((unit) => {
    if (seen.has(unit.path)) {
      return false
    }

    seen.add(unit.path)
    return true
  })
}

function duplicatePaths(paths: string[]) {
  const seen = new Set<string>()
  const duplicates = new Set<string>()

  for (const path of paths) {
    if (seen.has(path)) {
      duplicates.add(path)
    }
    seen.add(path)
  }

  return [...duplicates]
}

function diagnose(
  blocks: AgentHtmlInteractionUnit[],
  rawBlockPaths: string[]
): AgentHtmlInteractionDiagnostics {
  const blockPaths = blocks.map((unit) => unit.path)
  const nestedBlocks = blockPaths.flatMap((parent) =>
    blockPaths
      .filter((child) => child !== parent && child.startsWith(`${parent}/`))
      .map((child) => ({ parent, child }))
  )
  const duplicateBlocks = duplicatePaths(rawBlockPaths)

  return {
    ok: nestedBlocks.length === 0 && duplicateBlocks.length === 0,
    nestedBlocks,
    duplicateBlocks,
  }
}

export function inferAgentHtmlInteractionUnits(
  document: AgentHtmlDocument
): AgentHtmlInteractionUnits {
  const explicitBlocks: IndexedElement[] = []

  walkAgentHtmlElementPaths(document.root, (node, path, ancestors) => {
    const parent = ancestors.at(-1)
    const parentPath = parent
      ? path.split("/").slice(0, -1).join("/")
      : undefined
    const indexed = {
      node,
      parentPath,
      parentTag: parent?.tag,
      path,
    }

    if (agentHtmlExplicitBlockTags.has(indexed.node.tag as AgentHtmlTag)) {
      explicitBlocks.push(indexed)
    }
  })

  const blockUnits = uniqueByPath(
    explicitBlocks.map((indexed) =>
      toInteractionUnit(indexed)
    )
  )
  const rawBlockPaths = explicitBlocks.map(
    (indexed) => indexed.path
  )

  return {
    blocks: blockUnits,
    diagnostics: diagnose(blockUnits, rawBlockPaths),
  }
}
