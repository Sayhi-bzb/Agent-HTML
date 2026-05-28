import type {
  AgentHtmlAgentInteractionEvent,
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

type AgentHtmlContextEvent = {
  context: {
    selectedSource: string | null
  }
  createdAt: string
  eventId: string
  interaction: AgentHtmlAgentInteractionEvent | null
  intent: {
    request: string
  }
  schemaVersion: "agent-html.context-event.v1"
  source: {
    app: "agent-html"
    documentId: string
    filePath: string
    projectId: string
    projectName: string
    sectionId: string
    sectionTitle: string
    surface: "workspace"
  }
  target: {
    ahtmlPath: string
    kind: "block"
  }
}

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

function createEventId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID()
  }

  return `evt_${Date.now().toString(36)}_${Math.random()
    .toString(36)
    .slice(2)}`
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

function createPromptText(event: AgentHtmlContextEvent) {
  // TODO: Convert filePath to a Codex-cwd-relative path when the host exposes a
  // stable cwd contract for workspace documents.
  return [
    "---",
    `filePath: ${event.source.filePath}`,
    `ahtmlPath: ${event.target.ahtmlPath}`,
    "---",
    "",
    "```ahtml",
    event.context.selectedSource ?? "",
    "```",
    "",
    "Request:",
    event.intent.request,
  ].join("\n")
}

export async function deliverAgentHtmlIntent(input: {
  document: ProjectSectionDocument
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
}): Promise<AgentHtmlIntentDeliveryResult> {
  const parsedDocument =
    input.parsedDocument ?? parseAgentHtml(input.document.ahtmlSource)
  const selectedNode = findElementByPath(parsedDocument, input.submit.path)
  const event: AgentHtmlContextEvent = {
    context: {
      selectedSource: selectedNode
        ? serializeAgentHtml({ root: selectedNode })
        : null,
    },
    createdAt: new Date().toISOString(),
    eventId: createEventId(),
    interaction: input.submit.interaction ?? null,
    intent: {
      request: input.submit.prompt,
    },
    schemaVersion: "agent-html.context-event.v1",
    source: {
      app: "agent-html",
      documentId: `${input.document.projectId}/${input.document.sectionId}`,
      filePath: input.document.filePath,
      projectId: input.project.id,
      projectName: input.project.name,
      sectionId: input.section.id,
      sectionTitle: input.section.title,
      surface: "workspace",
    },
    target: {
      ahtmlPath: input.submit.path,
      kind: "block",
    },
  }
  const promptText = createPromptText(event)

  try {
    const turn = await input.startTurn({
      promptText,
      threadId: input.threadId,
    })

    return {
      eventId: event.eventId,
      ok: true,
      promptText,
      provider: "codex_app_server",
      threadId: turn.threadId,
      turnId: turn.turnId ?? null,
    }
  } catch (error) {
    return {
      error:
        error instanceof Error
          ? error.message
          : "Unable to start Codex turn.",
      eventId: event.eventId,
      ok: false,
      promptText,
      provider: "codex_app_server",
    }
  }
}
