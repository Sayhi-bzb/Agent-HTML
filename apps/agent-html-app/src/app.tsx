import { startTransition, useEffect, useMemo, useState } from "react"
import {
  BotIcon,
  FileCode2Icon,
  EyeIcon,
  HammerIcon,
  InspectIcon,
  LoaderCircleIcon,
  PlusIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
  TerminalSquareIcon,
  Trash2Icon,
} from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { formatTimestampLabel } from "@/lib/time"
import { mockAppState, mockPreviewHtml } from "./lib/mock-data"
import {
  appendChatMessage,
  checkRuntime,
  createSession,
  deleteSession,
  generateSessionProposal,
  isTauriRuntime,
  listSessions,
  openSession,
  readChat,
  readLogs,
  readPreviewHtml,
  runBuild,
  runInspect,
  saveSource,
  setSessionView,
  validateSource,
} from "./lib/tauri"
import type {
  AgentShellMessage,
  AppState,
  BuildRunSummary,
  InspectSnapshot,
  LogSnapshot,
  RuntimeReport,
  SessionDetail,
  SessionSummary,
  SourceValidationSnapshot,
  WorkbenchView,
} from "./lib/types"

type CommandState = {
  loading: boolean
  saving: boolean
  building: boolean
  inspecting: boolean
  sending: boolean
  drafting: boolean
  checking: boolean
  error?: string
}

type HydratedSessionState = {
  session: SessionDetail
  chat: AgentShellMessage[]
  logs: LogSnapshot
  previewHtml?: string
}

type PanelLayoutState = {
  sessions: number
  workbench: number
  shell: number
}

const panelLayoutStorageKey = "agent-html-app:panel-layout:v4-minimal"
const defaultPanelLayout: PanelLayoutState = {
  sessions: 18,
  workbench: 56,
  shell: 26,
}

const initialCommandState: CommandState = {
  loading: true,
  saving: false,
  building: false,
  inspecting: false,
  sending: false,
  drafting: false,
  checking: false,
}

export function App() {
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
  const [commandState, setCommandState] =
    useState<CommandState>(initialCommandState)
  const [panelLayout, setPanelLayout] = useState<PanelLayoutState>(() =>
    readStoredPanelLayout(),
  )

  const currentSession = appState.currentSession
  const currentBuild = appState.currentBuild
  const currentInspect = appState.currentInspect
  const currentLogs = appState.currentLogs
  const messages = appState.chat
  const hasUnsavedChanges = draftSource !== currentSession.source

  const filteredMessages = useMemo(
    () =>
      messages.filter(
        (message) =>
          message.kind === "proposal-placeholder" ||
          message.kind === "context-card" ||
          message.role !== "system",
      ),
    [messages],
  )

  useEffect(() => {
    void bootstrap()
  }, [])

  useEffect(() => {
    setDraftSource(currentSession.source)
    setValidation(undefined)
    setRuntimeReport(undefined)
  }, [currentSession.summary.id, currentSession.source])

  async function bootstrap() {
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

      startTransition(() => {
        setAppState((current) => ({
          ...current,
          sessions: sessions.length > 0 ? sessions : [nextState.session.summary],
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
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function handleOpenSession(sessionId: string) {
    if (!isTauriRuntime()) {
      const nextSession = appState.sessions.find((session) => session.id === sessionId)
      if (!nextSession) {
        return
      }

      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession:
            current.currentSession.summary.id === sessionId
              ? current.currentSession
              : current.currentSession,
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
      startTransition(() => {
        setAppState((current) => ({
          ...current,
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
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function handleCreateSession() {
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
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function handleDeleteSession(sessionId: string) {
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
        startTransition(() => {
          setAppState((current) => ({
            ...current,
            sessions: [nextState.session.summary],
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
        return
      }

      const fallbackId =
        sessionId === currentSession.summary.id ? sessions[0]?.id : currentSession.summary.id
      const nextState = await loadSessionState(fallbackId)

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
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        loading: false,
        error: formatError(error),
      }))
    }
  }

  async function handleViewChange(view: WorkbenchView) {
    setActiveView(view)

    if (!isTauriRuntime()) {
      return
    }

    try {
      const session = await setSessionView(currentSession.summary.id, { view })
      startTransition(() => {
        setAppState((current) => ({
          ...current,
          currentSession: session,
          sessions: current.sessions.map((item) =>
            item.id === session.summary.id ? session.summary : item,
          ),
        }))
      })
    } catch (error) {
      setCommandState((current) => ({
        ...current,
        error: formatError(error),
      }))
    }
  }

  async function handleSaveSource() {
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
        setAppState((current) => ({
          ...current,
          currentSession: session,
          sessions: current.sessions.map((item) =>
            item.id === session.summary.id ? session.summary : item,
          ),
        }))
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

  async function handleBuild() {
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
        await handleSaveSource()
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

  async function handleInspect() {
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

  async function handleValidate() {
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

  async function handleRuntimeCheck() {
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

  async function handleDraftProposal() {
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

  async function handleSendMessage() {
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

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="flex min-h-screen flex-col">
        <header className="border-b">
          <div className="flex h-14 items-center justify-between px-4">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-8 items-center justify-center rounded-md border bg-muted">
                <FileCode2Icon className="size-4" />
              </div>
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">agent-html</p>
                <p className="truncate text-xs text-muted-foreground">
                  {currentSession.summary.directory}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">{isTauriRuntime() ? "tauri" : "mock"}</Badge>
              <Badge variant="secondary">{activeView}</Badge>
              {commandState.error ? <Badge variant="destructive">error</Badge> : null}
            </div>
          </div>
        </header>

        {commandState.error ? (
          <div className="border-b px-4 py-2 text-xs text-destructive">
            {commandState.error}
          </div>
        ) : null}

        <div className="flex-1 overflow-hidden">
          <ResizablePanelGroup
            className="h-full"
            onLayoutChanged={(layout) => {
              const nextLayout = normalizePanelLayout(layout)
              setPanelLayout(nextLayout)
              persistPanelLayout(nextLayout)
            }}
            orientation="horizontal"
          >
            <ResizablePanel
              defaultSize={panelLayout.sessions}
              id="sessions"
              minSize={16}
            >
              <SessionRail
                activeSessionId={currentSession.summary.id}
                loading={commandState.loading}
                onCreateSession={() => {
                  void handleCreateSession()
                }}
                onDeleteSession={(sessionId) => {
                  void handleDeleteSession(sessionId)
                }}
                onOpenSession={(sessionId) => {
                  void handleOpenSession(sessionId)
                }}
                sessions={appState.sessions}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel
              defaultSize={panelLayout.workbench}
              id="workbench"
              minSize={38}
            >
              <WorkbenchPane
                activeView={activeView}
                build={currentBuild}
                draftSource={draftSource}
                hasUnsavedChanges={hasUnsavedChanges}
                inspect={currentInspect}
                logs={currentLogs}
                onBuild={() => {
                  void handleBuild()
                }}
                onDraftSourceChange={setDraftSource}
                onInspect={() => {
                  void handleInspect()
                }}
                onSaveSource={() => {
                  void handleSaveSource()
                }}
                onValidate={() => {
                  void handleValidate()
                }}
                onViewChange={(view) => {
                  void handleViewChange(view)
                }}
                previewHtml={previewHtml}
                saving={commandState.saving}
                session={currentSession}
                validating={false}
                validation={validation}
              />
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={panelLayout.shell} id="shell" minSize={22}>
              <ShellPane
                checking={commandState.checking}
                drafting={commandState.drafting}
                messages={filteredMessages}
                messageDraft={messageDraft}
                onDraftChange={setMessageDraft}
                onDraftProposal={() => {
                  void handleDraftProposal()
                }}
                onRuntimeCheck={() => {
                  void handleRuntimeCheck()
                }}
                onSend={() => {
                  void handleSendMessage()
                }}
                runtimeReport={runtimeReport}
                sending={commandState.sending}
              />
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>
    </div>
  )
}

type SessionRailProps = {
  sessions: SessionSummary[]
  activeSessionId: string
  loading: boolean
  onCreateSession: () => void
  onDeleteSession: (sessionId: string) => void
  onOpenSession: (sessionId: string) => void
}

function SessionRail({
  sessions,
  activeSessionId,
  loading,
  onCreateSession,
  onDeleteSession,
  onOpenSession,
}: SessionRailProps) {
  const [query, setQuery] = useState("")
  const filtered = sessions.filter((session) => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) {
      return true
    }

    return (
      session.name.toLowerCase().includes(normalized) ||
      session.directory.toLowerCase().includes(normalized)
    )
  })

  return (
    <div className="flex h-full flex-col">
      <div className="border-b p-3">
        <div className="flex items-center gap-2">
          <div className="relative flex-1">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-2.5 size-3.5 -translate-y-1/2 text-muted-foreground" />
            <Input
              className="pl-8"
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search"
              value={query}
            />
          </div>
          <Button onClick={onCreateSession} size="icon-sm" type="button" variant="outline">
            <PlusIcon />
          </Button>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-2 p-3">
          {filtered.map((session) => {
            const active = session.id === activeSessionId
            return (
              <button
                className="text-left"
                key={session.id}
                onClick={() => onOpenSession(session.id)}
                type="button"
              >
                <Card className={active ? "border-primary" : ""} size="sm">
                  <CardHeader>
                    <div className="flex items-start justify-between gap-2">
                      <CardTitle className="truncate">{session.name}</CardTitle>
                      <Badge variant={active ? "default" : "outline"}>
                        {session.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardFooter className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground">
                      {formatTimestampLabel(session.updatedAt)}
                    </span>
                    <Button
                      aria-label="Delete session"
                      onClick={(event) => {
                        event.stopPropagation()
                        onDeleteSession(session.id)
                      }}
                      size="icon-xs"
                      type="button"
                      variant="ghost"
                    >
                      <Trash2Icon />
                    </Button>
                  </CardFooter>
                </Card>
              </button>
            )
          })}
          {filtered.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-6 text-xs text-muted-foreground">
                No sessions
              </CardContent>
            </Card>
          ) : null}
          {loading ? (
            <div className="flex items-center gap-2 px-1 text-xs text-muted-foreground">
              <LoaderCircleIcon className="size-3.5 animate-spin" />
              Loading
            </div>
          ) : null}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <Button size="icon-sm" type="button" variant="ghost">
          <Settings2Icon />
        </Button>
      </div>
    </div>
  )
}

type WorkbenchPaneProps = {
  session: SessionDetail
  activeView: WorkbenchView
  previewHtml?: string
  build: BuildRunSummary
  inspect: InspectSnapshot
  logs: LogSnapshot
  draftSource: string
  hasUnsavedChanges: boolean
  saving: boolean
  validating: boolean
  validation?: SourceValidationSnapshot
  onViewChange: (view: WorkbenchView) => void
  onBuild: () => void
  onInspect: () => void
  onSaveSource: () => void
  onValidate: () => void
  onDraftSourceChange: (source: string) => void
}

function WorkbenchPane({
  session,
  activeView,
  previewHtml,
  build,
  inspect,
  logs,
  draftSource,
  hasUnsavedChanges,
  saving,
  validating,
  validation,
  onViewChange,
  onBuild,
  onInspect,
  onSaveSource,
  onValidate,
  onDraftSourceChange,
}: WorkbenchPaneProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <div className="flex items-center justify-between gap-3">
          <Tabs onValueChange={(value) => onViewChange(value as WorkbenchView)} value={activeView}>
            <TabsList>
              <TabsTrigger value="preview">
                <EyeIcon data-icon="inline-start" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="source">
                <FileCode2Icon data-icon="inline-start" />
                Source
              </TabsTrigger>
              <TabsTrigger value="inspect">
                <InspectIcon data-icon="inline-start" />
                Inspect
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="flex items-center gap-2">
            <Button onClick={onBuild} size="sm" type="button" variant="outline">
              <HammerIcon data-icon="inline-start" />
              Build
            </Button>
            <Button onClick={onInspect} size="sm" type="button" variant="outline">
              <InspectIcon data-icon="inline-start" />
              Inspect
            </Button>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden p-3">
        <Tabs className="h-full" value={activeView}>
          <TabsContent className="h-full" value="preview">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>{session.summary.name}</CardTitle>
                    <CardDescription>{session.previewPath ?? "preview"}</CardDescription>
                  </div>
                  <Badge variant={build.status === "succeeded" ? "default" : "outline"}>
                    {build.status}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="flex h-full min-h-0 flex-col gap-4">
                <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
                  {previewHtml ? (
                    <iframe
                      className="size-full bg-background"
                      srcDoc={previewHtml}
                      title={`${session.summary.name} preview`}
                    />
                  ) : (
                    <div className="flex size-full items-center justify-center text-sm text-muted-foreground">
                      Empty
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="h-full" value="source">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>Source</CardTitle>
                    <CardDescription>{session.sourcePath}</CardDescription>
                  </div>
                  <div className="flex items-center gap-2">
                    {hasUnsavedChanges ? <Badge variant="outline">dirty</Badge> : null}
                    <Button onClick={onValidate} size="sm" type="button" variant="outline">
                      Validate
                    </Button>
                    <Button
                      disabled={!hasUnsavedChanges || saving}
                      onClick={onSaveSource}
                      size="sm"
                      type="button"
                    >
                      Save
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex h-full min-h-0 flex-col gap-4">
                <Textarea
                  className="min-h-0 flex-1 resize-none font-mono"
                  onChange={(event) => onDraftSourceChange(event.target.value)}
                  value={draftSource}
                />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  {validating ? (
                    <>
                      <LoaderCircleIcon className="size-3.5 animate-spin" />
                      Validating
                    </>
                  ) : validation ? (
                    <>
                      <Badge
                        variant={
                          validation.status === "valid" ? "default" : "destructive"
                        }
                      >
                        {validation.status}
                      </Badge>
                      <span>{validation.structureSummary}</span>
                    </>
                  ) : null}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent className="h-full" value="inspect">
            <Card className="h-full">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <CardTitle>Inspect</CardTitle>
                    <CardDescription>{inspect.generatedAt}</CardDescription>
                  </div>
                  <Badge variant="outline">{inspect.diagnostics.length} items</Badge>
                </div>
              </CardHeader>
              <CardContent className="flex h-full min-h-0 flex-col gap-4">
                <div className="grid gap-2">
                  {inspect.diagnostics.map((item) => (
                    <div
                      className="rounded-lg border px-3 py-2 text-sm"
                      key={item.id}
                    >
                      <div className="flex items-center justify-between gap-2">
                        <span>{item.message}</span>
                        <Badge
                          variant={
                            item.severity === "error"
                              ? "destructive"
                              : item.severity === "warning"
                                ? "outline"
                                : "secondary"
                          }
                        >
                          {item.severity}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
                <Separator />
                <div className="grid min-h-0 flex-1 gap-2">
                  <p className="text-xs uppercase text-muted-foreground">stdout</p>
                  <pre className="min-h-0 overflow-auto rounded-lg border bg-muted p-3 text-xs">
                    {logs.stdout || "n/a"}
                  </pre>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}

type ShellPaneProps = {
  messages: AgentShellMessage[]
  messageDraft: string
  runtimeReport?: RuntimeReport
  sending: boolean
  drafting: boolean
  checking: boolean
  onDraftChange: (value: string) => void
  onSend: () => void
  onDraftProposal: () => void
  onRuntimeCheck: () => void
}

function ShellPane({
  messages,
  messageDraft,
  runtimeReport,
  sending,
  drafting,
  checking,
  onDraftChange,
  onSend,
  onDraftProposal,
  onRuntimeCheck,
}: ShellPaneProps) {
  return (
    <div className="flex h-full flex-col">
      <div className="border-b px-3 py-2">
        <div className="flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <BotIcon className="size-4" />
            <span className="text-sm font-medium">Shell</span>
          </div>
          <div className="flex items-center gap-2">
            <Button onClick={onDraftProposal} size="sm" type="button" variant="outline">
              <SparklesIcon data-icon="inline-start" />
              Proposal
            </Button>
            <Button onClick={onRuntimeCheck} size="sm" type="button" variant="outline">
              <TerminalSquareIcon data-icon="inline-start" />
              Doctor
            </Button>
          </div>
        </div>
      </div>
      <ScrollArea className="flex-1">
        <div className="grid gap-3 p-3">
          {runtimeReport ? (
            <Card size="sm">
              <CardHeader>
                <CardTitle>Doctor</CardTitle>
                <CardDescription>{runtimeReport.status}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-2 text-sm">
                <div className="flex items-center justify-between">
                  <span>ok</span>
                  <span>{runtimeReport.counts.ok}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>warn</span>
                  <span>{runtimeReport.counts.warn}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>fail</span>
                  <span>{runtimeReport.counts.fail}</span>
                </div>
              </CardContent>
            </Card>
          ) : null}

          {messages.map((message) => (
            <Card key={message.id} size="sm">
              <CardHeader>
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-sm">{message.kind}</CardTitle>
                  <Badge variant="outline">{message.role}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm leading-6">{message.text}</p>
              </CardContent>
            </Card>
          ))}

          {messages.length === 0 ? (
            <Card size="sm">
              <CardContent className="py-6 text-sm text-muted-foreground">
                Empty
              </CardContent>
            </Card>
          ) : null}
        </div>
      </ScrollArea>
      <div className="border-t p-3">
        <div className="grid gap-2">
          <Textarea
            onChange={(event) => onDraftChange(event.target.value)}
            placeholder="..."
            value={messageDraft}
          />
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs text-muted-foreground">
              {sending ? "Sending" : drafting ? "Drafting" : checking ? "Checking" : ""}
            </div>
            <Button disabled={!messageDraft.trim() || sending} onClick={onSend} type="button">
              Send
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

async function loadSessionState(sessionId: string): Promise<HydratedSessionState> {
  return hydrateSessionState(await openSession(sessionId))
}

async function hydrateSessionState(
  session: SessionDetail,
): Promise<HydratedSessionState> {
  const [chat, previewHtml, logs] = await Promise.all([
    safeReadChat(session.summary.id),
    safeReadPreviewHtml(session.summary.id),
    safeReadLogs(session.summary.id),
  ])

  return {
    session,
    chat,
    logs,
    previewHtml,
  }
}

async function safeReadPreviewHtml(sessionId: string) {
  try {
    return await readPreviewHtml(sessionId)
  } catch {
    return undefined
  }
}

async function safeReadLogs(sessionId: string) {
  try {
    return await readLogs(sessionId)
  } catch {
    return {}
  }
}

async function safeReadChat(sessionId: string) {
  try {
    return await readChat(sessionId)
  } catch {
    return mockAppState.chat
  }
}

function deriveBuildSummary(session: SessionDetail): BuildRunSummary {
  return (
    session.lastBuild ?? {
      runId: "idle",
      sessionId: session.summary.id,
      startedAt: session.summary.updatedAt,
      status: "idle",
    }
  )
}

function deriveInspectSnapshot(session: SessionDetail): InspectSnapshot {
  return {
    sessionId: session.summary.id,
    generatedAt: session.summary.updatedAt,
    diagnostics: [],
    structureSummary: "No inspect data",
    lastBuild: session.lastBuild,
  }
}

function readStoredPanelLayout(): PanelLayoutState {
  if (typeof window === "undefined") {
    return defaultPanelLayout
  }

  try {
    const raw = window.localStorage.getItem(panelLayoutStorageKey)
    if (!raw) {
      return defaultPanelLayout
    }

    const parsed = JSON.parse(raw) as Partial<PanelLayoutState>
    if (
      typeof parsed.sessions !== "number" ||
      typeof parsed.workbench !== "number" ||
      typeof parsed.shell !== "number"
    ) {
      return defaultPanelLayout
    }

    return normalizePanelLayout([parsed.sessions, parsed.workbench, parsed.shell])
  } catch {
    return defaultPanelLayout
  }
}

function normalizePanelLayout(
  layout: number[] | Record<string, number>,
): PanelLayoutState {
  if (Array.isArray(layout)) {
    const [
      sessions = defaultPanelLayout.sessions,
      workbench = defaultPanelLayout.workbench,
      shell = defaultPanelLayout.shell,
    ] = layout

    return {
      sessions,
      workbench,
      shell,
    }
  }

  return {
    sessions: layout.sessions ?? defaultPanelLayout.sessions,
    workbench: layout.workbench ?? defaultPanelLayout.workbench,
    shell: layout.shell ?? defaultPanelLayout.shell,
  }
}

function persistPanelLayout(layout: PanelLayoutState) {
  if (typeof window === "undefined") {
    return
  }

  window.localStorage.setItem(panelLayoutStorageKey, JSON.stringify(layout))
}

function formatError(error: unknown) {
  if (error instanceof Error) {
    return error.message
  }

  if (typeof error === "string") {
    return error
  }

  return "Unknown error"
}
