import { FileCodeIcon, FileTextIcon, SparklesIcon } from "lucide-react"

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
} from "#agent-html-playground/ui/sidebar"

import { artifactLabel } from "./api"
import type { Artifact, GuardIssue } from "./types"

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
    <Sidebar collapsible="offcanvas">
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:p-1.5!"
            >
              <a href="#">
                <FileCodeIcon />
                <span className="text-base font-semibold">AgentHTML</span>
              </a>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Artifacts</SidebarGroupLabel>
          <SidebarGroupContent>
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
                      <span className="min-w-0 truncate">
                        {artifactLabel(artifact.filePath)}
                      </span>
                      {issueCount > 0 ? <SidebarMenuBadge>{issueCount}</SidebarMenuBadge> : null}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton type="button">
              <SparklesIcon />
              <span className="min-w-0 truncate">React Canvas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
