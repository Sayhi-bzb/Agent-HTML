/// <reference types="node" />
// @vitest-environment node

import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  expectCliFailure,
  expectPathMissing,
  importCommandMetadata,
  readRepoSource,
  useShadcnCliHarness,
  useTemporaryDirectories,
} from "./cli-test-helpers"

const { runCliWithServer } = useShadcnCliHarness()
const temporaryDirectories = useTemporaryDirectories()

describe("cli surface contracts", () => {
  it("prints global and command help for the managed runtime workflow", async () => {
    const defaultHelp = await runCliWithServer([])
    const longHelp = await runCliWithServer(["--help"])
    const shortHelp = await runCliWithServer(["-h"])
    const namedHelp = await runCliWithServer(["help"])

    for (const result of [defaultHelp, longHelp, shortHelp, namedHelp]) {
      expect(result.stdout).toContain("Main workflow:")
      expect(result.stdout).toContain("ahtml prompt")
      expect(result.stdout).toContain("ahtml build artifact.agent.html")
      expect(result.stdout).toContain("ahtml preview artifact.agent.html")
      expect(result.stdout).toContain("ahtml gallery")
      expect(result.stdout).not.toContain("agent-html.project.json")
      expect(result.stdout).not.toContain("--scaffold")
    }

    const { commandMetadata } = await importCommandMetadata()
    const commands = Object.keys(commandMetadata)
    for (const command of commands) {
      const { stdout } = await runCliWithServer([command, "--help"])

      expect(stdout).toContain(`ahtml ${command}`)
      expect(stdout).toContain("Usage:")
    }
  }, 30000)

  it("keeps the README quick-start commands aligned with the CLI", async () => {
    const readme = await readRepoSource("README.md")

    expect(readme).toContain("ahtml prompt")
    expect(readme).toContain("ahtml build artifact.agent.html")
    expect(readme).toContain("ahtml preview artifact.agent.html")
    expect(readme).toContain("ahtml gallery")
  })

  it("rejects the removed init command without creating project files", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".custom-ahtml")

    await expectCliFailure(
      runCliWithServer(["init"], { AHTML_HOME: runtimeHome }, tempDir),
      'Unknown command "init"',
    )
    await expectCliFailure(
      runCliWithServer(
        ["init", "--dry-run"],
        { AHTML_HOME: runtimeHome },
        tempDir,
      ),
      'Unknown command "init"',
    )
    await expectPathMissing(path.join(tempDir, "agent-html.project.json"))
    await expectPathMissing(path.join(tempDir, "src"))
  })

  it("prints first-run guidance without bootstrapping in non-interactive help", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")

    const help = await runCliWithServer(
      [],
      { AHTML_HOME: runtimeHome },
      tempDir,
    )

    expect(help.stdout).toContain("Main workflow:")
    expect(help.stdout).toContain("Run ahtml setup to prepare the runtime.")
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
    await expectPathMissing(path.join(tempDir, "src"))
  })

  it("rejects invalid input and flags clearly", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const inputPath = path.join(tempDir, "artifact.agent.html")
    const outputDir = path.join(tempDir, "html")

    await import("node:fs/promises").then(({ writeFile }) =>
      writeFile(inputPath, '<page title="Bad"><card className="x" /></page>'),
    )

    await expectCliFailure(
      runCliWithServer(["build", inputPath, "--out", outputDir], {}, tempDir),
      "unknown-attr",
    )
    await expectCliFailure(
      runCliWithServer(["build", inputPath, "--format", "yaml"], {}, tempDir),
      'build --format must be "text" or "json".',
    )
    await expectCliFailure(
      runCliWithServer(["preview", inputPath], {}, tempDir),
      "unknown-attr",
    )
    await expectCliFailure(
      runCliWithServer(["gallery", "extra"], {}, tempDir),
      'Unexpected argument "extra".',
    )
    await expectCliFailure(
      runCliWithServer(["gallery", "--port", "bad"], {}, tempDir),
      "gallery --port must be an integer from 0 to 65535.",
    )
    await expectPathMissing(path.join(outputDir, "index.html"))
    await expectCliFailure(
      runCliWithServer(["prompt", "--format"]),
      "--format requires",
    )
    await expectCliFailure(
      runCliWithServer(["init", "--scaffold"], {}, tempDir),
      'Unknown command "init"',
    )
    await expectCliFailure(
      runCliWithServer(["compose", "--input", "composition.json"], {}, tempDir),
      'Unknown command "compose"',
    )
    await expectCliFailure(
      runCliWithServer(["schema"], {}, tempDir),
      'Unknown command "schema"',
    )
    await expectCliFailure(
      runCliWithServer(
        ["validate", "--input", inputPath, "--format", "yaml"],
        {},
        tempDir,
      ),
      'validate --format must be "text" or "json".',
    )
    await expectCliFailure(
      runCliWithServer(["validate"], {}, tempDir),
      "validate requires --input <path>.",
    )
  })

  it("rejects the removed gallery --style-ref argument", async () => {
    const tempDir = await temporaryDirectories.create("agent-html-cli-")
    const runtimeHome = path.join(tempDir, ".ahtml")

    await expectCliFailure(
      runCliWithServer(
        ["gallery", "--style-ref", "team-missing"],
        { AHTML_HOME: runtimeHome },
        tempDir,
      ),
      "does not accept --style-ref",
    )
    await expectPathMissing(path.join(runtimeHome, "config", "runtime.json"))
  })
})
