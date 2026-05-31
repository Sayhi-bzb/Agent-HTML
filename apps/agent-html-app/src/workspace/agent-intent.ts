import type {
  AgentHtmlAgentPromptSubmitInput,
  AgentHtmlDocument,
  AgentHtmlElementNode,
} from "@/agent-html"
import {
  parseAgentHtml,
  serializeAgentHtml,
} from "@/agent-html"
import type {
  ProjectSectionDocument,
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import { formatCodexWorkspacePath } from "@/app/workspace/codex-path"

export type AgentHtmlIntentDeliveryResult =
  | {
      eventId: string
      ok: true
      promptText: string
      provider: "codex_app_server"
      threadId: string
      turnId: string | null
    }
  | {
      error: string
      eventId: string
      ok: false
      promptText: string
      provider: "codex_app_server"
    }

export function isCodexThreadNotFoundError(error: string) {
  const normalized = error.toLowerCase()
  return (
    normalized.includes("thread notfound") ||
    normalized.includes("thread not found") ||
    normalized.includes("thread_not_found") ||
    normalized.includes("thread not_found")
  )
}

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `evt_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`
}

function getErrorMessage(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof error.message === "string") {
      return error.message
    }
    if ("error" in error && typeof error.error === "string") {
      return error.error
    }
  }

  return "Unable to start Codex turn."
}

function findElementByPath(
  parsedDocument: AgentHtmlDocument,
  path: string
): AgentHtmlElementNode | null {
  if (path === `/${parsedDocument.root.tag}`) {
    return parsedDocument.root
  }

  const parts = path.split("/").filter(Boolean)
  if (parts[0] !== parsedDocument.root.tag) {
    return null
  }

  let current: AgentHtmlElementNode = parsedDocument.root
  for (const part of parts.slice(1)) {
    const match = /^([A-Za-z][A-Za-z0-9-]*)\[(\d+)\]$/.exec(part)
    if (!match) {
      return null
    }

    const [, tag, indexValue] = match
    const targetIndex = Number(indexValue)
    let seen = 0
    let next: AgentHtmlElementNode | null = null

    for (const child of current.children) {
      if (child.type !== "element" || child.tag !== tag) {
        continue
      }

      if (seen === targetIndex) {
        next = child
        break
      }
      seen += 1
    }

    if (!next) {
      return null
    }

    current = next
  }

  return current
}

function createBlockPromptText({
  blockPath,
  filePath,
  request,
  selectedSource,
  workspaceRootPath,
}: {
  blockPath: string
  filePath: string
  request: string
  selectedSource: string | null
  workspaceRootPath: string
}) {
  return [
    "---",
    `filePath: ${formatCodexWorkspacePath(
      filePath,
      workspaceRootPath
    )}`,
    `blockPath: ${blockPath}`,
    "---",
    "",
    "```ahtml",
    selectedSource ?? "",
    "```",
    "",
    "Request:",
    request,
  ].join("\n")
}

export async function deliverAgentHtmlIntent(input: {
  clearStaleThread?: (threadId: string) => Promise<void>
  document: ProjectSectionDocument
  ensureThread?: () => Promise<string>
  parsedDocument?: AgentHtmlDocument
  project: WorkspaceProjectView
  section: WorkspaceSection
  startTurn: (input: {
    promptText: string
    threadId: string
  }) => Promise<{
    threadId: string
    turnId?: string | null
  }>
  submit: AgentHtmlAgentPromptSubmitInput
  threadId: string
  workspaceRootPath: string
}): Promise<AgentHtmlIntentDeliveryResult> {
  const eventId = createEventId()
  const blockPath = input.submit.target?.path
  const promptText = blockPath
    ? createBlockPromptText({
        blockPath,
        filePath: input.document.filePath,
        request: input.submit.prompt,
        selectedSource: (() => {
          const parsedDocument =
            input.parsedDocument ?? parseAgentHtml(input.document.source)
          const selectedNode = findElementByPath(parsedDocument, blockPath)
          return selectedNode ? serializeAgentHtml({ root: selectedNode }) : null
        })(),
        workspaceRootPath: input.workspaceRootPath,
      })
    : input.submit.prompt

  const startTurn = async (threadId: string) =>
    input.startTurn({
      promptText,
      threadId,
    })

  try {
    const turn = await startTurn(input.threadId)

    return {
      eventId,
      ok: true,
      promptText,
      provider: "codex_app_server",
      threadId: turn.threadId,
      turnId: turn.turnId ?? null,
    }
  } catch (error) {
    const message = getErrorMessage(error)
    if (
      input.ensureThread &&
      isCodexThreadNotFoundError(message)
    ) {
      await input.clearStaleThread?.(input.threadId)
      try {
        const nextThreadId = await input.ensureThread()
        const turn = await startTurn(nextThreadId)
        return {
          eventId,
          ok: true,
          promptText,
          provider: "codex_app_server",
          threadId: turn.threadId,
          turnId: turn.turnId ?? null,
        }
      } catch (retryError) {
        return {
          error: getErrorMessage(retryError),
          eventId,
          ok: false,
          promptText,
          provider: "codex_app_server",
        }
      }
    }

    return {
      error: message,
      eventId,
      ok: false,
      promptText,
      provider: "codex_app_server",
    }
  }
}
