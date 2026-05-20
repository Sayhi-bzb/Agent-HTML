/// <reference types="node" />
// @vitest-environment node

import path from "node:path"
import { pathToFileURL } from "node:url"

import { describe, expect, it } from "vitest"
import {
  VALIDATED_STANDARD_COMPONENT_SCHEMAS,
  createPublicAgentContract,
} from "@agent-html/core"

describe("runtime contract", () => {
  it("derives verification, mapping, and renderer registry views from one source", async () => {
    const { createRuntimeContract } = await importRuntimeContract()
    const publicComponents = createPublicAgentContract().components
    const runtimeContract = createRuntimeContract(publicComponents)
    const alertVerification = runtimeContract.verificationData.components.find(
      (component) => component.name === "alert",
    )
    const badgeVerification = runtimeContract.verificationData.components.find(
      (component) => component.name === "badge",
    )

    expect(runtimeContract.renderableAgentComponents).toEqual(
      publicComponents.map((component) => component.name),
    )
    expect(
      runtimeContract.verificationData.components.map(
        (component) => component.name,
      ),
    ).toEqual(
      runtimeContract.rendererMapping.components.map(
        (component) => component.name,
      ),
    )
    expect(runtimeContract.elementRegistrySpec.modules).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          registryItem: "tabs",
        }),
      ]),
    )
    expect(runtimeContract.rendererKindSpec.kinds).toContain("tabs")
    expect(alertVerification?.props).toContain("variant")
    expect(badgeVerification?.props).toContain("variant")
    expect(alertVerification?.props).not.toContain("tone")
    expect(badgeVerification?.props).not.toContain("tone")
  })

  it("builds managed runtime manifest and verification state from the same contract", async () => {
    const {
      createManagedRuntimeManifest,
      createRuntimeContract,
      createRuntimeVerificationState,
      VALIDATED_STANDARD_COMPONENT_SCHEMAS,
    } = await importRuntimeContract()
    const runtimeContract = createRuntimeContract(
      VALIDATED_STANDARD_COMPONENT_SCHEMAS,
    )
    const runtimeSurface = { source: "shadcn-init" }

    const manifest = createManagedRuntimeManifest({
      componentSource: "shadcn-cli",
      components: ["card", "tabs"],
      installMode: "default",
      packageVersion: "0.0.0",
      paths: {
        runtimeDir: "/runtime",
        cacheDir: "/cache",
        logsDir: "/logs",
        configDir: "/config",
      },
      preset: "nova",
      renderer: "shadcn-runtime",
      runtimeBase: "radix",
      runtimeContract,
      runtimeSurface,
      uiLibrary: "shadcn",
      version: 1,
    })
    const verificationState = createRuntimeVerificationState({
      components: ["card", "tabs"],
      runtimeBase: "radix",
      runtimeContract,
      runtimeSurface,
      version: 1,
    })

    expect(manifest.renderableAgentComponents).toEqual(
      runtimeContract.renderableAgentComponents,
    )
    expect(verificationState.renderableAgentComponents).toEqual(
      runtimeContract.renderableAgentComponents,
    )
    expect(verificationState.verificationData).toBe(
      runtimeContract.verificationData,
    )
    expect(verificationState.rendererMapping).toBe(
      runtimeContract.rendererMapping,
    )
  })

  it("preserves schema verification and renderer snapshots instead of recomputing them", async () => {
    const { createRuntimeContractFromSchema } = await importRuntimeContract()
    const schema = {
      components: [
        {
          name: "card",
          description: "Card",
          props: [],
          allowedChildren: ["#text"],
        },
      ],
      verificationData: {
        components: [
          {
            name: "card",
            renderKind: "compound",
            props: ["title"],
            slots: [{ name: "children", children: ["text"] }],
          },
        ],
      },
      rendererMapping: {
        components: [
          {
            name: "card",
            kind: "compound",
            renderKind: "compound",
            requiredRegistryItem: "card",
            requiredExports: ["Card", "CardContent", "CardTitle"],
            root: "Card",
            title: "CardTitle",
            titleProp: "title",
            content: "CardContent",
            childMode: "block",
            textMode: "preformatted",
            slots: [{ name: "children", children: ["text"] }],
          },
        ],
      },
    }

    const runtimeContract = createRuntimeContractFromSchema(schema)

    expect(runtimeContract.renderableAgentComponents).toEqual(["card"])
    expect(runtimeContract.verificationData).toBe(schema.verificationData)
    expect(runtimeContract.rendererMapping).toBe(schema.rendererMapping)
    expect(runtimeContract.verificationData.components[0]?.props).toEqual([
      "title",
    ])
    expect(
      runtimeContract.rendererMapping.components[0]?.textMode,
    ).toBe("preformatted")
  })
})

async function importRuntimeContract() {
  const runtimeContractUrl = pathToFileURL(
    path.join(
      process.cwd(),
      "packages",
      "ahtml",
      "src",
      "config",
      "runtime-contract.mjs",
    ),
  ).href
  const runtimeContractModule = await import(runtimeContractUrl)

  return {
    createManagedRuntimeManifest:
      runtimeContractModule.createManagedRuntimeManifest as (input: {
        componentSource: string
        components: readonly string[]
        installMode: string
        packageVersion: string
        paths: {
          runtimeDir: string
          cacheDir: string
          logsDir: string
          configDir: string
        }
        preset: string
        renderer: string
        runtimeBase: string
        runtimeContract: {
          renderableAgentComponents: readonly string[]
        }
        runtimeSurface: { source: string }
        uiLibrary: string
        version: number
      }) => {
        readonly renderableAgentComponents: readonly string[]
      },
    createRuntimeContract: runtimeContractModule.createRuntimeContract as (
      components: readonly { readonly name: string }[],
    ) => {
      readonly renderableAgentComponents: readonly string[]
      readonly verificationData: {
        readonly components: readonly {
          readonly name: string
          readonly props: readonly string[]
        }[]
      }
      readonly rendererMapping: {
        readonly components: readonly { readonly name: string }[]
      }
      readonly elementRegistrySpec: {
        readonly modules: readonly { readonly registryItem: string }[]
      }
      readonly rendererKindSpec: {
        readonly kinds: readonly string[]
      }
    },
    createRuntimeContractFromSchema:
      runtimeContractModule.createRuntimeContractFromSchema as (schema: {
        readonly components?: readonly {
          readonly name: string
          readonly description: string
          readonly props: readonly unknown[]
          readonly allowedChildren?: readonly string[]
        }[]
        readonly verificationData?: {
          readonly components: readonly {
            readonly name: string
            readonly renderKind: string
            readonly props: readonly string[]
            readonly slots: readonly {
              readonly name: string
              readonly children: readonly string[]
            }[]
          }[]
        }
        readonly rendererMapping?: {
          readonly components: readonly {
            readonly name: string
            readonly kind: string
            readonly renderKind: string
            readonly root: string
            readonly title?: string
            readonly titleProp?: string
            readonly content?: string
            readonly childMode?: string
            readonly textMode?: string
            readonly slots: readonly {
              readonly name: string
              readonly children: readonly string[]
            }[]
          }[]
        }
      }) => {
        readonly renderableAgentComponents: readonly string[]
        readonly verificationData: {
          readonly components: readonly {
            readonly props: readonly string[]
          }[]
        }
        readonly rendererMapping: {
          readonly components: readonly {
            readonly textMode?: string
          }[]
        }
      },
    createRuntimeVerificationState:
      runtimeContractModule.createRuntimeVerificationState as (input: {
        components: readonly string[]
        runtimeBase: string
        runtimeContract: {
          renderableAgentComponents: readonly string[]
          verificationData: unknown
          rendererMapping: unknown
        }
        runtimeSurface: { source: string }
        version: number
      }) => {
        readonly renderableAgentComponents: readonly string[]
        readonly verificationData: unknown
        readonly rendererMapping: unknown
      },
    VALIDATED_STANDARD_COMPONENT_SCHEMAS,
  }
}
