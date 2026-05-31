import { Button } from "@/app/shared/ui/button"
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
  return <WorkspaceStatus detail={detail} title="Loading workspace document" />
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
