import type {
  AgentHtmlAgentInteractionEvent,
  AgentHtmlAgentPromptSubmitInput,
  AgentHtmlElementNode,
} from "@/agent-html"
import {
  parseAgentHtml,
  serializeAgentHtml,
  walkAgentHtmlElementPaths,
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
  document: ProjectSectionDocument,
  path: string
): AgentHtmlElementNode | null {
  const parsedDocument = parseAgentHtml(document.ahtmlSource)
  let matchedNode: AgentHtmlElementNode | undefined

  walkAgentHtmlElementPaths(parsedDocument.root, (node, currentPath) => {
    if (currentPath === path) {
      matchedNode = node
    }
  })

  return matchedNode ?? null
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
  project: WorkspaceProjectView
  section: WorkspaceSection
  startTurn: (promptText: string) => Promise<{
    threadId: string
    turnId?: string | null
  }>
  submit: AgentHtmlAgentPromptSubmitInput
}): Promise<AgentHtmlIntentDeliveryResult> {
  const selectedNode = findElementByPath(input.document, input.submit.path)
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
    const turn = await input.startTurn(promptText)

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
