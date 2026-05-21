/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import {
  importRenderCapabilitiesModule,
  importRuntimeSetupModule,
  importShadcnApiModule,
  useShadcnCliHarness,
} from "./cli-test-helpers"

const { getRegistryUrl } = useShadcnCliHarness()

describe("runtime setup contracts", () => {
  it("uses shadcn API for runtime setup catalogs and keeps required runtime components renderable", async () => {
    const registryUrl = getRegistryUrl()

    if (!registryUrl) {
      throw new Error("Expected shadcn test registry URL to be available.")
    }

    const previousRegistryUrl = process.env.REGISTRY_URL
    process.env.REGISTRY_URL = registryUrl

    try {
      const { resolveManagedRuntimeComponentSet, resolveRuntimeSetup } =
        await importRuntimeSetupModule()
      const { requiredShadcnRuntimeComponents } =
        await importRenderCapabilitiesModule()
      const {
        getShadcnComponentCatalog,
        listShadcnPresets,
        validateShadcnPreset,
      } = await importShadcnApiModule()

      const setup = await resolveRuntimeSetup({
        interactive: false,
        options: {
          "component-source": "ahtml-managed-ui",
          preset: "custom",
          components: "accordion",
        },
      })
      expect(setup.components).toEqual(requiredShadcnRuntimeComponents)

      const catalog = await getShadcnComponentCatalog()
      expect(catalog.source).toBe("shadcn-api")
      expect(catalog.components).toContain("button")
      expect(catalog.components).toEqual(
        expect.arrayContaining([...requiredShadcnRuntimeComponents]),
      )
      expect(
        resolveManagedRuntimeComponentSet({
          componentCatalog: catalog.components,
          componentSet: "recommended",
        }),
      ).toEqual(requiredShadcnRuntimeComponents)
      expect(
        resolveManagedRuntimeComponentSet({
          componentCatalog: catalog.components,
          componentSet: "all",
        }),
      ).toEqual(catalog.components)
      expect(
        resolveManagedRuntimeComponentSet({
          componentCatalog: catalog.components,
          componentSet: "recommended",
        }),
      ).toEqual(requiredShadcnRuntimeComponents)

      const presets = listShadcnPresets()
      expect(presets).toContain("nova")
      expect(validateShadcnPreset("nova")).toBe(true)
      await expect(
        resolveRuntimeSetup({
          interactive: false,
          options: { preset: "not-a-shadcn-preset" },
        }),
      ).rejects.toThrow("Unsupported shadcn preset")
    } finally {
      if (typeof previousRegistryUrl === "undefined") {
        delete process.env.REGISTRY_URL
      } else {
        process.env.REGISTRY_URL = previousRegistryUrl
      }
    }
  }, 30000)

  it("renders minimal setup guidance", async () => {
    const { formatSetupControls, formatSetupHeader } =
      await importRuntimeSetupModule()

    expect(formatSetupHeader()).toContain("ahtml setup")
    expect(formatSetupControls()).toContain("Up/Down")
  })
})
