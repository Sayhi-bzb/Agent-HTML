import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const messagePath = fileURLToPath(new URL("./message.tsx", import.meta.url))
const markdownPath = fileURLToPath(new URL("./markdown.tsx", import.meta.url))
const transcriptPath = fileURLToPath(
  new URL("../pet/host/pet-thread-transcript-content.tsx", import.meta.url)
)
const threadPanelPath = fileURLToPath(
  new URL("../pet/host/pet-thread-panel-content.tsx", import.meta.url)
)

const messageSource = readFileSync(messagePath, "utf8")
const markdownSource = readFileSync(markdownPath, "utf8")
const transcriptSource = readFileSync(transcriptPath, "utf8")
const threadPanelSource = readFileSync(threadPanelPath, "utf8")

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
    expect(transcriptSource).toContain("@/app/shared/ui/avatar")
    expect(transcriptSource).toContain("@/app/shared/ui/button")
    expect(transcriptSource).toContain("@/app/shared/ui/scroll-area")
    expect(transcriptSource).toContain("@/app/shared/ui/separator")
    expect(transcriptSource).toContain("@/app/shared/ui/accordion")
    expect(transcriptSource).not.toContain("@/app/shared/ui/card")
    expect(transcriptSource).toContain("<section")
    expect(transcriptSource).toContain("<header")
    expect(transcriptSource).toContain("<footer")
    expect(transcriptSource).toContain("composer?: ReactNode")
    expect(transcriptSource).toContain(
      "relative min-h-0 min-w-0 flex-1 overflow-hidden bg-background"
    )
    expect(transcriptSource).toContain("h-full min-w-0 w-full max-w-full")
    expect(transcriptSource).toContain(
      "min-w-0 w-full max-w-full p-3"
    )
    expect(transcriptSource).toContain("containIntrinsicWidth")
    expect(transcriptSource).not.toContain(
      "[&>div]:!block [&>div]:!min-w-0 [&>div]:!w-full [&>div]:!max-w-full"
    )
    expect(transcriptSource).toContain(
      "flex min-w-0 w-full max-w-full flex-col gap-4"
    )
    expect(transcriptSource).toContain(
      "flex min-w-0 w-full max-w-full flex-col gap-2"
    )
    expect(transcriptSource).toContain(
      "flex min-w-0 w-full max-w-full flex-col gap-2.5"
    )
    expect(transcriptSource).toContain('"min-w-0 w-full"')
    expect(transcriptSource).toContain('composer && "pb-32"')
    expect(transcriptSource).toContain(
      "absolute inset-x-0 bottom-0 z-10 px-3 pb-3"
    )
    expect(transcriptSource).toContain("{!composer ? (")
    expect(transcriptSource).toContain("Thread Transcript")
    expect(transcriptSource).toContain("SearchIcon")
    expect(transcriptSource).toContain("MoreHorizontalIcon")
    expect(transcriptSource).toContain("XIcon")
    expect(transcriptSource).toContain("Search transcript")
    expect(transcriptSource).toContain("More transcript actions")
    expect(transcriptSource).toContain("Close transcript")
    expect(transcriptSource).toContain("isSearchOpen")
    expect(transcriptSource).toContain("searchQuery")
    expect(transcriptSource).toContain("activeMatchIndex")
    expect(transcriptSource).toContain("buildTranscriptSearch")
    expect(transcriptSource).toContain("highlightTranscriptText")
    expect(transcriptSource).toContain("No matches in this transcript.")
    expect(transcriptSource).toContain(
      "absolute inset-x-3 top-3 z-20 flex items-center gap-2"
    )
    expect(transcriptSource).toContain("bg-background/95")
    expect(transcriptSource).toContain("backdrop-blur")
    expect(transcriptSource).toContain("onClose?: () => void")
    expect(transcriptSource).toContain("onClick={onClose}")
    expect(transcriptSource).not.toContain("PinIcon")
    expect(transcriptSource).not.toContain("Pin transcript")
    expect(transcriptSource).not.toContain("onPinnedChange")
    expect(transcriptSource).not.toContain("isPinned")
    expect(transcriptSource).not.toContain("RefreshCwIcon")
    expect(transcriptSource).not.toContain("Refresh transcript")
    expect(transcriptSource).not.toContain("onReload")
    expect(transcriptSource).toContain("Read-only transcript")
    expect(transcriptSource).toContain("return threadId")
    expect(transcriptSource).not.toContain('return "Loading transcript..."')
    expect(transcriptSource).not.toContain('return "Unable to load transcript"')
    expect(transcriptSource).toContain("TurnDivider")
    expect(transcriptSource).toContain("TranscriptSystemActivity")
    expect(transcriptSource).toContain("TranscriptSystemContent")
    expect(transcriptSource).toContain("getVisibleTranscriptStatus")
    expect(transcriptSource).toContain("isFallback")
    expect(transcriptSource).toContain("fallbackName")
    expect(transcriptSource).toContain('"completed" ? undefined : status')
    expect(transcriptSource).toContain("hasMarkdownCodeBlock")
    expect(transcriptSource).toContain('"flex max-w-[88%] flex-col gap-1.5"')
    expect(transcriptSource).toContain("flex w-full max-w-[88%] flex-col")
    expect(transcriptSource).toContain(
      "min-w-0 w-full max-w-full text-xs leading-5"
    )
    expect(transcriptSource).toContain('"max-w-full text-xs leading-5"')
    expect(transcriptSource.indexOf("turn.items.length")).toBeLessThan(
      transcriptSource.indexOf("<TurnDivider")
    )
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

  it("combines thread list and transcript in one thread panel shell", () => {
    expect(threadPanelSource).toContain("PetThreadPanelContent")
    expect(threadPanelSource).toContain("chat")
    expect(threadPanelSource).toContain("<header")
    expect(threadPanelSource).toContain("<main")
    expect(threadPanelSource.match(/<header/g)?.length).toBe(1)
    expect(threadPanelSource).toContain("Search transcript")
    expect(threadPanelSource).toContain("New thread")
    expect(threadPanelSource).toContain("Toggle thread sidebar")
    expect(threadPanelSource).toContain("Close thread panel")
    expect(threadPanelSource).toContain("@/app/shared/ui/scroll-area")
    expect(threadPanelSource).toContain("@/app/shared/ui/dropdown-menu")
    expect(threadPanelSource).toContain("@/app/shared/ui/sidebar")
    expect(threadPanelSource).toContain("SidebarContent")
    expect(threadPanelSource).toContain("SidebarGroup")
    expect(threadPanelSource).toContain("SidebarGroupContent")
    expect(threadPanelSource).toContain("SidebarGroupLabel")
    expect(threadPanelSource).toContain("SidebarMenu")
    expect(threadPanelSource).toContain("SidebarMenuButton")
    expect(threadPanelSource).toContain("SidebarMenuItem")
    expect(threadPanelSource).toContain("SidebarMenuAction")
    expect(threadPanelSource.indexOf("New thread")).toBeGreaterThan(
      threadPanelSource.indexOf("<SidebarMenu")
    )
    expect(threadPanelSource).toContain("PanelLeftIcon")
    expect(threadPanelSource).toContain("SidebarStateProvider")
    expect(threadPanelSource).toContain("useSidebar")
    expect(threadPanelSource).toContain('open ? "w-72" : "w-0"')
    expect(threadPanelSource).not.toContain('open ? "w-14"')
    expect(threadPanelSource).toContain("data-collapsible")
    expect(threadPanelSource).toContain("bg-sidebar text-sidebar-foreground")
    expect(threadPanelSource).toContain('"--sidebar": "var(--background)"')
    expect(threadPanelSource).toContain(
      '"--sidebar-foreground": "var(--foreground)"'
    )
    expect(threadPanelSource).toContain('"--sidebar-accent": "var(--muted)"')
    expect(threadPanelSource).toContain(
      '"--sidebar-accent-foreground": "var(--foreground)"'
    )
    expect(threadPanelSource).toContain('"--sidebar-border": "var(--border)"')
    expect(threadPanelSource).toContain('"--sidebar-ring": "var(--ring)"')
    expect(threadPanelSource).not.toContain("border-r border-sidebar-border")
    expect(threadPanelSource).not.toContain("bg-sidebar/50")
    expect(threadPanelSource).toContain("getThreadSummaryById")
    expect(threadPanelSource).toContain("ThreadPanelAction")
    expect(threadPanelSource).toContain("ThreadPanelDispatch")
    expect(threadPanelSource).toContain("ThreadPanelBridge")
    expect(threadPanelSource).toContain('type: "resume-thread"')
    expect(threadPanelSource).toContain('type: "set-search-open"')
    expect(threadPanelSource).toContain("onSearchOpenChange")
    expect(threadPanelSource).not.toMatch(/\bSidebarProvider\b/)
    expect(threadPanelSource).not.toMatch(/\bSidebar\b,/)
    expect(threadPanelSource).not.toContain("PetPanel")
    expect(threadPanelSource).not.toContain("@/app/shared/ui/card")
  })
})
