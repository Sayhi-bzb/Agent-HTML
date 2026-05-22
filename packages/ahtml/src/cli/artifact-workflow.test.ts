import { mkdtemp, mkdir, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

describe("artifact workflow inspection", () => {
  it("reports the checked artifact profile reference in the inspection payload", async () => {
    const { createInspection } = await importArtifactWorkflowModule()
    const inspection = createInspection({
      meta: {
        artifactProfileReference: "shadcn-default",
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
      configModel: "artifact-profile-reference",
      config: {
        artifactProfileReference: "shadcn-default",
      },
      components: [
        { name: "card", count: 1 },
        { name: "page", count: 1 },
      ],
    })
  })

  it("formats inspection summaries with artifact-profile wording", async () => {
    const { formatInspectionSummary } = await importArtifactWorkflowModule()
    const summary = formatInspectionSummary({
      configModel: "artifact-profile-reference",
      config: {
        artifactProfileReference: "shadcn-default",
      },
      components: [{ name: "card", count: 1 }],
    })

    expect(summary).toContain("config model: artifact-profile-reference")
    expect(summary).toContain("artifactProfileReference: shadcn-default")
    expect(summary).not.toContain("resolved config")
    expect(summary).not.toContain("resolved document style tokens")
    expect(summary).toContain("- card: 1")
  })

  it("rejects dangerous output directories before build cleanup", async () => {
    const { ArtifactWorkflowOutputPathError, assertSafeOutputDirectory } =
      await importArtifactWorkflowModule()

    expect(() =>
      assertSafeOutputDirectory({
        inputFilePath: path.join("D:\\repo", "artifact.agent.html"),
        outputDir: "D:\\repo",
        userRoot: "D:\\repo",
      }),
    ).toThrow(ArtifactWorkflowOutputPathError)

    expect(() =>
      assertSafeOutputDirectory({
        inputFilePath: path.join("D:\\repo", "artifact.agent.html"),
        outputDir: path.join("D:\\repo", ".."),
        userRoot: "D:\\repo",
      }),
    ).toThrow(ArtifactWorkflowOutputPathError)

    expect(() =>
      assertSafeOutputDirectory({
        inputFilePath: path.join("D:\\repo", "artifact.agent.html"),
        outputDir: path.join("D:\\repo", "artifact.agent.html"),
        userRoot: "D:\\repo",
      }),
    ).toThrow(ArtifactWorkflowOutputPathError)

    expect(() =>
      assertSafeOutputDirectory({
        inputFilePath: path.join("D:\\repo", "artifact.agent.html"),
        outputDir: path.join("D:\\repo", "dist", "html"),
        userRoot: "D:\\repo",
      }),
    ).not.toThrow()
  })

  it("marks managed runtime stale when renderer mapping drifts from current schema", async () => {
    const { isRuntimeVerificationCurrent } =
      await importArtifactWorkflowModule()

    expect(() =>
      isRuntimeVerificationCurrent({
        schema: {
          rendererMapping: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                kind: "compound",
                root: "Card",
                slots: [],
              },
            ],
          },
          verificationData: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                props: [],
                slots: [],
              },
            ],
          },
        },
        runtimeVerificationState: {
          rendererMapping: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                kind: "compound",
                root: "Card",
                contentLayout: "default",
                slots: [],
              },
            ],
          },
          verificationData: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                props: [],
                slots: [],
              },
            ],
          },
        },
      }),
    ).toThrow(/contentLayout|renderer mapping/i)
  })

  it("reads runtime verification from the generated runtime file instead of manifest capability snapshots", async () => {
    const { isRuntimeVerificationCurrent } =
      await importArtifactWorkflowModule()
    const { readRuntimeVerificationState } =
      await importRuntimeRenderabilityModule()
    const runtimeRoot = await mkdtemp(
      path.join(tmpdir(), "ahtml-runtime-state-"),
    )
    const runtimeVerificationPath = path.join(
      runtimeRoot,
      "runtime",
      "render-verification.generated.json",
    )

    await mkdir(path.dirname(runtimeVerificationPath), { recursive: true })
    await writeFile(
      runtimeVerificationPath,
      `${JSON.stringify(
        {
          kind: "ahtml-runtime-render-verification",
          version: 1,
          renderableAgentComponents: ["page", "card"],
          verificationData: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                props: [],
                slots: [],
              },
            ],
          },
          rendererMapping: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                kind: "compound",
                root: "Card",
                slots: [],
              },
            ],
          },
        },
        null,
        2,
      )}\n`,
    )

    const runtimeVerificationState = await readRuntimeVerificationState({
      runtimeVerificationPath,
    })

    expect(() =>
      isRuntimeVerificationCurrent({
        schema: {
          rendererMapping: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                kind: "compound",
                root: "Card",
                contentLayout: "default",
                slots: [],
              },
            ],
          },
          verificationData: {
            components: [
              {
                name: "card",
                renderKind: "compound",
                props: [],
                slots: [],
              },
            ],
          },
        },
        runtimeVerificationState,
      }),
    ).toThrow(/contentLayout|renderer mapping/i)
  })

  it("marks managed runtime stale when runtime host glue drifts even if verification data still matches", async () => {
    const { createRuntimeContractFromSchema } =
      await importRuntimeContractModule()
    const { createManagedRuntimeManifest, createRuntimeVerificationState } =
      await importRuntimeContractModule()
    const { createAhtmlGlueProof } = await importRuntimeSurfaceModule()
    const { createManagedRuntimeUiProof } = await importRuntimeManagedUiModule()
    const runtimeRoot = await mkdtemp(
      path.join(tmpdir(), "ahtml-runtime-current-"),
    )
    const runtimePaths = createRuntimePaths(runtimeRoot)

    await mkdir(path.join(runtimePaths.runtimeSrcDir, "renderer"), {
      recursive: true,
    })
    await mkdir(runtimePaths.runtimeComponentsDir, { recursive: true })
    await mkdir(runtimePaths.configDir, { recursive: true })

    await seedRuntimeSurfaceFixture(runtimePaths)

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
            props: [],
            slots: [],
          },
        ],
      },
      rendererMapping: {
        components: [
          {
            name: "card",
            renderKind: "compound",
            kind: "compound",
            root: "Card",
            contentLayout: "default",
            slots: [],
          },
        ],
      },
    }
    const runtimeContract = createRuntimeContractFromSchema(schema)
    const runtimeSurface = {
      source: "ahtml-managed-runtime",
      template: "vite",
      preset: "new-york",
      style: "new-york",
      base: "radix",
      iconLibrary: "lucide",
      shellSource: "ahtml-runtime-shell",
      initSource: "ahtml-bootstrap",
      tailwindVersion: "^4.3.0",
      tailwindCss: "src/styles.css",
      cssPath: "src/styles.css",
      componentsJson: "components.json",
      aliases: {
        components: "@/components",
        ui: "@/components/ui",
        lib: "@/lib",
        utils: "@/lib/utils",
      },
      baseLayerExpectation: {
        cssVariables: true,
        imports: ["tailwindcss", "tw-animate-css", "shadcn/tailwind.css"],
        tokens: ["--background", "--foreground", "--border"],
      },
      registryItems: ["card"],
      requiredRegistryItems: ["card"],
      requiredFiles: [
        "components.json",
        "vite.config.ts",
        "src/styles.css",
        "src/lib/utils.ts",
        "src/components/ui/card.tsx",
      ],
      requiredExports: {
        card: ["Card", "CardContent", "CardHeader", "CardTitle"],
      },
      ahtmlGlueProof: await createAhtmlGlueProof(runtimePaths),
      ahtmlManagedUiProof: await createManagedRuntimeUiProof(["card"]),
    }

    const manifest = createManagedRuntimeManifest({
      componentSource: "ahtml-managed-ui",
      packageVersion: "0.2.0-alpha.1",
      paths: runtimePaths,
      preset: "new-york",
      renderer: "shadcn-runtime",
      runtimeBase: "radix",
      runtimeContract,
      runtimeSurface,
      uiLibrary: "shadcn",
      version: 2,
      components: ["card"],
      installMode: "managed",
    })

    await writeFile(
      runtimePaths.manifestPath,
      `${JSON.stringify(manifest, null, 2)}\n`,
    )
    await writeFile(
      runtimePaths.runtimeVerificationPath,
      `${JSON.stringify(
        createRuntimeVerificationState({
          components: ["card"],
          runtimeBase: "radix",
          runtimeContract,
          runtimeSurface,
          version: 1,
        }),
        null,
        2,
      )}\n`,
    )

    await writeFile(
      path.join(runtimePaths.runtimeSrcDir, "host-styles.tsx"),
      "export function createRuntimeHostCss() { return 'drifted' }\n",
    )

    const workflow = await createArtifactWorkflowForTest(runtimePaths)

    await expect(workflow.isManagedRuntimeCurrent(schema)).resolves.toBe(false)
  })
})

async function importArtifactWorkflowModule() {
  return importCliModule<{
    readonly ArtifactWorkflowOutputPathError: new (message: string) => Error
    readonly assertSafeOutputDirectory: (value: {
      readonly inputFilePath: string
      readonly outputDir: string
      readonly userRoot: string
    }) => void
    readonly createArtifactWorkflow: (input: {
      readonly userRoot: string
      readonly defaultOutputDir: string
      readonly packageRoot: string
      readonly runtimePaths: ReturnType<typeof createRuntimePaths>
      readonly readPackageVersion: () => Promise<string>
    }) => {
      readonly isManagedRuntimeCurrent: (schema: unknown) => Promise<boolean>
    }
    readonly createInspection: (document: unknown) => unknown
    readonly formatInspectionSummary: (inspection: {
      readonly configModel?: string
      readonly config?: Record<string, string>
      readonly components?: readonly {
        readonly name: string
        readonly count: number
      }[]
    }) => string
    readonly isManagedRuntimeCurrent: (schema: unknown) => Promise<boolean>
    readonly isRuntimeVerificationCurrent: (input: {
      readonly schema: unknown
      readonly runtimeVerificationState: unknown
    }) => boolean
  }>("artifact-workflow.mjs")
}

async function importRuntimeRenderabilityModule() {
  return importCliModule<{
    readonly readRuntimeVerificationState: (paths: {
      readonly runtimeVerificationPath: string
    }) => Promise<unknown>
  }>("runtime-renderability.mjs")
}

async function importRuntimeContractModule() {
  return importCliModule<{
    readonly createManagedRuntimeManifest: (
      input: Record<string, unknown>,
    ) => Record<string, unknown>
    readonly createRuntimeContractFromSchema: (
      schema: unknown,
    ) => Record<string, unknown>
    readonly createRuntimeVerificationState: (
      input: Record<string, unknown>,
    ) => Record<string, unknown>
  }>("..", "config", "runtime-contract.mjs")
}

async function importRuntimeSurfaceModule() {
  return importCliModule<{
    readonly createAhtmlGlueProof: (
      paths: ReturnType<typeof createRuntimePaths>,
    ) => Promise<Record<string, unknown>>
  }>("runtime-surface.mjs")
}

async function importRuntimeManagedUiModule() {
  return importCliModule<{
    readonly createManagedRuntimeUiProof: (
      components: string[],
    ) => Promise<Record<string, unknown>>
  }>("runtime-managed-ui.mjs")
}

function createRuntimePaths(runtimeRoot: string) {
  return {
    runtimeRoot,
    runtimeDir: path.join(runtimeRoot, "runtime"),
    cacheDir: path.join(runtimeRoot, "cache"),
    logsDir: path.join(runtimeRoot, "logs"),
    configDir: path.join(runtimeRoot, "config"),
    artifactProfilesDir: path.join(runtimeRoot, "config", "artifact-profiles"),
    builtinArtifactProfilesDir: path.join(
      runtimeRoot,
      "config",
      "artifact-profiles",
      "builtin",
    ),
    userArtifactProfilesDir: path.join(
      runtimeRoot,
      "config",
      "artifact-profiles",
      "user",
    ),
    manifestPath: path.join(runtimeRoot, "config", "runtime.json"),
    artifactProfileManifestPath: path.join(
      runtimeRoot,
      "config",
      "artifact-profiles.manifest.json",
    ),
    artifactProfileStatePath: path.join(
      runtimeRoot,
      "config",
      "artifact-profile-state.json",
    ),
    promptUiManifestPath: path.join(
      runtimeRoot,
      "config",
      "prompt-ui.manifest.json",
    ),
    runtimePackageJsonPath: path.join(runtimeRoot, "runtime", "package.json"),
    runtimeVerificationPath: path.join(
      runtimeRoot,
      "runtime",
      "render-verification.generated.json",
    ),
    runtimeViteConfigPath: path.join(
      runtimeRoot,
      "runtime",
      "vite.ahtml.config.mjs",
    ),
    runtimeSsrDir: path.join(runtimeRoot, "runtime", ".ahtml-ssr"),
    runtimeSrcDir: path.join(runtimeRoot, "runtime", "src"),
    runtimeComponentsDir: path.join(
      runtimeRoot,
      "runtime",
      "src",
      "components",
      "ui",
    ),
    generatedDocumentPath: path.join(
      runtimeRoot,
      "runtime",
      "document.generated.json",
    ),
    generatedRuntimeStatePath: path.join(
      runtimeRoot,
      "runtime",
      "runtime-state.generated.json",
    ),
  }
}

async function createArtifactWorkflowForTest(
  runtimePaths: ReturnType<typeof createRuntimePaths>,
) {
  const { createArtifactWorkflow } = await importArtifactWorkflowModule()
  return createArtifactWorkflow({
    userRoot: "D:\\repo",
    defaultOutputDir: "dist",
    packageRoot: "D:\\repo\\packages\\ahtml",
    runtimePaths,
    readPackageVersion: async () => "0.2.0-alpha.1",
  })
}

async function seedRuntimeSurfaceFixture(
  runtimePaths: ReturnType<typeof createRuntimePaths>,
) {
  await mkdir(path.join(runtimePaths.runtimeSrcDir, "lib"), { recursive: true })

  const files = {
    [path.join(runtimePaths.runtimeDir, "components.json")]: JSON.stringify(
      {
        style: "new-york",
        iconLibrary: "lucide",
        tailwind: {
          css: "src/styles.css",
          baseColor: "slate",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          lib: "@/lib",
          utils: "@/lib/utils",
        },
      },
      null,
      2,
    ),
    [path.join(runtimePaths.runtimeDir, "package.json")]: JSON.stringify(
      {
        devDependencies: {
          tailwindcss: "^4.3.0",
        },
      },
      null,
      2,
    ),
    [path.join(runtimePaths.runtimeDir, "vite.config.ts")]:
      'import { defineConfig } from "vite"\nimport react from "@vitejs/plugin-react"\nimport tailwindcss from "@tailwindcss/vite"\nimport path from "node:path"\nconst rootDir = __dirname\nexport default defineConfig({ plugins: [react(), tailwindcss()], resolve: { alias: { "@": path.resolve(rootDir, "./src") } } })\n',
    [path.join(runtimePaths.runtimeSrcDir, "styles.css")]:
      '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n:root{--background:#fff;--foreground:#111;--border:#ddd;}body{background-color:var(--background);color:var(--foreground);}*{border-color:var(--border);}\n',
    [path.join(runtimePaths.runtimeSrcDir, "main.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "app.tsx")]:
      "export function App() { return null }\n",
    [path.join(runtimePaths.runtimeSrcDir, "render-ssr.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "ssr.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "artifact-shell.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "host-styles.tsx")]:
      "export function createRuntimeHostCss() { return '' }\n",
    [path.join(runtimePaths.runtimeSrcDir, "profile-theme.ts")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "lib", "utils.ts")]:
      "export function cn() { return '' }\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "elements.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "kinds.ts")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "parity.ts")]:
      "export {}\n",
    [path.join(
      runtimePaths.runtimeSrcDir,
      "renderer",
      "render-layout-node.tsx",
    )]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "render-node.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "render-ui-node.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "types.ts")]:
      "export type X = {}\n",
    [path.join(runtimePaths.runtimeComponentsDir, "card.tsx")]:
      "export function Card() { return null }\nexport function CardContent() { return null }\nexport function CardHeader() { return null }\nexport function CardTitle() { return null }\n",
  }

  for (const [filePath, source] of Object.entries(files)) {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, `${source}\n`)
  }
}
