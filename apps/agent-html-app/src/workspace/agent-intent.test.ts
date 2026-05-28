import { afterEach, describe, expect, it, vi } from "vitest"

import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
import { parseAgentHtml } from "@/agent-html"

const document = {
  ahtmlSource: [
    "<Page>",
    "  <Section>",
    "    <Stack>",
    "      <Text>Move faster</Text>",
    "    </Stack>",
    "  </Section>",
    "</Page>",
    "",
  ].join("\n"),
  filePath: "D:\\workspace\\project-1\\section-1.agent-html",
  projectId: "project-1",
  sectionId: "section-1",
  updatedAt: "2026-05-27T00:00:00.000Z",
}

const project = {
  id: "project-1",
  name: "Project One",
  sections: [],
  slug: "project-one",
}

const section = {
  groupTitle: "Docs",
  id: "section-1",
  projectId: "project-1",
  sortOrder: 1,
  title: "Intro",
}

describe("deliverAgentHtmlIntent", () => {
  afterEach(() => {
    vi.restoreAllMocks()
  })

  it("starts a Codex turn with Agent-HTML context", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })

    const result = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      startTurn,
      submit: {
        interaction: null,
        path: "/Page/Section[0]/Stack[0]",
        prompt: "Make this tighter.",
      },
      threadId: "thr_123",
    })

    expect(result.ok).toBe(true)
    expect(startTurn.mock.calls[0][0].threadId).toBe("thr_123")
    const promptText = startTurn.mock.calls[0][0].promptText
    expect(promptText).toContain(
      [
        "---",
        "filePath: D:\\workspace\\project-1\\section-1.agent-html",
        "ahtmlPath: /Page/Section[0]/Stack[0]",
        "---",
      ].join("\n")
    )
    expect(promptText).toMatch(/```ahtml\s+<Stack>/)
    expect(promptText).toContain("<Text>Move faster</Text>")
    expect(promptText).toContain("\n```\n\nRequest:\nMake this tighter.")
    expect(promptText).not.toContain("当前文档 AHTML")
    expect(result.provider).toBe("codex_app_server")
    expect(result.threadId).toBe("thr_123")
  })

  it("uses a provided parsed document to select block context", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })
    const parsedDocument = parseAgentHtml(document.ahtmlSource)

    const result = await deliverAgentHtmlIntent({
      document: {
        ...document,
        ahtmlSource: "<Page><Text>Changed source should not be parsed</Text></Page>",
      },
      parsedDocument,
      project,
      section,
      startTurn,
      submit: {
        path: "/Page/Section[0]/Stack[0]",
        prompt: "Explain this block.",
      },
      threadId: "thr_123",
    })

    expect(result.ok).toBe(true)
    expect(startTurn.mock.calls[0][0].promptText).toContain(
      "<Text>Move faster</Text>"
    )
    expect(startTurn.mock.calls[0][0].promptText).not.toContain(
      "Changed source should not be parsed"
    )
  })

  it("keeps a valid prompt when the selected path is missing", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })

    const result = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      startTurn,
      submit: {
        path: "/Page/Section[0]/Stack[1]",
        prompt: "What is this?",
      },
      threadId: "thr_123",
    })

    expect(result.ok).toBe(true)
    expect(startTurn.mock.calls[0][0].promptText).toContain(
      "ahtmlPath: /Page/Section[0]/Stack[1]"
    )
    expect(startTurn.mock.calls[0][0].promptText).toMatch(/```ahtml\s+```/)
  })

  it("returns the Codex turn error when delivery fails", async () => {
    const startTurn = vi.fn().mockRejectedValue(new Error("offline"))

    const result = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      startTurn,
      submit: {
        interaction: {
          itemValue: "ticket-1",
          kind: "kanban_item_moved",
          nextColumnValue: "doing",
          nextIndex: 0,
          previousColumnValue: "todo",
          previousIndex: 2,
        },
        path: "/Page/Section[0]/Stack[0]",
        prompt: "Persist my ordering.",
      },
      threadId: "thr_123",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("codex_app_server")
    expect(result.error).toBe("offline")
    expect(result.promptText).toContain("Persist my ordering.")
    expect(result.promptText).not.toContain("Kanban item moved")
    expect(result.promptText).not.toContain("当前文档 AHTML")
  })
})
