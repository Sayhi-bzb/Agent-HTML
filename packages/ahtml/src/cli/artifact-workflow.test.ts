import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("artifact workflow inspection", () => {
  it("reports the checked document style config reference in the inspection payload", async () => {
    const { createInspection } = await importArtifactWorkflowModule()
    const inspection = createInspection({
      meta: {
        documentStyleConfigReference: "ops-compact",
      },
      components: [
        {
          type: "component",
          name: "page",
          props: {
            title: "Review",
          },
          children: [
            {
              type: "component",
              name: "card",
              props: {},
              children: [],
            },
          ],
        },
      ],
    })

    expect(inspection).toEqual({
      kind: "agent-html-inspection",
      configModel: "document-style-config-reference",
      config: {
        documentStyleConfigReference: "ops-compact",
      },
      components: [
        { name: "card", count: 1 },
        { name: "page", count: 1 },
      ],
    })
  })

  it("formats inspection summaries with document-style wording", async () => {
    const { formatInspectionSummary } = await importArtifactWorkflowModule()
    const summary = formatInspectionSummary({
      configModel: "document-style-config-reference",
      config: {
        documentStyleConfigReference: "ops-compact",
      },
      components: [{ name: "card", count: 1 }],
    })

    expect(summary).toContain("config model: document-style-config-reference")
    expect(summary).toContain("documentStyleConfigReference: ops-compact")
    expect(summary).not.toContain("resolved config")
    expect(summary).not.toContain("resolved document style tokens")
    expect(summary).toContain("- card: 1")
  })
})

async function importArtifactWorkflowModule() {
  return importCliModule<{
    readonly createInspection: (document: unknown) => unknown
    readonly formatInspectionSummary: (inspection: {
      readonly configModel?: string
      readonly config?: Record<string, string>
      readonly components?: readonly {
        readonly name: string
        readonly count: number
      }[]
    }) => string
  }>("artifact-workflow.mjs")
}
