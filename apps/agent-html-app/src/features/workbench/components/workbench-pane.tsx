import { EyeIcon, FileCode2Icon, HammerIcon, InspectIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import type {
  BuildRunSummary,
  InspectSnapshot,
  LogSnapshot,
  SessionDetail,
  SourceValidationSnapshot,
  WorkbenchView,
} from "@/lib/types"

import {
  ShellPaneHeader,
  ShellPaneScaffold,
} from "@/features/app-shell/components/shell-content"
import { InspectTab } from "./inspect-tab"
import { PreviewTab } from "./preview-tab"
import { SourceTab } from "./source-tab"

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
        <ShellPaneHeader
          gap="base"
          leading={
            <Tabs onValueChange={(value) => onViewChange(value as WorkbenchView)} value={activeView}>
              <TabsList>
                <TabsTrigger disabled={interactionLocked} value="preview">
                  <EyeIcon data-icon="inline-start" />
                  Preview
                </TabsTrigger>
                <TabsTrigger disabled={interactionLocked} value="source">
                  <FileCode2Icon data-icon="inline-start" />
                  Source
                </TabsTrigger>
                <TabsTrigger disabled={interactionLocked} value="inspect">
                  <InspectIcon data-icon="inline-start" />
                  Inspect
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
          trailing={
            <>
              <Button
                disabled={interactionLocked}
                onClick={onBuild}
                size="sm"
                type="button"
                variant="outline"
              >
                <HammerIcon data-icon="inline-start" />
                Build
              </Button>
              <Button
                disabled={interactionLocked}
                onClick={onInspect}
                size="sm"
                type="button"
                variant="outline"
              >
                <InspectIcon data-icon="inline-start" />
                Inspect
              </Button>
            </>
          }
        />
      }
      content={
        <Tabs className="app-shell-fill-tabs" value={activeView}>
          <TabsContent className="app-shell-fill-tab-panel" value="preview">
            <PreviewTab
              build={build}
              building={building}
              previewHtml={previewHtml}
              session={session}
            />
          </TabsContent>

          <TabsContent className="app-shell-fill-tab-panel" value="source">
            <SourceTab
              draftSource={draftSource}
              hasUnsavedChanges={hasUnsavedChanges}
              interactionLocked={interactionLocked}
              onDraftSourceChange={onDraftSourceChange}
              onSaveSource={onSaveSource}
              onValidate={onValidate}
              saving={saving}
              session={session}
              sourceEditingLocked={sourceEditingLocked}
              validating={validating}
              validation={validation}
            />
          </TabsContent>

          <TabsContent className="app-shell-fill-tab-panel" value="inspect">
            <InspectTab inspect={inspect} inspecting={inspecting} logs={logs} />
          </TabsContent>
        </Tabs>
      }
    />
  )
}
