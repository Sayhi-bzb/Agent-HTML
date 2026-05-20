/// <reference types="node" />
// @vitest-environment node

import { writeFile } from "node:fs/promises"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  expectCliFailure,
  expectPathMissing,
  importValidateModule,
  parseJson,
  root,
  useShadcnCliHarness,
  useTemporaryDirectories,
  validAgentHtmlFixtures,
  writeCurrentStyleProfileState,
  writeCustomStyleProfile,
} from "./cli-test-helpers"

const { runCliWithServer } = useShadcnCliHarness()
const temporaryDirectories = useTemporaryDirectories()

describe("validate and inspect contracts", () => {
  it("returns structured validation results without bootstrapping the runtime", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")
    const validInputPath = path.join(tempDir, "valid.agent.html")
    const invalidInputPath = path.join(tempDir, "invalid.agent.html")

    await writeFile(
      validInputPath,
      '<page title="Valid"><card title="Summary">Ready.</card></page>',
    )
    await writeFile(
      invalidInputPath,
      '<page title="Bad"><card className="x" /></page>',
    )

    const validResult = await runCliWithServer(
      ["validate", "--input", validInputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )
    const parsedValidResult = parseJson<{
      kind: string
      ok: boolean
      inspection?: { components: Array<{ name: string; count: number }> }
    }>(validResult.stdout)
    expect(parsedValidResult.kind).toBe("agent-html-validation-result")
    expect(parsedValidResult.ok).toBe(true)
    expect(parsedValidResult.inspection?.components).toEqual([
      { name: "card", count: 1 },
      { name: "page", count: 1 },
    ])
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))

    const invalidResult = await runCliWithServer(
      ["validate", "--input", invalidInputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    ).catch((error) => error)
    const invalidStdout: string =
      invalidResult &&
      typeof invalidResult === "object" &&
      "stdout" in invalidResult &&
      typeof invalidResult.stdout === "string"
        ? invalidResult.stdout
        : ""
    const parsedInvalidResult = parseJson<{
      kind: string
      ok: boolean
      diagnostics?: Array<{ code: string; severity: string }>
    }>(invalidStdout)
    expect(parsedInvalidResult.kind).toBe("agent-html-validation-result")
    expect(parsedInvalidResult.ok).toBe(false)
    expect(parsedInvalidResult.diagnostics).toEqual(
      expect.arrayContaining([
        expect.objectContaining({
          code: "unknown-attr",
          severity: "error",
        }),
      ]),
    )
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
  })

  it("fails inspect with validation diagnostics before runtime inspection", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")
    const invalidInputPath = path.join(tempDir, "invalid.agent.html")

    await writeFile(
      invalidInputPath,
      '<page title="Bad"><card className="x" /></page>',
    )

    await expectCliFailure(
      runCliWithServer(
        ["inspect", "--input", invalidInputPath],
        { AHTML_HOME: runtimeHome },
        tempDir,
      ),
      "Cannot inspect an invalid agent-html document.",
    )
    await expectCliFailure(
      runCliWithServer(
        ["inspect", "--input", invalidInputPath],
        { AHTML_HOME: runtimeHome },
        tempDir,
      ),
      "unknown-attr",
    )
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
  })

  it("validates and inspects user style profiles from runtime storage without bootstrapping the runtime", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")
    const inputPath = path.join(tempDir, "team-ops.agent.html")

    await writeCustomStyleProfile(runtimeHome)
    await writeFile(
      inputPath,
      [
        '<meta-agent style-ref="team-ops" />',
        '<page title="Team Ops"><card title="Summary">Ready.</card></page>',
      ].join("\n"),
    )

    const validation = await runCliWithServer(
      ["validate", "--input", inputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )
    const parsedValidation = parseJson<{
      kind: string
      ok: boolean
      inspection?: {
        config: { documentStyleConfigReference: string }
      }
    }>(validation.stdout)
    expect(parsedValidation.kind).toBe("agent-html-validation-result")
    expect(parsedValidation.ok).toBe(true)
    expect(parsedValidation.inspection?.config.documentStyleConfigReference).toBe(
      "team-ops",
    )
    expect(validation.stdout).not.toContain("resolvedDocumentStyleTokens")

    const inspection = await runCliWithServer(
      ["inspect", "--input", inputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )
    expect(inspection.stdout).toContain(
      '"documentStyleConfigReference": "team-ops"',
    )
    expect(inspection.stdout).not.toContain('"resolvedDocumentStyleTokens"')
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
  })

  it("falls back to the default profile for unresolved runtime style references in validate", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")
    const inputPath = path.join(tempDir, "fallback.agent.html")

    await writeFile(
      inputPath,
      [
        '<meta-agent style-ref="team-missing" />',
        '<page title="Fallback"><card title="Summary">Default profile.</card></page>',
      ].join("\n"),
    )

    const validation = await runCliWithServer(
      ["validate", "--input", inputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )
    const parsedValidation = parseJson<{
      ok: boolean
      diagnostics?: Array<{ code: string; severity: string; message?: string }>
      inspection?: {
        config: { documentStyleConfigReference: string }
      }
    }>(validation.stdout)

    expect(parsedValidation.ok).toBe(true)
    expect(parsedValidation.inspection?.config.documentStyleConfigReference).toBe(
      "report-default",
    )
    expect(parsedValidation.diagnostics).toEqual([
      expect.objectContaining({
        code: "unknown-style-ref",
        severity: "warning",
      }),
    ])
    expect(validation.stdout).not.toContain("resolvedDocumentStyleTokens")
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
  })

  it("uses the current runtime style for validate when the document omits style-ref", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")
    const inputPath = path.join(tempDir, "runtime-default.agent.html")

    await writeCustomStyleProfile(runtimeHome)
    await writeCurrentStyleProfileState(runtimeHome, "team-ops")
    await writeFile(
      inputPath,
      '<page title="Runtime Default"><card title="Summary">Current style.</card></page>',
    )

    const validation = await runCliWithServer(
      ["validate", "--input", inputPath, "--format", "json"],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )
    const parsedValidation = parseJson<{
      ok: boolean
      diagnostics?: Array<{ code: string; severity: string; message?: string }>
      inspection?: {
        config: { documentStyleConfigReference: string }
      }
    }>(validation.stdout)

    expect(parsedValidation.ok).toBe(true)
    expect(parsedValidation.inspection?.config.documentStyleConfigReference).toBe(
      "team-ops",
    )
    expect(parsedValidation.diagnostics).toEqual([
      expect.objectContaining({
        code: "missing-style-ref",
        severity: "warning",
      }),
    ])
  })

  it("accepts representative agent-html fixtures", async () => {
    const { validateAgentHtmlSource } = await importValidateModule()

    for (const source of validAgentHtmlFixtures) {
      const validation = await validateAgentHtmlSource(source, root)

      expect(
        validation.diagnostics.filter(
          (diagnostic: { severity: string }) => diagnostic.severity === "error",
        ),
        source,
      ).toEqual([])
    }
  })
})
