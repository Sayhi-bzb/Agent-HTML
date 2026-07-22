export const workspaceTabSessionVersion = 1
export const maximumWorkspaceTabCount = 100

export type ArtifactWorkspaceTab = {
  filePath: string
  id: string
  kind: "artifact"
}

export type CanvasWorkspaceTab = {
  filePath: string
  id: string
  kind: "canvas"
}

export type AppearanceWorkspaceTab = {
  id: "appearance"
  kind: "appearance"
}

export type ThreadManagerWorkspaceTab = {
  id: "threads"
  kind: "thread-manager"
}

export type ThreadWorkspaceTab = {
  id: string
  kind: "thread"
  threadId: string
}

export type WorkspaceTab =
  | AppearanceWorkspaceTab
  | ArtifactWorkspaceTab
  | CanvasWorkspaceTab
  | ThreadManagerWorkspaceTab
  | ThreadWorkspaceTab

export type WorkspaceTabTarget =
  | { kind: "appearance" }
  | { filePath: string; kind: "artifact" }
  | { filePath: string; kind: "canvas" }
  | { kind: "thread-manager" }
  | { kind: "thread"; threadId: string }

export type WorkspaceTabSession = {
  activeTabId: string | null
  tabs: WorkspaceTab[]
  version: typeof workspaceTabSessionVersion
}

export type WorkspaceTabAction =
  | { tab: WorkspaceTabTarget; type: "open" }
  | { tabId: string; type: "activate" }
  | { tabId: string; type: "close" }
  | { session: WorkspaceTabSession; type: "hydrate" }
  | {
      artifactFilePaths?: ReadonlySet<string>
      canvasFilePaths?: ReadonlySet<string>
      threadIds?: ReadonlySet<string>
      type: "reconcile"
    }

const maximumIdentityLength = 4_096

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value)
}

function readIdentity(value: unknown) {
  return typeof value === "string" &&
    value.length > 0 &&
    value.length <= maximumIdentityLength &&
    value === value.trim()
    ? value
    : null
}

export function createWorkspaceTab(target: WorkspaceTabTarget): WorkspaceTab {
  if (target.kind === "appearance") {
    return { id: "appearance", kind: "appearance" }
  }
  if (target.kind === "artifact") {
    return {
      filePath: target.filePath,
      id: `artifact:${target.filePath}`,
      kind: target.kind,
    }
  }
  if (target.kind === "canvas") {
    return {
      filePath: target.filePath,
      id: `canvas:${target.filePath}`,
      kind: target.kind,
    }
  }
  if (target.kind === "thread") {
    return {
      id: `thread:${target.threadId}`,
      kind: target.kind,
      threadId: target.threadId,
    }
  }
  return { id: "threads", kind: "thread-manager" }
}

export function createEmptyWorkspaceTabSession(): WorkspaceTabSession {
  return {
    activeTabId: null,
    tabs: [],
    version: workspaceTabSessionVersion,
  }
}

function readWorkspaceTab(value: unknown): WorkspaceTab | null {
  if (!isRecord(value)) return null

  if (value.kind === "appearance" && value.id === "appearance") {
    return { id: "appearance", kind: "appearance" }
  }
  if (value.kind === "thread-manager" && value.id === "threads") {
    return { id: "threads", kind: "thread-manager" }
  }
  if (value.kind === "artifact" || value.kind === "canvas") {
    const filePath = readIdentity(value.filePath)
    if (!filePath) return null
    const tab = createWorkspaceTab({ filePath, kind: value.kind })
    return value.id === tab.id ? tab : null
  }
  if (value.kind === "thread") {
    const threadId = readIdentity(value.threadId)
    if (!threadId) return null
    const tab = createWorkspaceTab({ kind: "thread", threadId })
    return value.id === tab.id ? tab : null
  }
  return null
}

export function readWorkspaceTabSession(
  value: unknown
): WorkspaceTabSession | null {
  if (
    !isRecord(value) ||
    value.version !== workspaceTabSessionVersion ||
    !Array.isArray(value.tabs) ||
    value.tabs.length > maximumWorkspaceTabCount
  ) {
    return null
  }

  const tabs: WorkspaceTab[] = []
  const ids = new Set<string>()
  for (const rawTab of value.tabs) {
    const tab = readWorkspaceTab(rawTab)
    if (!tab || ids.has(tab.id)) return null
    tabs.push(tab)
    ids.add(tab.id)
  }

  const activeTabId =
    value.activeTabId === null ? null : readIdentity(value.activeTabId)
  if (
    (value.activeTabId !== null && !activeTabId) ||
    (activeTabId !== null && !ids.has(activeTabId)) ||
    (tabs.length > 0 && activeTabId === null) ||
    (tabs.length === 0 && activeTabId !== null)
  ) {
    return null
  }

  return { activeTabId, tabs, version: workspaceTabSessionVersion }
}

function closeWorkspaceTab(
  session: WorkspaceTabSession,
  tabId: string
): WorkspaceTabSession {
  const index = session.tabs.findIndex((tab) => tab.id === tabId)
  if (index === -1) return session

  const tabs = session.tabs.filter((tab) => tab.id !== tabId)
  if (session.activeTabId !== tabId) return { ...session, tabs }

  const nextActive = tabs[index] ?? tabs[index - 1] ?? null
  return { ...session, activeTabId: nextActive?.id ?? null, tabs }
}

function reconcileWorkspaceTabs(
  session: WorkspaceTabSession,
  action: Extract<WorkspaceTabAction, { type: "reconcile" }>
) {
  const tabs = session.tabs.filter((tab) => {
    if (tab.kind === "artifact" && action.artifactFilePaths) {
      return action.artifactFilePaths.has(tab.filePath)
    }
    if (tab.kind === "canvas" && action.canvasFilePaths) {
      return action.canvasFilePaths.has(tab.filePath)
    }
    if (tab.kind === "thread" && action.threadIds) {
      return action.threadIds.has(tab.threadId)
    }
    return true
  })
  if (tabs.length === session.tabs.length) return session
  if (tabs.some((tab) => tab.id === session.activeTabId)) {
    return { ...session, tabs }
  }
  return { ...session, activeTabId: tabs.at(-1)?.id ?? null, tabs }
}

export function workspaceTabReducer(
  session: WorkspaceTabSession,
  action: WorkspaceTabAction
): WorkspaceTabSession {
  if (action.type === "hydrate") return action.session
  if (action.type === "reconcile") {
    return reconcileWorkspaceTabs(session, action)
  }
  if (action.type === "activate") {
    return session.tabs.some((tab) => tab.id === action.tabId)
      ? { ...session, activeTabId: action.tabId }
      : session
  }
  if (action.type === "close") {
    return closeWorkspaceTab(session, action.tabId)
  }

  const tab = createWorkspaceTab(action.tab)
  if (session.tabs.some((candidate) => candidate.id === tab.id)) {
    return { ...session, activeTabId: tab.id }
  }
  if (session.tabs.length >= maximumWorkspaceTabCount) return session
  return { ...session, activeTabId: tab.id, tabs: [...session.tabs, tab] }
}
