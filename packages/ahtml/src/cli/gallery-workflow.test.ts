/// <reference types="node" />
// @vitest-environment node

import { parseRenderConfig } from "@agent-html/core"
import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("gallery workflow", () => {
  it("creates a component gallery document from an artifact profile", async () => {
    const { createStyleGalleryDocument } = await importGalleryWorkflowModule()
    const artifactProfile = parseRenderConfig({
      "profile-ref": "ops-compact",
    }).artifactProfile

    const document = createStyleGalleryDocument(artifactProfile)

    expect(document.meta.artifactProfileReference).toBe("ops-compact")
    expect(document.meta.artifactProfile.id).toBe("ops-compact")
    expect(document.components[0]).toMatchObject({
      type: "component",
      name: "page",
      props: {
        title: "ops-compact component gallery",
      },
    })

    const serialized = JSON.stringify(document)

    expect(serialized).toContain('"title":"Cards Preview"')
    expect(serialized).toContain('"title":"Dashboard Preview"')
    expect(serialized).toContain('"title":"Forms Preview"')
    expect(serialized).toContain('"title":"Selection Preview"')
    expect(serialized).toContain('"title":"Disclosure Preview"')
    expect(serialized).toContain('"name":"separator"')
    expect(serialized).toContain('"name":"checkbox"')
    expect(serialized).toContain('"name":"radio-group"')
    expect(serialized).toContain('"name":"toggle-group"')
    expect(serialized).toContain(
      artifactProfile.globalStyle.tokenSets.light.background,
    )
    expect(serialized).toContain(artifactProfile.componentStyle.treatments.card)
    expect(serialized).toContain("Executive Summary")
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
        readonly artifactProfileReference: string
        readonly artifactProfile: {
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
