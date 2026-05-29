import * as React from "react"

import { markCodexStartupEvent } from "@/app/codex/connection"
import { createWorkspaceRepository } from "@/app/workspace/repository"
import type {
  ProjectSectionDocument,
  WorkspaceProjectView,
  WorkspaceSection,
} from "@/app/workspace/types"
import {
  applyAgentHtmlDropIntent,
  parseAgentHtml,
  renderInteractiveAgentHtml,
  serializeAgentHtml,
  validateAgentHtml,
  type AgentHtmlDocument,
  type AgentHtmlDropIntent,
  type AgentHtmlValidationError,
} from "@/agent-html"

export type WorkspaceDocumentState =
  | { status: "idle" | "loading" }
  | { message: string; status: "error" }
  | { document: ProjectSectionDocument; status: "ready" }

export type RuntimeState =
  | {
      content: React.ReactNode
      document: ProjectSectionDocument
      parsedDocument: AgentHtmlDocument
      status: "ready"
    }
  | { errors: AgentHtmlValidationError[]; status: "invalid" }
  | { message: string; status: "error" }

export type SaveState =
  | { status: "clean" }
  | { status: "dirty" }
  | { status: "saving" }
  | { status: "saved" }
  | { detail: string; status: "error" }

const workspaceRepository = createWorkspaceRepository()

export function renderWorkspaceDocument(
  document: ProjectSectionDocument
): RuntimeState {
  try {
    const parsedDocument = parseAgentHtml(document.ahtmlSource)
    const validation = validateAgentHtml(parsedDocument)

    if (!validation.ok) {
      return {
        errors: validation.errors,
        status: "invalid",
      }
    }

    return {
      content: renderInteractiveAgentHtml(parsedDocument),
      document,
      parsedDocument,
      status: "ready",
    }
  } catch (error) {
    return {
      message: error instanceof Error ? error.message : "Unable to render AHTML.",
      status: "error",
    }
  }
}

export function useWorkspaceDocumentController({
  activeProject,
  activeSection,
  canSave,
  onDirtyChange,
  saveAttentionToken,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  canSave: boolean
  onDirtyChange: (isDirty: boolean) => void
  saveAttentionToken: number
}) {
  const [documentState, setDocumentState] =
    React.useState<WorkspaceDocumentState>({ status: "idle" })
  const [saveState, setSaveState] = React.useState<SaveState>({
    status: "clean",
  })
  const [isSaveAttentionActive, setIsSaveAttentionActive] =
    React.useState(false)

  React.useEffect(() => {
    onDirtyChange(saveState.status === "dirty" || saveState.status === "error")
  }, [onDirtyChange, saveState.status])

  React.useEffect(() => {
    if (
      saveAttentionToken === 0 ||
      (saveState.status !== "dirty" && saveState.status !== "error")
    ) {
      return
    }

    setIsSaveAttentionActive(true)
    const timeout = window.setTimeout(() => {
      setIsSaveAttentionActive(false)
    }, 1400)

    return () => window.clearTimeout(timeout)
  }, [saveAttentionToken, saveState.status])

  const runtime = React.useMemo(() => {
    if (documentState.status !== "ready") {
      return null
    }

    return renderWorkspaceDocument(documentState.document)
  }, [documentState])

  const handleDropIntent = React.useCallback(
    ({
      intent,
      sourcePath,
    }: {
      intent: AgentHtmlDropIntent
      sourcePath: string
    }) => {
      if (documentState.status !== "ready" || runtime?.status !== "ready") {
        return
      }

      try {
        const nextDocument = applyAgentHtmlDropIntent(runtime.parsedDocument, {
          intent,
          sourcePath,
        })

        setDocumentState({
          document: {
            ...documentState.document,
            ahtmlSource: serializeAgentHtml(nextDocument),
          },
          status: "ready",
        })
        setSaveState({ status: "dirty" })
      } catch {
        return
      }
    },
    [documentState, runtime]
  )

  const handleSaveDocument = React.useCallback(() => {
    if (!canSave || documentState.status !== "ready") {
      return
    }

    const document = documentState.document
    setSaveState({ status: "saving" })
    workspaceRepository
      .updateProjectSectionDocument({
        ahtmlSource: document.ahtmlSource,
        projectId: document.projectId,
        sectionId: document.sectionId,
      })
      .then((nextDocument) => {
        setDocumentState({ document: nextDocument, status: "ready" })
        setSaveState({ status: "saved" })
      })
      .catch((error: unknown) => {
        setSaveState({
          detail:
            error instanceof Error
              ? error.message
              : "Unable to save workspace document.",
          status: "error",
        })
      })
  }, [canSave, documentState])

  React.useEffect(() => {
    if (!activeProject || !activeSection) {
      setDocumentState({ status: "idle" })
      setSaveState({ status: "clean" })
      return
    }

    let isCurrent = true
    setDocumentState({ status: "loading" })

    workspaceRepository
      .getProjectSectionDocument(activeProject.id, activeSection.id)
      .then((document) => {
        if (isCurrent) {
          markCodexStartupEvent("workspace-document-ready", {
            filePath: document.filePath,
            projectId: activeProject.id,
            sectionId: activeSection.id,
          })
          setDocumentState({ document, status: "ready" })
          setSaveState({ status: "clean" })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          setDocumentState({
            message:
              error instanceof Error
                ? error.message
                : "Unable to load workspace document.",
            status: "error",
          })
          setSaveState({ status: "clean" })
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeProject, activeSection])

  return {
    documentState,
    handleDropIntent,
    handleSaveDocument,
    isSaveAttentionActive,
    runtime,
    saveState,
  }
}
