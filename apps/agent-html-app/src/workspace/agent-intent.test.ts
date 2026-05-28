import { afterEach, describe, expect, it, vi } from "vitest"

import { deliverAgentHtmlIntent } from "@/app/workspace/agent-intent"

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
    })

    expect(result.ok).toBe(true)
    expect(startTurn).toHaveBeenCalledWith(expect.stringContaining("Make this tighter."))
    expect(startTurn).toHaveBeenCalledWith(expect.stringContaining("<Stack>"))
    expect(result.provider).toBe("codex_app_server")
    expect(result.threadId).toBe("thr_123")
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
    })

    expect(result.ok).toBe(false)
    expect(result.provider).toBe("codex_app_server")
    expect(result.error).toBe("offline")
    expect(result.promptText).toContain("Persist my ordering.")
    expect(result.promptText).toContain("Kanban item moved")
  })
})
