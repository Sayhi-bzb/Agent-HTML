import {
  ArrowLeftIcon,
  FileTextIcon,
  PaletteIcon,
  SearchIcon,
  Settings2Icon,
  SparklesIcon,
} from "lucide-react"
import * as React from "react"

import { artifactLabel } from "../api/api"
import {
  ReactCanvasThemeEditor,
  ReactCanvasThemeEditorHeader,
  ReactCanvasThemePresetSelect,
} from "../theme/theme-editor"
import type { CanvasThemeEditorSectionId } from "../theme/theme-editor-sections"
import type {
  CanvasThemeDraft,
  CanvasThemeResolvedVariables,
  CanvasThemeVariableName,
} from "../theme/theme-draft"
import {
  Command,
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "#agent-html-playground/components/ui/command"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "#agent-html-playground/components/ui/dropdown-menu"
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
  SidebarMenuSkeleton,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact, GuardIssue } from "../host-contracts"
import type { CanvasSidebarView } from "../preferences/canvas-host-preferences"

export function ReactCanvasSidebar({
  activeFilePath,
  activeSectionId,
  activeSidebarView,
  activeThemePresetId,
  artifactsLoading,
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
  activeSidebarView: CanvasSidebarView
  activeThemePresetId: CanvasThemePresetId
  artifactsLoading: boolean
  artifacts: Artifact[]
  guardIssues: GuardIssue[]
  onSelectArtifact: (filePath: string) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
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
  const isGalleryView = activeSidebarView === "gallery"

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="canvas-sidebar-pad canvas-sidebar-header-stack">
        {isGalleryView ? (
          <SidebarMenu className="canvas-sidebar-menu">
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={() => onSelectSidebarView("artifacts")}
                type="button"
              >
                <ArrowLeftIcon />
                <span className="min-w-0 flex-1 truncate text-left">Back</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        ) : (
          <>
            <div className="canvas-sidebar-brand">
              <img
                alt=""
                aria-hidden="true"
                className="canvas-sidebar-brand-icon"
                src="/__agent-html/public/ghost.svg"
              />
              <span className="canvas-sidebar-title min-w-0 truncate">
                Agent-HTML
              </span>
            </div>
            <ReactCanvasArtifactSearch
              artifacts={artifacts}
              onSelectArtifact={onSelectArtifact}
              onSelectSidebarView={onSelectSidebarView}
            />
            <ReactCanvasThemePresetSelect
              activePresetId={activeThemePresetId}
              onSelectPreset={onSelectThemePreset}
              presets={themePresets}
            />
          </>
        )}
        {isGalleryView ? (
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
        {isGalleryView ? (
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
                {artifactsLoading ? (
                  <ReactCanvasArtifactListSkeleton />
                ) : (
                  artifacts.map((artifact) => {
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
                  })
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        )}
      </SidebarContent>
      <SidebarFooter className="canvas-sidebar-pad">
        <SidebarMenu>
          {isGalleryView ? (
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
            <>
              <SidebarMenuItem>
                <SidebarMenuButton
                  onClick={() => onSelectSidebarView("gallery")}
                  type="button"
                >
                  <PaletteIcon />
                  <span className="min-w-0 truncate">Gallery</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <SidebarMenuButton type="button">
                      <Settings2Icon />
                      <span className="min-w-0 truncate">Settings</span>
                    </SidebarMenuButton>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" side="right">
                    <DropdownMenuLabel>Settings</DropdownMenuLabel>
                    <DropdownMenuItem disabled>Preferences</DropdownMenuItem>
                    <DropdownMenuItem disabled>About Agent-HTML</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </SidebarMenuItem>
            </>
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function ReactCanvasArtifactSearch({
  artifacts,
  onSelectArtifact,
  onSelectSidebarView,
}: {
  artifacts: Artifact[]
  onSelectArtifact: (filePath: string) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
}) {
  const [open, setOpen] = React.useState(false)

  return (
    <>
      <SidebarMenu className="canvas-sidebar-menu">
        <SidebarMenuItem>
          <SidebarMenuButton onClick={() => setOpen(true)} type="button">
            <SearchIcon />
            <span className="min-w-0 flex-1 truncate text-left">Search</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
      <CommandDialog
        className="sm:max-w-md"
        description="Search Canvas artifacts."
        onOpenChange={setOpen}
        open={open}
        title="Search artifacts"
      >
        <Command>
          <CommandInput placeholder="Search artifacts..." />
          <CommandList>
            <CommandEmpty>No artifacts found.</CommandEmpty>
            <CommandGroup heading="Artifacts">
              {artifacts.map((artifact) => {
                const label = artifactLabel(artifact.filePath)

                return (
                  <CommandItem
                    key={artifact.filePath}
                    keywords={[label, artifact.filePath]}
                    onSelect={() => {
                      onSelectArtifact(artifact.filePath)
                      onSelectSidebarView("artifacts")
                      setOpen(false)
                    }}
                    value={artifact.filePath}
                  >
                    <FileTextIcon />
                    <span className="min-w-0 flex-1 truncate">{label}</span>
                  </CommandItem>
                )
              })}
            </CommandGroup>
          </CommandList>
        </Command>
      </CommandDialog>
    </>
  )
}

function ReactCanvasArtifactListSkeleton() {
  return (
    <>
      {["primary", "secondary", "tertiary", "quaternary"].map((row) => (
        <SidebarMenuItem key={row}>
          <SidebarMenuSkeleton showIcon />
        </SidebarMenuItem>
      ))}
    </>
  )
}
