import { describe, expect, it } from "vitest"

import {
  createEmptyWorkspaceTabSession,
  createWorkspaceTab,
  readWorkspaceTabSession,
  workspaceTabReducer,
} from "./workspace-tabs"

describe("workspace tabs", () => {
  it("opens resources once and activates an existing tab", () => {
    let session = createEmptyWorkspaceTabSession()
    session = workspaceTabReducer(session, {
      tab: { filePath: "one.artifact.tsx", kind: "artifact" },
      type: "open",
    })
    session = workspaceTabReducer(session, {
      tab: { filePath: "canvas.canvas.tsx", kind: "canvas" },
      type: "open",
    })
    session = workspaceTabReducer(session, {
      tab: { filePath: "one.artifact.tsx", kind: "artifact" },
      type: "open",
    })

    expect(session.tabs).toHaveLength(2)
    expect(session.activeTabId).toBe("artifact:one.artifact.tsx")
  })

  it("closes with deterministic adjacent fallback", () => {
    const tabs = [
      createWorkspaceTab({ filePath: "one", kind: "artifact" }),
      createWorkspaceTab({ filePath: "two", kind: "canvas" }),
      createWorkspaceTab({ kind: "thread-manager" }),
    ]
    const session = workspaceTabReducer(
      { activeTabId: tabs[1].id, tabs, version: 1 },
      { tabId: tabs[1].id, type: "close" }
    )

    expect(session.tabs.map((tab) => tab.id)).toEqual([tabs[0].id, tabs[2].id])
    expect(session.activeTabId).toBe("threads")
  })

  it("reconciles only registries whose successful result is available", () => {
    const artifact = createWorkspaceTab({
      filePath: "missing",
      kind: "artifact",
    })
    const thread = createWorkspaceTab({ kind: "thread", threadId: "thread-1" })
    const session = workspaceTabReducer(
      { activeTabId: thread.id, tabs: [artifact, thread], version: 1 },
      {
        artifactFilePaths: new Set(),
        type: "reconcile",
      }
    )

    expect(session.tabs).toEqual([thread])
    expect(session.activeTabId).toBe(thread.id)
  })

  it("strictly validates stable ids, duplicates, and active membership", () => {
    expect(
      readWorkspaceTabSession({
        activeTabId: "threads",
        tabs: [{ id: "threads", kind: "thread-manager" }],
        version: 1,
      })
    ).not.toBeNull()
    expect(
      readWorkspaceTabSession({
        activeTabId: "wrong",
        tabs: [{ id: "threads", kind: "thread-manager" }],
        version: 1,
      })
    ).toBeNull()
  })
})
