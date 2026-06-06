import { FolderTreeIcon } from "lucide-react"

import { Badge } from "../../components/ui/badge"

import { structureFiles } from "./data"

export function StructureBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">File system shape</h2>
        <p className="canvas-text-body text-muted-foreground">
          The folder makes the artifact map visible before any source is opened.
        </p>
      </div>

      <div className="canvas-stack-md">
        {structureFiles.map((file) => (
          <div className="canvas-cluster-md canvas-content-panel-sm" key={file.path}>
            <div className="canvas-icon-box-sm">
              <FolderTreeIcon />
            </div>
            <div className="canvas-stack-sm min-w-0">
              <div className="canvas-wrap-sm items-center">
                <Badge variant="outline">{file.role}</Badge>
                <code className="canvas-text-body">{file.path}</code>
              </div>
              <p className="canvas-text-body text-muted-foreground">
                {file.readWhen}
              </p>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}
