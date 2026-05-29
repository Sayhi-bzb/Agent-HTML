import { afterEach, describe, expect, it, vi } from "vitest"

import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"
import { parseAgentHtml } from "@/agent-html"

const document = {
  source: [
    "<Page>",
    "  <Section>",
    "    <Stack>",
    "      <Text>Move faster</Text>",
    "    </Stack>",
    "  </Section>",
    "</Page>",
    "",
  ].join("\n"),
  filePath: "D:\\AgentHTML\\projects\\project-1\\section-1\\artifact.agent-html",
  projectId: "project-1",
  sectionId: "section-1",
  updatedAt: "2026-05-27T00:00:00.000Z",
}

const worldDocument = {
  ...document,
  filePath:
    "C:\\Users\\Administrator\\AppData\\Roaming\\Agent-HTML\\AgentHTML\\projects\\project-1\\section-1\\artifact.agent-html",
}

const customRootDocument = {
  ...document,
  filePath: "D:\\AgentHTML\\projects\\project-1\\section-1\\artifact.agent-html",
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
        prompt: "Make this tighter.",
        target: {
          kind: "block",
          path: "/Page/Section[0]/Stack[0]",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result.ok).toBe(true)
    expect(startTurn.mock.calls[0][0].threadId).toBe("thr_123")
    const promptText = startTurn.mock.calls[0][0].promptText
    expect(promptText).toContain(
      [
        "---",
        "filePath: projects/project-1/section-1/artifact.agent-html",
        "targetKind: block",
        "blockPath: /Page/Section[0]/Stack[0]",
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
    const parsedDocument = parseAgentHtml(document.source)

    const result = await deliverAgentHtmlIntent({
      document: {
        ...document,
        source: "<Page><Text>Changed source should not be parsed</Text></Page>",
      },
      parsedDocument,
      project,
      section,
      startTurn,
      submit: {
        prompt: "Explain this block.",
        target: {
          kind: "block",
          path: "/Page/Section[0]/Stack[0]",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
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
        prompt: "What is this?",
        target: {
          kind: "block",
          path: "/Page/Section[0]/Stack[1]",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result.ok).toBe(true)
    expect(startTurn.mock.calls[0][0].promptText).toContain(
      "blockPath: /Page/Section[0]/Stack[1]"
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
        prompt: "Persist my ordering.",
        target: {
          kind: "block",
          path: "/Page/Section[0]/Stack[0]",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("codex_app_server")
    expect(result.error).toBe("offline")
    expect(result.promptText).toContain("Persist my ordering.")
    expect(result.promptText).not.toContain("Kanban item moved")
    expect(result.promptText).not.toContain("当前文档 AHTML")
  })

  it("starts a document-scoped Codex turn with full document context", async () => {
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
        prompt: "Review this section.",
        target: {
          kind: "document",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result.ok).toBe(true)
    const promptText = startTurn.mock.calls[0][0].promptText
    expect(promptText).toContain(
      [
        "---",
        "filePath: projects/project-1/section-1/artifact.agent-html",
        "targetKind: document",
        "---",
      ].join("\n")
    )
    expect(promptText).not.toContain("blockPath:")
    expect(promptText).toContain("<Page>")
    expect(promptText).toContain("<Text>Move faster</Text>")
    expect(promptText).toContain("\n```\n\nRequest:\nReview this section.")
  })

  it("uses a file path relative to the Codex workspace root", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })

    await deliverAgentHtmlIntent({
      document: worldDocument,
      project,
      section,
      startTurn,
      submit: {
        prompt: "Review this section.",
        target: {
          kind: "document",
        },
      },
      threadId: "thr_123",
      workspaceRootPath:
        "C:\\Users\\Administrator\\AppData\\Roaming\\Agent-HTML\\AgentHTML",
    })

    expect(startTurn.mock.calls[0][0].promptText).toContain(
      "filePath: projects/project-1/section-1/artifact.agent-html"
    )
  })

  it("handles custom workspace roots and trailing slashes", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })

    await deliverAgentHtmlIntent({
      document: customRootDocument,
      project,
      section,
      startTurn,
      submit: {
        prompt: "Review this section.",
        target: {
          kind: "document",
        },
      },
      threadId: "thr_123",
      workspaceRootPath: "D:/AgentHTML/",
    })

    expect(startTurn.mock.calls[0][0].promptText).toContain(
      "filePath: projects/project-1/section-1/artifact.agent-html"
    )
  })

  it("rejects file paths outside the Codex workspace root", async () => {
    const startTurn = vi.fn().mockResolvedValue({
      threadId: "thr_123",
      turnId: "turn_123",
    })

    await expect(
      deliverAgentHtmlIntent({
        document: {
          ...document,
          filePath: "D:\\external\\notes\\source.agent-html",
        },
        project,
        section,
        startTurn,
        submit: {
          prompt: "Review this section.",
          target: {
            kind: "document",
          },
        },
        threadId: "thr_123",
        workspaceRootPath: "D:\\AgentHTML",
      })
    ).rejects.toThrow("outside the Codex workspace root")
  })
})
