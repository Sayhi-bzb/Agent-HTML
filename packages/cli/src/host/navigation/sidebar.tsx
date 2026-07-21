import {
  ArrowLeftIcon,
  FileTextIcon,
  LayoutDashboardIcon,
  PaletteIcon,
  SearchIcon,
  SparklesIcon,
} from "lucide-react"

import { artifactLabel } from "../api/api"
import {
  ReactCanvasThemeEditor,
  ReactCanvasThemeEditorHeader,
  ReactCanvasThemePresetSelect,
} from "../theme/theme-editor"
import type { CanvasThemeEditorSectionId } from "../theme/theme-editor-contract"
import type {
  CanvasThemeDraft,
  CanvasThemeResolvedVariables,
  CanvasThemeVariableName,
} from "../theme/theme-draft"
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
} from "#agent-html-playground/components/ui/sidebar"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import type { Artifact, CanvasEntry } from "../host-contracts"
import type { CanvasSidebarView } from "../preferences/canvas-host-preferences"
import {
  HostCommand,
  HostCommandDialog,
  HostCommandEmpty,
  HostCommandGroup,
  HostCommandInput,
  HostCommandItem,
  HostCommandList,
} from "../ui/command"
import { useHostI18n } from "../i18n/host-i18n"
import { HostSidebarAction, HostSidebarStatus } from "../ui/sidebar-action"

export function ReactCanvasSidebar({
  artifactSearchOpen,
  activeSectionId,
  activeSidebarView,
  activeThemePresetId,
  artifacts,
  canvases,
  onArtifactSearchOpenChange,
  onSelectArtifact,
  onSelectCanvas,
  onSelectSection,
  onSelectSidebarView,
  onSelectThemePreset,
  onResetThemePreview,
  onThemeVariableChange,
  themeDraft,
  themePreviewDirty,
  themePresets,
  themeRuntimeVariables,
  showArtifactSearchAction,
}: {
  artifactSearchOpen: boolean
  activeSectionId: CanvasThemeEditorSectionId
  activeSidebarView: CanvasSidebarView
  activeThemePresetId: CanvasThemePresetId
  artifacts: Artifact[]
  canvases: CanvasEntry[]
  onArtifactSearchOpenChange: (open: boolean) => void
  onSelectArtifact: (filePath: string) => void
  onSelectCanvas: (filePath: string) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
  onSelectThemePreset: (presetId: CanvasThemePresetId) => void
  onResetThemePreview: () => void
  onThemeVariableChange: (name: CanvasThemeVariableName, value: string) => void
  themeDraft: CanvasThemeDraft
  themePreviewDirty: boolean
  themePresets: readonly CanvasThemePreset[]
  themeRuntimeVariables: CanvasThemeResolvedVariables
  showArtifactSearchAction: boolean
}) {
  const { t } = useHostI18n()
  const activeThemePreset =
    themePresets.find((preset) => preset.id === activeThemePresetId) ??
    themePresets[0]
  const isGalleryView = activeSidebarView === "gallery"

  return (
    <Sidebar className="border-transparent" collapsible="offcanvas">
      <SidebarHeader className="canvas-sidebar-pad canvas-sidebar-header-stack">
        <ReactCanvasArtifactSearch
          artifacts={artifacts}
          canvases={canvases}
          onOpenChange={onArtifactSearchOpenChange}
          onSelectArtifact={onSelectArtifact}
          onSelectCanvas={onSelectCanvas}
          onSelectSidebarView={onSelectSidebarView}
          open={artifactSearchOpen}
          showTrigger={!isGalleryView && showArtifactSearchAction}
        />
        {isGalleryView ? (
          <SidebarMenu className="canvas-sidebar-menu">
            <HostSidebarAction
              icon={ArrowLeftIcon}
              label={t("sidebar.back")}
              onClick={() => onSelectSidebarView("artifacts")}
              type="button"
            />
          </SidebarMenu>
        ) : (
          <ReactCanvasThemePresetSelect
            activePresetId={activeThemePresetId}
            onSelectPreset={onSelectThemePreset}
            presets={themePresets}
          />
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
        ) : null}
      </SidebarContent>
      <SidebarFooter className="canvas-sidebar-pad">
        <SidebarMenu>
          {isGalleryView ? (
            themePreviewDirty ? (
              <HostSidebarAction
                icon={SparklesIcon}
                label={t("sidebar.resetPreview")}
                onClick={onResetThemePreview}
                type="button"
              />
            ) : (
              <HostSidebarStatus
                icon={SparklesIcon}
                label={t("sidebar.previewClean")}
              />
            )
          ) : (
            <HostSidebarAction
              icon={PaletteIcon}
              label={t("sidebar.gallery")}
              onClick={() => onSelectSidebarView("gallery")}
              type="button"
            />
          )}
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

function ReactCanvasArtifactSearch({
  artifacts,
  canvases,
  onOpenChange,
  onSelectArtifact,
  onSelectCanvas,
  onSelectSidebarView,
  open,
  showTrigger,
}: {
  artifacts: Artifact[]
  canvases: CanvasEntry[]
  onOpenChange: (open: boolean) => void
  onSelectArtifact: (filePath: string) => void
  onSelectCanvas: (filePath: string) => void
  onSelectSidebarView: (view: CanvasSidebarView) => void
  open: boolean
  showTrigger: boolean
}) {
  const { t } = useHostI18n()

  return (
    <>
      {showTrigger ? (
        <SidebarMenu className="canvas-sidebar-menu">
          <HostSidebarAction
            icon={SearchIcon}
            label={t("sidebar.search")}
            onClick={() => onOpenChange(true)}
            type="button"
          />
        </SidebarMenu>
      ) : null}
      <HostCommandDialog
        className="sm:max-w-md"
        description={t("sidebar.searchDescription")}
        onOpenChange={onOpenChange}
        open={open}
        title={t("sidebar.searchTitle")}
      >
        <HostCommand>
          <HostCommandInput placeholder={t("sidebar.searchPlaceholder")} />
          <HostCommandList>
            <HostCommandEmpty>
              {t("artifact.noArtifactsTitle")}
            </HostCommandEmpty>
            <HostCommandGroup heading={t("sidebar.artifacts")}>
              {artifacts.map((artifact) => {
                const label = artifact.title
                const fileLabel = artifactLabel(artifact.filePath)

                return (
                  <HostCommandItem
                    icon={FileTextIcon}
                    key={artifact.filePath}
                    keywords={[label, fileLabel, artifact.filePath]}
                    label={label}
                    onSelect={() => {
                      onSelectArtifact(artifact.filePath)
                      onSelectSidebarView("artifacts")
                      onOpenChange(false)
                    }}
                    value={artifact.filePath}
                  />
                )
              })}
            </HostCommandGroup>
            <HostCommandGroup heading="Canvases">
              {canvases.map((canvas) => (
                <HostCommandItem
                  icon={LayoutDashboardIcon}
                  key={canvas.filePath}
                  keywords={[canvas.title, canvas.filePath]}
                  label={canvas.title}
                  onSelect={() => {
                    onSelectCanvas(canvas.filePath)
                    onSelectSidebarView("artifacts")
                    onOpenChange(false)
                  }}
                  value={canvas.filePath}
                />
              ))}
            </HostCommandGroup>
          </HostCommandList>
        </HostCommand>
      </HostCommandDialog>
    </>
  )
}
