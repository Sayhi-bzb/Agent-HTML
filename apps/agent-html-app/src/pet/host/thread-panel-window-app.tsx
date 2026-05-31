import * as React from "react"

import { PetMessageComposer } from "@/app/pet/host/pet-message-composer"
import {
  ThreadPanelSurface,
  type ThreadPanelBridge,
} from "@/app/pet/host/pet-thread-panel-content"
import { PetThreadTranscriptContent } from "@/app/pet/host/pet-thread-transcript-content"
import {
  dispatchThreadPanelNativeAction,
  subscribeThreadPanelNativeSnapshots,
  type ThreadPanelNativeSnapshot,
} from "@/app/pet/host/thread-panel-native-bridge"

export function ThreadPanelWindowApp() {
  const [snapshot, setSnapshot] =
    React.useState<ThreadPanelNativeSnapshot | null>(null)

  React.useEffect(() => {
    let isMounted = true
    let cleanup: (() => void) | undefined

    void subscribeThreadPanelNativeSnapshots((nextSnapshot) => {
      if (isMounted) {
        setSnapshot(nextSnapshot)
      }
    }).then((unlisten) => {
      cleanup = unlisten
    })

    return () => {
      isMounted = false
      cleanup?.()
    }
  }, [])

  if (!snapshot) {
    return (
      <div className="flex h-screen items-center justify-center bg-background px-6 text-center text-xs text-muted-foreground">
        Waiting for thread panel state.
      </div>
    )
  }

  const bridge: ThreadPanelBridge = {
    dispatch: dispatchThreadPanelNativeAction,
    snapshot: snapshot.surface,
  }

  return (
    <div className="h-screen min-h-0 w-screen min-w-0 overflow-hidden bg-background">
      <ThreadPanelSurface
        bridge={bridge}
        chat={({ onSearchOpenChange, searchOpen }) => (
          <PetThreadTranscriptContent
            composer={
              <PetMessageComposer
                draft={snapshot.composer.draft}
                onDraftChange={(draft) =>
                  void dispatchThreadPanelNativeAction({
                    draft,
                    type: "set-message-draft",
                  })
                }
                onPromptSubmit={(submit) =>
                  void dispatchThreadPanelNativeAction({
                    submit,
                    type: "submit-prompt",
                  })
                }
                surface="floating"
              />
            }
            error={snapshot.transcript.error}
            hideHeader
            isLoading={snapshot.transcript.isLoading}
            onSearchOpenChange={onSearchOpenChange}
            searchOpen={searchOpen}
            threadId={snapshot.transcript.threadId}
            turns={snapshot.transcript.turns}
          />
        )}
      />
    </div>
  )
}
