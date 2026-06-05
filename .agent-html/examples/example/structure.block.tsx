import { FolderTreeIcon } from "lucide-react"

import { Badge } from "../../ui/badge"
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../../ui/card"

import { structureFiles } from "./data"

export function StructureBlock() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>File system shape</CardTitle>
        <CardDescription>
          The folder makes the artifact map visible before any source is opened.
        </CardDescription>
      </CardHeader>
      <CardContent className="canvas-stack-md">
        {structureFiles.map((file) => (
          <div className="canvas-content-panel" key={file.path}>
            <div className="canvas-cluster-md">
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
          </div>
        ))}
      </CardContent>
    </Card>
  )
}
