import { FileCodeIcon, FileTextIcon, SparklesIcon } from "lucide-react"

import { artifactLabel } from "./api"
import { Button } from "./host-primitives"
import type { Artifact, GuardIssue } from "./host-contracts"

export function ReactCanvasSidebar({
  activeFilePath,
  artifacts,
  guardIssues,
  onSelectArtifact,
}: {
  activeFilePath: string | null
  artifacts: Artifact[]
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
}) {
  return (
    <aside className="flex min-h-svh w-64 shrink-0 flex-col border-r border-border bg-sidebar text-sidebar-foreground">
      <div className="border-b border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md px-1.5 py-1">
          <FileCodeIcon className="size-4" />
          <span className="text-base font-semibold">AgentHTML</span>
        </div>
      </div>
      <div className="min-h-0 flex-1 overflow-auto p-3">
        <div className="mb-2 px-2 text-xs font-medium text-sidebar-foreground/70">
          Artifacts
        </div>
        <div className="grid gap-1">
          {artifacts.map((artifact) => {
            const issueCount = guardIssues.filter(
              (issue) => issue.filePath === artifact.filePath
            ).length

            return (
              <Button
                className={
                  artifact.filePath === activeFilePath
                    ? "w-full justify-start bg-sidebar-accent text-sidebar-accent-foreground"
                    : "w-full justify-start text-sidebar-foreground"
                }
                key={artifact.filePath}
                onClick={() => onSelectArtifact(artifact.filePath)}
                title={artifact.filePath}
                type="button"
                variant="ghost"
              >
                <FileTextIcon />
                <span className="min-w-0 flex-1 truncate text-left">
                  {artifactLabel(artifact.filePath)}
                </span>
                {issueCount > 0 ? (
                  <span className="rounded-md bg-sidebar-primary px-1.5 py-0.5 text-xs text-sidebar-primary-foreground">
                    {issueCount}
                  </span>
                ) : null}
              </Button>
            )
          })}
        </div>
      </div>
      <div className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm">
          <SparklesIcon className="size-4" />
          <span className="min-w-0 truncate">React Canvas</span>
        </div>
      </div>
    </aside>
  )
}
