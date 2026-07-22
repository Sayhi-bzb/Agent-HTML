import * as React from "react"
import { SparklesIcon } from "lucide-react"

import { Separator } from "#agent-html-playground/components/ui/separator"
import type {
  CanvasThemePreset,
  CanvasThemePresetId,
} from "#agent-html-playground/theme/presets"
import { useHostI18n } from "../i18n/host-i18n"
import { HostItemContent } from "../ui/item-content"
import { HostButton } from "../ui/button"
import { WorkspaceSplitView } from "../ui/workspace-split-view"
import {
  ReactCanvasThemeEditor,
  ReactCanvasThemeEditorHeader,
} from "./theme-editor"
import type { CanvasThemeEditorSectionId } from "./theme-editor-contract"
import type {
  CanvasThemeDraft,
  CanvasThemeResolvedVariables,
  CanvasThemeVariableName,
} from "./theme-draft"

export function AppearanceSurface({
  activePresetId,
  activeSectionId,
  draft,
  onResetPreview,
  onSelectPreset,
  onSelectSection,
  onVariableChange,
  presets,
  preview,
  previewDirty,
  runtimeVariables,
}: {
  activePresetId: CanvasThemePresetId
  activeSectionId: CanvasThemeEditorSectionId
  draft: CanvasThemeDraft
  onResetPreview: () => void
  onSelectPreset: (presetId: CanvasThemePresetId) => void
  onSelectSection: (sectionId: CanvasThemeEditorSectionId) => void
  onVariableChange: (name: CanvasThemeVariableName, value: string) => void
  presets: readonly CanvasThemePreset[]
  preview: React.ReactNode
  previewDirty: boolean
  runtimeVariables: CanvasThemeResolvedVariables
}) {
  const { t } = useHostI18n()
  const [narrowPanel, setNarrowPanel] = React.useState<"main" | "pane">("pane")
  const activePreset =
    presets.find((preset) => preset.id === activePresetId) ?? presets[0]

  const controls = (
    <div className="appearance-surface__controls">
      <h1 className="sr-only">{t("appearance.title")}</h1>
      <ReactCanvasThemeEditorHeader
        activePresetId={activePresetId}
        activeSectionId={activeSectionId}
        onSelectPreset={onSelectPreset}
        onSelectSection={onSelectSection}
        presets={presets}
      />
      <ReactCanvasThemeEditor
        activeSectionId={activeSectionId}
        draft={draft}
        onVariableChange={onVariableChange}
        preset={activePreset}
        runtimeVariables={runtimeVariables}
      />
      <Separator />
      <div className="appearance-surface__status">
        {previewDirty ? (
          <HostButton onClick={onResetPreview} type="button" variant="ghost">
            <SparklesIcon data-icon="inline-start" />
            {t("sidebar.resetPreview")}
          </HostButton>
        ) : (
          <div className="appearance-surface__clean-status" role="status">
            <HostItemContent
              icon={SparklesIcon}
              label={t("sidebar.previewClean")}
            />
          </div>
        )}
      </div>
    </div>
  )

  return (
    <WorkspaceSplitView
      main={preview}
      mainLabel={t("appearance.preview")}
      narrowPanel={narrowPanel}
      onNarrowPanelChange={setNarrowPanel}
      pane={controls}
      paneLabel={t("appearance.controls")}
    />
  )
}
