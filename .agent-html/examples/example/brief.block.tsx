import { FileCode2Icon, SparklesIcon } from "lucide-react"

import { Alert, AlertDescription } from "../../ui/alert"
import { Badge } from "../../ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "../../ui/card"

import { exampleCopy } from "./copy"

export function BriefBlock() {
  return (
    <Card>
      <CardHeader>
        <Badge className="w-fit" variant="secondary">
          split artifact pattern
        </Badge>
        <CardTitle>{exampleCopy.title}</CardTitle>
      </CardHeader>
      <CardContent className="canvas-stack-lg">
        <div className="canvas-cluster-lg canvas-content-panel">
          <div className="canvas-icon-box-md">
            <FileCode2Icon />
          </div>
          <p className="canvas-text-body text-muted-foreground">
            {exampleCopy.summary}
          </p>
        </div>

        <Alert>
          <SparklesIcon />
          <AlertDescription>{exampleCopy.alert}</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  )
}
