import type {
  AgentHtmlAttrMap,
  AgentHtmlDocument,
  AgentHtmlElementNode,
  AgentHtmlNode,
} from "@/gallery/preview/agent-html/ast"

type Token =
  | { type: "open"; tag: string; attrs: AgentHtmlAttrMap; selfClosing: boolean }
  | { type: "close"; tag: string }
  | { type: "text"; value: string }

function parseAttrs(raw: string) {
  const attrs: AgentHtmlAttrMap = {}
  const attrPattern = /([A-Za-z][A-Za-z0-9-]*)="([^"]*)"/g
  let match: RegExpExecArray | null

  while ((match = attrPattern.exec(raw)) !== null) {
    attrs[match[1]] = match[2]
  }

  const stripped = raw.replace(attrPattern, "").trim()
  if (stripped.length > 0) {
    throw new Error(`Invalid attribute syntax: ${stripped}`)
  }

  return attrs
}

function tokenize(input: string) {
  const tokens: Token[] = []
  const tagPattern = /<[^>]+>/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = tagPattern.exec(input)) !== null) {
    const text = input.slice(lastIndex, match.index)
    if (text.length > 0) {
      tokens.push({ type: "text", value: text })
    }

    const rawTag = match[0]
    if (rawTag.startsWith("</")) {
      const tag = rawTag.slice(2, -1).trim()
      tokens.push({ type: "close", tag })
    } else {
      const selfClosing = rawTag.endsWith("/>")
      const tagBody = rawTag.slice(1, selfClosing ? -2 : -1).trim()
      const firstSpace = tagBody.search(/\s/)
      const tag = firstSpace === -1 ? tagBody : tagBody.slice(0, firstSpace)
      const rawAttrs = firstSpace === -1 ? "" : tagBody.slice(firstSpace + 1).trim()
      const attrs = parseAttrs(rawAttrs)
      tokens.push({ type: "open", tag, attrs, selfClosing })
    }

    lastIndex = match.index + rawTag.length
  }

  const trailing = input.slice(lastIndex)
  if (trailing.length > 0) {
    tokens.push({ type: "text", value: trailing })
  }

  return tokens
}

export function parseAgentHtml(input: string): AgentHtmlDocument {
  const tokens = tokenize(input)
  const stack: AgentHtmlElementNode[] = []
  const roots: AgentHtmlNode[] = []

  for (const token of tokens) {
    if (token.type === "text") {
      const normalized = token.value.replace(/\s+/g, " ").trim()
      if (!normalized) {
        continue
      }

      const textNode: AgentHtmlNode = { type: "text", value: normalized }
      if (stack.length > 0) {
        stack[stack.length - 1].children.push(textNode)
      } else {
        roots.push(textNode)
      }
      continue
    }

    if (token.type === "open") {
      const element: AgentHtmlElementNode = {
        type: "element",
        tag: token.tag,
        attrs: token.attrs,
        children: [],
      }

      if (stack.length > 0) {
        stack[stack.length - 1].children.push(element)
      } else {
        roots.push(element)
      }

      if (!token.selfClosing) {
        stack.push(element)
      }
      continue
    }

    const current = stack.pop()
    if (!current) {
      throw new Error(`Unexpected closing tag: ${token.tag}`)
    }

    if (current.tag !== token.tag) {
      throw new Error(`Mismatched closing tag: expected </${current.tag}> but found </${token.tag}>`)
    }
  }

  if (stack.length > 0) {
    throw new Error(`Unclosed tag: <${stack[stack.length - 1].tag}>`)
  }

  if (roots.length !== 1 || roots[0]?.type !== "element") {
    throw new Error("Document must contain exactly one root element")
  }

  return {
    root: roots[0],
  }
}
