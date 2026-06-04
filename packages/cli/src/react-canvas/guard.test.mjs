import { describe, expect, it } from "vitest"

import { analyzeReactCanvasArtifact } from "./guard.mjs"

function issueMessages(source) {
  return analyzeReactCanvasArtifact({
    filePath: "artifact.agent.tsx",
    relativePath: ".agent-html/artifacts/artifact.agent.tsx",
    source,
  }).map((issue) => issue.message)
}

describe("React Canvas Guard", () => {
  it("reports a missing Artifact wrapper", () => {
    const messages = issueMessages(`
      import { Block } from "@agent-html/react"
      export default function Demo() {
        return <Block id="summary">Summary</Block>
      }
    `)

    expect(messages).toContain("Artifact must use the Artifact wrapper.")
  })

  it("reports duplicate Block ids at both locations", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">One</Block>
            <Block id="summary">Two</Block>
          </Artifact>
        )
      }
    `)

    expect(messages.filter((message) => message.includes("Duplicate Block id"))).toHaveLength(2)
  })

  it("reports unsafe visual classes and inline style", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">
              <div className="bg-purple-900 rounded-3xl shadow-2xl" style={{ color: "red" }}>
                Unsafe
              </div>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages.some((message) => message.includes("Unsafe className"))).toBe(true)
    expect(messages).toContain("Inline visual style is not allowed in React Canvas artifacts.")
  })

  it("reports arbitrary values and oversized typography", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">
              <section className="p-[37px] text-6xl tracking-tight">
                Oversized
              </section>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages.some((message) => message.includes("Unsafe className"))).toBe(true)
  })

  it("allows semantic tokens and compact layout scale", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact className="mx-auto flex max-w-4xl flex-col gap-4 bg-background p-4 text-foreground" title="Demo">
            <Block id="summary">
              <section className="grid min-w-0 gap-3 overflow-hidden text-sm leading-normal">
                <p className="truncate text-muted-foreground">Summary</p>
              </section>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages.filter((message) => message.includes("Unsafe className"))).toEqual([])
    expect(messages).not.toContain("Inline visual style is not allowed in React Canvas artifacts.")
  })

  it("reports layout or visual props on Block", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block className="grid gap-3" id="summary" style={{ display: "grid" }}>
              <section>Summary</section>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages).toContain("Block is protocol-only and must not receive className or style.")
  })

  it("reports forbidden app and old runtime imports", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      import { Button } from "@/app/shared/ui/button"
      import { renderInteractiveAgentHtml } from "@/agent-html/runtime"

      export default function Demo() {
        renderInteractiveAgentHtml
        return (
          <Artifact title="Demo">
            <Block id="summary">Summary</Block>
          </Artifact>
        )
      }
    `)

    expect(messages).toContain("Forbidden app or old runtime import in React Canvas artifact.")
    expect(messages).toContain("Old AHTML render API is not allowed in React Canvas artifacts.")
  })

  it("reports primitive bypasses for common controls and tables", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"

      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">
              <button>Run</button>
              <table><tbody><tr><td>One</td></tr></tbody></table>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages.some((message) => message.includes("Primitive bypass"))).toBe(true)
  })
})
