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
    <div className="app-shell-pane">
      <div className="app-shell-pane-header">
        <div className="app-shell-split-row-base">
          <Tabs onValueChange={(value) => onViewChange(value as WorkbenchView)} value={activeView}>
            <TabsList>
              <TabsTrigger value="preview">
                <EyeIcon data-icon="inline-start" />
                Preview
              </TabsTrigger>
              <TabsTrigger value="source">
                <FileCode2Icon data-icon="inline-start" />
                Source
              </TabsTrigger>
              <TabsTrigger value="inspect">
                <InspectIcon data-icon="inline-start" />
                Inspect
              </TabsTrigger>
            </TabsList>
          </Tabs>
          <div className="app-shell-stack-compact">
            <Button onClick={onBuild} size="sm" type="button" variant="outline">
              <HammerIcon data-icon="inline-start" />
              Build
            </Button>
            <Button onClick={onInspect} size="sm" type="button" variant="outline">
              <InspectIcon data-icon="inline-start" />
              Inspect
            </Button>
          </div>
        </div>
      </div>

      <div className="app-shell-pane-content">
        <Tabs className="app-shell-fill-tabs" value={activeView}>
          <TabsContent className="app-shell-fill-tab-panel" value="preview">
            <PreviewTab build={build} previewHtml={previewHtml} session={session} />
          </TabsContent>

          <TabsContent className="app-shell-fill-tab-panel" value="source">
            <SourceTab
              draftSource={draftSource}
              hasUnsavedChanges={hasUnsavedChanges}
              onDraftSourceChange={onDraftSourceChange}
              onSaveSource={onSaveSource}
              onValidate={onValidate}
              saving={saving}
              session={session}
              validating={validating}
              validation={validation}
            />
          </TabsContent>

          <TabsContent className="app-shell-fill-tab-panel" value="inspect">
            <InspectTab inspect={inspect} logs={logs} />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}
