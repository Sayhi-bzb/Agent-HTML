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

  it("posts a context event to the local bridge", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true })
    vi.stubGlobal("fetch", fetchMock)

    const result = await deliverAgentHtmlIntent({
      document,
      project,
      section,
      submit: {
        interaction: null,
        path: "/Page/Section[0]/Stack[0]",
        prompt: "Make this tighter.",
      },
    })

    expect(result.ok).toBe(true)
    expect(fetchMock).toHaveBeenCalledWith(
      "http://127.0.0.1:51278/agent-html/events",
      expect.objectContaining({
        method: "POST",
      })
    )

    const body = JSON.parse(fetchMock.mock.calls[0][1].body)
    expect(body.event.target.blockTag).toBe("Stack")
    expect(body.promptText).toContain("Make this tighter.")
    expect(body.promptText).toContain("<Stack>")
  })

  it("copies the prompt when the bridge is unavailable", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error("offline")))
    vi.stubGlobal("navigator", {
      clipboard: {
        writeText,
      },
    })

    const result = await deliverAgentHtmlIntent({
      document,
      project,
      section,
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
    expect(result.provider).toBe("copy_prompt")
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Persist my ordering.")
    )
    expect(writeText).toHaveBeenCalledWith(
      expect.stringContaining("Kanban item moved")
    )
  })
})
