/// <reference types="node" />
// @vitest-environment node

import { spawn } from "node:child_process"
import { mkdtemp, writeFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { describe, expect, it } from "vitest"

import {
  cliPath,
  createCliEnv,
  removeTempDir,
  useShadcnCliHarness,
  waitForPreviewUrl,
  waitForProcessExit,
  writeCustomStyleProfile,
} from "./cli-test-helpers"

const { getRegistryUrl } = useShadcnCliHarness()

describe("agent-html CLI heavy preview flows", () => {
  it("serves a preview from the generated static output", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")
    const inputPath = path.join(tempDir, "artifact.agent.html")
    const outputDir = path.join(tempDir, "html")

    await writeFile(
      inputPath,
      [
        '<meta-agent style-ref="ops-compact" />',
        '<page title="CLI Preview">',
        '  <card title="Overview">',
        '    <alert title="State" variant="destructive">Preview by CLI</alert>',
        '    <badge variant="secondary">Ready</badge>',
        "    <tabs>",
        '      <tab value="summary" label="Summary">',
        "        <table>",
        "          <row><cell>Layer</cell><cell>Status</cell></row>",
        "          <row><cell>Preview</cell><cell>Ready</cell></row>",
        "        </table>",
        "      </tab>",
        "    </tabs>",
        "  </card>",
        "</page>",
      ].join("\n"),
    )

    const preview = spawn(
      process.execPath,
      [cliPath, "preview", inputPath, "--out", outputDir, "--port", "0"],
      {
        cwd: tempDir,
        env: createCliEnv(
          {
            AHTML_HOME: runtimeHome,
          },
          getRegistryUrl(),
        ),
        stdio: ["ignore", "pipe", "pipe"],
      },
    )

    try {
      const url = await waitForPreviewUrl(preview)
      const response = await fetch(url)
      const body = await response.text()

      expect(body).toContain("Preview by CLI")
      expect(body).toContain("Overview")
      expect(body).toContain(
        'rel="icon" type="image/svg+xml" href="./ghost.svg"',
      )
      expect(body).toContain('data-style-profile="ops-compact"')
      expect(body).toContain('data-slot="alert"')
      expect(body).toContain('data-slot="badge"')
      expect(body).toContain('data-slot="tabs"')
      expect(body).toContain('data-slot="table"')
      expect(body).toContain('class="ahtml-runtime-host ahtml-runtime-document"')
      expect(body).not.toContain('tone="')
      expect(body).not.toContain('kind="')
      expect(body).not.toContain('default="')
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("serves previews for user style profiles stored under AHTML_HOME", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")
    const inputPath = path.join(tempDir, "team-ops.agent.html")
    const outputDir = path.join(tempDir, "html")

    await writeCustomStyleProfile(runtimeHome)
    await writeFile(
      inputPath,
      [
        '<meta-agent style-ref="team-ops" />',
        '<page title="Team Preview"><card title="Summary">Preview by user profile.</card></page>',
      ].join("\n"),
    )

    const preview = spawn(
      process.execPath,
      [cliPath, "preview", inputPath, "--out", outputDir, "--port", "0"],
      {
        cwd: tempDir,
        env: createCliEnv(
          {
            AHTML_HOME: runtimeHome,
          },
          getRegistryUrl(),
        ),
        stdio: ["ignore", "pipe", "pipe"],
      },
    )

    try {
      const url = await waitForPreviewUrl(preview)
      const response = await fetch(url)
      const body = await response.text()

      expect(body).toContain("Team Preview")
      expect(body).toContain('data-style-profile="team-ops"')
      expect(body).toContain('class="ahtml-runtime-host ahtml-runtime-document"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)
})
