import { Button } from "@/app/shared/ui/button"
import { Skeleton } from "@/app/shared/ui/skeleton"
import type { AgentHtmlValidationError } from "@/agent-html"

export function RuntimeValidationErrors({
  errors,
}: {
  errors: AgentHtmlValidationError[]
}) {
  return (
    <div className="flex flex-col gap-3 p-4 md:p-6">
      {errors.map((error) => (
        <article
          key={`${error.code}:${error.path}:${error.attr ?? ""}`}
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-destructive"
        >
          <p className="text-sm font-medium">{error.code}</p>
          <p className="mt-1 text-xs leading-5">
            {error.path} - {error.message}
          </p>
        </article>
      ))}
    </div>
  )
}

function WorkspaceStatus({
  detail,
  title,
}: {
  detail: string
  title: string
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">{detail}</p>
      </section>
    </div>
  )
}

export function WorkspaceNoProjectState() {
  return (
    <WorkspaceStatus
      detail="Open a project section from the sidebar to render its current AHTML document."
      title="No workspace section selected"
    />
  )
}

export function WorkspaceNoSectionState({
  canEditStructure,
  error,
  isCreating,
  onCreateSection,
}: {
  canEditStructure: boolean
  error?: string | null
  isCreating: boolean
  onCreateSection: () => void
}) {
  return (
    <div className="flex flex-1 items-center justify-center p-6">
      <section className="max-w-md rounded-xl border bg-background p-5 text-foreground shadow-sm">
        <p className="text-sm font-medium">No sections in this project</p>
        <p className="mt-2 text-sm leading-6 text-muted-foreground">
          Create a section to start editing this workspace project.
        </p>
        {error ? <p className="mt-3 text-sm text-destructive">{error}</p> : null}
        <Button
          className="mt-4"
          disabled={!canEditStructure || isCreating}
          onClick={onCreateSection}
          title={canEditStructure ? undefined : "Desktop runtime required"}
          type="button"
        >
          {isCreating ? "Creating..." : "New Section"}
        </Button>
      </section>
    </div>
  )
}

export function WorkspaceLoadingDocumentState({
  detail,
}: {
  detail: string
}) {
  return (
    <div
      className="flex min-h-0 flex-1 flex-col p-4 md:p-6"
      data-selection="none"
    >
      <div className="flex min-h-0 flex-1 flex-col rounded-xl border bg-background p-5">
        <div className="flex items-start justify-between gap-4">
          <div className="min-w-0 flex-1 space-y-2">
            <Skeleton className="h-5 w-52 max-w-full" />
            <Skeleton className="h-3 w-72 max-w-full" />
          </div>
          <div className="flex shrink-0 gap-2">
            <Skeleton className="h-8 w-20" />
            <Skeleton className="h-8 w-16" />
          </div>
        </div>
        <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_16rem]">
          <div className="space-y-4">
            <div className="space-y-2">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="h-3 w-full" />
              <Skeleton className="h-3 w-11/12" />
              <Skeleton className="h-3 w-4/5" />
            </div>
            <div className="rounded-lg border bg-muted/20 p-3">
              <Skeleton className="h-3 w-28" />
              <div className="mt-3 space-y-2">
                <Skeleton className="h-3 w-full" />
                <Skeleton className="h-3 w-5/6" />
                <Skeleton className="h-3 w-3/4" />
              </div>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Skeleton className="h-24 rounded-lg" />
              <Skeleton className="h-24 rounded-lg" />
            </div>
          </div>
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-20 rounded-lg" />
            <Skeleton className="h-20 rounded-lg" />
          </div>
        </div>
        <span className="sr-only">{detail}</span>
      </div>
    </div>
  )
}

export function WorkspaceDocumentErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load document" />
}

export function WorkspaceRuntimeErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Runtime error" />
}

export function WorkspaceLoadErrorState({ detail }: { detail: string }) {
  return <WorkspaceStatus detail={detail} title="Unable to load workspace" />
}
