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
    ahtmlSource: string
    selectedSource: string | null
  }
  createdAt: string
  eventId: string
  interaction: AgentHtmlAgentInteractionEvent | null
  intent: {
    prompt: string
    type: "edit"
  }
  schemaVersion: "agent-html.context-event.v1"
  source: {
    app: "agent-html"
    documentId: string
    projectId: string
    projectName: string
    sectionId: string
    sectionTitle: string
    surface: "workspace"
  }
  target: {
    blockPath: string
    blockTag: string | null
    kind: "block"
  }
}

export type AgentHtmlIntentDeliveryResult =
  | {
      eventId: string
      ok: true
      promptText: string
      provider: "http_bridge"
    }
  | {
      error: string
      eventId: string
      ok: false
      promptText: string
      provider: "copy_prompt"
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

function formatInteraction(interaction: AgentHtmlAgentInteractionEvent | null) {
  if (!interaction) {
    return "无"
  }

  if (interaction.kind === "kanban_item_moved") {
    return [
      `类型：Kanban item moved`,
      `item: ${interaction.itemValue}`,
      `from: ${interaction.previousColumnValue}[${interaction.previousIndex}]`,
      `to: ${interaction.nextColumnValue}[${interaction.nextIndex}]`,
    ].join("\n")
  }

  return [
    `类型：Block moved`,
    `sourcePath: ${interaction.sourcePath}`,
    `intent: ${JSON.stringify(interaction.intent)}`,
  ].join("\n")
}

function createPromptText(event: AgentHtmlContextEvent) {
  return [
    "用户在 Agent-HTML 工作台中发起了一个上下文请求。",
    "",
    "用户要求：",
    event.intent.prompt,
    "",
    "目标位置：",
    `- project: ${event.source.projectName} (${event.source.projectId})`,
    `- section: ${event.source.sectionTitle} (${event.source.sectionId})`,
    `- blockPath: ${event.target.blockPath}`,
    `- blockTag: ${event.target.blockTag ?? "unknown"}`,
    "",
    "最近一次交互：",
    formatInteraction(event.interaction),
    "",
    "选中 Block AHTML：",
    event.context.selectedSource ?? "未找到选中 block 的源码片段。",
    "",
    "当前文档 AHTML：",
    event.context.ahtmlSource,
  ].join("\n")
}

function getBridgeUrl() {
  const configuredUrl = import.meta.env.VITE_AGENT_HTML_BRIDGE_URL
  if (typeof configuredUrl === "string" && configuredUrl.trim()) {
    return configuredUrl.trim()
  }

  return "http://127.0.0.1:51278/agent-html/events"
}

async function copyPromptFallback(promptText: string) {
  if (typeof navigator === "undefined" || !navigator.clipboard?.writeText) {
    throw new Error("Clipboard is not available.")
  }

  await navigator.clipboard.writeText(promptText)
}

export async function deliverAgentHtmlIntent(input: {
  document: ProjectSectionDocument
  project: WorkspaceProjectView
  section: WorkspaceSection
  submit: AgentHtmlAgentPromptSubmitInput
}): Promise<AgentHtmlIntentDeliveryResult> {
  const selectedNode = findElementByPath(input.document, input.submit.path)
  const event: AgentHtmlContextEvent = {
    context: {
      ahtmlSource: input.document.ahtmlSource,
      selectedSource: selectedNode
        ? serializeAgentHtml({ root: selectedNode })
        : null,
    },
    createdAt: new Date().toISOString(),
    eventId: createEventId(),
    interaction: input.submit.interaction ?? null,
    intent: {
      prompt: input.submit.prompt,
      type: "edit",
    },
    schemaVersion: "agent-html.context-event.v1",
    source: {
      app: "agent-html",
      documentId: `${input.document.projectId}/${input.document.sectionId}`,
      projectId: input.project.id,
      projectName: input.project.name,
      sectionId: input.section.id,
      sectionTitle: input.section.title,
      surface: "workspace",
    },
    target: {
      blockPath: input.submit.path,
      blockTag: selectedNode?.tag ?? null,
      kind: "block",
    },
  }
  const promptText = createPromptText(event)

  try {
    const response = await fetch(getBridgeUrl(), {
      body: JSON.stringify({
        event,
        promptText,
      }),
      headers: {
        "Content-Type": "application/json",
      },
      method: "POST",
    })

    if (!response.ok) {
      throw new Error(`Bridge returned ${response.status}.`)
    }

    return {
      eventId: event.eventId,
      ok: true,
      promptText,
      provider: "http_bridge",
    }
  } catch (error) {
    try {
      await copyPromptFallback(promptText)
    } catch {
      return {
        error:
          error instanceof Error
            ? error.message
            : "Bridge unavailable and clipboard fallback failed.",
        eventId: event.eventId,
        ok: false,
        promptText,
        provider: "copy_prompt",
      }
    }

    return {
      error:
        error instanceof Error
          ? error.message
          : "Bridge unavailable; prompt copied instead.",
      eventId: event.eventId,
      ok: false,
      promptText,
      provider: "copy_prompt",
    }
  }
}
