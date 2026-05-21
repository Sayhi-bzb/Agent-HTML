import { startTransition, useEffect, useMemo, useState } from "react"

import { mockAppState, mockPreviewHtml } from "@/lib/mock-data"
import {
  createSession,
  deleteSession,
  isTauriRuntime,
  listSessions,
  openSession,
  renameSession,
  runBuild,
  runInspect,
  saveSource,
  setSessionView,
  validateSource,
} from "@/lib/tauri"
import type {
  AppState,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

import { formatError } from "./errors"
import {
  createInitialMockSessionSources,
  createMockBuildSummary,
  createMockInspectSnapshot,
  createMockLogs,
  createMockPreviewHtml,
  createMockSessionDetail,
  createMockSessionSummary,
  createMockValidationSnapshot,
} from "./mock-runtime"
import {
  deriveBuildSummary,
  deriveInspectSnapshot,
  hydrateSessionState,
  loadSessionState,
  safeReadLogs,
  safeReadPreviewHtml,
} from "./session-hydration"
import {
  initialCommandState,
  type CommandState,
  type OpenSessionTab,
} from "./types"

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

function sortSessions(
  sessions: AppState["sessions"],
): AppState["sessions"] {
  return [...sessions].sort((left, right) => {
    if (left.id === right.id) {
      return 0
    }

    return right.updatedAt.localeCompare(left.updatedAt) ||
      left.name.localeCompare(right.name)
  })
}

function sessionSummaryFromDetail(
  session: AppState["currentSession"],
): AppState["sessions"][number] {
  return {
    id: session.id,
    name: session.name,
    directory: session.directory,
    status: session.status,
    updatedAt: session.updatedAt,
    lastBuildAt: session.lastBuildAt,
    hasPreview: session.hasPreview,
  }
}

function ensureOpenSessionTab(
  tabs: OpenSessionTab[],
  sessionId: string,
): OpenSessionTab[] {
  if (tabs.some((tab) => tab.sessionId === sessionId)) {
    return tabs
  }

  return [...tabs, { sessionId }]
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
          mockAppState.currentSession.id,
          mockAppState.currentSession.currentView,
        ),
      ]),
    ),
  )
  const [previewHtml, setPreviewHtml] = useState<string | undefined>(
    isTauriRuntime() ? undefined : mockPreviewHtml,
  )
  const [activeView, setActiveView] = useState<WorkbenchView>(
    mockAppState.currentSession.currentView,
  )
  const [draftSource, setDraftSource] = useState(mockAppState.currentSession.source)
  const [validation, setValidation] = useState<SourceValidationSnapshot>()
  const [commandState, setCommandState] = useState(initialCommandState)
  const [openSessionTabs, setOpenSessionTabs] = useState<OpenSessionTab[]>([
    { sessionId: mockAppState.currentSession.id },
  ])

  const currentSession = appState.currentSession
  const currentBuild = appState.currentBuild
  const currentInspect = appState.currentInspect
  const currentLogs = appState.currentLogs
  const hasUnsavedChanges = draftSource !== currentSession.source

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    setDraftSource(currentSession.source)
    setValidation(undefined)
  }, [currentSession.id, currentSession.source])

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
          session = sessionSummaryFromDetail(await createSession("First Session"))
        }

        const nextState = await loadSessionState(session.id)
        applyHydratedSessionState(
          nextState,
          sessions.length > 0 ? sessions : [nextState.session],
        )
        setOpenSessionTabs([{ sessionId: nextState.session.id }])
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
      }))
      setPreviewHtml(nextState.previewHtml)
      setActiveView(nextState.session.currentView)
      setDraftSource(nextState.session.source)
      setOpenSessionTabs((current) =>
        ensureOpenSessionTab(current, nextState.session.id),
      )
    })
  }

  function replaceSessionSummary(
    summary: AppState["sessions"][number],
    sessions: AppState["sessions"],
  ): AppState["sessions"] {
    return sortSessions(
      sessions.map((item) => (item.id === summary.id ? summary : item)),
    )
  }

  function patchCurrentSessionSummary(
    mutate: (summary: AppState["sessions"][number]) => AppState["sessions"][number],
  ): void {
    setAppState((current) => {
      const nextSummary = mutate(sessionSummaryFromDetail(current.currentSession))
      return {
        ...current,
        currentSession: {
          ...current.currentSession,
          ...nextSummary,
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
        mockAppState.currentSession.id,
        mockAppState.currentSession.currentView,
      )
    )
  }

  function updateSessionSummary(session: AppState["currentSession"]): void {
    const nextSummary = sessionSummaryFromDetail(session)
    setAppState((current) => ({
      ...current,
      currentSession: session,
      sessions: replaceSessionSummary(nextSummary, current.sessions),
    }))
    setActiveView(session.currentView)
  }

  function applyMockSessionState(
    summary: AppState["sessions"][number],
    source: string,
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
          const nextView = getMockView(nextSummary)

          applyMockSessionState(
            nextSummary,
            nextSource,
            appState.sessions,
            nextView,
          )
          setOpenSessionTabs((current) =>
            ensureOpenSessionTab(current, nextSummary.id),
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
          const nextSessions = sortSessions([nextSummary, ...appState.sessions])

          setMockSessionSources((current) => ({
            ...current,
            [nextSummary.id]: nextSource,
          }))
          setMockSessionViews((current) => ({
            ...current,
            [nextSummary.id]: "source",
          }))
          applyMockSessionState(
            nextSummary,
            nextSource,
            nextSessions,
            "source",
          )
          setOpenSessionTabs((current) =>
            ensureOpenSessionTab(current, nextSummary.id),
          )
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("loading", async () => {
        const created = await createSession(`Session ${appState.sessions.length + 1}`)
        const nextState = await hydrateSessionState(created)
        const sessions = await listSessions()
        applyHydratedSessionState(nextState, sessions)
        setOpenSessionTabs((current) => ensureOpenSessionTab(current, created.id))
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

            setMockSessionSources({ [nextSummary.id]: nextSource })
            setMockSessionViews({ [nextSummary.id]: "source" })
            applyMockSessionState(
              nextSummary,
              nextSource,
              sortSessions([nextSummary]),
              "source",
            )
            setOpenSessionTabs([{ sessionId: nextSummary.id }])
            return
          }

          const fallbackSummary =
            sessionId === currentSession.id
              ? remainingSessions[0]
              : remainingSessions.find((session) => session.id === currentSession.id) ??
                remainingSessions[0]
          const nextSource =
            mockSessionSources[fallbackSummary.id] ??
            createInitialMockSessionSources([fallbackSummary])[fallbackSummary.id]
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
          applyMockSessionState(
            fallbackSummary,
            nextSource,
            sortSessions(remainingSessions),
            nextView,
          )
          setOpenSessionTabs((current) => {
            const nextTabs = current.filter((tab) => tab.sessionId !== sessionId)
            return ensureOpenSessionTab(nextTabs, fallbackSummary.id)
          })
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
          const created = await createSession("First Session")
          const nextState = await hydrateSessionState(created)
          applyHydratedSessionState(nextState, [nextState.session])
          return
        }

        const fallbackId =
          sessionId === currentSession.id
            ? sessions[0].id
            : currentSession.id
        const nextState = await loadSessionState(fallbackId)
        applyHydratedSessionState(nextState, sessions)
        setOpenSessionTabs((current) => {
          const nextTabs = current.filter((tab) => tab.sessionId !== sessionId)
          return ensureOpenSessionTab(nextTabs, nextState.session.id)
        })
      })
    } catch (error) {
      void error
    }
  }

  async function renameSessionById(sessionId: string, name: string): Promise<void> {
    const trimmed = name.trim()
    if (!trimmed) {
      return
    }

    if (!isTauriRuntime()) {
      try {
        await runCommand("loading", async () => {
          await yieldToNextTask()
          const target = appState.sessions.find((session) => session.id === sessionId)
          if (!target || target.name === trimmed) {
            return
          }

          const nextSummary = {
            ...target,
            name: trimmed,
            updatedAt: new Date().toISOString(),
          }
          const nextSessions = replaceSessionSummary(nextSummary, appState.sessions)
          const nextSource =
            mockSessionSources[sessionId] ??
            createInitialMockSessionSources([nextSummary])[sessionId]
          const nextView = getMockView(nextSummary)

          if (sessionId === currentSession.id) {
            applyMockSessionState(
              nextSummary,
              nextSource,
              nextSessions,
              nextView,
            )
            return
          }

          startTransition(() => {
            setAppState((current) => ({
              ...current,
              sessions: nextSessions,
            }))
          })
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("loading", async () => {
        const session = await renameSession(sessionId, trimmed)
        const sessions = await listSessions()

        if (sessionId === currentSession.id) {
          const nextState = await hydrateSessionState(session)
          applyHydratedSessionState(nextState, sessions)
          return
        }

        startTransition(() => {
          setAppState((current) => ({
            ...current,
            sessions,
          }))
        })
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
          [currentSession.id]: view,
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
      const session = await setSessionView(currentSession.id, view)
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
        ...currentSession,
        updatedAt,
        status: "dirty" as const,
      }
      const nextSessions = appState.sessions.map((item) =>
        item.id === nextSummary.id ? nextSummary : item,
      )

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
          nextSessions,
          "source",
        )
      })
      return
    }

    await runCommand("saving", async () => {
      const session = await saveSource(currentSession.id, draftSource)
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
    const sessionId = currentSession.id

    if (!isTauriRuntime()) {
      try {
        await runCommand("building", async () => {
          await yieldToNextTask()
          const now = new Date().toISOString()
          const nextSource = hasUnsavedChanges ? draftSource : currentSession.source
          const nextSummary = {
            ...currentSession,
            updatedAt: now,
            lastBuildAt: now,
            status: "ready" as const,
            hasPreview: true,
          }
          const nextSessions = appState.sessions.map((item) =>
            item.id === nextSummary.id ? nextSummary : item,
          )

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

        startTransition(() => {
          const nextSummary = sessionSummaryFromDetail(session)
          setAppState((current) => ({
            ...current,
            currentSession: session,
            currentBuild: build,
            currentInspect: current.currentInspect,
            sessions: replaceSessionSummary(nextSummary, current.sessions),
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
            currentSession,
            nextSource,
          )
          const nextSummary = {
            ...currentSession,
            updatedAt: new Date().toISOString(),
            status:
              nextValidation.status === "invalid" ? ("error" as const) : currentSession.status,
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
        const inspect = await runInspect(currentSession.id)
        const session = await openSession(currentSession.id)
        const logs = await safeReadLogs(currentSession.id)
        const html = await safeReadPreviewHtml(currentSession.id)

        startTransition(() => {
          const nextSummary = sessionSummaryFromDetail(session)
          setAppState((current) => ({
            ...current,
            currentSession: session,
            currentInspect: inspect,
            currentLogs: logs,
            sessions: replaceSessionSummary(nextSummary, current.sessions),
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
          setValidation(createMockValidationSnapshot(currentSession, draftSource))
          return Promise.resolve()
        })
      } catch (error) {
        void error
      }
      return
    }

    try {
      await runCommand("validating", async () => {
        const result = await validateSource(currentSession.id, draftSource)
        setValidation(result)
      })
    } catch (error) {
      void error
    }
  }

  async function closeSessionTab(sessionId: string): Promise<void> {
    if (openSessionTabs.length <= 1) {
      return
    }

    const nextTabs = openSessionTabs.filter((tab) => tab.sessionId !== sessionId)
    setOpenSessionTabs(nextTabs)

    if (sessionId !== currentSession.id) {
      return
    }

    const fallbackTab = nextTabs[nextTabs.length - 1]
    if (!fallbackTab) {
      return
    }

    try {
      await openSessionById(fallbackTab.sessionId)
    } catch (error) {
      void error
    }
  }

  const visibleSessionTabs = useMemo(
    () =>
      openSessionTabs
        .map((tab) => appState.sessions.find((session) => session.id === tab.sessionId))
        .filter((session): session is AppState["sessions"][number] => Boolean(session)),
    [appState.sessions, openSessionTabs],
  )

  return {
    appState,
    previewHtml,
    activeView,
    draftSource,
    validation,
    commandState,
    currentSession,
    currentBuild,
    currentInspect,
    currentLogs,
    hasUnsavedChanges,
    openSessionTabs: visibleSessionTabs,
    setDraftSource,
    actions: {
      openSessionById,
      closeSessionTab,
      createNewSession,
      deleteCurrentOrTargetSession,
      renameSessionById,
      changeView,
      saveCurrentSource,
      buildCurrentSession,
      inspectCurrentSession,
      validateCurrentSource,
    },
  }
}
