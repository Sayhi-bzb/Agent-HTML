import { describe, expect, it } from "vitest"

import {
  reduceCodexApprovalNotification,
  reduceCodexServerRequest,
  type CodexApprovalState,
} from "@/app/workspace/agent-approval"

const emptyState: CodexApprovalState = { items: [] }

describe("Codex approval reducers", () => {
  it("tracks command approval requests", () => {
    const state = reduceCodexServerRequest(emptyState, {
      id: 7,
      method: "item/commandExecution/requestApproval",
      params: {
        availableDecisions: ["accept", "acceptForSession", "decline"],
        command: ["npm", "test"],
        cwd: "D:\\codes\\Agent-HTML",
        itemId: "item_1",
        threadId: "thr_1",
        turnId: "turn_1",
      },
    })

    expect(state.items[0]).toEqual(
      expect.objectContaining({
        availableDecisions: ["accept", "acceptForSession", "decline"],
        command: "npm test",
        cwd: "D:\\codes\\Agent-HTML",
        itemId: "item_1",
        kind: "command",
        requestId: 7,
        title: "Command needs approval",
      })
    )
  })

  it("tracks network approval requests with network-specific title", () => {
    const state = reduceCodexServerRequest(emptyState, {
      id: 8,
      method: "item/commandExecution/requestApproval",
      params: {
        networkApprovalContext: {
          host: "registry.npmjs.org",
          port: 443,
          protocol: "https",
        },
      },
    })

    expect(state.items[0]).toEqual(
      expect.objectContaining({
        networkTarget: "https://registry.npmjs.org:443",
        title: "Network access needs approval",
      })
    )
  })

  it("tracks file change approval requests", () => {
    const state = reduceCodexServerRequest(emptyState, {
      id: 9,
      method: "item/fileChange/requestApproval",
      params: {
        grantRoot: "D:\\outside",
        reason: "Need to edit outside workspace.",
      },
    })

    expect(state.items[0]).toEqual(
      expect.objectContaining({
        cwd: "D:\\outside",
        kind: "fileChange",
        reason: "Need to edit outside workspace.",
        title: "File change needs approval",
      })
    )
  })

  it("clears resolved server requests", () => {
    const pending = reduceCodexServerRequest(emptyState, {
      id: 10,
      method: "item/commandExecution/requestApproval",
      params: {},
    })

    const resolved = reduceCodexApprovalNotification(pending, {
      method: "serverRequest/resolved",
      params: {
        requestId: 10,
      },
    })

    expect(resolved.items).toEqual([])
  })
})
