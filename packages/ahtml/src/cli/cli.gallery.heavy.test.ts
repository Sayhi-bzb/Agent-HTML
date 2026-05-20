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
  writeCurrentStyleProfileState,
  writeCustomStyleProfile,
} from "./cli-test-helpers"

const { getRegistryUrl } = useShadcnCliHarness()

describe("agent-html CLI heavy gallery flows", () => {
  it("serves a built-in style gallery preview", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")

    const preview = spawn(
      process.execPath,
      [
        cliPath,
        "gallery",
        "--port",
        "0",
      ],
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

      expect(body).toContain("<h1>report-default</h1>")
      expect(body).toContain("AHTML Gallery")
      expect(body).toContain("Showcase canvas")
      expect(body).toContain("Current style id")
      expect(body).toContain("New Style Id")
      expect(body).toContain("Save Current Style")
      expect(body).toContain('data-style-profile="report-default"')
      expect(body).toContain(
        'class="ahtml-runtime-host ahtml-gallery-shell"',
      )
      expect(body).toContain('data-slot="tabs"')
      expect(body).toContain('data-slot="table"')
      expect(body).toContain("Showcase canvas")
      expect(body).toContain("report-card")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("serves user style galleries from AHTML_HOME storage", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")

    await writeCustomStyleProfile(runtimeHome)
    await writeCurrentStyleProfileState(runtimeHome, "team-ops")

    const preview = spawn(
      process.execPath,
      [
        cliPath,
        "gallery",
        "--port",
        "0",
      ],
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

      expect(body).toContain("<h1>team-ops</h1>")
      expect(body).toContain('data-style-profile="team-ops"')
      expect(body).toContain('data-ahtml-treatment="review-card"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
      expect(body).toContain("Style gallery ready.")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("uses the selected current style for preview when the document omits style-ref", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")
    const previewOutputDir = path.join(tempDir, "preview")
    const inputPath = path.join(tempDir, "artifact.agent.html")

    await writeCustomStyleProfile(runtimeHome)
    await writeFile(
      inputPath,
      '<page title="Preview Current Style"><card title="Summary">Ready.</card></page>',
    )

    const gallery = spawn(
      process.execPath,
      [cliPath, "gallery", "--port", "0"],
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
      const galleryUrl = await waitForPreviewUrl(gallery)
      await fetch(`${galleryUrl}/__ahtml/gallery/select`, {
        body: JSON.stringify({
          styleReference: "team-ops",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
    } finally {
      gallery.kill("SIGTERM")
      await waitForProcessExit(gallery)
    }

    const preview = spawn(
      process.execPath,
      [
        cliPath,
        "preview",
        inputPath,
        "--out",
        previewOutputDir,
        "--port",
        "0",
      ],
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

      expect(body).toContain('data-style-profile="team-ops"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)
})
