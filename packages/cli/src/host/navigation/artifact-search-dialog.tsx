import { FileTextIcon, LayoutDashboardIcon } from "lucide-react"

import { artifactLabel } from "../api/api"
import type { Artifact, CanvasEntry } from "../host-contracts"
import { useHostI18n } from "../i18n/host-i18n"
import {
  HostCommand,
  HostCommandDialog,
  HostCommandEmpty,
  HostCommandGroup,
  HostCommandInput,
  HostCommandItem,
  HostCommandList,
} from "../ui/command"

export function ArtifactSearchDialog({
  artifacts,
  canvases,
  onOpenChange,
  onSelectArtifact,
  onSelectCanvas,
  open,
}: {
  artifacts: Artifact[]
  canvases: CanvasEntry[]
  onOpenChange: (open: boolean) => void
  onSelectArtifact: (filePath: string) => void
  onSelectCanvas: (filePath: string) => void
  open: boolean
}) {
  const { t } = useHostI18n()

  return (
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
          <HostCommandEmpty>{t("artifact.noArtifactsTitle")}</HostCommandEmpty>
          <HostCommandGroup heading={t("sidebar.artifacts")}>
            {artifacts.map((artifact) => {
              const fileLabel = artifactLabel(artifact.filePath)
              return (
                <HostCommandItem
                  icon={FileTextIcon}
                  key={artifact.filePath}
                  keywords={[artifact.title, fileLabel, artifact.filePath]}
                  label={artifact.title}
                  onSelect={() => {
                    onSelectArtifact(artifact.filePath)
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
                  onOpenChange(false)
                }}
                value={canvas.filePath}
              />
            ))}
          </HostCommandGroup>
        </HostCommandList>
      </HostCommand>
    </HostCommandDialog>
  )
}
