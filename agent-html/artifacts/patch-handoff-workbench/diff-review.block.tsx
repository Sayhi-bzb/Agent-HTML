import { CodeBlock } from "../../components/code-block"
import { Separator } from "../../components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../../components/ui/tabs"
import { diffExample, reviewChecklist } from "./data"
import { CountBadge, WorkbenchHeader } from "./shared"

const reviewerPrompt = `Review the selected hunk as a handoff reviewer.

Return:
1. Behavioral risk.
2. Missing validation.
3. Exact files that need human attention.
4. A concise patch packet update.`

const machineSummary = `{
  "patch": "PHW-101",
  "risk": "Critical",
  "reviewMode": "human-plus-agent",
  "checks": ["protocol-props", "block-ids", "handoff-packet"],
  "openQuestions": 1
}`

export function DiffReviewBlock() {
  return (
    <section className="canvas-stack-lg">
      <WorkbenchHeader title="Diff review">
        Compare the exact code hunk, the reviewer prompt, and the machine
        summary without leaving the patch context.
      </WorkbenchHeader>

      <Tabs defaultValue="diff">
        <TabsList>
          <TabsTrigger value="diff">Diff</TabsTrigger>
          <TabsTrigger value="prompt">Prompt</TabsTrigger>
          <TabsTrigger value="summary">Summary</TabsTrigger>
        </TabsList>

        <TabsContent value="diff">
          <CodeBlock
            caption="Selectable patch hunk for line-level human and agent review."
            code={diffExample}
            language="diff"
            showLineNumbers
            title="Patch hunk"
          />
        </TabsContent>

        <TabsContent value="prompt">
          <CodeBlock
            caption="Prompt packet used when handing this hunk to the next reviewer."
            code={reviewerPrompt}
            language="text"
            title="Reviewer prompt"
            wrap
          />
        </TabsContent>

        <TabsContent value="summary">
          <CodeBlock
            caption="Machine-readable review state for downstream handoff."
            code={machineSummary}
            language="json"
            title="Review state"
          />
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="canvas-grid-gap md:grid-cols-2">
        {reviewChecklist.map((item, index) => (
          <div className="canvas-content-panel-sm canvas-stack-sm" key={item}>
            <CountBadge count={index + 1} label="check" />
            <p className="canvas-text-body text-muted-foreground">{item}</p>
          </div>
        ))}
      </div>
    </section>
  )
}
