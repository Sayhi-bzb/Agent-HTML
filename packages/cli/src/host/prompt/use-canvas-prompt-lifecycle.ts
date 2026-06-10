import * as React from "react"

import {
  readCanvasMessageDraft,
  writeCanvasMessageDraft,
} from "../preferences/canvas-host-preferences"
import {
  failBlockMessageThread,
  finishBlockMessageThread,
  getBlockMessageStoreSnapshot,
  setBlockMessageThreadOpen,
  startBlockMessageThread,
  subscribeBlockMessageStore,
} from "./block-message-events"
import {
  clearCanvasMessageHost,
  publishCanvasMessageHost,
} from "./canvas-message-store"
import { submitBlockPromptToPipeline } from "../pipeline"
import type { FloatingPromptTarget } from "../host-contracts"
import type { HostTranslator } from "../i18n/host-i18n"

export function useCanvasPromptLifecycle({
  activeCodexThreadId,
  onCodexThreadChange,
  onThreadsRefresh,
  resolvedActiveFilePath,
  t,
}: {
  activeCodexThreadId: string | null
  onCodexThreadChange: (threadId: string) => void
  onThreadsRefresh: () => void
  resolvedActiveFilePath: string | null
  t: HostTranslator
}) {
  const [messageDraft, setMessageDraft] = React.useState("")
  const [promptStatus, setPromptStatus] = React.useState("")
  const [blockMessages, setBlockMessages] = React.useState(
    getBlockMessageStoreSnapshot
  )
  const [promptTarget, setPromptTarget] =
    React.useState<FloatingPromptTarget | null>(null)

  const openPrompt = React.useCallback((target: FloatingPromptTarget) => {
    setPromptStatus("")
    setMessageDraft(
      resolvedActiveFilePath
        ? readCanvasMessageDraft({
            blockId: target.id,
            filePath: resolvedActiveFilePath,
          })
        : ""
    )
    setPromptTarget(target)
  }, [resolvedActiveFilePath])

  const closePrompt = React.useCallback(() => {
    setPromptStatus("")
    setPromptTarget(null)
  }, [])

  const submitBlockPrompt = React.useCallback(async ({
    request,
    target,
  }: {
    request: string
    target: FloatingPromptTarget
  }) => {
    if (!resolvedActiveFilePath) {
      setPromptStatus(t("app.noActiveArtifact"))
      return
    }

    setPromptStatus("")

    try {
      const messageTarget = {
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        title: target.title,
      }

      startBlockMessageThread({
        request,
        t,
        target: messageTarget,
      })

      const turn = await submitBlockPromptToPipeline({
        activeThreadId: activeCodexThreadId,
        blockId: target.id,
        filePath: resolvedActiveFilePath,
        request,
      })

      finishBlockMessageThread({
        t,
        target: messageTarget,
        threadId: turn.threadId,
        turnId: turn.turnId,
      })
      onCodexThreadChange(turn.threadId)
      onThreadsRefresh()
      writeCanvasMessageDraft({
        blockId: target.id,
        draft: "",
        filePath: resolvedActiveFilePath,
      })
    } catch (submitError: unknown) {
      const errorMessage =
        submitError instanceof Error ? submitError.message : String(submitError)
      failBlockMessageThread({
        error: errorMessage,
        t,
        target: {
          blockId: target.id,
          filePath: resolvedActiveFilePath,
          title: target.title,
        },
      })
      setPromptStatus(errorMessage)
    }
  }, [
    activeCodexThreadId,
    onCodexThreadChange,
    onThreadsRefresh,
    resolvedActiveFilePath,
    t,
  ])

  const updateMessageDraft = React.useCallback((draft: string) => {
    setMessageDraft(draft)

    if (!resolvedActiveFilePath || !promptTarget) {
      return
    }

    writeCanvasMessageDraft({
      blockId: promptTarget.id,
      draft,
      filePath: resolvedActiveFilePath,
    })
  }, [promptTarget, resolvedActiveFilePath])

  React.useEffect(() => {
    return subscribeBlockMessageStore(() => {
      setBlockMessages(getBlockMessageStoreSnapshot())
    })
  }, [])

  React.useEffect(() => {
    publishCanvasMessageHost({
      activeFilePath: resolvedActiveFilePath,
      activeTarget: promptTarget,
      blockMessages,
      draft: messageDraft,
      enabled: true,
      onClose: closePrompt,
      onDraftChange: updateMessageDraft,
      onOpenTarget: openPrompt,
      onPromptSubmit: submitBlockPrompt,
      onThreadOpenChange: setBlockMessageThreadOpen,
      status: promptStatus,
    })
  }, [
    blockMessages,
    closePrompt,
    messageDraft,
    openPrompt,
    promptStatus,
    promptTarget,
    resolvedActiveFilePath,
    submitBlockPrompt,
    updateMessageDraft,
  ])

  React.useEffect(() => {
    return () => clearCanvasMessageHost()
  }, [])

  return {
    closePrompt,
    promptStatus,
    promptTarget,
    setPromptStatus,
    setPromptTarget,
  }
}
