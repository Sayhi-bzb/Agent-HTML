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
    const { isRuntimeVerificationCurrent } = await importArtifactWorkflowModule()

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
    const { isRuntimeVerificationCurrent } = await importArtifactWorkflowModule()
    const { readRuntimeVerificationState } =
      await importRuntimeRenderabilityModule()
    const runtimeRoot = await mkdtemp(path.join(tmpdir(), "ahtml-runtime-state-"))
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
})

async function importArtifactWorkflowModule() {
  return importCliModule<{
    readonly ArtifactWorkflowOutputPathError: new (message: string) => Error
    readonly assertSafeOutputDirectory: (value: {
      readonly inputFilePath: string
      readonly outputDir: string
      readonly userRoot: string
    }) => void
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
