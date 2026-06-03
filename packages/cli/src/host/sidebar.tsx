import { FileCodeIcon, FileTextIcon, SparklesIcon } from "lucide-react"

import { artifactLabel } from "./api"
import { Badge } from "#agent-html-playground/ui/badge"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#agent-html-playground/ui/sidebar"
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
    <Sidebar
      className="min-h-svh border-r border-sidebar-border"
      collapsible="none"
    >
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex h-8 items-center gap-2 rounded-md px-1.5">
          <FileCodeIcon className="size-4" />
          <span className="min-w-0 truncate text-base font-semibold">
            AgentHTML
          </span>
        </div>
      </SidebarHeader>
      <SidebarContent className="p-3">
        <div className="mb-2 px-2 text-xs font-medium text-sidebar-foreground/70">
          Artifacts
        </div>
        <SidebarMenu>
          {artifacts.map((artifact) => {
            const issueCount = guardIssues.filter(
              (issue) => issue.filePath === artifact.filePath
            ).length

            return (
              <SidebarMenuItem key={artifact.filePath}>
                <SidebarMenuButton
                  isActive={artifact.filePath === activeFilePath}
                  onClick={() => onSelectArtifact(artifact.filePath)}
                  title={artifact.filePath}
                  type="button"
                >
                  <FileTextIcon />
                  <span className="min-w-0 flex-1 truncate text-left">
                    {artifactLabel(artifact.filePath)}
                  </span>
                  {issueCount > 0 ? (
                    <Badge className="shrink-0 bg-sidebar-primary text-sidebar-primary-foreground">
                      {issueCount}
                    </Badge>
                  ) : null}
                </SidebarMenuButton>
              </SidebarMenuItem>
            )
          })}
        </SidebarMenu>
      </SidebarContent>
      <SidebarFooter className="border-t border-sidebar-border p-3">
        <div className="flex items-center gap-2 rounded-md px-2.5 py-1.5 text-sm">
          <SparklesIcon className="size-4" />
          <span className="min-w-0 truncate">React Canvas</span>
        </div>
      </SidebarFooter>
    </Sidebar>
  )
}
