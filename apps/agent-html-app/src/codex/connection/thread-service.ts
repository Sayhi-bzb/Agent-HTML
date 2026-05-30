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
    cwd?: string | null
    request: CodexRpcRequest
    threadId: string
  }) => Promise<void>
  startThread: (input: {
    cwd?: string | null
    request: CodexRpcRequest
  }) => Promise<string>
  startTurn: (input: {
    cwd?: string | null
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

  async resumeThread({ cwd, request, threadId }) {
    await request("thread/resume", {
      ...(cwd ? { cwd } : {}),
      threadId,
    })
  },

  async startThread({ cwd, request }) {
    const threadId = readThreadId(
      await request("thread/start", {
        ...(cwd ? { cwd } : {}),
        persistExtendedHistory: false,
        serviceName: "agent_html",
      })
    )

    if (!threadId) {
      throw new Error("Codex did not return a thread id.")
    }

    return threadId
  },

  async startTurn({ cwd, promptText, request, threadId }) {
    if (!threadId) {
      throw new Error("Choose a Codex thread before sending a request.")
    }

    const result = await request("turn/start", {
      ...(cwd ? { cwd } : {}),
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
