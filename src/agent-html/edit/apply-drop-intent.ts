import type {
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/agent-html/ast/types"
import { walkAgentHtmlElementPaths } from "@/agent-html/ast/paths"
import type {
  AgentHtmlDropIntent,
  ApplyAgentHtmlDropIntentInput,
} from "@/agent-html/edit/types"
import {
  agentHtmlDocumentContainerTags,
  agentHtmlFlowLayoutTags,
} from "@/agent-html/schema/interaction-roles"
import { validateAgentHtml } from "@/agent-html/validate/validate-agent-html"

type LocatedElement = {
  index: number
  node: AgentHtmlElementNode
  parent: AgentHtmlElementNode | null
  path: string
}

function cloneNode(node: AgentHtmlNode): AgentHtmlNode {
  if (node.type === "text") {
    return { ...node }
  }

  return {
    attrs: { ...node.attrs },
    children: node.children.map(cloneNode),
    tag: node.tag,
    type: "element",
  }
}

function cloneDocument(document: AgentHtmlDocument): AgentHtmlDocument {
  return {
    root: cloneNode(document.root) as AgentHtmlElementNode,
  }
}

function locateElements(document: AgentHtmlDocument) {
  const locations = new Map<string, LocatedElement>()

  walkAgentHtmlElementPaths(document.root, (node, path, ancestors) => {
    const parent = ancestors.at(-1) ?? null
    const index = parent ? parent.children.indexOf(node) : -1
    locations.set(path, {
      index,
      node,
      parent,
      path,
    })
  })

  return locations
}

function removeLocated(location: LocatedElement) {
  if (!location.parent || location.index < 0) {
    throw new Error("Cannot move the root Agent-HTML element")
  }

  location.parent.children.splice(location.index, 1)
}

function insertAt(
  parent: AgentHtmlElementNode,
  index: number,
  node: AgentHtmlElementNode
) {
  parent.children.splice(index, 0, node)
}

function canContainBlock(node: AgentHtmlElementNode) {
  return (
    agentHtmlDocumentContainerTags.has(node.tag) ||
    agentHtmlFlowLayoutTags.has(node.tag)
  )
}

function createGrid(children: AgentHtmlElementNode[]): AgentHtmlElementNode {
  return {
    attrs: { columns: String(Math.min(children.length, 4)) },
    children,
    tag: "Grid",
    type: "element",
  }
}

function isLayoutNode(node: AgentHtmlElementNode) {
  return (
    agentHtmlDocumentContainerTags.has(node.tag) ||
    agentHtmlFlowLayoutTags.has(node.tag)
  )
}

function normalizeLayoutChildren(parent: AgentHtmlElementNode) {
  for (const child of parent.children) {
    if (child.type === "element") {
      normalizeLayoutChildren(child)
    }
  }

  const nextChildren: AgentHtmlNode[] = []

  for (const child of parent.children) {
    if (child.type !== "element" || !isLayoutNode(child)) {
      nextChildren.push(child)
      continue
    }

    if (child.children.length === 0) {
      continue
    }

    if (child.tag === "Grid") {
      if (child.children.length === 1) {
        nextChildren.push(child.children[0])
        continue
      }

      child.attrs.columns = String(Math.min(child.children.length, 4))
    }

    nextChildren.push(child)
  }

  parent.children = nextChildren
}

function normalizeDocument(document: AgentHtmlDocument) {
  normalizeLayoutChildren(document.root)
}

function isSameParent(source: LocatedElement, target: LocatedElement) {
  return source.parent !== null && source.parent === target.parent
}

function isEquivalentDrop(
  source: LocatedElement,
  target: LocatedElement,
  intent: AgentHtmlDropIntent
) {
  if (!isSameParent(source, target)) {
    return false
  }

  if (intent.type === "before") {
    return source.index === target.index || source.index === target.index - 1
  }

  if (intent.type === "after") {
    return source.index === target.index || source.index === target.index + 1
  }

  if (intent.type === "column-before") {
    return source.parent?.tag === "Grid" && source.index === target.index - 1
  }

  if (intent.type === "column-after") {
    return source.parent?.tag === "Grid" && source.index === target.index + 1
  }

  return false
}

function applyMove(
  document: AgentHtmlDocument,
  source: LocatedElement,
  target: LocatedElement,
  intent: AgentHtmlDropIntent
) {
  if (!target.parent && intent.type !== "inside") {
    throw new Error("Cannot insert before or after the root Agent-HTML element")
  }

  removeLocated(source)
  const moved = source.node
  const targetIndex = target.parent ? target.parent.children.indexOf(target.node) : -1
  const currentTarget = {
    ...target,
    index: targetIndex,
  }

  if (intent.type === "inside") {
    const targetContainer = canContainBlock(currentTarget.node)
      ? currentTarget.node
      : currentTarget.parent

    if (!targetContainer) {
      throw new Error("Cannot move inside the root Agent-HTML element")
    }

    targetContainer.children.push(moved)
    return
  }

  if (intent.type === "before" || intent.type === "after") {
    if (!currentTarget.parent) {
      throw new Error("Cannot insert next to the root Agent-HTML element")
    }

    insertAt(
      currentTarget.parent,
      currentTarget.index + (intent.type === "after" ? 1 : 0),
      moved
    )
    return
  }

  if (!currentTarget.parent) {
    throw new Error("Cannot create columns around the root Agent-HTML element")
  }

  if (currentTarget.parent.tag === "Grid") {
    insertAt(
      currentTarget.parent,
      currentTarget.index + (intent.type === "column-after" ? 1 : 0),
      moved
    )
    return
  }

  const targetNode = currentTarget.node
  const orderedChildren =
    intent.type === "column-before" ? [moved, targetNode] : [targetNode, moved]
  currentTarget.parent.children.splice(
    currentTarget.index,
    1,
    createGrid(orderedChildren)
  )
}

export function applyAgentHtmlDropIntent(
  document: AgentHtmlDocument,
  input: ApplyAgentHtmlDropIntentInput
): AgentHtmlDocument {
  const nextDocument = cloneDocument(document)
  const locations = locateElements(nextDocument)
  const source = locations.get(input.sourcePath)
  const target = locations.get(input.intent.targetPath)

  if (!source) {
    throw new Error(`Unknown source path: ${input.sourcePath}`)
  }

  if (!target) {
    throw new Error(`Unknown target path: ${input.intent.targetPath}`)
  }

  if (
    source.path === target.path ||
    input.intent.targetPath.startsWith(`${source.path}/`)
  ) {
    throw new Error("Cannot move a block into itself")
  }

  if (isEquivalentDrop(source, target, input.intent)) {
    return nextDocument
  }

  applyMove(nextDocument, source, target, input.intent)
  normalizeDocument(nextDocument)

  const validation = validateAgentHtml(nextDocument)
  if (!validation.ok) {
    throw new Error("Drop intent produced invalid Agent-HTML")
  }

  return nextDocument
}
