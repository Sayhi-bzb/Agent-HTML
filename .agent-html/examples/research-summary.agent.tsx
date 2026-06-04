import { Artifact, Block } from "@agent-html/react"

import { Badge } from "../ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../ui/card"

export default function ResearchSummaryExample() {
  return (
    <Artifact
      className="mx-auto flex w-full max-w-4xl flex-col gap-4 bg-background text-foreground"
      title="Research Summary Example"
    >
      <Block id="findings" title="Findings">
        <Card>
          <CardHeader>
            <CardTitle>Findings</CardTitle>
            <CardDescription>
              A compact sample block built from local primitives.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p>Use blocks for reviewable research sections.</p>
            <Badge>example</Badge>
          </CardContent>
        </Card>
      </Block>
    </Artifact>
  )
}
