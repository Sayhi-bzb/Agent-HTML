import { parse as babelParse } from "@babel/parser"
import recast from "recast"

const { namedTypes: n, visit } = recast.types

function parseSource(source) {
  return recast.parse(source, {
    parser: {
      parse(value) {
        return babelParse(value, {
          plugins: ["jsx", "typescript"],
          sourceType: "module",
          tokens: true,
        })
      },
    },
  })
}

function importedCanvasBindings(ast) {
  const bindings = { Canvas: new Set(), Node: new Set() }
  for (const statement of ast.program.body) {
    if (
      !n.ImportDeclaration.check(statement) ||
      statement.source.value !== "@agent-html/react"
    )
      continue
    for (const specifier of statement.specifiers) {
      if (!n.ImportSpecifier.check(specifier)) continue
      const imported = specifier.imported.name ?? specifier.imported.value
      if (imported !== "Canvas" && imported !== "Node") continue
      bindings[imported].add(specifier.local.name)
    }
  }
  return bindings
}

function jsxName(element) {
  const name = element.openingElement.name
  return n.JSXIdentifier.check(name) ? name.name : null
}

function staticNodeId(element) {
  const attribute = element.openingElement.attributes.find(
    (candidate) =>
      n.JSXAttribute.check(candidate) && candidate.name.name === "id"
  )
  if (!attribute) return null
  if (n.StringLiteral.check(attribute.value)) return attribute.value.value
  if (
    n.JSXExpressionContainer.check(attribute.value) &&
    n.StringLiteral.check(attribute.value.expression)
  )
    return attribute.value.expression.value
  return null
}

function collectEditableElements(ast) {
  const bindings = importedCanvasBindings(ast)
  if (bindings.Canvas.size === 0 || bindings.Node.size === 0) {
    throw new TypeError(
      "Canvas hierarchy source must import Canvas and Node from @agent-html/react"
    )
  }

  const canvases = []
  const nodes = new Map()
  const nodeRecords = new Map()
  const semanticParents = []
  visit(ast, {
    visitJSXElement(path) {
      const name = jsxName(path.node)
      let semanticParent = null
      if (name && bindings.Canvas.has(name)) {
        canvases.push(path.node)
        semanticParent = { id: null, kind: "canvas" }
      }
      if (name && bindings.Node.has(name)) {
        const id = staticNodeId(path.node)
        if (!id) {
          throw new TypeError(
            "Canvas hierarchy editing requires static string Node ids"
          )
        }
        if (nodes.has(id)) {
          throw new TypeError(`Canvas hierarchy Node id ${id} must be unique`)
        }
        nodes.set(id, path.node)
        const container = semanticParents.at(-1) ?? null
        nodeRecords.set(id, {
          container,
          element: path.node,
          id,
          parentId: container?.kind === "node" ? container.id : null,
          path,
        })
        semanticParent = { id, kind: "node" }
      }
      if (semanticParent) {
        semanticParents.push(semanticParent)
        this.traverse(path)
        semanticParents.pop()
        return false
      }
      this.traverse(path)
    },
  })
  if (canvases.length !== 1) {
    throw new TypeError(
      "Canvas hierarchy editing requires exactly one static Canvas element"
    )
  }
  return { canvas: canvases[0], nodeRecords, nodes }
}

function removeElements(root, movedElements) {
  visit(root, {
    visitJSXElement(path) {
      const children = path.node.children
      if (Array.isArray(children)) {
        path.node.children = children.filter(
          (child) => !movedElements.has(child)
        )
      }
      this.traverse(path)
    },
  })
}

function appendElements(target, elements) {
  const children = target.children
  let insertAt = children.length
  while (
    insertAt > 0 &&
    n.JSXText.check(children[insertAt - 1]) &&
    children[insertAt - 1].value.trim() === ""
  ) {
    insertAt -= 1
  }
  children.splice(insertAt, 0, ...elements)
}

export function reparentStaticCanvasNodes({
  nodeIds,
  parentId = null,
  source,
}) {
  if (typeof source !== "string") {
    throw new TypeError("Canvas hierarchy source must be a string")
  }
  if (!Array.isArray(nodeIds) || nodeIds.length === 0) {
    throw new TypeError("Canvas hierarchy nodeIds must not be empty")
  }
  const ast = parseSource(source)
  const editable = collectEditableElements(ast)
  const elements = nodeIds.map((id) => {
    const element = editable.nodes.get(id)
    if (!element)
      throw new TypeError(`Canvas hierarchy Node ${id} was not found`)
    return element
  })
  const target =
    parentId === null ? editable.canvas : editable.nodes.get(parentId)
  if (!target) {
    throw new TypeError(
      `Canvas hierarchy parent Node ${parentId} was not found`
    )
  }
  const movedElements = new Set(elements)
  removeElements(ast, movedElements)
  appendElements(target, elements)
  return { source: recast.print(ast).code }
}

function recordDepth(record, records) {
  let depth = 0
  let parentId = record.parentId
  const visited = new Set()
  while (parentId && !visited.has(parentId)) {
    visited.add(parentId)
    depth += 1
    parentId = records.get(parentId)?.parentId ?? null
  }
  return depth
}

export function reorderStaticCanvasNodes({ groups, source }) {
  if (typeof source !== "string") {
    throw new TypeError("Canvas layer source must be a string")
  }
  if (!Array.isArray(groups) || groups.length === 0) {
    throw new TypeError("Canvas layer groups must not be empty")
  }
  const ast = parseSource(source)
  const editable = collectEditableElements(ast)
  const prepared = groups.map((group, groupIndex) => {
    if (!group || typeof group !== "object") {
      throw new TypeError(`Canvas layer groups.${groupIndex} must be an object`)
    }
    const parentId = group.parentId ?? null
    if (parentId !== null && typeof parentId !== "string") {
      throw new TypeError(
        `Canvas layer groups.${groupIndex}.parentId must be a string or null`
      )
    }
    if (!Array.isArray(group.nodeIds) || group.nodeIds.length === 0) {
      throw new TypeError(
        `Canvas layer groups.${groupIndex}.nodeIds must not be empty`
      )
    }
    const siblings = [...editable.nodeRecords.values()].filter(
      (record) => record.container && record.parentId === parentId
    )
    const expectedIds = new Set(siblings.map((record) => record.id))
    const orderedIds = [...new Set(group.nodeIds)]
    if (
      orderedIds.length !== siblings.length ||
      orderedIds.some((id) => !expectedIds.has(id))
    ) {
      throw new TypeError(
        `Canvas layer group ${parentId ?? "root"} must contain every static sibling Node`
      )
    }
    return { orderedIds, parentId, siblings }
  })

  prepared.sort((left, right) => {
    const leftRecord =
      left.parentId === null
        ? { parentId: null }
        : editable.nodeRecords.get(left.parentId)
    const rightRecord =
      right.parentId === null
        ? { parentId: null }
        : editable.nodeRecords.get(right.parentId)
    return (
      recordDepth(rightRecord, editable.nodeRecords) -
      recordDepth(leftRecord, editable.nodeRecords)
    )
  })

  for (const group of prepared) {
    const elements = group.orderedIds.map(
      (id) => editable.nodeRecords.get(id).element
    )
    group.siblings.forEach((record, index) =>
      record.path.replace(elements[index])
    )
  }
  return { source: recast.print(ast).code }
}
