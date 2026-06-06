import { CodeBlock } from "../../components/code-block"
import { Separator } from "../../components/ui/separator"

const promptExample = `Rewrite only the selected block.

Keep the Artifact and Block protocol unchanged.
Use Canvas primitives before adding one-off markup.
Return a concise explanation of the changed source.`

const tsxExample = `import { Artifact, Block } from "@agent-html/react"

export default function ExampleArtifact() {
  return (
    <Artifact title="Example">
      <Block id="summary" title="Summary">
        <SummaryBlock />
      </Block>
    </Artifact>
  )
}`

export function CodeBlockDemoBlock() {
  return (
    <section className="canvas-stack-lg">
      <div className="canvas-stack-sm">
        <h2 className="canvas-text-heading">Code block</h2>
        <p className="canvas-text-body text-muted-foreground">
          Use this component for code, commands, prompt packets, generated text,
          and other selectable machine-readable content.
        </p>
      </div>

      <CodeBlock
        caption="Wrapped prompt text keeps long collaboration instructions readable."
        code={promptExample}
        language="text"
        title="Prompt packet"
        wrap
      />

      <Separator />

      <CodeBlock
        caption="Line numbers help reviewers reference generated source."
        code={tsxExample}
        language="tsx"
        showLineNumbers
        title="Artifact skeleton"
      />
    </section>
  )
}
