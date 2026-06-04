import {
  FileStackIcon,
  FileCodeIcon,
  FileTextIcon,
  PaletteIcon,
  SparklesIcon,
} from "lucide-react"

import { artifactLabel } from "./api"
import {
  ReactCanvasThemeEditor,
  ReactCanvasThemeEditorHeader,
} from "./theme-editor"
import type { CanvasThemeEditorSectionId } from "./theme-editor-sections"
import type {
  CanvasThemeDraft,
  CanvasThemeResolvedVariables,
  CanvasThemeVariableName,
} from "./theme-draft"
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
  activeSectionId,
  activeSidebarView,
  activeThemePresetId,
  artifacts,
  guardIssues,
  onSelectArtifact,
  onSelectSection,
  onSelectSidebarView,
  onSelectThemePreset,
  onResetThemePreview,
  onThemeVariableChange,
  themeDraft,
  themePreviewDirty,
  themePresets,
  themeRuntimeVariables,
}: {
  activeFilePath: string | null
  activeSectionId: CanvasThemeEditorSectionId
  activeSidebarView: "artifacts" | "theme"
  activeThemePresetId: CanvasThemePresetId
  artifacts: Artifact[]
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: "artifacts" | "theme") => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  onResetThemePreview: () => void
  onThemeVariableChange: (
    name: CanvasThemeVariableName,
    value: string
  ) => void
  themeDraft: CanvasThemeDraft
  themePreviewDirty: boolean
  themePresets: readonly CanvasThemePreset[]
  themeRuntimeVariables: CanvasThemeResolvedVariables
}) {
  const activeThemePreset =
    themePresets.find((preset) => preset.id === activeThemePresetId) ??
    themePresets[0]

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="canvas-sidebar-pad canvas-sidebar-header-stack">
        <SidebarMenu className="canvas-sidebar-menu">
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" tooltip="AgentHTML">
              <FileCodeIcon />
              <span className="canvas-sidebar-title min-w-0 truncate">
                AgentHTML
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeSidebarView === "artifacts"}
              onClick={() => onSelectSidebarView("artifacts")}
              type="button"
            >
              <FileStackIcon />
              <span className="min-w-0 flex-1 truncate text-left">
                Artifacts
              </span>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarMenuButton
              isActive={activeSidebarView === "theme"}
              onClick={() => onSelectSidebarView("theme")}
              type="button"
            >
              <PaletteIcon />
              <span className="min-w-0 flex-1 truncate text-left">Theme</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
        {activeSidebarView === "theme" ? (
          <ReactCanvasThemeEditorHeader
            activePresetId={activeThemePresetId}
            activeSectionId={activeSectionId}
            onSelectPreset={onSelectThemePreset}
            onSelectSection={onSelectSection}
            presets={themePresets}
          />
        ) : null}
      </SidebarHeader>
      <SidebarContent>
        {activeSidebarView === "theme" ? (
          <ReactCanvasThemeEditor
            activeSectionId={activeSectionId}
            draft={themeDraft}
            onVariableChange={onThemeVariableChange}
            preset={activeThemePreset}
            runtimeVariables={themeRuntimeVariables}
          />
        ) : (
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
        )}
      </SidebarContent>
      <SidebarFooter className="canvas-sidebar-pad">
        <SidebarMenu>
          {activeSidebarView === "theme" ? (
            <SidebarMenuItem>
              <SidebarMenuButton
                disabled={!themePreviewDirty}
                onClick={onResetThemePreview}
                type="button"
              >
                <SparklesIcon />
                <span className="min-w-0 truncate">
                  {themePreviewDirty ? "Reset preview" : "Preview clean"}
                </span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <SidebarMenuItem>
              <SidebarMenuButton tooltip="React Canvas">
                <SparklesIcon />
                <span className="min-w-0 truncate">React Canvas</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
