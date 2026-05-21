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
  AgentShellMessage,
  AppState,
  RuntimeReport,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

import { formatError } from "./errors"
import {
  createInitialMockSessionChats,
  createInitialMockSessionSources,
  createMockBaseChat,
  createMockBuildSummary,
  createMockInspectSnapshot,
  createMockLogs,
  createMockPreviewHtml,
  createMockProposalMessage,
  createMockRuntimeReport,
  createMockSessionDetail,
  createMockSessionSummary,
  createMockUserMessage,
  createMockValidationSnapshot,
} from "./mock-runtime"
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
  const [mockSessionSources, setMockSessionSources] = useState(() =>
    createInitialMockSessionSources(mockAppState.sessions),
  )
  const [mockSessionChats, setMockSessionChats] = useState(() => {
    const sources = createInitialMockSessionSources(mockAppState.sessions)
    return createInitialMockSessionChats(mockAppState.sessions, sources)
  })
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

  async function yieldToNextTask(): Promise<void> {
    await new Promise((resolve) => {
      setTimeout(resolve, 0)
    })
  }

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

  function applyMockSessionState(
    summary: AppState["sessions"][number],
    source: string,
    chat: AgentShellMessage[],
    sessions: AppState["sessions"],
    view: WorkbenchView,
  ): void {
    const session = createMockSessionDetail(summary, source, view)
    const build = createMockBuildSummary(summary, session)
    const inspect = createMockInspectSnapshot(summary, session, source)
    const logs = createMockLogs(summary, source)

    startTransition(() => {
      setAppState({
        sessions,
        currentSession: session,
        currentBuild: build,
        currentInspect: inspect,
        currentLogs: logs,
        chat,
      })
      setPreviewHtml(createMockPreviewHtml(summary, source))
      setActiveView(view)
      setDraftSource(source)
      setValidation(undefined)
    })
  }

  async function openSessionById(sessionId: string): Promise<void> {
    if (!isTauriRuntime()) {
      const nextSummary = appState.sessions.find((session) => session.id === sessionId)
      if (!nextSummary) {
        return
      }

      setCommandState((current) => ({
        ...current,
        loading: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const nextSource =
          mockSessionSources[sessionId] ??
          createInitialMockSessionSources([nextSummary])[sessionId]
        const nextChat =
          mockSessionChats[sessionId] ?? createMockBaseChat(nextSummary, nextSource)

        applyMockSessionState(
          nextSummary,
          nextSource,
          nextChat,
          appState.sessions,
          activeView,
        )
      } finally {
        setCommandState((current) => ({ ...current, loading: false }))
      }
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
      setCommandState((current) => ({
        ...current,
        loading: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const nextSummary = createMockSessionSummary(
          `Session ${appState.sessions.length + 1}`,
          appState.sessions.length + 1,
        )
        const nextSource =
          createInitialMockSessionSources([nextSummary])[nextSummary.id]
        const nextChat = createMockBaseChat(nextSummary, nextSource)
        const nextSessions = [nextSummary, ...appState.sessions]

        setMockSessionSources((current) => ({
          ...current,
          [nextSummary.id]: nextSource,
        }))
        setMockSessionChats((current) => ({
          ...current,
          [nextSummary.id]: nextChat,
        }))
        applyMockSessionState(
          nextSummary,
          nextSource,
          nextChat,
          nextSessions,
          "source",
        )
      } finally {
        setCommandState((current) => ({ ...current, loading: false }))
      }
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
      setCommandState((current) => ({
        ...current,
        loading: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const remainingSessions = appState.sessions.filter((session) => session.id !== sessionId)

        if (remainingSessions.length === 0) {
          const nextSummary = createMockSessionSummary("First Session", 1)
          const nextSource =
            createInitialMockSessionSources([nextSummary])[nextSummary.id]
          const nextChat = createMockBaseChat(nextSummary, nextSource)

          setMockSessionSources({ [nextSummary.id]: nextSource })
          setMockSessionChats({ [nextSummary.id]: nextChat })
          applyMockSessionState(
            nextSummary,
            nextSource,
            nextChat,
            [nextSummary],
            "source",
          )
          return
        }

        const fallbackSummary =
          sessionId === currentSession.summary.id
            ? remainingSessions[0]
            : remainingSessions.find((session) => session.id === currentSession.summary.id) ??
              remainingSessions[0]
        const nextSource =
          mockSessionSources[fallbackSummary.id] ??
          createInitialMockSessionSources([fallbackSummary])[fallbackSummary.id]
        const nextChat =
          mockSessionChats[fallbackSummary.id] ??
          createMockBaseChat(fallbackSummary, nextSource)

        setMockSessionSources((current) => {
          const next = { ...current }
          delete next[sessionId]
          return next
        })
        setMockSessionChats((current) => {
          const next = { ...current }
          delete next[sessionId]
          return next
        })
        applyMockSessionState(
          fallbackSummary,
          nextSource,
          nextChat,
          remainingSessions,
          activeView,
        )
      } finally {
        setCommandState((current) => ({ ...current, loading: false }))
      }
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
      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession: {
            ...current.currentSession,
            currentView: view,
          },
        }))
      })
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
      const updatedAt = new Date().toISOString()
      const nextSummary = {
        ...currentSession.summary,
        updatedAt,
        status: "dirty" as const,
      }
      const nextSessions = appState.sessions.map((item) =>
        item.id === nextSummary.id ? nextSummary : item,
      )
      const nextChat =
        mockSessionChats[nextSummary.id] ??
        createMockBaseChat(nextSummary, draftSource)
      const nextSources = {
        ...mockSessionSources,
        [nextSummary.id]: draftSource,
      }

      setMockSessionSources(nextSources)
      startTransition(() => {
        applyMockSessionState(
          nextSummary,
          draftSource,
          nextChat,
          nextSessions,
          activeView,
        )
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
      setCommandState((current) => ({
        ...current,
        building: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const now = new Date().toISOString()
        const nextSource = hasUnsavedChanges ? draftSource : currentSession.source
        const nextSummary = {
          ...currentSession.summary,
          updatedAt: now,
          lastBuildAt: now,
          status: "ready" as const,
          hasPreview: true,
        }
        const nextSessions = appState.sessions.map((item) =>
          item.id === nextSummary.id ? nextSummary : item,
        )
        const nextChat =
          mockSessionChats[nextSummary.id] ??
          createMockBaseChat(nextSummary, nextSource)

        setMockSessionSources((current) => ({
          ...current,
          [nextSummary.id]: nextSource,
        }))
        applyMockSessionState(
          nextSummary,
          nextSource,
          nextChat,
          nextSessions,
          activeView,
        )
      } finally {
        setCommandState((current) => ({ ...current, building: false }))
      }
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
      setCommandState((current) => ({
        ...current,
        inspecting: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const nextSource = hasUnsavedChanges ? draftSource : currentSession.source
        const nextSession = createMockSessionDetail(
          currentSession.summary,
          nextSource,
          activeView,
        )
        const nextInspect = createMockInspectSnapshot(
          currentSession.summary,
          nextSession,
          nextSource,
        )
        const nextLogs = createMockLogs(currentSession.summary, nextSource)

        startTransition(() => {
          setAppState((current) => ({
            ...current,
            currentInspect: nextInspect,
            currentLogs: nextLogs,
            currentSession: nextSession,
          }))
        })
      } finally {
        setCommandState((current) => ({ ...current, inspecting: false }))
      }
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
    if (!isTauriRuntime()) {
      setCommandState((current) => ({
        ...current,
        validating: true,
        error: undefined,
      }))

      try {
        const result = createMockValidationSnapshot(currentSession.summary, draftSource)
        setValidation(result)
      } finally {
        setCommandState((current) => ({ ...current, validating: false }))
      }
      return
    }

    setCommandState((current) => ({
      ...current,
      validating: true,
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
    } finally {
      setCommandState((current) => ({ ...current, validating: false }))
    }
  }

  async function checkCurrentRuntime(): Promise<void> {
    if (!isTauriRuntime()) {
      setCommandState((current) => ({
        ...current,
        checking: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        setRuntimeReport(createMockRuntimeReport())
      } finally {
        setCommandState((current) => ({ ...current, checking: false }))
      }
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
      setCommandState((current) => ({
        ...current,
        drafting: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const nextChat = [
          ...(mockSessionChats[currentSession.summary.id] ??
            createMockBaseChat(currentSession.summary, currentSession.source)).filter(
            (message) => message.kind !== "proposal-placeholder",
          ),
          createMockProposalMessage(currentSession.summary, draftSource),
        ]

        setMockSessionChats((current) => ({
          ...current,
          [currentSession.summary.id]: nextChat,
        }))
        startTransition(() => {
          setAppState((current) => ({
            ...current,
            chat: nextChat,
          }))
        })
      } finally {
        setCommandState((current) => ({ ...current, drafting: false }))
      }
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
    if (!trimmed) {
      return
    }

    if (!isTauriRuntime()) {
      setCommandState((current) => ({
        ...current,
        sending: true,
        error: undefined,
      }))

      try {
        await yieldToNextTask()
        const nextChat = [
          ...(mockSessionChats[currentSession.summary.id] ??
            createMockBaseChat(currentSession.summary, currentSession.source)),
          createMockUserMessage(trimmed),
        ]

        setMockSessionChats((current) => ({
          ...current,
          [currentSession.summary.id]: nextChat,
        }))
        startTransition(() => {
          setAppState((current) => ({
            ...current,
            chat: nextChat,
          }))
          setMessageDraft("")
        })
      } finally {
        setCommandState((current) => ({ ...current, sending: false }))
      }
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
