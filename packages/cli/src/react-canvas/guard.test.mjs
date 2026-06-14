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

function artifactIssueMessages(source) {
  return analyzeReactCanvasArtifact({
    filePath: "demo.artifact.tsx",
    relativePath: "agent-html/artifacts/demo.artifact.tsx",
    source,
  }).map((issue) => issue.message)
}

function artifactIssuesFor(source) {
  return analyzeReactCanvasArtifact({
    filePath: "demo.artifact.tsx",
    relativePath: "agent-html/artifacts/demo.artifact.tsx",
    source,
  })
}

function blockIssueMessages(source) {
  return analyzeBlockImplementationSource({
    relativePath: "agent-html/artifacts/demo/summary.block.tsx",
    source,
  }).map((issue) => issue.message)
}

describe("React Canvas Guard", () => {
  it("labels artifact entry protocol issues with their guard scope", () => {
    const issues = artifactIssuesFor(`
      export default function Demo() {
        return null
      }
    `)

    expect(
      issues.find((issue) => issue.message === "Artifact entry must use defineArtifact.")
        ?.guardScope
    ).toBe(reactCanvasGuardScopes.artifactEntryProtocol)
  })

  it("labels workspace boundary issues with their guard scope", () => {
    const issues = analyzeBlockImplementationSource({
      relativePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        import { Button } from "@/app/shared/ui/button"
        export default function SummaryBlock() {
          return <section>{Button}</section>
        }
      `,
    })

    expect(
      issues.find((issue) => issue.message === "Import crosses the React Canvas boundary.")
        ?.guardScope
    ).toBe(reactCanvasGuardScopes.workspaceBoundary)
  })

  it("checks split block implementation source boundaries", () => {
    const issues = analyzeBlockImplementationSource({
      relativePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        export default function SummaryBlock() {
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
        import { defineArtifact } from "@agent-html/react"
        export default defineArtifact({
          title: "Demo",
          blocks: ["summary"],
        })
      `
    )
    await fs.writeFile(
      path.join(root, "agent-html", "artifacts", "demo", "summary.block.tsx"),
      `
        export default function SummaryBlock() {
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

  it("reports missing defineArtifact usage", () => {
    const messages = artifactIssueMessages(`
      export default function Demo() {
        return null
      }
    `)

    expect(messages).toContain("Artifact entry must use defineArtifact.")
  })

  it("reports duplicate block ids at both locations", () => {
    const messages = artifactIssueMessages(`
      import { defineArtifact } from "@agent-html/react"
      export default defineArtifact({
        title: "Demo",
        blocks: ["summary", "summary"],
      })
    `)

    expect(messages.filter((message) => message.includes("Duplicate Block id"))).toHaveLength(2)
  })

  it("reports missing blocks and missing static title", () => {
    const messages = artifactIssueMessages(`
      import { defineArtifact } from "@agent-html/react"
      export default defineArtifact({
        blocks: [],
      })
    `)

    expect(messages).toContain("Artifact definition is missing a static title.")
    expect(messages).toContain("Artifact definition must contain at least one block id.")
  })

  it("reports unsafe visual classes and inline style in block implementations", () => {
    const messages = blockIssueMessages(`
      export default function SummaryBlock() {
        return (
          <section className="bg-purple-900 rounded-3xl shadow-2xl" style={{ color: "red" }}>
            Unsafe
          </section>
        )
      }
    `)

    expect(messages.some((message) => message.includes("Unsafe className"))).toBe(true)
    expect(messages).toContain("Inline visual style is not allowed in React Canvas artifacts.")
  })

  it("truncates long unsafe className messages", () => {
    const issues = analyzeBlockImplementationSource({
      relativePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        export default function SummaryBlock() {
          return (
            <section className="bg-purple-900 rounded-3xl shadow-2xl text-6xl tracking-tight p-[37px] m-[21px] border-red-500 font-display">
              Oversized
            </section>
          )
        }
      `,
    })
    const unsafeIssue = issues.find((issue) =>
      issue.message.startsWith("Unsafe className:")
    )

    expect(unsafeIssue?.message.length).toBeLessThanOrEqual(114)
    expect(unsafeIssue?.message).toContain("…")
    expect(unsafeIssue?.suggestion).toBe("Use semantic token classes.")
  })

  it("allows semantic tokens and compact layout scale", () => {
    const messages = blockIssueMessages(`
      export default function SummaryBlock() {
        return (
          <section className="grid min-w-0 gap-3 overflow-hidden text-sm leading-normal">
            <p className="truncate text-muted-foreground">Summary</p>
          </section>
        )
      }
    `)

    expect(messages.filter((message) => message.includes("Unsafe className"))).toEqual([])
    expect(messages).not.toContain("Inline visual style is not allowed in React Canvas artifacts.")
  })

  it("reports forbidden app and old runtime imports", () => {
    const messages = blockIssueMessages(`
      import { Button } from "@/app/shared/ui/button"
      import { renderInteractiveAgentHtml } from "@/agent-html/runtime"

      export default function SummaryBlock() {
        renderInteractiveAgentHtml
        return <section>{Button}</section>
      }
    `)

    expect(messages).toContain("Import crosses the React Canvas boundary.")
    expect(messages).toContain("Old AHTML render API is not allowed in React Canvas artifacts.")
  })

  it("allows imported assets but reports imported public files", () => {
    const assetMessages = blockIssueMessages(`
      import diagramUrl from "../assets/diagram.svg"

      export default function SummaryBlock() {
        return <section>{diagramUrl}</section>
      }
    `)
    const publicMessages = blockIssueMessages(`
      import logoUrl from "../public/logo.svg"
      import localLogoUrl from "./public/logo.svg"

      export default function SummaryBlock() {
        return <section>{logoUrl}{localLogoUrl}</section>
      }
    `)

    expect(assetMessages).not.toContain("Public files must be referenced by URL, not imported.")
    expect(
      publicMessages.filter(
        (message) => message === "Public files must be referenced by URL, not imported."
      )
    ).toHaveLength(2)
  })

  it("aggregates primitive bypasses for common controls and tables", () => {
    const messages = blockIssueMessages(`
      export default function SummaryBlock() {
        return (
          <section>
            <button>Run</button>
            <table><tbody><tr><td>One</td></tr></tbody></table>
          </section>
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
