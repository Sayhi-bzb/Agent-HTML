import { afterEach, describe, expect, it, vi } from "vitest"

import {
  deliverAgentHtmlIntent,
  isCodexThreadNotFoundError,
} from "@/app/workspace/agent-intent"
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

  it("returns string and object Codex turn errors when delivery fails", async () => {
    const stringError = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      startTurn: vi.fn().mockRejectedValue("thread already has an active turn"),
      submit: {
        prompt: "Try again.",
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })
    const objectError = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      startTurn: vi.fn().mockRejectedValue({
        error: "required MCP server failed",
      }),
      submit: {
        prompt: "Try again.",
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(stringError).toEqual(
      expect.objectContaining({
        error: "thread already has an active turn",
        ok: false,
      })
    )
    expect(objectError).toEqual(
      expect.objectContaining({
        error: "required MCP server failed",
        ok: false,
      })
    )
  })

  it("recognizes stale Codex thread errors", () => {
    expect(isCodexThreadNotFoundError("process error: thread notfound")).toBe(
      true
    )
    expect(isCodexThreadNotFoundError("Thread not found")).toBe(true)
    expect(isCodexThreadNotFoundError("thread_not_found")).toBe(true)
    expect(isCodexThreadNotFoundError("required MCP server failed")).toBe(false)
  })

  it("clears a stale thread and retries once with a new thread", async () => {
    const startTurn = vi
      .fn()
      .mockRejectedValueOnce("process error: thread notfound")
      .mockResolvedValueOnce({
        threadId: "thr_new",
        turnId: "turn_new",
      })
    const clearStaleThread = vi.fn().mockResolvedValue(undefined)
    const ensureThread = vi.fn().mockResolvedValue("thr_new")

    const result = await deliverAgentHtmlIntent({
      clearStaleThread,
      document,
      ensureThread,
      project,
      section,
      startTurn,
      submit: {
        prompt: "Try again.",
      },
      threadId: "thr_old",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result).toEqual(
      expect.objectContaining({
        ok: true,
        threadId: "thr_new",
        turnId: "turn_new",
      })
    )
    expect(clearStaleThread).toHaveBeenCalledWith("thr_old")
    expect(ensureThread).toHaveBeenCalledTimes(1)
    expect(startTurn).toHaveBeenNthCalledWith(1, {
      promptText: "Try again.",
      threadId: "thr_old",
    })
    expect(startTurn).toHaveBeenNthCalledWith(2, {
      promptText: "Try again.",
      threadId: "thr_new",
    })
  })

  it("does not retry non-stale Codex turn errors", async () => {
    const startTurn = vi.fn().mockRejectedValue("required MCP server failed")
    const clearStaleThread = vi.fn().mockResolvedValue(undefined)
    const ensureThread = vi.fn().mockResolvedValue("thr_new")

    const result = await deliverAgentHtmlIntent({
      clearStaleThread,
      document,
      ensureThread,
      project,
      section,
      startTurn,
      submit: {
        prompt: "Try again.",
      },
      threadId: "thr_old",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result).toEqual(
      expect.objectContaining({
        error: "required MCP server failed",
        ok: false,
      })
    )
    expect(clearStaleThread).not.toHaveBeenCalled()
    expect(ensureThread).not.toHaveBeenCalled()
    expect(startTurn).toHaveBeenCalledTimes(1)
  })

  it("starts a pet Codex turn with the plain request", async () => {
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
      },
      threadId: "thr_123",
      workspaceRootPath: "D:\\AgentHTML",
    })

    expect(result.ok).toBe(true)
    const promptText = startTurn.mock.calls[0][0].promptText
    expect(promptText).toBe("Review this section.")
    expect(promptText).not.toContain("filePath:")
    expect(promptText).not.toContain("blockPath:")
    expect(promptText).not.toContain("targetKind:")
    expect(promptText).not.toContain("```ahtml")
  })

  it("uses a file path relative to the Codex workspace root for block prompts", async () => {
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
          path: "/Page/Section[0]/Stack[0]",
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
          path: "/Page/Section[0]/Stack[0]",
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
            path: "/Page/Section[0]/Stack[0]",
          },
        },
        threadId: "thr_123",
        workspaceRootPath: "D:\\AgentHTML",
      })
    ).rejects.toThrow("outside the Codex workspace root")
  })
})
