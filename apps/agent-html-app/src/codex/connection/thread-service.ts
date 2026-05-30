import { readThreadId, readThreads, readTurnId } from "./parsers"
import { createThreadListParams } from "./thread-list"
import type {
  CodexThreadSummary,
  CodexTurnInterruptInput,
  CodexTurnStartResult,
} from "./types"

export type CodexRpcRequest = (
  method: string,
  params: unknown
) => Promise<unknown>

export type CodexThreadListResult = {
  items: CodexThreadSummary[]
}

export type CodexThreadService = {
  listThreads: (input: {
    cwd?: string | null
    request: CodexRpcRequest
  }) => Promise<CodexThreadListResult>
  resumeThread: (input: {
    request: CodexRpcRequest
    threadId: string
  }) => Promise<void>
  startThread: (input: { request: CodexRpcRequest }) => Promise<string>
  startTurn: (input: {
    promptText: string
    request: CodexRpcRequest
    threadId: string
  }) => Promise<CodexTurnStartResult>
  interruptTurn: (input: CodexTurnInterruptInput & {
    request: CodexRpcRequest
  }) => Promise<void>
}

export const codexThreadService: CodexThreadService = {
  async listThreads({ cwd, request }) {
    return {
      items: readThreads(await request("thread/list", createThreadListParams(cwd))),
    }
  },

  async resumeThread({ request, threadId }) {
    await request("thread/resume", { threadId })
  },

  async startThread({ request }) {
    const threadId = readThreadId(
      await request("thread/start", {
        persistExtendedHistory: false,
        serviceName: "agent_html",
      })
    )

    if (!threadId) {
      throw new Error("Codex did not return a thread id.")
    }

    return threadId
  },

  async startTurn({ promptText, request, threadId }) {
    if (!threadId) {
      throw new Error("Choose a Codex thread before sending a request.")
    }

    const result = await request("turn/start", {
      input: [
        {
          text: promptText,
          type: "text",
        },
      ],
      threadId,
    })

    return {
      threadId,
      turnId: readTurnId(result),
    }
  },

  async interruptTurn({ request, threadId, turnId }) {
    if (!threadId) {
      throw new Error("Choose a Codex thread before interrupting a turn.")
    }

    await request("turn/interrupt", {
      threadId,
      ...(turnId ? { turnId } : {}),
    })
  },
}
