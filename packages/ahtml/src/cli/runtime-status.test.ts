/// <reference types="node" />
// @vitest-environment node

import { mkdir, mkdtemp, readFile, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { vi } from "vitest"

import { afterEach, describe, expect, it } from "vitest"

import { importCliModule, removeTempDir } from "./cli-test-helpers"

const tempDirs: string[] = []

afterEach(async () => {
  while (tempDirs.length > 0) {
    const dir = tempDirs.pop()

    if (dir) {
      await removeTempDir(dir)
    }
  }
})

describe("withRuntimeBuildLock", () => {
  it("serializes concurrent runtime build critical sections", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-runtime-"))
    tempDirs.push(tempDir)
    const { getRuntimePaths } = await importCliModule<{
      readonly getRuntimePaths: (
        env?: NodeJS.ProcessEnv,
      ) => {
        readonly runtimeRoot: string
      }
    }>("runtime-paths.mjs")
    const { withRuntimeBuildLock } = await importCliModule<{
      readonly withRuntimeBuildLock: <T>(
        paths: { readonly runtimeRoot: string },
        action: () => Promise<T>,
      ) => Promise<T>
    }>("runtime-status.mjs")
    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: tempDir,
    })
    const timeline: string[] = []
    let activeCount = 0
    let maxActiveCount = 0

    await Promise.all([
      withRuntimeBuildLock(runtimePaths, async () => {
        timeline.push("first:start")
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        await new Promise((resolve) => setTimeout(resolve, 120))
        activeCount -= 1
        timeline.push("first:end")
      }),
      withRuntimeBuildLock(runtimePaths, async () => {
        timeline.push("second:start")
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        activeCount -= 1
        timeline.push("second:end")
      }),
    ])

    expect(maxActiveCount).toBe(1)
    expect(timeline).toHaveLength(4)
    expect(timeline).toContain("first:start")
    expect(timeline).toContain("first:end")
    expect(timeline).toContain("second:start")
    expect(timeline).toContain("second:end")
  })

  it("serializes setup bootstrap through the same runtime build lock", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-runtime-"))
    tempDirs.push(tempDir)
    const { getRuntimePaths } = await importCliModule<{
      readonly getRuntimePaths: (
        env?: NodeJS.ProcessEnv,
      ) => {
        readonly runtimeRoot: string
      }
    }>("runtime-paths.mjs")
    const runtimeStatusModule = await importCliModule<{
      readonly bootstrapManagedRuntimeWithLock: (options: {
        readonly bootstrap?: (options: {
          readonly packageVersion: string
        }) => Promise<unknown>
        readonly packageRoot: string
        readonly packageVersion: string
        readonly paths: { readonly runtimeRoot: string }
        readonly schema: Record<string, unknown>
        readonly setup: Record<string, unknown>
      }) => Promise<unknown>
    }>("runtime-status.mjs")

    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: tempDir,
    })
    const timeline: string[] = []
    let activeCount = 0
    let maxActiveCount = 0
    const planQueue = [
      { label: "first", delayMs: 120 },
      { label: "second", delayMs: 0 },
    ]
    const bootstrapSpy = vi.fn(async ({ packageVersion }: { packageVersion: string }) => {
        const nextPlan = planQueue.shift()
        if (!nextPlan) {
          throw new Error("Missing bootstrap plan entry.")
        }

        timeline.push(`${nextPlan.label}:start`)
        activeCount += 1
        maxActiveCount = Math.max(maxActiveCount, activeCount)
        await new Promise((resolve) => setTimeout(resolve, nextPlan.delayMs))
        activeCount -= 1
        timeline.push(`${nextPlan.label}:end`)
        return {
          packageVersion,
        }
      })
    const guardedBootstrap = (label: string) =>
      runtimeStatusModule.bootstrapManagedRuntimeWithLock({
        bootstrap: bootstrapSpy,
        packageRoot: process.cwd(),
        packageVersion: `${label}-test`,
        paths: runtimePaths,
        schema: {},
        setup: {
          componentSource: "test",
          components: [],
          preset: "custom",
        },
      })

    await Promise.all([
      guardedBootstrap("first"),
      guardedBootstrap("second"),
    ])

    expect(bootstrapSpy).toHaveBeenCalledTimes(2)
    expect(maxActiveCount).toBe(1)
    expect(timeline).toEqual([
      "first:start",
      "first:end",
      "second:start",
      "second:end",
    ])
  })

  it("marks runtime not ready when builtin artifact profile storage drifts from current source", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-runtime-"))
    tempDirs.push(tempDir)
    const { getRuntimePaths } = await importCliModule<{
      readonly getRuntimePaths: (
        env?: NodeJS.ProcessEnv,
      ) => ReturnType<typeof createRuntimePathsFixture>
    }>("runtime-paths.mjs")
    const { getRuntimeStatus } = await importCliModule<{
      readonly getRuntimeStatus: (options: {
        readonly paths: ReturnType<typeof createRuntimePathsFixture>
      }) => Promise<{
        readonly ready: boolean
        readonly runtimeDetail: string
      }>
    }>("runtime-status.mjs")
    const { writeArtifactProfileStorage } = await importCliModule<{
      readonly writeArtifactProfileStorage: (
        paths: ReturnType<typeof createRuntimePathsFixture>,
      ) => Promise<unknown>
    }>("artifact-profile-storage.mjs")

    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: tempDir,
    })

    await mkdir(path.join(runtimePaths.runtimeSrcDir, "renderer"), {
      recursive: true,
    })
    await mkdir(runtimePaths.runtimeComponentsDir, { recursive: true })
    await mkdir(runtimePaths.configDir, { recursive: true })
    await seedRuntimeStatusFixture(runtimePaths)
    await writeArtifactProfileStorage(runtimePaths)

    const builtinProfilePath = path.join(
      runtimePaths.builtinArtifactProfilesDir,
      "shadcn-default.json",
    )
    const persistedProfile = JSON.parse(
      await readFile(builtinProfilePath, "utf8"),
    )
    persistedProfile.globalLayout.frame.frameMaxWidth = "72rem"
    persistedProfile.componentLayout.frame.maxWidth = "72rem"
    persistedProfile.globalStyle.tokenSets.light.background = "#f7f7f5"
    await writeFile(
      builtinProfilePath,
      `${JSON.stringify(persistedProfile, null, 2)}\n`,
    )

    const status = await getRuntimeStatus({ paths: runtimePaths })

    expect(status.ready).toBe(false)
    expect(status.runtimeDetail).toMatch(
      /artifact profile storage file "shadcn-default" does not match the current built-in profile/i,
    )
  })
})

function createRuntimePathsFixture(runtimeRoot: string) {
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

async function seedRuntimeStatusFixture(
  runtimePaths: ReturnType<typeof createRuntimePathsFixture>,
) {
  await mkdir(path.join(runtimePaths.runtimeSrcDir, "lib"), { recursive: true })

  const files = {
    [path.join(runtimePaths.runtimeDir, "components.json")]: JSON.stringify(
      {
        style: "nova",
        iconLibrary: "radix",
        tailwind: {
          css: "src/styles.css",
          baseColor: "neutral",
          cssVariables: true,
        },
        aliases: {
          components: "@/components",
          ui: "@/components/ui",
          lib: "@/lib",
          hooks: "@/hooks",
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
    [runtimePaths.runtimeViteConfigPath]: "export default {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "styles.css")]:
      '@import "tailwindcss";\n@import "tw-animate-css";\n@import "shadcn/tailwind.css";\n:root{--background:oklch(1 0 0);--foreground:oklch(0.145 0 0);--border:oklch(0.922 0 0);}body{background-color:var(--background);color:var(--foreground);}*{border-color:var(--border);}\n',
    [path.join(runtimePaths.runtimeSrcDir, "main.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "app.tsx")]:
      "export function App() { return null }\n",
    [path.join(runtimePaths.runtimeSrcDir, "render-ssr.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "ssr.tsx")]: "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "artifact-shell.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "host-styles.tsx")]:
      "export function createRuntimeHostCss() { return '' }\n",
    [path.join(runtimePaths.runtimeSrcDir, "profile-theme.ts")]:
      "export function createDocumentStyleCss() { return '' }\n",
    [path.join(runtimePaths.runtimeSrcDir, "lib", "utils.ts")]:
      "export function cn() { return '' }\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "elements.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "kinds.ts")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "parity.ts")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "render-layout-node.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "render-node.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "render-ui-node.tsx")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeSrcDir, "renderer", "types.ts")]:
      "export {}\n",
    [path.join(runtimePaths.runtimeComponentsDir, "card.tsx")]:
      "export function Card() { return null }\nexport function CardContent() { return null }\nexport function CardHeader() { return null }\nexport function CardTitle() { return null }\n",
    [runtimePaths.promptUiManifestPath]: JSON.stringify(
      { kind: "prompt-ui-manifest" },
      null,
      2,
    ),
    [runtimePaths.manifestPath]: JSON.stringify(
      createRuntimeManifestFixture(),
      null,
      2,
    ),
    [runtimePaths.runtimeVerificationPath]: JSON.stringify(
      {
        kind: "ahtml-runtime-render-verification",
        version: 1,
        runtimeBase: "radix",
        renderableAgentComponents: ["card"],
        verificationData: {
          version: 1,
          components: [
            {
              name: "card",
              renderKind: "compound",
              source: "shadcn",
              props: [],
              slots: [],
            },
          ],
        },
        rendererMapping: {
          version: 1,
          components: [
            {
              name: "card",
              renderKind: "compound",
              source: "shadcn",
              kind: "compound",
              root: "Card",
              contentLayout: "default",
              childMode: "block",
              textMode: "prose",
              slots: [],
            },
          ],
        },
        shadcnRuntimeSurface: createRuntimeManifestFixture().shadcnRuntimeSurface,
      },
      null,
      2,
    ),
  }

  for (const [filePath, source] of Object.entries(files)) {
    await mkdir(path.dirname(filePath), { recursive: true })
    await writeFile(filePath, `${source}\n`)
  }
}

function createRuntimeManifestFixture() {
  const runtimeCapability = {
    version: 1,
    renderableAgentComponents: ["card"],
    verificationData: {
      version: 1,
      components: [
        {
          name: "card",
          renderKind: "compound",
          source: "shadcn",
          props: [],
          slots: [],
        },
      ],
    },
    rendererMapping: {
      version: 1,
      components: [
        {
          name: "card",
          renderKind: "compound",
          source: "shadcn",
          kind: "compound",
          root: "Card",
          contentLayout: "default",
          childMode: "block",
          textMode: "prose",
          slots: [],
        },
      ],
    },
  }

  return {
    kind: "ahtml-managed-runtime",
    version: 2,
    renderer: "shadcn-runtime",
    runtimeBase: "radix",
    preset: "nova",
    runtimeCapability,
    components: ["card"],
    installedUiComponents: ["card"],
    renderableAgentComponents: runtimeCapability.renderableAgentComponents,
    shadcnRuntimeSurface: {
      source: "ahtml-managed-runtime",
      template: "vite",
      preset: "nova",
      style: "nova",
      base: "radix",
      iconLibrary: "radix",
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
        hooks: "@/hooks",
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
      ahtmlGlueProof: {
        algorithm: "sha256",
        files: {},
      },
      ahtmlManagedUiProof: {
        algorithm: "sha256",
        files: {},
        reasons: {},
      },
    },
  }
}
