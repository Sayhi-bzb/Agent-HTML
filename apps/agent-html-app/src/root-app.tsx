import * as React from "react"

import App from "@/app/App"
import { CodexConnectionProvider } from "@/app/codex/connection"
import { Skeleton } from "@/app/shared/ui/skeleton"

const LazyThreadPanelWindowApp = React.lazy(() =>
  import("@/app/pet/host/thread-panel-window-app").then((module) => ({
    default: module.ThreadPanelWindowApp,
  }))
)

const LazyPetSettingsWindowApp = React.lazy(() =>
  import("@/app/pet/host/pet-settings-window-app").then((module) => ({
    default: module.PetSettingsWindowApp,
  }))
)

export function RootApp() {
  const windowName = new URLSearchParams(window.location.search).get("window")

  if (windowName === "thread-panel") {
    return (
      <React.Suspense fallback={<ThreadPanelWindowStartupSkeleton />}>
        <LazyThreadPanelWindowApp />
      </React.Suspense>
    )
  }

  if (windowName === "pet-settings") {
    return (
      <React.Suspense fallback={<PetSettingsWindowStartupSkeleton />}>
        <LazyPetSettingsWindowApp />
      </React.Suspense>
    )
  }

  return (
    <CodexConnectionProvider>
      <App />
    </CodexConnectionProvider>
  )
}

function SecondaryWindowStartupFrame({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="flex h-svh min-h-svh w-full bg-transparent p-[var(--window-chrome-inset)] text-foreground">
      <section
        className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-[var(--window-chrome-radius)] border bg-background shadow-[var(--window-chrome-shadow)]"
        data-selection="none"
      >
        {children}
      </section>
    </div>
  )
}

function ThreadPanelWindowStartupSkeleton() {
  return (
    <SecondaryWindowStartupFrame>
      <div className="flex min-h-14 items-center gap-3 bg-muted/30 px-4">
        <Skeleton className="size-8 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-32" />
          <Skeleton className="h-3 w-48" />
        </div>
        <Skeleton className="size-8" />
      </div>
      <div className="flex min-h-0 flex-1 border-t">
        <aside className="w-72 shrink-0 border-r p-3">
          <Skeleton className="mb-3 h-3 w-24" />
          <div className="space-y-2">
            {Array.from({ length: 5 }).map((_, index) => (
              <div className="flex items-center gap-2" key={index}>
                <Skeleton className="size-6 rounded-md" />
                <div className="min-w-0 flex-1 space-y-1.5">
                  <Skeleton className="h-3 w-4/5" />
                  <Skeleton className="h-2.5 w-2/3" />
                </div>
              </div>
            ))}
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4">
          <div className="space-y-4">
            <Skeleton className="h-16 w-3/4 rounded-lg" />
            <Skeleton className="ml-auto h-14 w-2/3 rounded-lg" />
            <Skeleton className="h-24 w-4/5 rounded-lg" />
          </div>
        </main>
      </div>
    </SecondaryWindowStartupFrame>
  )
}

function PetSettingsWindowStartupSkeleton() {
  return (
    <SecondaryWindowStartupFrame>
      <div className="flex min-h-14 items-center gap-3 bg-muted/30 px-4">
        <Skeleton className="size-8 rounded-full" />
        <div className="min-w-0 flex-1 space-y-2">
          <Skeleton className="h-4 w-36" />
          <Skeleton className="h-3 w-28" />
        </div>
        <Skeleton className="size-8" />
      </div>
      <div className="flex min-h-0 flex-1 border-t">
        <aside className="w-44 shrink-0 border-r p-3">
          <Skeleton className="mb-3 h-3 w-20" />
          <div className="space-y-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <Skeleton className="h-8 w-full" key={index} />
            ))}
          </div>
        </aside>
        <main className="min-w-0 flex-1 p-4">
          <div className="space-y-3">
            <Skeleton className="h-9 w-full" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-56 w-full rounded-lg" />
            <div className="flex justify-end gap-2">
              <Skeleton className="h-8 w-20" />
              <Skeleton className="h-8 w-16" />
            </div>
          </div>
        </main>
      </div>
    </SecondaryWindowStartupFrame>
  )
}
