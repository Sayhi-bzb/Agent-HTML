import * as React from "react"

import { WorkspaceGhostPet } from "@/app/pet/ghost"
import {
  getWorkspacePetHostSnapshot,
  subscribeWorkspacePetHost,
  type WorkspacePetHostSnapshot,
} from "@/app/pet/host/pet-host-store"
import { PetMessageComposer } from "@/app/pet/host/pet-message-composer"
import {
  PetSettingsContent,
  PetSettingsSurface,
  type PetSettingsAction,
  type PetSettingsBridge,
  type PetSettingsDispatch,
  type PetSettingsSurfaceSnapshot,
} from "@/app/pet/host/pet-settings-content"
import {
  canUsePetSettingsNativeWindow,
  closePetSettingsNativeWindow,
  openPetSettingsNativeWindow,
  preloadPetSettingsNativeWindowApp,
  publishPetSettingsNativeSnapshot,
  subscribePetSettingsNativeActions,
} from "@/app/pet/host/pet-settings-native-bridge"
import { PetThreadPanelContent } from "@/app/pet/host/pet-thread-panel-content"
import { PetThreadTranscriptContent } from "@/app/pet/host/pet-thread-transcript-content"
import { ThreadPanelAppWindowHost } from "@/app/pet/host/thread-panel-app-window-host"
import {
  canUseThreadPanelNativeWindow,
  closeThreadPanelNativeWindow,
  openThreadPanelNativeWindow,
  preloadThreadPanelNativeWindowApp,
  publishThreadPanelNativeSnapshot,
  subscribeThreadPanelNativeActions,
  type ThreadPanelNativeAction,
  type ThreadPanelNativeSnapshot,
} from "@/app/pet/host/thread-panel-native-bridge"
import type { ThreadPanelAction } from "@/app/pet/host/pet-thread-panel-content"

export function WorkspacePetHostSessionRoot() {
  const snapshot = React.useSyncExternalStore(
    subscribeWorkspacePetHost,
    getWorkspacePetHostSnapshot,
    getWorkspacePetHostSnapshot
  )
  if (!snapshot.enabled) {
    return null
  }

  return (
    <WorkspacePetHostSession
      key={snapshot.draftScope ?? "workspace"}
      snapshot={snapshot}
    />
  )
}

function WorkspacePetHostSession({
  snapshot,
}: {
  snapshot: WorkspacePetHostSnapshot
}) {
  const [isMessageOpen, setIsMessageOpen] = React.useState(false)
  const [isSettingsOpen, setIsSettingsOpen] = React.useState(false)
  const [isThreadPanelOpen, setIsThreadPanelOpen] = React.useState(false)
  const [settingsSnapshot, setSettingsSnapshot] =
    React.useState<PetSettingsSurfaceSnapshot | null>(null)
  const settingsDispatchRef = React.useRef<PetSettingsDispatch | null>(null)
  const [useNativeSettingsFallback, setUseNativeSettingsFallback] =
    React.useState(false)
  const [useNativeThreadPanelFallback, setUseNativeThreadPanelFallback] =
    React.useState(false)
  const threadPanel = snapshot.threadPanel
  const canUseNativeThreadPanel =
    canUseThreadPanelNativeWindow() && !useNativeThreadPanelFallback
  const canUseNativeSettings =
    canUsePetSettingsNativeWindow() && !useNativeSettingsFallback
  const threadPanelComposer = (
    <PetMessageComposer
      draft={snapshot.messageDraft}
      onDraftChange={snapshot.onMessageDraftChange}
      onPromptSubmit={snapshot.onPromptSubmit}
      surface="floating"
    />
  )

  const threadPanelContent = threadPanel ? (
    <PetThreadPanelContent
      activeThreadId={threadPanel.activeThreadId}
      canSelectThread={threadPanel.canSelectThread}
      chat={({ onSearchOpenChange, searchOpen }) => (
        <PetThreadTranscriptContent
          composer={threadPanelComposer}
          error={threadPanel.transcript.error}
          hideHeader
          isLoading={threadPanel.transcript.isLoading}
          onSearchOpenChange={onSearchOpenChange}
          searchOpen={searchOpen}
          threadId={threadPanel.transcript.threadId}
          turns={threadPanel.transcript.turns}
        />
      )}
      codexThreadError={threadPanel.codexThreadError}
      companyAgentError={threadPanel.companyAgentError}
      isLoading={threadPanel.isLoading}
      isSelectingThread={threadPanel.isSelectingThread}
      items={threadPanel.items}
      onClose={() => setIsThreadPanelOpen(false)}
      onNewThread={snapshot.onNewThread ?? noop}
      onRenameThread={snapshot.onRenameThread ?? noopRenameThread}
      onResumeThread={snapshot.onResumeThread ?? noop}
      optimisticThreadNames={threadPanel.optimisticThreadNames}
      renameError={threadPanel.renameError}
      renamingThreadId={threadPanel.renamingThreadId}
      threadRequestPreviews={threadPanel.threadRequestPreviews}
      threadSelectionError={threadPanel.threadSelectionError}
      threadSummaries={threadPanel.threadSummaries}
    />
  ) : null

  const nativeSnapshot = React.useMemo<ThreadPanelNativeSnapshot | null>(() => {
    if (!threadPanel) {
      return null
    }

    const activeThread = threadPanel.items.find(
      (item) => item.threadId === threadPanel.activeThreadId
    )

    return {
      composer: {
        draft: snapshot.messageDraft,
      },
      surface: {
        activeThreadId: threadPanel.activeThreadId,
        activeThreadName: activeThread?.displayName ?? "Thread",
        canSelectThread: threadPanel.canSelectThread,
        codexThreadError: threadPanel.codexThreadError,
        companyAgentError: threadPanel.companyAgentError,
        isLoading: threadPanel.isLoading,
        isSelectingThread: threadPanel.isSelectingThread,
        items: threadPanel.items,
        optimisticThreadNames: threadPanel.optimisticThreadNames,
        renameError: threadPanel.renameError,
        renamingThreadId: threadPanel.renamingThreadId,
        searchOpen: false,
        subtitle:
          activeThread?.previewText ||
          threadPanel.activeThreadId ||
          "No thread selected",
        threadSelectionError: threadPanel.threadSelectionError,
        threadSummaries: threadPanel.threadSummaries,
      },
      transcript: {
        error: threadPanel.transcript.error,
        isLoading: threadPanel.transcript.isLoading,
        threadId: threadPanel.transcript.threadId,
        turns: threadPanel.transcript.turns,
      },
    }
  }, [snapshot.messageDraft, threadPanel])

  const handleNativeThreadPanelAction = React.useCallback(
    (action: ThreadPanelNativeAction) => {
      switch (action.type) {
        case "set-message-draft":
          snapshot.onMessageDraftChange(action.draft)
          return
        case "submit-prompt":
          snapshot.onMessageDraftChange("")
          snapshot.onPromptSubmit?.(action.submit)
          return
        case "interrupt-turn":
          snapshot.onInterruptTurn?.()
          return
        default:
          dispatchThreadPanelAction({
            action,
            onClose: () => setIsThreadPanelOpen(false),
            onNewThread: snapshot.onNewThread ?? noop,
            onRenameThread: snapshot.onRenameThread ?? noopRenameThread,
            onResumeThread: snapshot.onResumeThread ?? noop,
          })
      }
    },
    [snapshot]
  )

  React.useEffect(() => {
    if (!canUseNativeThreadPanel) {
      return undefined
    }

    preloadThreadPanelNativeWindowApp()

    let cleanup: (() => void) | undefined
    void subscribeThreadPanelNativeActions(handleNativeThreadPanelAction).then(
      (unlisten) => {
        cleanup = unlisten
      }
    )

    return () => cleanup?.()
  }, [canUseNativeThreadPanel, handleNativeThreadPanelAction])

  const handleNativeSettingsAction = React.useCallback(
    (action: PetSettingsAction) => {
      if (action.type === "close") {
        setIsSettingsOpen(false)
      }
      settingsDispatchRef.current?.(action)
    },
    []
  )

  React.useEffect(() => {
    if (!canUseNativeSettings) {
      return undefined
    }

    preloadPetSettingsNativeWindowApp()

    let cleanup: (() => void) | undefined
    void subscribePetSettingsNativeActions(handleNativeSettingsAction).then(
      (unlisten) => {
        cleanup = unlisten
      }
    )

    return () => cleanup?.()
  }, [canUseNativeSettings, handleNativeSettingsAction])

  React.useEffect(() => {
    if (!isThreadPanelOpen || !canUseNativeThreadPanel || !nativeSnapshot) {
      if (canUseNativeThreadPanel && (!isThreadPanelOpen || !nativeSnapshot)) {
        void closeThreadPanelNativeWindow()
      }
      return
    }

    void publishThreadPanelNativeSnapshot(nativeSnapshot)
  }, [canUseNativeThreadPanel, isThreadPanelOpen, nativeSnapshot])

  React.useEffect(() => {
    if (!isSettingsOpen || !canUseNativeSettings || !settingsSnapshot) {
      if (canUseNativeSettings && !isSettingsOpen) {
        void closePetSettingsNativeWindow()
      }
      return
    }

    void publishPetSettingsNativeSnapshot(settingsSnapshot)
  }, [canUseNativeSettings, isSettingsOpen, settingsSnapshot])

  const handleSettingsClose = React.useCallback(() => {
    setIsSettingsOpen(false)
  }, [])

  const handleSettingsBridgeChange = React.useCallback(
    (bridge: PetSettingsBridge) => {
      settingsDispatchRef.current = bridge.dispatch
      setSettingsSnapshot((current) =>
        current === bridge.snapshot ? current : bridge.snapshot
      )
    },
    []
  )

  const settingsBridge = React.useMemo<PetSettingsBridge | null>(() => {
    if (!settingsSnapshot) {
      return null
    }

    return {
      dispatch: (action) => settingsDispatchRef.current?.(action),
      snapshot: settingsSnapshot,
    }
  }, [settingsSnapshot])

  const handleThreadPanelOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open || !canUseNativeThreadPanel) {
        setIsThreadPanelOpen(open)
        return
      }

      setIsThreadPanelOpen(true)
      if (nativeSnapshot) {
        void publishThreadPanelNativeSnapshot(nativeSnapshot)
      }
      void openThreadPanelNativeWindow().then((opened) => {
        if (opened && nativeSnapshot) {
          void publishThreadPanelNativeSnapshot(nativeSnapshot)
          return
        }
        setUseNativeThreadPanelFallback(true)
      })
    },
    [canUseNativeThreadPanel, nativeSnapshot]
  )

  const handleSettingsOpenChange = React.useCallback(
    (open: boolean) => {
      if (!open || !canUseNativeSettings) {
        setIsSettingsOpen(open)
        return
      }

      setIsSettingsOpen(true)
      if (settingsSnapshot) {
        void publishPetSettingsNativeSnapshot(settingsSnapshot)
      }
      void openPetSettingsNativeWindow().then((opened) => {
        if (opened && settingsSnapshot) {
          void publishPetSettingsNativeSnapshot(settingsSnapshot)
          return
        }
        setUseNativeSettingsFallback(true)
      })
    },
    [canUseNativeSettings, settingsSnapshot]
  )

  return (
    <>
      <WorkspaceGhostPet
        approval={snapshot.approval}
        approvalError={snapshot.approvalError}
        isMessageOpen={isMessageOpen}
        isSettingsOpen={isSettingsOpen}
        messageContent={
          <PetMessageComposer
            draft={snapshot.messageDraft}
            onDraftChange={snapshot.onMessageDraftChange}
            onPromptSubmit={snapshot.onPromptSubmit}
            onSent={() => setIsMessageOpen(false)}
            surface="floating"
          />
        }
        onMessageOpenChange={setIsMessageOpen}
        canInterruptTurn={snapshot.canInterruptTurn}
        isInterruptingTurn={snapshot.isInterruptingTurn}
        onInterruptTurn={snapshot.onInterruptTurn}
        onSettingsOpenChange={handleSettingsOpenChange}
        onRespondToApproval={snapshot.onRespondToApproval}
        onThreadPanelOpenChange={handleThreadPanelOpenChange}
        presence={snapshot.presence}
        settingsContent={
          !canUseNativeSettings && settingsBridge ? (
            <PetSettingsSurface bridge={settingsBridge} />
          ) : null
        }
        speechBubbles={snapshot.speechBubbles}
      />
      <PetSettingsContent
        active={isSettingsOpen}
        onBridgeChange={handleSettingsBridgeChange}
        onClose={handleSettingsClose}
        renderSurface={false}
      />
      <ThreadPanelAppWindowHost
        open={isThreadPanelOpen && !canUseNativeThreadPanel}
      >
        {threadPanelContent}
      </ThreadPanelAppWindowHost>
    </>
  )
}

function noop() {}

async function noopRenameThread() {}

function dispatchThreadPanelAction({
  action,
  onClose,
  onNewThread,
  onRenameThread,
  onResumeThread,
}: {
  action: ThreadPanelAction
  onClose: () => void
  onNewThread: () => void
  onRenameThread: (input: { name: string; threadId: string }) => Promise<void>
  onResumeThread: (threadId: string) => void
}) {
  switch (action.type) {
    case "close":
      onClose()
      return
    case "new-thread":
      onNewThread()
      return
    case "resume-thread":
      onResumeThread(action.threadId)
      return
    case "rename-thread":
      void onRenameThread({
        name: action.name,
        threadId: action.threadId,
      })
      return
    case "set-search-open":
      return
  }
}
