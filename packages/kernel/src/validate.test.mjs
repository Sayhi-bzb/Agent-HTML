import { describe, expect, it } from "vitest"

import {
  extractStaticCanvasIntent,
  extractStaticCanvasIntentGraph,
  inspectArtifactEntry,
  replaceArtifactTitle,
  validateArtifactEntry,
  validateBlockImplementation,
} from "./validate.mjs"

describe("Canvas Kernel validation", () => {
  it("extracts aliased static Canvas intent without expanding Node content", () => {
    expect(
      extractStaticCanvasIntent({
        filePath: "agent-html/canvases/demo.canvas.tsx",
        source: `
          import { Canvas as Map, Node as Item } from "@agent-html/react"
          export default function Demo() {
            return (
              <Map>
                <>
                  <Item id="profile">
                    <Profile />
                  </Item>
                </>
                <Item id="revenue" />
              </Map>
            )
          }
        `,
      })
    ).toEqual({
      canvas: {},
      nodes: [
        {
          id: "profile",
          siblingOrder: 0,
          sources: ["agent-html/canvases/demo.canvas.tsx"],
        },
        {
          id: "revenue",
          siblingOrder: 1,
          sources: ["agent-html/canvases/demo.canvas.tsx"],
        },
      ],
    })
  })

  it("refuses dynamic Canvas intent instead of returning partial cold data", () => {
    expect(() =>
      extractStaticCanvasIntent({
        filePath: "agent-html/canvases/demo.canvas.tsx",
        source: `
          import { Canvas, Node } from "@agent-html/react"
          export default function Demo({ nodes }) {
            return <Canvas>{nodes.map((node) => <Node {...node} />)}</Canvas>
          }
        `,
      })
    ).toThrow("requires static Canvas children")
  })

  it("recursively expands ordered static local intent components", async () => {
    const modules = new Map([
      [
        "/canvas/region.tsx",
        `
          import { Node } from "@agent-html/react"
          import Nested from "./nested"
          export default function Region() {
            return <><Node id="region" /><Nested /></>
          }
        `,
      ],
      [
        "/canvas/nested.tsx",
        `
          import { Node } from "@agent-html/react"
          export default function Nested() { return <Node id="nested" /> }
        `,
      ],
    ])
    const result = await extractStaticCanvasIntentGraph({
      filePath: "/canvas/demo.canvas.tsx",
      loadModule: async ({ fromFilePath, specifier }) => {
        const filePath = `/canvas/${specifier.replace(/^\.\//, "")}.tsx`
        const source = modules.get(filePath)
        if (!source) throw new Error(`missing ${fromFilePath} ${specifier}`)
        return { filePath, source }
      },
      source: `
        import { Canvas, Node } from "@agent-html/react"
        import Region from "./region"
        export default function Demo() {
          return <Canvas><Node id="start" /><Region /><Node id="end" /></Canvas>
        }
      `,
    })

    expect(result.nodes.map((node) => node.id)).toEqual([
      "start",
      "region",
      "nested",
      "end",
    ])
  })

  it("extracts normalized metadata with the same AST used for validation", () => {
    const inspection = inspectArtifactEntry({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      source: `
        export default defineArtifact({
          title: "Demo",
          blocks: ["airport-rides", { id: "summary", title: "Overview" }]
        })
      `,
    })

    expect(inspection.diagnostics).toEqual([])
    expect(inspection.metadata).toEqual({
      title: "Demo",
      blocks: [
        { id: "airport-rides", title: "Airport Rides" },
        { id: "summary", title: "Overview" },
      ],
    })
  })

  it("returns stable, positioned protocol diagnostics", () => {
    const [issue] = validateArtifactEntry({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      source: "export default function Demo() { return null }",
    })

    expect(issue).toMatchObject({
      code: "canvas/protocol/define-artifact",
      column: 1,
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      line: 1,
      policyVersion: 1,
    })
  })

  it("reports every machine rule as an error through the CLI adapter contract", () => {
    const issues = validateBlockImplementation({
      filePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        import logo from "../public/logo.svg"
        export default function Summary() {
          return <button className="bg-purple-900" style={{ color: "red" }}>{logo}</button>
        }
      `,
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "canvas/workspace/public-import",
        "canvas/workspace/native-control",
        "canvas/style/unsafe-class",
        "canvas/style/inline-style",
      ])
    )
    expect(issues.every((issue) => issue.policyVersion === 1)).toBe(true)
  })

  it("replaces only the static artifact title literal", () => {
    const source = [
      'const untouched = "Old title"',
      "export default defineArtifact({",
      '  blocks: ["summary"],',
      "  title: 'Old title'",
      "})",
      "",
    ].join("\n")

    const result = replaceArtifactTitle({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      source,
      title: '  New "title"  ',
    })

    expect(result).toEqual({
      source: source.replace("title: 'Old title'", 'title: "New \\"title\\""'),
      title: 'New "title"',
    })
  })

  it.each([
    ["an empty title", "   ", "Artifact title is required"],
    ["an oversized title", "a".repeat(513), "512 characters or fewer"],
  ])("rejects %s", (_label, title, message) => {
    expect(() =>
      replaceArtifactTitle({
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        source:
          'export default defineArtifact({ title: "Demo", blocks: ["summary"] })',
        title,
      })
    ).toThrow(message)
  })

  it("rejects missing or dynamic artifact titles", () => {
    expect(() =>
      replaceArtifactTitle({
        filePath: "agent-html/artifacts/demo.artifact.tsx",
        source: 'export default defineArtifact({ title, blocks: ["summary"] })',
        title: "New title",
      })
    ).toThrow("missing a static title")
  })
})
