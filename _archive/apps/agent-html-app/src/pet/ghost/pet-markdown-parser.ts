export type PetMarkdownInline =
  | { text: string; type: "code" | "strong" | "text" }

export type PetMarkdownBlock =
  | { children: PetMarkdownInline[]; type: "paragraph" }
  | { items: PetMarkdownInline[][]; type: "ordered-list" | "unordered-list" }
  | { text: string; title: string; type: "code-block" }

const unorderedListPattern = /^\s*[-*]\s+(.+)$/
const orderedListPattern = /^\s*\d+\.\s+(.+)$/

export function parsePetMarkdown(text: string): PetMarkdownBlock[] {
  const lines = text.replace(/\r\n/g, "\n").split("\n")
  const blocks: PetMarkdownBlock[] = []
  let index = 0

  while (index < lines.length) {
    const line = lines[index] ?? ""

    if (!line.trim()) {
      index += 1
      continue
    }

    if (line.trimStart().startsWith("```")) {
      const title = getCodeBlockTitle(line)
      const codeLines: string[] = []
      index += 1
      while (
        index < lines.length &&
        !(lines[index] ?? "").trimStart().startsWith("```")
      ) {
        codeLines.push(lines[index] ?? "")
        index += 1
      }
      if (index < lines.length) {
        index += 1
      }
      blocks.push({ text: codeLines.join("\n"), title, type: "code-block" })
      continue
    }

    const unorderedMatch = unorderedListPattern.exec(line)
    if (unorderedMatch) {
      const items: PetMarkdownInline[][] = []
      while (index < lines.length) {
        const itemMatch = unorderedListPattern.exec(lines[index] ?? "")
        if (!itemMatch) {
          break
        }
        items.push(parseInlineMarkdown(itemMatch[1] ?? ""))
        index += 1
      }
      blocks.push({ items, type: "unordered-list" })
      continue
    }

    const orderedMatch = orderedListPattern.exec(line)
    if (orderedMatch) {
      const items: PetMarkdownInline[][] = []
      while (index < lines.length) {
        const itemMatch = orderedListPattern.exec(lines[index] ?? "")
        if (!itemMatch) {
          break
        }
        items.push(parseInlineMarkdown(itemMatch[1] ?? ""))
        index += 1
      }
      blocks.push({ items, type: "ordered-list" })
      continue
    }

    const paragraphLines: string[] = []
    while (index < lines.length) {
      const paragraphLine = lines[index] ?? ""
      if (
        !paragraphLine.trim() ||
        paragraphLine.trimStart().startsWith("```") ||
        unorderedListPattern.test(paragraphLine) ||
        orderedListPattern.test(paragraphLine)
      ) {
        break
      }
      paragraphLines.push(paragraphLine)
      index += 1
    }
    blocks.push({
      children: parseInlineMarkdown(paragraphLines.join("\n")),
      type: "paragraph",
    })
  }

  return blocks
}

function parseInlineMarkdown(text: string): PetMarkdownInline[] {
  const nodes: PetMarkdownInline[] = []
  let cursor = 0

  while (cursor < text.length) {
    const codeStart = text.indexOf("`", cursor)
    const linkStart = text.indexOf("[", cursor)
    const strongStart = text.indexOf("**", cursor)
    const nextStart = getNextTokenStart(codeStart, linkStart, strongStart)

    if (nextStart === -1) {
      nodes.push({ text: text.slice(cursor), type: "text" })
      break
    }

    if (nextStart > cursor) {
      nodes.push({ text: text.slice(cursor, nextStart), type: "text" })
    }

    if (nextStart === codeStart) {
      const codeEnd = text.indexOf("`", codeStart + 1)
      if (codeEnd === -1) {
        nodes.push({ text: text.slice(codeStart), type: "text" })
        break
      }
      nodes.push({ text: text.slice(codeStart + 1, codeEnd), type: "code" })
      cursor = codeEnd + 1
      continue
    }

    if (nextStart === linkStart) {
      const link = readMarkdownLink(text, linkStart)
      if (!link) {
        nodes.push({ text: text.slice(linkStart), type: "text" })
        break
      }
      nodes.push({ text: link.label, type: "text" })
      cursor = link.end
      continue
    }

    const strongEnd = text.indexOf("**", strongStart + 2)
    if (strongEnd === -1) {
      nodes.push({ text: text.slice(strongStart), type: "text" })
      break
    }
    nodes.push({
      text: text.slice(strongStart + 2, strongEnd),
      type: "strong",
    })
    cursor = strongEnd + 2
  }

  return mergeAdjacentTextNodes(nodes)
}

function mergeAdjacentTextNodes(nodes: PetMarkdownInline[]) {
  const merged: PetMarkdownInline[] = []
  for (const node of nodes) {
    if (!node.text) {
      continue
    }

    const previous = merged[merged.length - 1]
    if (previous?.type === "text" && node.type === "text") {
      previous.text += node.text
      continue
    }

    merged.push(node)
  }

  return merged
}

function readMarkdownLink(text: string, start: number) {
  const labelEnd = text.indexOf("]", start + 1)
  if (labelEnd === -1 || text[labelEnd + 1] !== "(") {
    return undefined
  }

  const hrefEnd = text.indexOf(")", labelEnd + 2)
  if (hrefEnd === -1) {
    return undefined
  }

  return {
    end: hrefEnd + 1,
    label: text.slice(start + 1, labelEnd),
  }
}

function getNextTokenStart(...starts: number[]) {
  const validStarts = starts.filter((start) => start !== -1)
  if (!validStarts.length) {
    return -1
  }

  return Math.min(...validStarts)
}

function getCodeBlockTitle(openingLine: string) {
  return openingLine.trimStart().slice(3).trim() || "Code"
}
