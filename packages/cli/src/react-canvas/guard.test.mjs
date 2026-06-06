import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { describe, expect, it } from "vitest"

import {
  analyzeBlockImplementationSource,
  analyzeReactCanvasArtifact,
  reactCanvasGuardScopes,
  runGuard,
} from "./guard.mjs"

function issueMessages(source) {
  return analyzeReactCanvasArtifact({
    filePath: "demo.artifact.tsx",
    relativePath: "agent-html/artifacts/demo.artifact.tsx",
    source,
  }).map((issue) => issue.message)
}

function issuesFor(source) {
  return analyzeReactCanvasArtifact({
    filePath: "demo.artifact.tsx",
    relativePath: "agent-html/artifacts/demo.artifact.tsx",
    source,
  })
}

describe("React Canvas Guard", () => {
  it("labels artifact entry protocol issues with their guard scope", () => {
    const issues = issuesFor(`
      import { Block } from "@agent-html/react"
      export default function Demo() {
        return <Block id="summary">Summary</Block>
      }
    `)

    expect(
      issues.find((issue) => issue.message === "Artifact must use the Artifact wrapper.")
        ?.guardScope
    ).toBe(reactCanvasGuardScopes.artifactEntryProtocol)
  })

  it("labels workspace boundary issues with their guard scope", () => {
    const issues = issuesFor(`
      import { Artifact, Block } from "@agent-html/react"
      import { Button } from "@/app/shared/ui/button"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">{Button}</Block>
          </Artifact>
        )
      }
    `)

    expect(
      issues.find((issue) => issue.message === "Import crosses the React Canvas boundary.")
        ?.guardScope
    ).toBe(reactCanvasGuardScopes.workspaceBoundary)
  })

  it("checks split block implementation source boundaries", () => {
    const issues = analyzeBlockImplementationSource({
      relativePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        export function SummaryBlock() {
          return <section className="bg-purple-900 rounded-3xl">Unsafe</section>
        }
      `,
    })

    expect(issues).toContainEqual(
      expect.objectContaining({
        guardScope: reactCanvasGuardScopes.blockImplementationSource,
        message: expect.stringContaining("Unsafe className"),
      })
    )
  })

  it("runs artifact entry protocol guard and block implementation source guard", async () => {
    const root = await fs.mkdtemp(path.join(os.tmpdir(), "agent-html-guard-"))
    await fs.mkdir(path.join(root, "agent-html", "artifacts", "demo"), {
      recursive: true,
    })
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo.artifact.tsx"),
      `
        import { Artifact, Block } from "@agent-html/react"
        export default function Demo() {
          return (
            <Artifact title="Demo">
              <Block id="summary">Summary</Block>
            </Artifact>
          )
        }
      `
    )
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "summary.block.tsx"),
      `
        export function SummaryBlock() {
          return <section className="bg-purple-900">Unsafe</section>
        }
      `
    )

    const report = await runGuard({ root })

    expect(report.artifacts).toHaveLength(1)
    expect(report.blockImplementations).toHaveLength(1)
    expect(report.issues).toContainEqual(
      expect.objectContaining({
        filePath: "agent-html/artifacts/demo/summary.block.tsx",
        guardScope: reactCanvasGuardScopes.blockImplementationSource,
        message: expect.stringContaining("Unsafe className"),
      })
    )
  })

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

  it("reports dynamic Block ids as non-static protocol metadata", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      const blockId = "summary"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id={blockId}>Summary</Block>
          </Artifact>
        )
      }
    `)

    expect(messages).toContain("Block id must be a static string literal.")
    expect(messages).not.toContain("Block is missing a stable id.")
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

  it("truncates long unsafe className messages", () => {
    const issues = issuesFor(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">
              <section className="bg-purple-900 rounded-3xl shadow-2xl text-6xl tracking-tight p-[37px] m-[21px] border-red-500 font-display">
                Oversized
              </section>
            </Block>
          </Artifact>
        )
      }
    `)
    const unsafeIssue = issues.find((issue) =>
      issue.message.startsWith("Unsafe className:")
    )

    expect(unsafeIssue?.message.length).toBeLessThanOrEqual(114)
    expect(unsafeIssue?.message).toContain("…")
    expect(unsafeIssue?.suggestion).toBe("Use semantic token classes.")
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
          <Artifact title="Demo">
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

  it("reports layout or visual props on Artifact", () => {
    const messages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      export default function Demo() {
        return (
          <Artifact className="max-w-4xl" title="Demo" style={{ color: "red" }}>
            <Block id="summary">
              <section>Summary</section>
            </Block>
          </Artifact>
        )
      }
    `)

    expect(messages).toContain("Artifact owns token-configured reading layout and must not receive className or style.")
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

    expect(messages).toContain("Import crosses the React Canvas boundary.")
    expect(messages).toContain("Old AHTML render API is not allowed in React Canvas artifacts.")
  })

  it("allows imported assets but reports imported public files", () => {
    const assetMessages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      import diagramUrl from "../assets/diagram.svg"

      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">{diagramUrl}</Block>
          </Artifact>
        )
      }
    `)
    const publicMessages = issueMessages(`
      import { Artifact, Block } from "@agent-html/react"
      import logoUrl from "../public/logo.svg"

      export default function Demo() {
        return (
          <Artifact title="Demo">
            <Block id="summary">{logoUrl}</Block>
          </Artifact>
        )
      }
    `)

    expect(assetMessages).not.toContain("Public files must be referenced by URL, not imported.")
    expect(publicMessages).toContain("Public files must be referenced by URL, not imported.")
  })

  it("aggregates primitive bypasses for common controls and tables", () => {
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

    expect(
      messages.filter((message) => message.includes("bypasses local UI"))
    ).toEqual([
      "Native form control bypasses local UI primitives.",
      "Native table bypasses local UI table primitives.",
    ])
  })
})
