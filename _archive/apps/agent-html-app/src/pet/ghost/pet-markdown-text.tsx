import type * as React from "react"

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/app/shared/ui/accordion"
import {
  parsePetMarkdown,
  type PetMarkdownBlock,
  type PetMarkdownInline,
} from "@/app/pet/ghost/pet-markdown-parser"

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
