import * as React from "react"

import { PetMessageComposer } from "@/app/pet/host/pet-message-composer"
import {
  ThreadPanelSurface,
  type ThreadPanelBridge,
} from "@/app/pet/host/pet-thread-panel-content"
import { PetThreadTranscriptContent } from "@/app/pet/host/pet-thread-transcript-content"
import {
  dispatchThreadPanelNativeAction,
  readThreadPanelNativeSnapshotCache,
  subscribeThreadPanelNativeSnapshots,
  type ThreadPanelNativeSnapshot,
} from "@/app/pet/host/thread-panel-native-bridge"
import { hideWindow } from "@/app/shared/lib/window-controls"
import {
  WindowChromeFrame,
  WindowTitlebar,
} from "@/app/shared/ui/window-chrome"

export function ThreadPanelWindowApp() {
  const [snapshot, setSnapshot] =
    React.useState<ThreadPanelNativeSnapshot | null>(
      readThreadPanelNativeSnapshotCache
    )
  const [isSearchOpen, setIsSearchOpen] = React.useState(false)

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
      <WindowChromeFrame className="items-center justify-center px-6 text-center text-xs text-muted-foreground">
        Waiting for thread panel state.
      </WindowChromeFrame>
    )
  }

  const bridge = {
    dispatch: (action) => {
      if (action.type === "set-search-open") {
        setIsSearchOpen(action.open)
        return
      }
      if (action.type === "close") {
        void dispatchThreadPanelNativeAction(action)
        void hideWindow()
        return
      }
      return dispatchThreadPanelNativeAction(action)
    },
    snapshot: {
      ...snapshot.surface,
      searchOpen: isSearchOpen,
    },
  } satisfies ThreadPanelBridge

  return (
    <WindowChromeFrame>
      <ThreadPanelSurface
        bridge={bridge}
        headerSlot={(header) => (
          <WindowTitlebar className="bg-muted/30 text-foreground">
            {header}
          </WindowTitlebar>
        )}
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
    </WindowChromeFrame>
  )
}
