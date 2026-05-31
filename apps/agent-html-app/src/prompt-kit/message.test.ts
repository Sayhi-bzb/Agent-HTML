import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const messagePath = fileURLToPath(new URL("./message.tsx", import.meta.url))
const markdownPath = fileURLToPath(new URL("./markdown.tsx", import.meta.url))
const transcriptPath = fileURLToPath(
  new URL("../pet/host/pet-thread-transcript-content.tsx", import.meta.url)
)

const messageSource = readFileSync(messagePath, "utf8")
const markdownSource = readFileSync(markdownPath, "utf8")
const transcriptSource = readFileSync(transcriptPath, "utf8")

describe("prompt-kit message", () => {
  it("keeps message primitives in the prompt-kit layer", () => {
    expect(messageSource).toContain("export type MessageProps")
    expect(messageSource).toContain("MessageAvatar")
    expect(messageSource).toContain("MessageContent")
    expect(messageSource).toContain("MessageActions")
    expect(messageSource).toContain("MessageAction")
  })

  it("uses project shared primitives rather than external aliases", () => {
    expect(messageSource).toContain("@/app/shared/ui/avatar")
    expect(messageSource).toContain("@/app/shared/ui/tooltip")
    expect(messageSource).toContain("@/app/shared/lib/utils")
    expect(messageSource).not.toContain("@/components/ui")
    expect(messageSource).not.toContain("@/lib/utils")
  })

  it("routes markdown through a replaceable prompt-kit wrapper", () => {
    expect(messageSource).toContain("@/app/prompt-kit/markdown")
    expect(markdownSource).toContain("PetMarkdownText")
  })

  it("moves thread transcript onto a shadcn shell with prompt-kit messages", () => {
    expect(transcriptSource).toContain("Message")
    expect(transcriptSource).toContain("MessageContent")
    expect(transcriptSource).toContain("@/app/shared/ui/card")
    expect(transcriptSource).toContain("@/app/shared/ui/scroll-area")
    expect(transcriptSource).toContain("@/app/shared/ui/separator")
    expect(transcriptSource).toContain("@/app/shared/ui/accordion")
    expect(transcriptSource).toContain("TurnDivider")
    expect(transcriptSource).toContain("TranscriptSystemActivity")
    expect(transcriptSource).toContain("TranscriptSystemContent")
    expect(transcriptSource).toContain("getVisibleTranscriptStatus")
    expect(transcriptSource).toContain("isFallback")
    expect(transcriptSource).toContain("fallbackName")
    expect(transcriptSource).toContain('"completed" ? undefined : status')
    expect(transcriptSource).toContain('"Plan"')
    expect(transcriptSource).toContain('"Reasoning"')
    expect(transcriptSource).toContain('"File changes"')
    expect(transcriptSource).toContain('"Web search"')
    expect(transcriptSource).toContain('"MCP tool call"')
    expect(transcriptSource).toContain('"Dynamic tool call"')
    expect(transcriptSource).toContain('"Collab tool call"')
    expect(transcriptSource).toContain('"No content"')
    expect(transcriptSource).toContain('data-selection="text"')
    expect(transcriptSource).toContain('data-cursor="text"')
    expect(transcriptSource).toContain('data-selection="none"')
    expect(transcriptSource).not.toContain(
      'className="flex flex-col gap-4"\n            data-cursor="text"'
    )
    expect(transcriptSource).not.toContain("view.label")
    expect(transcriptSource).not.toContain("item.phase")
    expect(transcriptSource).not.toContain("Fallback detail")
    expect(transcriptSource).not.toContain('"You"')
    expect(transcriptSource).not.toContain("PetPanel")
    expect(transcriptSource).not.toContain('Card size="sm"')
    expect(transcriptSource).not.toContain("MessageActions")
    expect(transcriptSource).not.toContain("MessageAction")
    expect(transcriptSource).not.toContain("navigator.clipboard")
    expect(transcriptSource).not.toContain("CopyMessageAction")
    expect(transcriptSource).not.toContain("TranscriptBubble")
    expect(transcriptSource).not.toContain("TranscriptSystemCard")
    expect(transcriptSource).not.toContain("ThumbsUp")
    expect(transcriptSource).not.toContain("ThumbsDown")
  })
})
