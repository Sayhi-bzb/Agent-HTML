import { describe, expect, it } from "vitest"

import {
  buildProjectThreadPickerItems,
  formatThreadRelativeTime,
  readFirstThreadRequestText,
  sortProjectThreadLinksByRecent,
} from "@/app/workspace/thread-picker-model"

describe("workspace thread card helpers", () => {
  it("formats thread timestamps as fixed English relative time", () => {
    const now = Date.UTC(2026, 4, 28, 12, 0, 0)

    expect(formatThreadRelativeTime(new Date(now - 20_000).toISOString(), now)).toBe(
      "just now"
    )
    expect(formatThreadRelativeTime(new Date(now - 3 * 60_000).toISOString(), now)).toBe(
      "3m ago"
    )
    expect(formatThreadRelativeTime(new Date(now - 2 * 60 * 60_000).toISOString(), now)).toBe(
      "2h ago"
    )
    expect(formatThreadRelativeTime(new Date(now - 5 * 24 * 60 * 60_000).toISOString(), now)).toBe(
      "5d ago"
    )
  })

  it("reads the first user request from summarized thread turns", () => {
    expect(
      readFirstThreadRequestText({
        data: [
          {
            items: [
              {
                content: [
                  { text: "  Build a pricing card  " },
                  { text: "with actions" },
                ],
                type: "userMessage",
              },
            ],
          },
        ],
      })
    ).toBe("Build a pricing card with actions")
  })

  it("extracts the Agent-HTML request from prompt front matter", () => {
    expect(
      readFirstThreadRequestText({
        data: [
          {
            items: [
              {
                content: [
                  {
                    text: [
                      "---",
                      "filePath: D:/demo/page.ahtml",
                      "blockPath: /Page/Stack[0]",
                      "---",
                      "",
                      "```ahtml",
                      "<Stack />",
                      "```",
                      "",
                      "Request:",
                      "Make this section tighter.",
                    ].join("\n"),
                  },
                ],
                type: "userMessage",
              },
            ],
          },
        ],
      })
    ).toBe("Make this section tighter.")
  })

  it("truncates long request previews", () => {
    const preview = readFirstThreadRequestText({
      data: [
        {
          items: [
            {
              content: [{ text: "x".repeat(200) }],
              type: "userMessage",
            },
          ],
        },
      ],
    })

    expect(preview).toHaveLength(160)
    expect(preview?.endsWith("...")).toBe(true)
  })

  it("sorts project thread links with the newest thread first", () => {
    const links = [
      {
        createdAt: "2026-05-26T12:00:00.000Z",
        lastUsedAt: "2026-05-27T12:00:00.000Z",
        origin: "agent-html",
        projectId: "project",
        threadId: "thr_old",
      },
      {
        createdAt: "2026-05-25T12:00:00.000Z",
        lastUsedAt: "2026-05-26T12:00:00.000Z",
        origin: "agent-html",
        projectId: "project",
        threadId: "thr_new",
      },
    ] as const
    const summaries = [
      {
        id: "thr_new",
        name: null,
        updatedAt: "2026-05-28T12:00:00.000Z",
      },
    ]

    expect(sortProjectThreadLinksByRecent([...links], summaries).map((link) => link.threadId)).toEqual([
      "thr_new",
      "thr_old",
    ])
  })

  it("builds serializable thread picker items for the app-hosted pet", () => {
    const items = buildProjectThreadPickerItems({
      optimisticThreadNames: {
        thr_current: "Working thread",
      },
      projectThreadLinks: [
        {
          createdAt: "2026-05-27T12:00:00.000Z",
          lastUsedAt: "2026-05-28T11:58:00.000Z",
          origin: "agent-html",
          projectId: "project",
          threadId: "thr_current",
        },
      ],
      selectedProjectThreadId: "thr_current",
      threadRequestPreviews: {
        thr_current: {
          isLoading: false,
          requestText: "Make the pet draggable.",
        },
      },
      threadSummaries: [],
    })

    expect(items).toEqual([
      {
        displayName: "Working thread",
        isCurrentThread: true,
        previewText: "Make the pet draggable.",
        threadId: "thr_current",
        timestamp: expect.any(String),
      },
    ])
  })
})
