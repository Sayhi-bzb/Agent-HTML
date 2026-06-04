import {
  FileCodeIcon,
  FileTextIcon,
  PaletteIcon,
  SparklesIcon,
} from "lucide-react"

import { artifactLabel } from "./api"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "#agent-html-playground/ui/select"
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
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact, GuardIssue } from "./host-contracts"

export function ReactCanvasSidebar({
  activeFilePath,
  activeThemePresetId,
  artifacts,
  guardIssues,
  onSelectArtifact,
  onSelectThemePreset,
  themePresets,
}: {
  activeFilePath: string | null
  activeThemePresetId: CanvasThemePresetId
  artifacts: Artifact[]
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  themePresets: readonly CanvasThemePreset[]
}) {
  const activeThemePreset =
    themePresets.find((preset) => preset.id === activeThemePresetId) ??
    themePresets[0]

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="AgentHTML">
              <FileCodeIcon />
              <span className="min-w-0 truncate text-base font-semibold">
                AgentHTML
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <Select
              onValueChange={(value) =>
                onSelectThemePreset(value as CanvasThemePresetId)
              }
              value={activeThemePresetId}
            >
              <SelectTrigger asChild>
                <SidebarMenuButton
                  aria-label="Theme preset"
                  className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
                  type="button"
                >
                  <PaletteIcon />
                  <SelectValue placeholder="Theme">
                    <span className="min-w-0 flex-1 truncate text-left">
                      {activeThemePreset?.label ?? "Theme"}
                    </span>
                  </SelectValue>
                </SidebarMenuButton>
              </SelectTrigger>
              <SelectContent
                align="start"
                className="w-[var(--radix-select-trigger-width)] min-w-[var(--radix-select-trigger-width)] p-1"
                position="popper"
              >
                {themePresets.map((preset) => (
                  <SelectItem
                    className="gap-2 px-2 py-1 pr-8 text-sm"
                    key={preset.id}
                    value={preset.id}
                  >
                    <span className="min-w-0 truncate">{preset.label}</span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
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
                      tooltip={artifactLabel(artifact.filePath)}
                      type="button"
                    >
                      <FileTextIcon />
                      <span className="min-w-0 flex-1 truncate text-left">
                        {artifactLabel(artifact.filePath)}
                      </span>
                    </SidebarMenuButton>
                    {issueCount > 0 ? (
                      <SidebarMenuBadge>{issueCount}</SidebarMenuBadge>
                    ) : null}
                  </SidebarMenuItem>
                )
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="p-3">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton tooltip="React Canvas">
              <SparklesIcon />
              <span className="min-w-0 truncate">React Canvas</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
