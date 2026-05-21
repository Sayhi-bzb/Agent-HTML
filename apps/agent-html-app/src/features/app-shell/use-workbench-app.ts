import { startTransition, useEffect, useMemo, useState } from "react"

import { mockAppState, mockPreviewHtml } from "@/lib/mock-data"
import {
  appendChatMessage,
  checkRuntime,
  createSession,
  deleteSession,
  generateSessionProposal,
  isTauriRuntime,
  listSessions,
  openSession,
  runBuild,
  runInspect,
  saveSource,
  setSessionView,
  validateSource,
} from "@/lib/tauri"
import type {
  AppState,
  RuntimeReport,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

import { formatError } from "./errors"
import {
  deriveBuildSummary,
  deriveInspectSnapshot,
  hydrateSessionState,
  loadSessionState,
  safeReadChat,
  safeReadLogs,
  safeReadPreviewHtml,
} from "./session-hydration"
import { initialCommandState } from "./types"

function filterMessages(messages: AppState["chat"]) {
  return messages.filter((message) => {
    return (
      message.kind === "proposal-placeholder" ||
      message.kind === "context-card" ||
      message.role !== "system"
    )
  })
}

export function useWorkbenchApp() {
  const [appState, setAppState] = useState<AppState>(mockAppState)
  const [previewHtml, setPreviewHtml] = useState<string | undefined>(
    isTauriRuntime() ? undefined : mockPreviewHtml,
  )
  const [activeView, setActiveView] = useState<WorkbenchView>(
    mockAppState.currentSession.currentView,
  )
  const [draftSource, setDraftSource] = useState(mockAppState.currentSession.source)
  const [messageDraft, setMessageDraft] = useState("")
  const [validation, setValidation] = useState<SourceValidationSnapshot>()
  const [runtimeReport, setRuntimeReport] = useState<RuntimeReport>()
  const [commandState, setCommandState] = useState(initialCommandState)

  const currentSession = appState.currentSession
  const currentBuild = appState.currentBuild
  const currentInspect = appState.currentInspect
  const currentLogs = appState.currentLogs
  const messages = appState.chat
  const hasUnsavedChanges = draftSource !== currentSession.source

  const filteredMessages = useMemo(() => filterMessages(messages), [messages])

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    setDraftSource(currentSession.source)
    setValidation(undefined)
    setRuntimeReport(undefined)
  }, [currentSession.summary.id, currentSession.source])

  async function bootstrap(): Promise<void> {
    if (!isTauriRuntime()) {
      setCommandState((current) => ({ ...current, loading: false }))
      return
    }

    setCommandState((current) => ({
      ...current,
      loading: true,
      error: undefined,
    }))

    try {
      const sessions = await listSessions()
      let session = sessions[0]

      if (!session) {
        session = (await createSession({ name: "First Session" })).summary
      }

      const nextState = await loadSessionState(session.id)
      applyHydratedSessionState(
        nextState,
        sessions.length > 0 ? sessions : [nextState.session.summary],
      )
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  function applyHydratedSessionState(
    nextState: Awaited<ReturnType<typeof loadSessionState>>,
    sessions: AppState["sessions"],
  ): void {
    startTransition(() => {
      setAppState((current) => ({
        ...current,
        sessions,
        currentSession: nextState.session,
        currentBuild: deriveBuildSummary(nextState.session),
        currentInspect: deriveInspectSnapshot(nextState.session),
        currentLogs: nextState.logs,
        chat: nextState.chat,
      }))
      setPreviewHtml(nextState.previewHtml)
      setActiveView(nextState.session.currentView)
      setDraftSource(nextState.session.source)
      setCommandState((current) => ({ ...current, loading: false }))
    })
  }

  function updateSessionSummary(session: AppState["currentSession"]): void {
    setAppState((current) => ({
      ...current,
      currentSession: session,
      sessions: current.sessions.map((item) =>
        item.id === session.summary.id ? session.summary : item,
      ),
    }))
  }

  async function openSessionById(sessionId: string): Promise<void> {
    if (!isTauriRuntime()) {
      const nextSession = appState.sessions.find((session) => session.id === sessionId)
      if (!nextSession) {
        return
      }

      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession: current.currentSession,
        }))
      })
      return
    }

    setCommandState((current) => ({
      ...current,
      loading: true,
      error: undefined,
    }))

    try {
      const nextState = await loadSessionState(sessionId)
      applyHydratedSessionState(nextState, appState.sessions)
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function createNewSession(): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      loading: true,
      error: undefined,
    }))

    try {
      const created = await createSession({
        name: `Session ${appState.sessions.length + 1}`,
      })
      const nextState = await hydrateSessionState(created)
      const sessions = await listSessions()
      applyHydratedSessionState(nextState, sessions)
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function deleteCurrentOrTargetSession(sessionId: string): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      loading: true,
      error: undefined,
    }))

    try {
      await deleteSession(sessionId)
      const sessions = await listSessions()

      if (sessions.length === 0) {
        const created = await createSession({ name: "First Session" })
        const nextState = await hydrateSessionState(created)
        applyHydratedSessionState(nextState, [nextState.session.summary])
        return
      }

      const fallbackId =
        sessionId === currentSession.summary.id
          ? sessions[0].id
          : currentSession.summary.id
      const nextState = await loadSessionState(fallbackId)
      applyHydratedSessionState(nextState, sessions)
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function changeView(view: WorkbenchView): Promise<void> {
    setActiveView(view)

    if (!isTauriRuntime()) {
      return
    }

    try {
      const session = await setSessionView(currentSession.summary.id, { view })
      startTransition(() => {
        updateSessionSummary(session)
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    }
  }

  async function saveCurrentSource(): Promise<void> {
    if (!hasUnsavedChanges) {
      return
    }

    if (!isTauriRuntime()) {
      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession: {
            ...current.currentSession,
            source: draftSource,
          },
        }))
      })
      return
    }

    setCommandState((current) => ({
      ...current,
      saving: true,
      error: undefined,
    }))

    try {
      const session = await saveSource(currentSession.summary.id, draftSource)
      startTransition(() => {
        updateSessionSummary(session)
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, saving: false }))
    }
  }

  async function buildCurrentSession(): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      building: true,
      error: undefined,
    }))

    try {
      if (hasUnsavedChanges) {
        await saveCurrentSource()
      }

      const build = await runBuild(currentSession.summary.id)
      const html = await safeReadPreviewHtml(currentSession.summary.id)
      const session = await openSession(currentSession.summary.id)
      const chat = await safeReadChat(currentSession.summary.id)

      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession: session,
          currentBuild: build,
          currentInspect: current.currentInspect,
          sessions: current.sessions.map((item) =>
            item.id === session.summary.id ? session.summary : item,
          ),
          chat,
        }))
        setPreviewHtml(html)
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, building: false }))
    }
  }

  async function inspectCurrentSession(): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      inspecting: true,
      error: undefined,
    }))

    try {
      const inspect = await runInspect(currentSession.summary.id)
      const logs = await safeReadLogs(currentSession.summary.id)
      const html = await safeReadPreviewHtml(currentSession.summary.id)
      const chat = await safeReadChat(currentSession.summary.id)

      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentInspect: inspect,
          currentLogs: logs,
          chat,
        }))
        setPreviewHtml(html)
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, inspecting: false }))
    }
  }

  async function validateCurrentSource(): Promise<void> {
    setCommandState((current) => ({
      ...current,
      error: undefined,
    }))

    try {
      const result = await validateSource(currentSession.summary.id, draftSource)
      setValidation(result)
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    }
  }

  async function checkCurrentRuntime(): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      checking: true,
      error: undefined,
    }))

    try {
      const report = await checkRuntime()
      setRuntimeReport(report)
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, checking: false }))
    }
  }

  async function draftProposal(): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      drafting: true,
      error: undefined,
    }))

    try {
      const chat = await generateSessionProposal(currentSession.summary.id)
      startTransition(() => {
        setAppState((current) => ({
          ...current,
          chat,
        }))
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, drafting: false }))
    }
  }

  async function sendMessage(): Promise<void> {
    const trimmed = messageDraft.trim()
    if (!trimmed || !isTauriRuntime()) {
      return
    }

    setCommandState((current) => ({
      ...current,
      sending: true,
      error: undefined,
    }))

    try {
      const chat = await appendChatMessage(currentSession.summary.id, {
        role: "user",
        text: trimmed,
        kind: "message",
      })
      startTransition(() => {
        setAppState((current) => ({
          ...current,
          chat,
        }))
        setMessageDraft("")
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    } finally {
      setCommandState((current) => ({ ...current, sending: false }))
    }
  }

  return {
    appState,
    previewHtml,
    activeView,
    draftSource,
    messageDraft,
    validation,
    runtimeReport,
    commandState,
    currentSession,
    currentBuild,
    currentInspect,
    currentLogs,
    hasUnsavedChanges,
    filteredMessages,
    setDraftSource,
    setMessageDraft,
    actions: {
      openSessionById,
      createNewSession,
      deleteCurrentOrTargetSession,
      changeView,
      saveCurrentSource,
      buildCurrentSession,
      inspectCurrentSession,
      validateCurrentSource,
      checkCurrentRuntime,
      draftProposal,
      sendMessage,
    },
  }
}
