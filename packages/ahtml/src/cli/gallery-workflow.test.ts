/// <reference types="node" />
// @vitest-environment node

import { parseRenderConfig } from "@agent-html/core"
import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("gallery workflow", () => {
  it("creates a component gallery document from a style profile", async () => {
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
        title: "ops-compact component gallery",
      },
    })

    const serialized = JSON.stringify(document)

    expect(serialized).toContain('"title":"Feedback Gallery"')
    expect(serialized).toContain('"title":"Content Gallery"')
    expect(serialized).toContain('"title":"Form Gallery"')
    expect(serialized).toContain('"title":"Overlay Gallery"')
    expect(serialized).toContain('"title":"Disclosure Gallery"')
    expect(serialized).toContain('"name":"separator"')
    expect(serialized).toContain('"name":"checkbox"')
    expect(serialized).toContain('"name":"radio-group"')
    expect(serialized).toContain('"name":"toggle-group"')
    expect(serialized).toContain(
      styleProfile.globalStyle.tokenSets.light.background,
    )
    expect(serialized).toContain(styleProfile.componentStyle.treatments.card)
    expect(serialized).toContain("Operations review summary")
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
