import type * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"

type PetMarkdownInline =
  | { text: string; type: "code" | "strong" | "text" }

type PetMarkdownBlock =
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

export function PetMarkdownText({ text }: { text: string }) {
  const blocks = parsePetMarkdown(text)

  return (
    <div className="min-w-0 w-full max-w-full space-y-1 text-left leading-4">
      {blocks.map((block, index) => (
        <PetMarkdownBlockView block={block} key={index} />
      ))}
    </div>
  )
}

function PetMarkdownBlockView({ block }: { block: PetMarkdownBlock }) {
  switch (block.type) {
    case "code-block":
      return (
        <Accordion
          className="min-w-0 w-full max-w-full"
          collapsible
          type="single"
        >
          <AccordionItem className="min-w-0 w-full border-0" value="code">
            <AccordionTrigger className="min-w-0 w-full py-1 text-[10px] text-foreground hover:no-underline">
              <span className="min-w-0 truncate">{block.title}</span>
            </AccordionTrigger>
            <AccordionContent className="min-w-0 w-full max-w-full pb-0">
              <div className="min-w-0 w-full max-w-full overflow-x-auto rounded-md bg-muted/70">
                <pre className="w-max min-w-0 px-2 py-1 pb-3 text-left font-mono text-[10px] leading-4 whitespace-pre text-foreground">
                  <code>{block.text}</code>
                </pre>
              </div>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )

    case "unordered-list":
      return (
        <ul className="m-0 list-disc space-y-0.5 pl-4 text-left">
          {block.items.map((item, index) => (
            <li key={index}>{renderInlineNodes(item)}</li>
          ))}
        </ul>
      )

    case "ordered-list":
      return (
        <ol className="m-0 list-decimal space-y-0.5 pl-4 text-left">
          {block.items.map((item, index) => (
            <li key={index}>{renderInlineNodes(item)}</li>
          ))}
        </ol>
      )

    case "paragraph":
      return (
        <p className="m-0 text-left whitespace-pre-wrap">
          {renderInlineNodes(block.children)}
        </p>
      )
  }
}

function getCodeBlockTitle(openingLine: string) {
  return openingLine.trimStart().slice(3).trim() || "Code"
}

function renderInlineNodes(nodes: PetMarkdownInline[]) {
  return nodes.map<React.ReactNode>((node, index) => {
    if (node.type === "code") {
      return (
        <code
          className="rounded bg-muted/80 px-1 py-0.5 font-mono text-[10px] text-foreground"
          key={index}
        >
          {node.text}
        </code>
      )
    }

    if (node.type === "strong") {
      return <strong key={index}>{node.text}</strong>
    }

    return node.text
  })
}
