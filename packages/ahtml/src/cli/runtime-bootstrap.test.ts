/// <reference types="node" />
// @vitest-environment node

import { mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"

import prettier from "prettier"
import { describe, expect, it } from "vitest"

import { removeTempDir } from "./cli-test-helpers"

describe("checked-in runtime bootstrap", () => {
  it("rewrites runtime vite configs to an ESM-safe template", async () => {
    const { ensureRuntimeBuildConfig } = await importRuntimeTemplateModule()
    const runtimeDir = await mkdtemp(
      path.join(tmpdir(), "ahtml-runtime-bootstrap-"),
    )
    const runtimeViteConfigPath = path.join(runtimeDir, "vite.ahtml.config.mjs")

    try {
      await writeFile(
        path.join(runtimeDir, "vite.config.ts"),
        [
          'import path from "path"',
          'import tailwindcss from "@tailwindcss/vite"',
          'import react from "@vitejs/plugin-react"',
          'import { defineConfig } from "vite"',
          "",
          "export default defineConfig({",
          "  plugins: [react(), tailwindcss()],",
          "  resolve: {",
          "    alias: {",
          '      "@": path.resolve(__dirname, "./src"),',
          "    },",
          "  },",
          "})",
          "",
        ].join("\n"),
      )

      await ensureRuntimeBuildConfig({
        packageRoot: process.cwd(),
        paths: {
          runtimeDir,
          runtimeViteConfigPath,
        },
      })

      const templateConfig = await readFile(
        path.join(runtimeDir, "vite.config.ts"),
        "utf8",
      )
      const ahtmlConfig = await readFile(runtimeViteConfigPath, "utf8")

      expect(templateConfig).toContain(
        "const rootDir = path.dirname(fileURLToPath(import.meta.url))",
      )
      expect(templateConfig).toContain('path.resolve(rootDir, "./src")')
      expect(templateConfig).not.toContain("__dirname")
      expect(ahtmlConfig).toContain("rewriteTemplateRoot")
    } finally {
      await removeTempDir(runtimeDir)
    }
  })

  it("provisions a managed runtime shell without shadcn init", async () => {
    const { writeRuntimeHost } = await importRuntimeTemplateModule()
    const runtimeRoot = await mkdtemp(
      path.join(tmpdir(), "ahtml-runtime-shell-"),
    )
    const runtimeDir = path.join(runtimeRoot, "runtime")
    const schemaModule: {
      readonly getCliSchemaOutput: (root?: string) => Promise<unknown>
    } = await import(
      pathToFileURL(
        path.join(
          process.cwd(),
          "packages",
          "ahtml",
          "src",
          "cli",
          "schema.mjs",
        ),
      ).href
    )

    try {
      await writeRuntimeHost({
        packageRoot: process.cwd(),
        paths: {
          runtimeDir,
          runtimeSrcDir: path.join(runtimeDir, "src"),
          runtimeComponentsDir: path.join(
            runtimeDir,
            "src",
            "components",
            "ui",
          ),
          runtimeViteConfigPath: path.join(runtimeDir, "vite.ahtml.config.mjs"),
          runtimeVerificationPath: path.join(
            runtimeDir,
            "render-verification.generated.json",
          ),
        },
        schema: await schemaModule.getCliSchemaOutput(process.cwd()),
        setup: {
          uiLibrary: "shadcn",
          componentSource: "ahtml-managed-ui",
          installMode: "preset",
          preset: "nova",
          components: ["card"],
        },
      })

      const componentsJson = await readFile(
        path.join(runtimeDir, "components.json"),
        "utf8",
      )
      const packageJson = await readFile(
        path.join(runtimeDir, "package.json"),
        "utf8",
      )
      const cssSource = await readFile(
        path.join(runtimeDir, "src", "styles.css"),
        "utf8",
      )

      expect(componentsJson).toContain('"style": "nova"')
      expect(componentsJson).toContain('"css": "src/styles.css"')
      expect(componentsJson).toContain('"iconLibrary": "radix"')
      expect(packageJson).toContain('"name": "ahtml-runtime"')
      expect(cssSource).toContain('@import "shadcn/tailwind.css";')
      expect(
        await readFile(
          path.join(runtimeDir, "src", "components", "ui", "card.tsx"),
          "utf8",
        ),
      ).toContain("function Card")
      expect(
        await readFile(
          path.join(runtimeDir, "src", "components", "ui", "slider.tsx"),
          "utf8",
        ),
      ).toContain("controlId")
    } finally {
      await removeTempDir(runtimeRoot)
    }
  }, 30000)

  it("keeps the checked-in runtime element registry template in sync with shared mapping", async () => {
    const root = process.cwd()
    const { createRuntimeElementRegistrySource } =
      await importRuntimeTemplateModule()
    const [
      { getCliSchemaOutput },
      { createRuntimeContractFromSchema },
      { createRuntimeRendererKindSource },
    ] = await Promise.all([
      import(
        pathToFileURL(
          path.join(root, "packages", "ahtml", "src", "cli", "schema.mjs"),
        ).href
      ) as Promise<{
        readonly getCliSchemaOutput: (root?: string) => Promise<{
          readonly components: readonly { readonly name: string }[]
          readonly verificationData: unknown
          readonly rendererMapping: unknown
        }>
      }>,
      import(
        pathToFileURL(
          path.join(
            root,
            "packages",
            "ahtml",
            "src",
            "config",
            "runtime-contract.mjs",
          ),
        ).href
      ) as Promise<{
        readonly createRuntimeContractFromSchema: (schema: {
          readonly components: readonly { readonly name: string }[]
          readonly verificationData: unknown
          readonly rendererMapping: unknown
        }) => {
          readonly elementRegistrySpec: unknown
          readonly rendererKindSpec: unknown
        }
      }>,
      importRuntimeTemplateModule(),
    ])
    const schema = await getCliSchemaOutput(root)
    const runtimeContract = createRuntimeContractFromSchema(schema)
    const expected = createRuntimeElementRegistrySource(
      runtimeContract.elementRegistrySpec,
    )
    const checkedIn = await readFile(
      path.join(
        root,
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "renderer",
        "elements.tsx",
      ),
      "utf8",
    )

    const formattedExpected = await prettier.format(expected, {
      parser: "typescript",
      semi: false,
    })
    expect(normalizeNewlines(checkedIn).trimEnd()).toBe(
      normalizeNewlines(formattedExpected).trimEnd(),
    )

    const expectedKinds = createRuntimeRendererKindSource(
      runtimeContract.rendererKindSpec,
    )
    const checkedInKinds = await readFile(
      path.join(
        root,
        "packages",
        "ahtml",
        "src",
        "cli",
        "runtime-host",
        "renderer",
        "kinds.ts",
      ),
      "utf8",
    )

    const formattedExpectedKinds = await prettier.format(expectedKinds, {
      parser: "typescript",
      semi: false,
    })
    expect(normalizeNewlines(checkedInKinds).trimEnd()).toBe(
      normalizeNewlines(formattedExpectedKinds).trimEnd(),
    )
  })
})

function normalizeNewlines(value: string) {
  return value.replaceAll("\r\n", "\n")
}

async function importRuntimeTemplateModule() {
  const moduleUrl = pathToFileURL(
    path.join(
      process.cwd(),
      "packages",
      "ahtml",
      "src",
      "cli",
      "runtime-bootstrap",
      "index.mjs",
    ),
  ).href

  return import(moduleUrl) as Promise<{
    readonly createRuntimeElementRegistrySource: (
      registrySpec: unknown,
    ) => string
    readonly createRuntimeRendererKindSource: (kindSpec: unknown) => string
    readonly ensureRuntimeBuildConfig: (input: {
      readonly packageRoot: string
      readonly paths: {
        readonly runtimeDir: string
        readonly runtimeViteConfigPath: string
      }
    }) => Promise<void>
    readonly writeRuntimeHost: (input: {
      readonly packageRoot: string
      readonly paths: {
        readonly runtimeDir: string
        readonly runtimeSrcDir: string
        readonly runtimeComponentsDir: string
        readonly runtimeViteConfigPath: string
        readonly runtimeVerificationPath: string
      }
      readonly schema: unknown
      readonly setup: {
        readonly uiLibrary: string
        readonly componentSource: string
        readonly installMode: string
        readonly preset: string
        readonly components: readonly string[]
      }
    }) => Promise<unknown>
  }>
}
