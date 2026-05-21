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
import { initialCommandState, type CommandState } from "./types"

function filterMessages(messages: AppState["chat"]) {
  return messages.filter((message) => {
    return (
      message.kind === "proposal-placeholder" ||
      message.kind === "context-card" ||
      message.role !== "system"
    )
  })
}

function getDefaultMockView(
  summary: AppState["sessions"][number],
  currentSessionId: string,
  currentView: WorkbenchView,
): WorkbenchView {
  if (summary.id === currentSessionId) {
    return currentView
  }

  return summary.hasPreview ? "preview" : "source"
}

export function useWorkbenchApp() {
  const [appState, setAppState] = useState<AppState>(mockAppState)
  const [mockSessionSources, setMockSessionSources] = useState(() =>
    createInitialMockSessionSources(mockAppState.sessions),
  )
  const [mockSessionViews, setMockSessionViews] = useState<Record<string, WorkbenchView>>(() =>
    Object.fromEntries(
      mockAppState.sessions.map((summary) => [
        summary.id,
        getDefaultMockView(
          summary,
          mockAppState.currentSession.summary.id,
          mockAppState.currentSession.currentView,
        ),
      ]),
    ),
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

  function startCommand(flag: keyof CommandState): void {
    setCommandState((current) => ({
      ...current,
      [flag]: true,
      error: undefined,
    }))
  }

  function finishCommand(flag: keyof CommandState): void {
    setCommandState((current) => ({
      ...current,
      [flag]: false,
    }))
  }

  function setCommandError(error: unknown): void {
    setCommandState((current) => ({
      ...current,
      error: formatError(error),
    }))
  }

  function clearCommandError(): void {
    setCommandState((current) => ({
      ...current,
      error: undefined,
    }))
  }

  async function runCommand<T>(
    flag: keyof CommandState,
    task: () => Promise<T>,
  ): Promise<T> {
    startCommand(flag)

    try {
      return await task()
    } catch (error) {
      setCommandError(error)
      throw error
    } finally {
      finishCommand(flag)
    }
  }

  async function bootstrap(): Promise<void> {
    if (!isTauriRuntime()) {
      finishCommand("loading")
      return
    }

    try {
      await runCommand("loading", async () => {
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
      })
    } catch (error) {
      void error
    }
  }

  async function recoverSessionState(sessionId: string): Promise<void> {
    if (!isTauriRuntime()) {
      return
    }

    try {
      const [sessions, nextState] = await Promise.all([
        listSessions(),
        loadSessionState(sessionId),
      ])
      applyHydratedSessionState(nextState, sessions)
    } catch {
      // Best-effort recovery after an optimistic session-state transition fails.
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
    })
  }

  function replaceSessionSummary(
    summary: AppState["sessions"][number],
    sessions: AppState["sessions"],
  ): AppState["sessions"] {
    return sessions.map((item) => (item.id === summary.id ? summary : item))
  }

  function patchCurrentSessionSummary(
    mutate: (summary: AppState["sessions"][number]) => AppState["sessions"][number],
  ): void {
    setAppState((current) => {
      const nextSummary = mutate(current.currentSession.summary)
      return {
        ...current,
        currentSession: {
          ...current.currentSession,
          summary: nextSummary,
        },
        sessions: replaceSessionSummary(nextSummary, current.sessions),
      }
    })
  }

  function getMockView(summary: AppState["sessions"][number]): WorkbenchView {
    return (
      mockSessionViews[summary.id] ??
      getDefaultMockView(
        summary,
        mockAppState.currentSession.summary.id,
        mockAppState.currentSession.currentView,
      )
    )
  }

  function updateSessionSummary(session: AppState["currentSession"]): void {
    setAppState((current) => ({
      ...current,
      currentSession: session,
      sessions: replaceSessionSummary(session.summary, current.sessions),
    }))
    setActiveView(session.currentView)
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

      try {
        await runCommand("loading", async () => {
          await yieldToNextTask()
          const nextSource =
            mockSessionSources[sessionId] ??
            createInitialMockSessionSources([nextSummary])[sessionId]
          const nextChat =
            mockSessionChats[sessionId] ?? createMockBaseChat(nextSummary, nextSource)
          const nextView = getMockView(nextSummary)

          applyMockSessionState(
            nextSummary,
            nextSource,
            nextChat,
            appState.sessions,
            nextView,
          )
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("loading", async () => {
        const nextState = await loadSessionState(sessionId)
        applyHydratedSessionState(nextState, appState.sessions)
      })
    } catch (error) {
      void error
    }
  }

  async function createNewSession(): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("loading", async () => {
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
          setMockSessionViews((current) => ({
            ...current,
            [nextSummary.id]: "source",
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
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("loading", async () => {
        const created = await createSession({
          name: `Session ${appState.sessions.length + 1}`,
        })
        const nextState = await hydrateSessionState(created)
        const sessions = await listSessions()
        applyHydratedSessionState(nextState, sessions)
      })
    } catch (error) {
      void error
    }
  }

  async function deleteCurrentOrTargetSession(sessionId: string): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("loading", async () => {
          await yieldToNextTask()
          const remainingSessions = appState.sessions.filter((session) => session.id !== sessionId)

          if (remainingSessions.length === 0) {
            const nextSummary = createMockSessionSummary("First Session", 1)
            const nextSource =
              createInitialMockSessionSources([nextSummary])[nextSummary.id]
            const nextChat = createMockBaseChat(nextSummary, nextSource)

            setMockSessionSources({ [nextSummary.id]: nextSource })
            setMockSessionViews({ [nextSummary.id]: "source" })
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
          const nextView = getMockView(fallbackSummary)

          setMockSessionSources((current) => {
            const next = { ...current }
            delete next[sessionId]
            return next
          })
          setMockSessionViews((current) => {
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
            nextView,
          )
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("loading", async () => {
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
      })
    } catch (error) {
      void error
    }
  }

  async function changeView(view: WorkbenchView): Promise<void> {
    const previousView = activeView
    clearCommandError()
    setActiveView(view)

    if (!isTauriRuntime()) {
      startTransition(() => {
        setMockSessionViews((current) => ({
          ...current,
          [currentSession.summary.id]: view,
        }))
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
      setActiveView(previousView)
      setCommandError(error)
    }
  }

  async function persistCurrentSource(): Promise<void> {
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

      await runCommand("saving", async () => {
        await yieldToNextTask()
        setMockSessionSources((current) => ({
          ...current,
          [nextSummary.id]: draftSource,
        }))
        setMockSessionViews((current) => ({
          ...current,
          [nextSummary.id]: "source",
        }))
        applyMockSessionState(
          nextSummary,
          draftSource,
          nextChat,
          nextSessions,
          "source",
        )
      })
      return
    }

    await runCommand("saving", async () => {
      const session = await saveSource(currentSession.summary.id, draftSource)
      startTransition(() => updateSessionSummary(session))
    })
  }

  async function saveCurrentSource(): Promise<void> {
    try {
      await persistCurrentSource()
    } catch (error) {
      void error
    }
  }

  async function buildCurrentSession(): Promise<void> {
    const sessionId = currentSession.summary.id

    if (!isTauriRuntime()) {
      try {
        await runCommand("building", async () => {
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
          setMockSessionViews((current) => ({
            ...current,
            [nextSummary.id]: "preview",
          }))
          applyMockSessionState(
            nextSummary,
            nextSource,
            nextChat,
            nextSessions,
            "preview",
          )
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("building", async () => {
        if (hasUnsavedChanges) {
          await persistCurrentSource()
        }

        patchCurrentSessionSummary((summary) => ({
          ...summary,
          status: "building",
          updatedAt: new Date().toISOString(),
        }))

        const build = await runBuild(sessionId)
        const html = await safeReadPreviewHtml(sessionId)
        const session = await openSession(sessionId)
        const chat = await safeReadChat(sessionId)

        startTransition(() => {
          setAppState((current) => ({
            ...current,
            currentSession: session,
            currentBuild: build,
            currentInspect: current.currentInspect,
            sessions: replaceSessionSummary(session.summary, current.sessions),
            chat,
          }))
          setPreviewHtml(html)
          setActiveView(session.currentView)
        })
      })
    } catch (error) {
      await recoverSessionState(sessionId)
      void error
    }
  }

  async function inspectCurrentSession(): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("inspecting", async () => {
          await yieldToNextTask()
          const nextSource = currentSession.source
          const nextValidation = createMockValidationSnapshot(
            currentSession.summary,
            nextSource,
          )
          const nextSummary = {
            ...currentSession.summary,
            updatedAt: new Date().toISOString(),
            status:
              nextValidation.status === "invalid" ? ("error" as const) : currentSession.summary.status,
          }
          const nextSessions = replaceSessionSummary(nextSummary, appState.sessions)
          const nextSession = createMockSessionDetail(nextSummary, nextSource, "inspect")
          const nextInspect = createMockInspectSnapshot(
            nextSummary,
            nextSession,
            nextSource,
          )
          const nextLogs = createMockLogs(nextSummary, nextSource)

          startTransition(() => {
            setMockSessionViews((current) => ({
              ...current,
              [nextSummary.id]: "inspect",
            }))
            setAppState({
              sessions: nextSessions,
              currentSession: nextSession,
              currentBuild: createMockBuildSummary(nextSummary, nextSession),
              currentInspect: nextInspect,
              currentLogs: nextLogs,
              chat: appState.chat,
            })
            setPreviewHtml(createMockPreviewHtml(nextSummary, nextSource))
            setActiveView("inspect")
          })
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("inspecting", async () => {
        const inspect = await runInspect(currentSession.summary.id)
        const session = await openSession(currentSession.summary.id)
        const logs = await safeReadLogs(currentSession.summary.id)
        const html = await safeReadPreviewHtml(currentSession.summary.id)
        const chat = await safeReadChat(currentSession.summary.id)

        startTransition(() => {
          setAppState((current) => ({
            ...current,
            currentSession: session,
            currentInspect: inspect,
            currentLogs: logs,
            sessions: replaceSessionSummary(session.summary, current.sessions),
            chat,
          }))
          setPreviewHtml(html)
          setActiveView(session.currentView)
        })
      })
    } catch (error) {
      void error
    }
  }

  async function validateCurrentSource(): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("validating", () => {
          setValidation(createMockValidationSnapshot(currentSession.summary, draftSource))
          return Promise.resolve()
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("validating", async () => {
        const result = await validateSource(currentSession.summary.id, draftSource)
        setValidation(result)
      })
    } catch (error) {
      void error
    }
  }

  async function checkCurrentRuntime(): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("checking", async () => {
          await yieldToNextTask()
          setRuntimeReport(createMockRuntimeReport())
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("checking", async () => {
        const report = await checkRuntime()
        setRuntimeReport(report)
      })
    } catch (error) {
      void error
    }
  }

  async function draftProposal(): Promise<void> {
    if (!isTauriRuntime()) {
      try {
        await runCommand("drafting", async () => {
          await yieldToNextTask()
          const nextSummary = {
            ...currentSession.summary,
            updatedAt: new Date().toISOString(),
          }
          const nextSessions = replaceSessionSummary(nextSummary, appState.sessions)
          const nextView = getMockView(nextSummary)
          const nextSession = createMockSessionDetail(
            nextSummary,
            currentSession.source,
            nextView,
          )
          const nextChat = [
            ...(mockSessionChats[currentSession.summary.id] ??
              createMockBaseChat(currentSession.summary, currentSession.source)).filter(
              (message) => message.kind !== "proposal-placeholder",
            ),
            createMockProposalMessage(currentSession.summary, currentSession.source),
          ]

          setMockSessionChats((current) => ({
            ...current,
            [currentSession.summary.id]: nextChat,
          }))
          startTransition(() => {
            setAppState((current) => ({
              ...current,
              sessions: nextSessions,
              currentSession: nextSession,
              chat: nextChat,
            }))
          })
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("drafting", async () => {
        const chat = await generateSessionProposal(currentSession.summary.id)
        const session = await openSession(currentSession.summary.id)
        startTransition(() => {
          updateSessionSummary(session)
          setAppState((current) => ({
            ...current,
            chat,
          }))
        })
      })
    } catch (error) {
      void error
    }
  }

  async function sendMessage(): Promise<void> {
    const trimmed = messageDraft.trim()
    if (!trimmed) {
      return
    }

    if (!isTauriRuntime()) {
      try {
        await runCommand("sending", async () => {
          await yieldToNextTask()
          const nextSummary = {
            ...currentSession.summary,
            updatedAt: new Date().toISOString(),
          }
          const nextSessions = replaceSessionSummary(nextSummary, appState.sessions)
          const nextView = getMockView(nextSummary)
          const nextSession = createMockSessionDetail(
            nextSummary,
            currentSession.source,
            nextView,
          )
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
              sessions: nextSessions,
              currentSession: nextSession,
              chat: nextChat,
            }))
            setMessageDraft("")
          })
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("sending", async () => {
        const chat = await appendChatMessage(currentSession.summary.id, {
          role: "user",
          text: trimmed,
          kind: "message",
        })
        const session = await openSession(currentSession.summary.id)
        startTransition(() => {
          updateSessionSummary(session)
          setAppState((current) => ({
            ...current,
            chat,
          }))
          setMessageDraft("")
        })
      })
    } catch (error) {
      void error
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
