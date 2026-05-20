/// <reference types="node" />
// @vitest-environment node

import { parseRenderConfig } from "@agent-html/core"
import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("gallery workflow", () => {
  it("creates a continuous showcase document from a style profile", async () => {
    const { createStyleGalleryDocument } = await importGalleryWorkflowModule()
    const styleProfile = parseRenderConfig({
      "style-ref": "ops-compact",
    }).styleProfile

    const document = createStyleGalleryDocument(styleProfile)

    expect(document.meta.documentStyleConfigReference).toBe("ops-compact")
    expect(document.meta.styleProfile.id).toBe("ops-compact")
    expect(document.components[0]).toMatchObject({
      type: "component",
      name: "page",
      props: {
        title: "ops-compact showcase canvas",
      },
    })

    const serialized = JSON.stringify(document)

    expect(serialized).toContain('"title":"Feedback"')
    expect(serialized).toContain('"title":"Content"')
    expect(serialized).toContain('"title":"Forms"')
    expect(serialized).toContain('"title":"Selection"')
    expect(serialized).toContain('"title":"Disclosure"')
    expect(serialized).toContain(
      styleProfile.globalStyle.tokenSets.light.background,
    )
    expect(serialized).toContain(styleProfile.componentStyle.treatments.card)
    expect(serialized).toContain("Showcase canvas")
    expect(serialized).toContain("Current profile")
  })
})

async function importGalleryWorkflowModule() {
  return importCliModule<{
    readonly createStyleGalleryDocument: (styleProfile: {
      readonly id: string
      readonly globalStyle: {
        readonly tokenSets: {
          readonly light: {
            readonly background: string
          }
        }
      }
      readonly componentStyle: {
        readonly treatments: Readonly<Record<string, string>>
      }
    }) => {
      readonly meta: {
        readonly documentStyleConfigReference: string
        readonly styleProfile: {
          readonly id: string
        }
      }
      readonly components: readonly {
        readonly type: "component"
        readonly name: string
        readonly props: Record<string, string>
      }[]
    }
  }>("gallery-workflow.mjs")
}
