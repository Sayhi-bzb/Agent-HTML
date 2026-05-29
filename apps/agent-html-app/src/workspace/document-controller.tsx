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

export type PendingDocumentState =
  | { status: "idle" }
  | { detail: string; status: "loading" }
  | { detail: string; status: "error" }

export type WorkspaceDocumentDraft = {
  document: ProjectSectionDocument
  projectId: string
  saveState: Extract<SaveState, { status: "dirty" | "error" }>
  sectionId: string
  tabId: string
}

const workspaceRepository = createWorkspaceRepository()

function getSectionTabId(sectionId: string) {
  return `section:${sectionId}`
}

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
  activeTabDraft,
  activeTabId,
  canSave,
  onDraftChange,
  onDirtyChange,
}: {
  activeProject: WorkspaceProjectView | null
  activeSection: WorkspaceSection | null
  activeTabDraft: WorkspaceDocumentDraft | null
  activeTabId: string | null
  canSave: boolean
  onDraftChange: (tabId: string, draft: WorkspaceDocumentDraft | null) => void
  onDirtyChange: (tabId: string | null, isDirty: boolean) => void
}) {
  const [documentState, setDocumentState] =
    React.useState<WorkspaceDocumentState>({ status: "idle" })
  const [saveState, setSaveState] = React.useState<SaveState>({
    status: "clean",
  })
  const [pendingDocumentState, setPendingDocumentState] =
    React.useState<PendingDocumentState>({ status: "idle" })
  const documentStateRef = React.useRef(documentState)

  React.useEffect(() => {
    documentStateRef.current = documentState
  }, [documentState])

  React.useEffect(() => {
    const isDirty = saveState.status === "dirty" || saveState.status === "error"

    if (documentState.status !== "ready") {
      onDirtyChange(activeTabId, false)
      return
    }

    const documentTabId = getSectionTabId(documentState.document.sectionId)
    onDirtyChange(documentTabId, isDirty)

    if (isDirty) {
      onDraftChange(documentTabId, {
        document: documentState.document,
        projectId: documentState.document.projectId,
        saveState,
        sectionId: documentState.document.sectionId,
        tabId: documentTabId,
      })
      return
    }

    onDraftChange(documentTabId, null)
  }, [activeTabId, documentState, onDirtyChange, onDraftChange, saveState])

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
    if (
      !canSave ||
      documentState.status !== "ready" ||
      saveState.status === "clean" ||
      saveState.status === "saved" ||
      saveState.status === "saving"
    ) {
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
        const documentTabId = getSectionTabId(nextDocument.sectionId)
        onDraftChange(documentTabId, null)
        onDirtyChange(documentTabId, false)
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
  }, [canSave, documentState, onDirtyChange, onDraftChange, saveState.status])

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        event.key.toLowerCase() !== "s" ||
        event.altKey ||
        event.shiftKey ||
        (!event.ctrlKey && !event.metaKey)
      ) {
        return
      }

      if (
        !canSave ||
        documentStateRef.current.status !== "ready" ||
        (saveState.status !== "dirty" && saveState.status !== "error")
      ) {
        return
      }

      event.preventDefault()
      handleSaveDocument()
    }

    window.addEventListener("keydown", handleKeyDown)
    return () => window.removeEventListener("keydown", handleKeyDown)
  }, [canSave, handleSaveDocument, saveState.status])

  React.useEffect(() => {
    if (!activeProject || !activeSection || !activeTabId) {
      setDocumentState({ status: "idle" })
      setPendingDocumentState({ status: "idle" })
      setSaveState({ status: "clean" })
      return
    }

    let isCurrent = true
    const pendingDetail = `${activeProject.name} / ${activeSection.title}`
    const hasDisplayedDocument = documentStateRef.current.status === "ready"

    if (
      activeTabDraft?.tabId === activeTabId &&
      activeTabDraft.projectId === activeProject.id &&
      activeTabDraft.sectionId === activeSection.id
    ) {
      setDocumentState({ document: activeTabDraft.document, status: "ready" })
      setPendingDocumentState({ status: "idle" })
      setSaveState(activeTabDraft.saveState)
      return
    }

    if (hasDisplayedDocument) {
      setPendingDocumentState({
        detail: pendingDetail,
        status: "loading",
      })
      setSaveState((current) =>
        current.status === "dirty" ||
        current.status === "saving" ||
        current.status === "error"
          ? current
          : { status: "clean" }
      )
    } else {
      setPendingDocumentState({ status: "idle" })
      setDocumentState({ status: "loading" })
    }

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
          setPendingDocumentState({ status: "idle" })
          setSaveState({ status: "clean" })
        }
      })
      .catch((error: unknown) => {
        if (isCurrent) {
          const message =
            error instanceof Error
              ? error.message
              : "Unable to load workspace document."

          if (documentStateRef.current.status === "ready") {
            setPendingDocumentState({
              detail: message,
              status: "error",
            })
          } else {
            setPendingDocumentState({ status: "idle" })
            setDocumentState({
              message,
              status: "error",
            })
            setSaveState({ status: "clean" })
          }
        }
      })

    return () => {
      isCurrent = false
    }
  }, [activeProject, activeSection, activeTabDraft, activeTabId])

  return {
    documentState,
    handleDropIntent,
    handleSaveDocument,
    pendingDocumentState,
    runtime,
    saveState,
  }
}
