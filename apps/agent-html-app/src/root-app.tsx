import * as React from "react"

import App from "@/app/App"
import { CodexConnectionProvider } from "@/app/codex/connection"

const LazyThreadPanelWindowApp = React.lazy(() =>
  import("@/app/pet/host/thread-panel-window-app").then((module) => ({
    default: module.ThreadPanelWindowApp,
  }))
)

export function RootApp() {
  const windowName = new URLSearchParams(window.location.search).get("window")

  if (windowName === "thread-panel") {
    return (
      <React.Suspense fallback={null}>
        <LazyThreadPanelWindowApp />
      </React.Suspense>
    )
  }

  return (
    <CodexConnectionProvider>
      <App />
    </CodexConnectionProvider>
  )
}
