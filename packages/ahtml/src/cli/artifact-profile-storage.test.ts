/// <reference types="node" />
// @vitest-environment node

import { mkdtemp, readFile } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"

import { ArtifactProfileSchema } from "@agent-html/core"
import { afterEach, describe, expect, it } from "vitest"

import { importCliModule } from "./cli-test-helpers"

type RuntimePaths = {
  readonly runtimeRoot: string
  readonly artifactProfilesDir: string
  readonly builtinArtifactProfilesDir: string
  readonly userArtifactProfilesDir: string
  readonly artifactProfileManifestPath: string
  readonly artifactProfileStatePath: string
}

type ArtifactProfile = ReturnType<typeof ArtifactProfileSchema.parse>

const tempDirs: string[] = []

afterEach(async () => {
  await Promise.allSettled(
    tempDirs.splice(0).map(async (directory) => {
      const { rm } = await import("node:fs/promises")
      await rm(directory, { force: true, recursive: true })
    }),
  )
})

describe("artifact profile storage", () => {
  it("saves and overwrites user profiles", async () => {
    const runtimeHome = await createRuntimeHome()
    const { getRuntimePaths } = await importRuntimePathsModule()
    const {
      loadUserArtifactProfilesById,
      saveUserArtifactProfile,
    } = await importArtifactProfileStorageModule()
    const paths = getRuntimePaths({ AHTML_HOME: runtimeHome })
    const firstProfile = createProfile("team-ops", "#0f766e")

    const firstSave = await saveUserArtifactProfile(paths, firstProfile)
    const savedSource = await readFile(firstSave.path, "utf8")
    const loadedProfiles = await loadUserArtifactProfilesById(paths)

    expect(firstSave.overwritten).toBe(false)
    expect(savedSource).toContain('"id": "team-ops"')
    expect(loadedProfiles.get("team-ops")?.globalStyle.tokenSets.light.primary).toBe(
      "#0f766e",
    )

    const overwriteSave = await saveUserArtifactProfile(
      paths,
      createProfile("team-ops", "#0b5fff"),
      { overwrite: true },
    )

    expect(overwriteSave.overwritten).toBe(true)
    expect(
      (await loadUserArtifactProfilesById(paths)).get("team-ops")?.globalStyle
        .tokenSets.light.primary,
    ).toBe("#0b5fff")
  })

  it("persists and falls back current artifact profile ids", async () => {
    const runtimeHome = await createRuntimeHome()
    const { getRuntimePaths } = await importRuntimePathsModule()
    const {
      deleteArtifactProfile,
      readCurrentArtifactProfileReference,
      saveUserArtifactProfile,
      writeCurrentArtifactProfileReference,
    } = await importArtifactProfileStorageModule()
    const paths = getRuntimePaths({ AHTML_HOME: runtimeHome })

    await writeCurrentArtifactProfileReference(paths, "report-default")

    expect(await readCurrentArtifactProfileReference(paths)).toBe(
      "report-default",
    )

    await saveUserArtifactProfile(paths, createProfile("team-ops", "#0f766e"))
    await writeCurrentArtifactProfileReference(paths, "team-ops")

    expect(await readCurrentArtifactProfileReference(paths)).toBe("team-ops")

    const deletion = await deleteArtifactProfile(paths, "team-ops")
    expect(deletion.deleted).toBe(true)
    expect(deletion.currentArtifactProfileReference).toBe("report-default")
    expect(await readCurrentArtifactProfileReference(paths)).toBe(
      "report-default",
    )
  })

  it("rejects invalid ids", async () => {
    const runtimeHome = await createRuntimeHome()
    const { getRuntimePaths } = await importRuntimePathsModule()
    const { saveUserArtifactProfile } = await importArtifactProfileStorageModule()
    const paths = getRuntimePaths({ AHTML_HOME: runtimeHome })

    await expect(
      saveUserArtifactProfile(paths, createProfile("TeamOps", "#0f766e")),
    ).rejects.toThrow("artifact profile ids must use lowercase kebab-case")
  })

  it("rejects save and delete mutations for built-in artifact profiles", async () => {
    const runtimeHome = await createRuntimeHome()
    const { getRuntimePaths } = await importRuntimePathsModule()
    const { deleteArtifactProfile, saveUserArtifactProfile } =
      await importArtifactProfileStorageModule()
    const paths = getRuntimePaths({ AHTML_HOME: runtimeHome })

    await expect(
      saveUserArtifactProfile(paths, createProfile("report-default", "#0f766e"), {
        overwrite: true,
      }),
    ).rejects.toThrow('Cannot save built-in artifact profile "report-default"')

    await expect(
      deleteArtifactProfile(paths, "report-default"),
    ).rejects.toThrow(
      'Cannot delete built-in artifact profile "report-default"',
    )
  })
})

async function createRuntimeHome(): Promise<string> {
  const directory = await mkdtemp(path.join(tmpdir(), "ahtml-style-profiles-"))
  tempDirs.push(directory)
  return directory
}

function createProfile(id: string, primary: string): ArtifactProfile {
  return {
    id,
    globalStyle: {
      tokenSets: {
        light: {
          background: "#fcfbf8",
          foreground: "#1f2933",
          card: "#ffffff",
          cardForeground: "#1f2933",
          popover: "#ffffff",
          popoverForeground: "#1f2933",
          primary,
          primaryForeground: "#f8fafc",
          secondary: "#f2f7f6",
          secondaryForeground: "#1f2933",
          muted: "#eef4f3",
          mutedForeground: "#52606d",
          accent: "#dff5f2",
          accentForeground: "#134e4a",
          destructive: "#be123c",
          destructiveForeground: "#fdf2f8",
          border: "#d9e2ec",
          input: "#bcccdc",
          ring: primary,
          chart1: "#0f766e",
          chart2: "#14b8a6",
          chart3: "#0ea5e9",
          chart4: "#6366f1",
          chart5: "#a855f7",
          sidebar: "#f7fbfb",
          sidebarForeground: "#1f2933",
          sidebarPrimary: "#0f766e",
          sidebarPrimaryForeground: "#f8fafc",
          sidebarAccent: "#dff5f2",
          sidebarAccentForeground: "#134e4a",
          sidebarBorder: "#d9e2ec",
          sidebarRing: primary,
        },
        dark: {
          background: "oklch(0.18 0.02 190)",
          foreground: "oklch(0.96 0.01 190)",
          card: "oklch(0.24 0.02 190)",
          cardForeground: "oklch(0.96 0.01 190)",
          popover: "oklch(0.24 0.02 190)",
          popoverForeground: "oklch(0.96 0.01 190)",
          primary: "oklch(0.74 0.11 190)",
          primaryForeground: "oklch(0.2 0.02 190)",
          secondary: "oklch(0.3 0.02 190)",
          secondaryForeground: "oklch(0.96 0.01 190)",
          muted: "oklch(0.28 0.02 190)",
          mutedForeground: "oklch(0.78 0.01 190)",
          accent: "oklch(0.32 0.03 190)",
          accentForeground: "oklch(0.96 0.01 190)",
          destructive: "oklch(0.62 0.2 20)",
          destructiveForeground: "oklch(0.96 0.01 190)",
          border: "oklch(1 0 0 / 12%)",
          input: "oklch(1 0 0 / 18%)",
          ring: "oklch(0.74 0.11 190)",
          chart1: "oklch(0.74 0.11 190)",
          chart2: "oklch(0.68 0.1 205)",
          chart3: "oklch(0.64 0.12 230)",
          chart4: "oklch(0.6 0.14 255)",
          chart5: "oklch(0.56 0.16 280)",
          sidebar: "oklch(0.22 0.02 190)",
          sidebarForeground: "oklch(0.96 0.01 190)",
          sidebarPrimary: "oklch(0.74 0.11 190)",
          sidebarPrimaryForeground: "oklch(0.2 0.02 190)",
          sidebarAccent: "oklch(0.32 0.03 190)",
          sidebarAccentForeground: "oklch(0.96 0.01 190)",
          sidebarBorder: "oklch(1 0 0 / 12%)",
          sidebarRing: "oklch(0.74 0.11 190)",
        },
      },
      radiusScale: {
        base: "0.9rem",
        sm: "calc(var(--radius) * 0.6)",
        md: "calc(var(--radius) * 0.8)",
        lg: "var(--radius)",
        xl: "calc(var(--radius) * 1.4)",
        "2xl": "calc(var(--radius) * 1.8)",
        "3xl": "calc(var(--radius) * 2.2)",
        "4xl": "calc(var(--radius) * 2.6)",
      },
      typography: {
        fontSans:
          '"Inter Variable", system-ui, "Helvetica Neue", Helvetica, Arial, sans-serif',
        fontHeading: "var(--font-sans)",
        fontSerif: 'ui-serif, Georgia, Cambria, "Times New Roman", Times, serif',
        fontMono:
          'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
        letterSpacing: "0em",
        spacing: "0.25rem",
        shadowColor: "oklch(0 0 0)",
        shadowOpacity: "0.1",
        shadowBlur: "3px",
        shadowSpread: "0px",
        shadowOffsetX: "0px",
        shadowOffsetY: "1px",
      },
      cssVariableMap: {
        background: "--background",
        foreground: "--foreground",
        card: "--card",
        cardForeground: "--card-foreground",
        popover: "--popover",
        popoverForeground: "--popover-foreground",
        primary: "--primary",
        primaryForeground: "--primary-foreground",
        secondary: "--secondary",
        secondaryForeground: "--secondary-foreground",
        muted: "--muted",
        mutedForeground: "--muted-foreground",
        accent: "--accent",
        accentForeground: "--accent-foreground",
        destructive: "--destructive",
        destructiveForeground: "--destructive-foreground",
        border: "--border",
        input: "--input",
        ring: "--ring",
        chart1: "--chart-1",
        chart2: "--chart-2",
        chart3: "--chart-3",
        chart4: "--chart-4",
        chart5: "--chart-5",
        sidebar: "--sidebar",
        sidebarForeground: "--sidebar-foreground",
        sidebarPrimary: "--sidebar-primary",
        sidebarPrimaryForeground: "--sidebar-primary-foreground",
        sidebarAccent: "--sidebar-accent",
        sidebarAccentForeground: "--sidebar-accent-foreground",
        sidebarBorder: "--sidebar-border",
        sidebarRing: "--sidebar-ring",
        radius: "--radius",
        fontSans: "--font-sans",
        fontHeading: "--font-heading",
        fontSerif: "--font-serif",
        fontMono: "--font-mono",
        letterSpacing: "--letter-spacing",
        spacing: "--spacing",
        shadowColor: "--shadow-color",
        shadowOpacity: "--shadow-opacity",
        shadowBlur: "--shadow-blur",
        shadowSpread: "--shadow-spread",
        shadowOffsetX: "--shadow-offset-x",
        shadowOffsetY: "--shadow-offset-y",
      },
    },
    globalLayout: {
      frame: {
        pageMaxWidth: "72rem",
        pagePaddingInline: "1rem",
        pagePaddingBlockStart: "1.5rem",
        pagePaddingBlockEnd: "3rem",
        frameMaxWidth: "64rem",
      },
      measure: {
        prose: "68ch",
        wide: "84ch",
        full: "100%",
      },
      rhythm: {
        pageGap: "1.25rem",
        stackGap: "1rem",
        clusterGap: "0.75rem",
        splitGap: "1rem",
        gridGap: "1rem",
        switcherGap: "1rem",
      },
      density: {
        default: "balanced",
        compact: 0.85,
        balanced: 1,
        relaxed: 1.2,
      },
      partition: {
        splitMinColumnWidth: "18rem",
        gridMinColumnWidth: "16rem",
        switcherMinChildWidth: "18rem",
      },
      reflow: {
        splitAutoFlow: "auto-fit",
        gridAutoFlow: "auto-fit",
        clusterWrap: "wrap",
        switcherWrap: "wrap",
        clusterJustify: "flex-start",
        switcherJustify: "flex-start",
      },
    },
    componentStyle: {
      treatments: {
        alert: "ops-alert",
        badge: "ops-badge",
        card: "ops-card",
        input: "ops-field",
        table: "ops-table",
        tabs: "ops-tabs",
        textarea: "ops-field",
      },
    },
    componentLayout: {
      page: {
        gap: "1.25rem",
        measure: "wide",
      },
      stack: {
        gap: "1rem",
        density: "balanced",
        measure: "full",
      },
      cluster: {
        gap: "0.75rem",
        density: "balanced",
        wrap: "wrap",
        justify: "flex-start",
      },
      split: {
        gap: "1rem",
        density: "balanced",
        minColumnWidth: "18rem",
        autoFlow: "auto-fit",
      },
      grid: {
        gap: "1rem",
        density: "balanced",
        minColumnWidth: "16rem",
        autoFlow: "auto-fit",
      },
      switcher: {
        gap: "1rem",
        density: "balanced",
        minChildWidth: "18rem",
        wrap: "wrap",
        justify: "flex-start",
      },
      frame: {
        maxWidth: "64rem",
        measure: "wide",
      },
    },
  }
}

async function importRuntimePathsModule() {
  return importCliModule<{
    readonly getRuntimePaths: (env?: NodeJS.ProcessEnv) => RuntimePaths
  }>("runtime-paths.mjs")
}

async function importArtifactProfileStorageModule() {
  return importCliModule<{
    readonly deleteArtifactProfile: (
      paths: RuntimePaths,
      artifactProfileReference: string,
    ) => Promise<{
      readonly deleted: boolean
      readonly currentArtifactProfileReference: string
    }>
    readonly loadUserArtifactProfilesById: (
      paths: RuntimePaths,
    ) => Promise<Map<string, ArtifactProfile>>
    readonly readCurrentArtifactProfileReference: (
      paths: RuntimePaths,
    ) => Promise<string>
    readonly saveUserArtifactProfile: (
      paths: RuntimePaths,
      profile: ArtifactProfile,
      options?: {
        readonly overwrite?: boolean
      },
    ) => Promise<{
      readonly overwritten: boolean
      readonly path: string
    }>
    readonly writeCurrentArtifactProfileReference: (
      paths: RuntimePaths,
      artifactProfileReference: string,
    ) => Promise<string>
  }>("artifact-profile-storage.mjs")
}
