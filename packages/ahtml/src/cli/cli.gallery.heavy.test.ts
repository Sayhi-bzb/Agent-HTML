/// <reference types="node" />
// @vitest-environment node

import { spawn } from "node:child_process"
import { mkdtemp, readFile, writeFile } from "node:fs/promises"
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
  writeCurrentArtifactProfileState,
  writeCustomArtifactProfile,
} from "./cli-test-helpers"

const { getRegistryUrl } = useShadcnCliHarness()

type GalleryStatePayload = {
  ok: boolean
  availableArtifactProfileReferences: string[]
  builtinArtifactProfileReferences: string[]
  artifactProfileReference: string
  artifactProfile: {
    id: string
    globalStyle: {
      typography: {
        fontSans: string
      }
    }
    componentStyle: {
      treatments: Record<string, string>
    }
  }
}

describe("agent-html CLI heavy gallery flows", () => {
  it("serves a built-in artifact profile gallery preview", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")

    const preview = spawn(
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
      const url = await waitForPreviewUrl(preview)
      const response = await fetch(url)
      const body = await response.text()

      expect(body).toContain("ahtml-gallery-preset-select-row")
      expect(body).toContain(">report-default</")
      expect(body).toContain("Gallery")
      expect(body).toContain("GitHub")
      expect(body).toContain("Reset")
      expect(body).toContain("Save Profile")
      expect(body).toContain("Colors")
      expect(body).toContain("Typography")
      expect(body).toContain("Other")
      expect(body).toContain("Preset controls")
      expect(body).toContain("Editor theme mode")
      expect(body).toContain("Primary")
      expect(body).toContain("Secondary")
      expect(body).toContain("Border &amp; Input")
      expect(body).toContain("Read-only baseline preset")
      expect(body).toContain("Preview synced")
      expect(body).toContain('data-artifact-profile="report-default"')
      expect(body).toContain('class="ahtml-runtime-host ahtml-gallery-shell"')
      expect(body).toContain('data-gallery-frame="header"')
      expect(body).toContain('data-gallery-frame="controls"')
      expect(body).toContain('data-gallery-frame="preview"')
      expect(body).toContain("Controls")
      expect(body).toContain("Cards")
      expect(body).toContain("Dashboard")
      expect(body).toContain("Mail")
      expect(body).toContain("Pricing")
      expect(body).toContain("Color Palette")
      expect(body).toContain("Mode")
      expect(body).toContain("Draft")
      expect(body).toContain('data-slot="tabs"')
      expect(body).toContain("Cards Preview")
      expect(body).toContain("Component gallery")
      expect(body).toContain(
        "Component families rendered as a workbench matrix",
      )
      expect(body).toContain("Content family")
      expect(body).toContain("Forms family")
      expect(body).toContain("Selection family")
      expect(body).toContain("Collaboration family")
      expect(body).toContain("Revenue Pulse")
      expect(body).toContain("Create Account")
      expect(body).toContain("Surface Audit")
      expect(body).toContain("report-card")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("supports gallery state, create, save, select, and delete flows", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")
    const userProfilePath = path.join(
      runtimeHome,
      "config",
      "artifact-profiles",
      "user",
      "team-ops.json",
    )

    const preview = spawn(
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
      const url = await waitForPreviewUrl(preview)
      const stateResponse = await fetch(`${url}/__ahtml/gallery/state`)
      const initialState = (await stateResponse.json()) as GalleryStatePayload

      expect(initialState.ok).toBe(true)
      expect(initialState.artifactProfileReference).toBe("report-default")
      expect(initialState.availableArtifactProfileReferences).toContain(
        "report-default",
      )
      expect(initialState.builtinArtifactProfileReferences).toEqual(
        expect.arrayContaining([
          "report-default",
          "ops-compact",
          "review-dense",
        ]),
      )

      const createResponse = await fetch(`${url}/__ahtml/gallery/create`, {
        body: JSON.stringify({
          artifactProfileReference: "team-ops",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const createdState = (await createResponse.json()) as GalleryStatePayload

      expect(createResponse.ok).toBe(true)
      expect(createdState.ok).toBe(true)
      expect(createdState.artifactProfileReference).toBe("team-ops")
      expect(createdState.availableArtifactProfileReferences).toContain("team-ops")

      const savedProfile = {
        ...createdState.artifactProfile,
        globalStyle: {
          ...createdState.artifactProfile.globalStyle,
          typography: {
            ...createdState.artifactProfile.globalStyle.typography,
            fontSans: '"IBM Plex Sans", sans-serif',
          },
        },
        componentStyle: {
          ...createdState.artifactProfile.componentStyle,
          treatments: {
            ...createdState.artifactProfile.componentStyle.treatments,
            card: "team-card",
          },
        },
      }
      const saveResponse = await fetch(`${url}/__ahtml/gallery/save`, {
        body: JSON.stringify({
          artifactProfile: savedProfile,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const savedState = (await saveResponse.json()) as GalleryStatePayload

      expect(saveResponse.ok).toBe(true)
      expect(savedState.ok).toBe(true)
      expect(savedState.artifactProfileReference).toBe("team-ops")
      expect(savedState.artifactProfile.globalStyle.typography.fontSans).toBe(
        '"IBM Plex Sans", sans-serif',
      )
      expect(savedState.artifactProfile.componentStyle.treatments.card).toBe(
        "team-card",
      )

      const savedProfileSource = await readFile(userProfilePath, "utf8")
      expect(savedProfileSource).toContain(
        '"fontSans": "\\"IBM Plex Sans\\", sans-serif"',
      )
      expect(savedProfileSource).toContain('"card": "team-card"')

      const selectResponse = await fetch(`${url}/__ahtml/gallery/select`, {
        body: JSON.stringify({
          artifactProfileReference: "report-default",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const selectedState = (await selectResponse.json()) as GalleryStatePayload

      expect(selectResponse.ok).toBe(true)
      expect(selectedState.ok).toBe(true)
      expect(selectedState.artifactProfileReference).toBe("report-default")

      const deleteResponse = await fetch(`${url}/__ahtml/gallery/delete`, {
        body: JSON.stringify({
          artifactProfileReference: "team-ops",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const deletedState = (await deleteResponse.json()) as GalleryStatePayload

      expect(deleteResponse.ok).toBe(true)
      expect(deletedState.ok).toBe(true)
      expect(deletedState.artifactProfileReference).toBe("report-default")
      expect(deletedState.availableArtifactProfileReferences).not.toContain(
        "team-ops",
      )
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("rejects builtin artifact profile mutations through gallery APIs", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")

    const preview = spawn(
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
      const url = await waitForPreviewUrl(preview)
      const stateResponse = await fetch(`${url}/__ahtml/gallery/state`)
      const initialState = (await stateResponse.json()) as GalleryStatePayload

      const saveResponse = await fetch(`${url}/__ahtml/gallery/save`, {
        body: JSON.stringify({
          artifactProfile: {
            ...initialState.artifactProfile,
            id: "report-default",
          },
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const saveResult = (await saveResponse.json()) as {
        ok: boolean
        error?: string
      }

      expect(saveResponse.ok).toBe(false)
      expect(saveResult.ok).toBe(false)
      expect(saveResult.error).toContain(
        'Cannot save built-in artifact profile "report-default"',
      )

      const deleteResponse = await fetch(`${url}/__ahtml/gallery/delete`, {
        body: JSON.stringify({
          artifactProfileReference: "report-default",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const deleteResult = (await deleteResponse.json()) as {
        ok: boolean
        error?: string
      }

      expect(deleteResponse.ok).toBe(false)
      expect(deleteResult.ok).toBe(false)
      expect(deleteResult.error).toContain(
        'Cannot delete built-in artifact profile "report-default"',
      )
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("serves user artifact profile galleries from AHTML_HOME storage", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")

    await writeCustomArtifactProfile(runtimeHome)
    await writeCurrentArtifactProfileState(runtimeHome, "team-ops")

    const preview = spawn(
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
      const url = await waitForPreviewUrl(preview)
      const response = await fetch(url)
      const body = await response.text()

      expect(body).toContain("ahtml-gallery-preset-select-row")
      expect(body).toContain(">team-ops</")
      expect(body).toContain('data-artifact-profile="team-ops"')
      expect(body).toContain('data-ahtml-treatment="review-card"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
      expect(body).toContain("Artifact profile gallery ready.")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("uses the selected current profile for preview when the document omits profile-ref", async () => {
    const tempDir = await mkdtemp(path.join(tmpdir(), "agent-html-cli-"))
    const runtimeHome = path.join(tempDir, ".ahtml")
    const previewOutputDir = path.join(tempDir, "preview")
    const inputPath = path.join(tempDir, "artifact.agent.html")

    await writeCustomArtifactProfile(runtimeHome)
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
          artifactProfileReference: "team-ops",
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
      [cliPath, "preview", inputPath, "--out", previewOutputDir, "--port", "0"],
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

      expect(body).toContain('data-artifact-profile="team-ops"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)
})
