import type {
  BuildRunSummary,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

import {
  ShellPaneScaffold,
} from "@/features/app-shell/components/shell-content"
import { InspectTab } from "./inspect-tab"
import { PreviewTab } from "./preview-tab"
import { SourceTab } from "./source-tab"
import { WorkbenchHeader } from "./workbench-header"
import { WorkbenchTabs } from "./workbench-tabs"

export type WorkbenchPaneProps = {
  session: SessionDetail
  activeView: WorkbenchView
  previewHtml?: string
  build: BuildRunSummary
  inspect: InspectSnapshot
  logs: LogSnapshot
  draftSource: string
  hasUnsavedChanges: boolean
  interactionLocked: boolean
  sourceEditingLocked: boolean
  building: boolean
  inspecting: boolean
  saving: boolean
  validating: boolean
  validation?: SourceValidationSnapshot
  onViewChange: (view: WorkbenchView) => void
  onBuild: () => void
  onInspect: () => void
  onSaveSource: () => void
  onValidate: () => void
  onDraftSourceChange: (source: string) => void
}

export function WorkbenchPane({
  session,
  activeView,
  previewHtml,
  build,
  inspect,
  logs,
  draftSource,
  hasUnsavedChanges,
  interactionLocked,
  sourceEditingLocked,
  building,
  inspecting,
  saving,
  validating,
  validation,
  onViewChange,
  onBuild,
  onInspect,
  onSaveSource,
  onValidate,
  onDraftSourceChange,
}: WorkbenchPaneProps) {
  return (
    <ShellPaneScaffold
      header={
        <WorkbenchHeader
          activeView={activeView}
          interactionLocked={interactionLocked}
          onBuild={onBuild}
          onInspect={onInspect}
          onViewChange={onViewChange}
        />
      }
      content={
        <WorkbenchTabs
          activeView={activeView}
          inspect={<InspectTab inspect={inspect} inspecting={inspecting} logs={logs} />}
          preview={
            <PreviewTab
              build={build}
              building={building}
              previewHtml={previewHtml}
              session={session}
            />
          }
          source={
            <SourceTab
              draftSource={draftSource}
              hasUnsavedChanges={hasUnsavedChanges}
              interactionLocked={interactionLocked}
              onDraftSourceChange={onDraftSourceChange}
              onSaveSource={onSaveSource}
              onValidate={onValidate}
              saving={saving}
              sourceEditingLocked={sourceEditingLocked}
              validating={validating}
              validation={validation}
            />
          }
        />
      }
    />
  )
}
