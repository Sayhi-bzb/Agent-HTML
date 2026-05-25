import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
} from "@/agent-html/ast/types"
import {
  agentHtmlChildPath,
  agentHtmlElementChildren,
  walkAgentHtmlElementPaths,
} from "@/agent-html/ast/paths"
import {
  agentHtmlComponentAnatomyTags,
  agentHtmlDataChildTags,
  agentHtmlDocumentContainerTags,
  agentHtmlFlowLayoutTags,
  agentHtmlNonBlockContentTags,
} from "@/agent-html/schema/interaction-roles"
import type {
  AgentHtmlInteractionDiagnostics,
  AgentHtmlInteractionUnit,
  AgentHtmlInteractionUnits,
} from "@/agent-html/interaction/types"

type IndexedElement = {
  node: AgentHtmlElementNode
  path: string
}

function isFlowLayout(node: AgentHtmlElementNode) {
  return agentHtmlFlowLayoutTags.has(node.tag)
}

function hasDirectContentChild(node: AgentHtmlElementNode) {
  return agentHtmlElementChildren(node).some(
    (child) =>
      !agentHtmlFlowLayoutTags.has(child.tag) &&
      !agentHtmlDocumentContainerTags.has(child.tag) &&
      !agentHtmlDataChildTags.has(child.tag)
  )
}

function isInsideComponentAnatomy(ancestors: AgentHtmlElementNode[]) {
  return ancestors.some((ancestor) =>
    agentHtmlComponentAnatomyTags.has(ancestor.tag)
  )
}

function isMeaningfulDirectContent(node: AgentHtmlElementNode) {
  return (
    !agentHtmlFlowLayoutTags.has(node.tag) &&
    !agentHtmlDocumentContainerTags.has(node.tag) &&
    !agentHtmlComponentAnatomyTags.has(node.tag) &&
    !agentHtmlNonBlockContentTags.has(node.tag) &&
    !agentHtmlDataChildTags.has(node.tag)
  )
}

function nestedCandidateExists(
  parent: IndexedElement,
  candidates: IndexedElement[]
) {
  return candidates.some(
    (candidate) =>
      candidate.path !== parent.path && candidate.path.startsWith(`${parent.path}/`)
  )
}

function directContentBlocksOfGroup(group: IndexedElement): IndexedElement[] {
  const childCounts = new Map<string, number>()

  return agentHtmlElementChildren(group.node).flatMap((child) => {
    const count = childCounts.get(child.tag) ?? 0
    childCounts.set(child.tag, count + 1)

    if (!isMeaningfulDirectContent(child)) {
      return []
    }

    return [
      {
        node: child,
        path: agentHtmlChildPath(group.path, child.tag, count),
      },
    ]
  })
}

function toInteractionUnit(
  indexed: IndexedElement,
  kind: AgentHtmlInteractionUnit["kind"]
): AgentHtmlInteractionUnit {
  return {
    kind,
    path: indexed.path,
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

function intersection(left: string[], right: string[]) {
  const rightSet = new Set(right)
  return left.filter((path) => rightSet.has(path))
}

function diagnose(
  blocks: AgentHtmlInteractionUnit[],
  groups: AgentHtmlInteractionUnit[],
  internal: AgentHtmlInteractionUnit[],
  rawBlockPaths: string[]
): AgentHtmlInteractionDiagnostics {
  const blockPaths = blocks.map((unit) => unit.path)
  const groupPaths = groups.map((unit) => unit.path)
  const internalPaths = internal.map((unit) => unit.path)
  const nestedBlocks = blockPaths.flatMap((parent) =>
    blockPaths
      .filter((child) => child !== parent && child.startsWith(`${parent}/`))
      .map((child) => ({ parent, child }))
  )
  const duplicateBlocks = duplicatePaths(rawBlockPaths)
  const blockGroupOverlap = intersection(blockPaths, groupPaths)
  const blockInternalOverlap = intersection(blockPaths, internalPaths)
  const groupInternalOverlap = intersection(groupPaths, internalPaths)

  return {
    ok:
      blockGroupOverlap.length === 0 &&
      blockInternalOverlap.length === 0 &&
      groupInternalOverlap.length === 0 &&
      nestedBlocks.length === 0 &&
      duplicateBlocks.length === 0,
    blockGroupOverlap,
    blockInternalOverlap,
    groupInternalOverlap,
    nestedBlocks,
    duplicateBlocks,
  }
}

export function inferAgentHtmlInteractionUnits(
  document: AgentHtmlDocument
): AgentHtmlInteractionUnits {
  const rawCandidates: IndexedElement[] = []
  const internalCandidates: IndexedElement[] = []

  walkAgentHtmlElementPaths(document.root, (node, path, ancestors) => {
    const indexed = { node, path }

    if (isInsideComponentAnatomy(ancestors)) {
      if (isFlowLayout(indexed.node)) {
        internalCandidates.push(indexed)
      }
      return
    }

    if (isFlowLayout(indexed.node) && hasDirectContentChild(indexed.node)) {
      rawCandidates.push(indexed)
    }
  })

  const groups = rawCandidates.filter((candidate) =>
    nestedCandidateExists(candidate, rawCandidates)
  )
  const groupPaths = new Set(groups.map((group) => group.path))
  const rawBlocks = rawCandidates.filter(
    (candidate) => !groupPaths.has(candidate.path)
  )

  const liftedBlocks = groups.flatMap(directContentBlocksOfGroup)
  const blockUnits = uniqueByPath(
    [...rawBlocks, ...liftedBlocks].map((indexed) =>
      toInteractionUnit(indexed, "block")
    )
  )
  const groupUnits = uniqueByPath(
    groups.map((indexed) => toInteractionUnit(indexed, "group"))
  )
  const internalUnits = uniqueByPath(
    internalCandidates.map((indexed) => toInteractionUnit(indexed, "internal"))
  )
  const rawBlockPaths = [...rawBlocks, ...liftedBlocks].map(
    (indexed) => indexed.path
  )

  return {
    blocks: blockUnits,
    groups: groupUnits,
    internal: internalUnits,
    diagnostics: diagnose(blockUnits, groupUnits, internalUnits, rawBlockPaths),
  }
}
