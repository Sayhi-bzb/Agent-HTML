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
  writeCurrentStyleProfileState,
  writeCustomStyleProfile,
} from "./cli-test-helpers"

const { getRegistryUrl } = useShadcnCliHarness()

type GalleryStatePayload = {
  ok: boolean
  availableStyleReferences: string[]
  styleReference: string
  styleProfile: {
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
  it("serves a built-in style gallery preview", async () => {
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

      expect(body).toContain("ahtml-gallery-hero-title")
      expect(body).toContain(">report-default</")
      expect(body).toContain("AHTML Gallery")
      expect(body).toContain("Component gallery")
      expect(body).toContain("GitHub")
      expect(body).toContain("Current style id")
      expect(body).toContain("New Style Id")
      expect(body).toContain("Reset Draft")
      expect(body).toContain("Save Current Style")
      expect(body).toContain("Typography")
      expect(body).toContain("Light Tokens")
      expect(body).toContain("Dark Tokens")
      expect(body).toContain("Treatments")
      expect(body).toContain("Persist")
      expect(body).toContain("Active style")
      expect(body).toContain("Preview mode")
      expect(body).toContain('data-style-profile="report-default"')
      expect(body).toContain('class="ahtml-runtime-host ahtml-gallery-shell"')
      expect(body).toContain('data-gallery-frame="header"')
      expect(body).toContain('data-gallery-frame="controls"')
      expect(body).toContain('data-gallery-frame="preview"')
      expect(body).toContain("Controls")
      expect(body).toContain('value="components"')
      expect(body).toContain("Component gallery workbench")
      expect(body).toContain('data-slot="tabs"')
      expect(body).toContain('data-slot="table"')
      expect(body).toContain("Feedback Gallery")
      expect(body).toContain("Content Gallery")
      expect(body).toContain("Form Gallery")
      expect(body).toContain("Overlay Gallery")
      expect(body).toContain("Disclosure Gallery")
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
      "style-profiles",
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
      expect(initialState.styleReference).toBe("report-default")
      expect(initialState.availableStyleReferences).toContain("report-default")

      const createResponse = await fetch(`${url}/__ahtml/gallery/create`, {
        body: JSON.stringify({
          styleReference: "team-ops",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const createdState = (await createResponse.json()) as GalleryStatePayload

      expect(createResponse.ok).toBe(true)
      expect(createdState.ok).toBe(true)
      expect(createdState.styleReference).toBe("team-ops")
      expect(createdState.availableStyleReferences).toContain("team-ops")

      const savedProfile = {
        ...createdState.styleProfile,
        globalStyle: {
          ...createdState.styleProfile.globalStyle,
          typography: {
            ...createdState.styleProfile.globalStyle.typography,
            fontSans: '"IBM Plex Sans", sans-serif',
          },
        },
        componentStyle: {
          ...createdState.styleProfile.componentStyle,
          treatments: {
            ...createdState.styleProfile.componentStyle.treatments,
            card: "team-card",
          },
        },
      }
      const saveResponse = await fetch(`${url}/__ahtml/gallery/save`, {
        body: JSON.stringify({
          styleProfile: savedProfile,
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const savedState = (await saveResponse.json()) as GalleryStatePayload

      expect(saveResponse.ok).toBe(true)
      expect(savedState.ok).toBe(true)
      expect(savedState.styleReference).toBe("team-ops")
      expect(savedState.styleProfile.globalStyle.typography.fontSans).toBe(
        '"IBM Plex Sans", sans-serif',
      )
      expect(savedState.styleProfile.componentStyle.treatments.card).toBe(
        "team-card",
      )

      const savedProfileSource = await readFile(userProfilePath, "utf8")
      expect(savedProfileSource).toContain(
        '"fontSans": "\\"IBM Plex Sans\\", sans-serif"',
      )
      expect(savedProfileSource).toContain('"card": "team-card"')

      const selectResponse = await fetch(`${url}/__ahtml/gallery/select`, {
        body: JSON.stringify({
          styleReference: "report-default",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const selectedState = (await selectResponse.json()) as GalleryStatePayload

      expect(selectResponse.ok).toBe(true)
      expect(selectedState.ok).toBe(true)
      expect(selectedState.styleReference).toBe("report-default")

      const deleteResponse = await fetch(`${url}/__ahtml/gallery/delete`, {
        body: JSON.stringify({
          styleReference: "team-ops",
        }),
        headers: {
          "content-type": "application/json",
        },
        method: "POST",
      })
      const deletedState = (await deleteResponse.json()) as GalleryStatePayload

      expect(deleteResponse.ok).toBe(true)
      expect(deletedState.ok).toBe(true)
      expect(deletedState.styleReference).toBe("report-default")
      expect(deletedState.availableStyleReferences).not.toContain("team-ops")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)

  it("rejects builtin style profile mutations through gallery APIs", async () => {
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
          styleProfile: {
            ...initialState.styleProfile,
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
        'Cannot save built-in style profile "report-default"',
      )

      const deleteResponse = await fetch(`${url}/__ahtml/gallery/delete`, {
        body: JSON.stringify({
          styleReference: "report-default",
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
        'Cannot delete built-in style profile "report-default"',
      )
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

      expect(body).toContain("ahtml-gallery-hero-title")
      expect(body).toContain(">team-ops</")
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

      expect(body).toContain('data-style-profile="team-ops"')
      expect(body).toContain(":root{--background:#fcfbf8;--foreground:#1f2933;")
    } finally {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview)
      await removeTempDir(tempDir)
    }
  }, 120000)
})
