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

const jsonExample = `{
  "artifact": "test",
  "blocks": ["interaction-controls", "kanban-board", "code-block-demo"],
  "collaboration": {
    "mode": "agent-assisted",
    "supportsText": true,
    "supportsCode": true
  }
}`

const commandExample = `npm run react-canvas:guard
npm run react-canvas:typecheck
npm run react-canvas:index:check`

const diffExample = `const code = \`type Languages = "javascript" | "typescript";\`
const highlighter = await highlight()
const html = highlighter.codeToHtml(code, {
  lang: "javascript", // [!code --]
  lang: "typescript", // [!code ++]
  theme: "one-light",
})`

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

      <Separator />

      <CodeBlock
        caption="Structured collaboration state can be shown without forcing it into a card."
        code={jsonExample}
        language="json"
        title="Collaboration payload"
      />

      <CodeBlock
        caption="Commands stay copyable as a compact machine-readable surface."
        code={commandExample}
        language="bash"
        title="Validation commands"
        wrap
      />

      <Separator />

      <CodeBlock
        caption="Diff notation marks changed lines while hiding the Shiki markers."
        code={diffExample}
        language="ts"
        title="Notation diff"
      />
    </section>
  )
}
