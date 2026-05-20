import { execFile } from "node:child_process"
import type { ChildProcessByStdio } from "node:child_process"
import { mkdir, mkdtemp, readFile, rm, stat, writeFile } from "node:fs/promises"
import { createServer } from "node:http"
import { tmpdir } from "node:os"
import path from "node:path"
import type { Readable } from "node:stream"
import { setTimeout as delay } from "node:timers/promises"
import { pathToFileURL } from "node:url"
import { promisify } from "node:util"

import { afterAll, afterEach, beforeAll, expect } from "vitest"

const execFileAsync = promisify(execFile)

export const root = process.cwd()
export const cliPath = path.join(root, "packages", "ahtml", "bin", "ahtml.mjs")
export const shadcnTemplateFixtureDir = path.join(
  root,
  "scripts",
  "shadcn-test-fixtures",
  "template",
)
export const validAgentHtmlFixtures = [
  '<page title="Fixture"><card title="Summary">Valid text.</card></page>',
  [
    '<meta-agent style-ref="ops-compact" />',
    '<page title="Dashboard"><card title="Queue">Ready.</card></page>',
  ].join("\n"),
  [
    '<page title="Layout Fixture">',
    "  <stack>",
    '    <card title="Summary">',
    "      <cluster>",
    '        <badge variant="secondary">Ready</badge>',
    '        <badge variant="outline">Queued</badge>',
    "      </cluster>",
    "    </card>",
    "  </stack>",
    "</page>",
  ].join("\n"),
  [
    '<page title="Review Form">',
    '  <card title="Decision">',
    '    <checkbox label="Ship now" checked="true" description="Boolean field." />',
    '    <switch label="Live Sync" checked="true" description="Immediate preference toggle." />',
    '    <slider label="Review strictness" value="70" description="Read-only numeric field." />',
    '    <radio-group label="Direction" value="ship" description="Single-select field.">',
    '      <option value="ship" label="Ship">Use the current direction.</option>',
    '      <option value="hold" label="Hold">Wait for the guard.</option>',
    "    </radio-group>",
    '    <toggle-group label="Rollout Mode" value="fast" description="Inline option set.">',
    '      <option value="fast" label="Fast">Prefer speed.</option>',
    '      <option value="safe" label="Safe">Prefer guardrails.</option>',
    "    </toggle-group>",
    '    <select label="Deployment Window" value="today" description="Choose a release window.">',
    '      <option value="today" label="Today">Ship in the current window.</option>',
    '      <option value="tomorrow" label="Tomorrow">Wait for the next window.</option>',
    "    </select>",
    "  </card>",
    "</page>",
  ].join("\n"),
]

export type CliSchemaOutput = {
  readonly kind: string
  readonly components: readonly {
    readonly name: string
    readonly props: readonly {
      readonly name: string
    }[]
  }[]
  readonly verificationData: {
    readonly components: readonly {
      readonly name: string
      readonly renderKind: string
      readonly source: string
      readonly slots: readonly {
        readonly name: string
        readonly children: readonly string[]
      }[]
    }[]
  }
  readonly rendererMapping: {
    readonly components: readonly {
      readonly name: string
      readonly kind: string
      readonly renderKind: string
      readonly slots: readonly {
        readonly name: string
        readonly children: readonly string[]
      }[]
    }[]
  }
  readonly forbidden: string
  readonly safetyPolicy: {
    readonly blockedNames: readonly string[]
    readonly forbidden: string
  }
  readonly renderConfig: {
    readonly defaults: Readonly<Record<string, string>>
    readonly keys: readonly string[]
    readonly values: Readonly<Record<string, readonly string[]>>
    readonly model: string
  }
}

type SchemaModule = {
  readonly formatPrompt: (schema: CliSchemaOutput) => string
  readonly getCliSchemaOutput: (root?: string) => Promise<CliSchemaOutput>
}

type ValidateModule = {
  readonly validateAgentHtmlSource: (
    source: string,
    root?: string,
  ) => Promise<{
    readonly diagnostics: readonly { readonly message: string }[]
  }>
}

type CommandMetadataModule = {
  readonly commandMetadata: Readonly<Record<string, unknown>>
  readonly formatCliCommandUsageBlock: () => string
}

type RenderCapabilitiesModule = {
  readonly requiredShadcnRuntimeComponents: readonly string[]
}

type RuntimeSetupModule = {
  readonly resolveRuntimeSetup: (options?: {
    readonly options?: Record<string, string | boolean>
    readonly interactive?: boolean
  }) => Promise<{
    readonly componentSource: string
    readonly preset: string
    readonly components: readonly string[]
  }>
  readonly resolveManagedRuntimeComponentSet: (options?: {
    readonly componentCatalog?: readonly string[]
    readonly componentSet?: string
  }) => readonly string[]
  readonly formatSetupControls: () => string
  readonly formatSetupHeader: () => string
}

type ShadcnApiModule = {
  readonly getShadcnComponentCatalog: () => Promise<{
    readonly components: readonly string[]
    readonly source: string
  }>
  readonly listShadcnPresets: () => readonly string[]
  readonly validateShadcnPreset: (value: string) => boolean
}

type ShadcnTestServerModule = {
  readonly startShadcnTestServer: () => Promise<ShadcnTestServer>
}

export type ShadcnTestServer = {
  readonly registryUrl: string
  readonly close: () => Promise<void>
}

export function createCliEnv(
  env: NodeJS.ProcessEnv = {},
  registryUrl?: string,
): NodeJS.ProcessEnv {
  const testRuntimeTemplateEnv = registryUrl
    ? {
        AHTML_ALLOW_SHADCN_TEMPLATE_OVERRIDE: "1",
        AHTML_SHADCN_TEMPLATE_DIR: shadcnTemplateFixtureDir,
        REGISTRY_URL: registryUrl,
      }
    : {}

  return {
    ...process.env,
    AHTML_NO_UPDATE_CHECK: "1",
    ...testRuntimeTemplateEnv,
    ...env,
  }
}

export function runCli(
  args: readonly string[],
  env: NodeJS.ProcessEnv = {},
  cwd = root,
  registryUrl?: string,
) {
  return execFileAsync(process.execPath, [cliPath, ...args], {
    cwd,
    env: createCliEnv(env, registryUrl),
  })
}

export function resolveRepoPath(...segments: readonly string[]) {
  return path.join(root, ...segments)
}

export function resolveCliPath(...segments: readonly string[]) {
  return resolveRepoPath("packages", "ahtml", "src", "cli", ...segments)
}

export async function importCliModule<T>(
  ...segments: readonly string[]
): Promise<T> {
  return import(pathToFileURL(resolveCliPath(...segments)).href) as Promise<T>
}

export async function readRepoSource(
  ...segments: readonly string[]
): Promise<string> {
  return readFile(resolveRepoPath(...segments), "utf8")
}

export async function importSchemaModule(): Promise<SchemaModule> {
  const schemaModuleUrl = pathToFileURL(
    path.join(root, "packages", "ahtml", "src", "cli", "schema.mjs"),
  ).href

  return (await import(schemaModuleUrl)) as SchemaModule
}

export async function importValidateModule(): Promise<ValidateModule> {
  const validateModuleUrl = pathToFileURL(
    path.join(root, "packages", "ahtml", "src", "cli", "validate.mjs"),
  ).href

  return (await import(validateModuleUrl)) as ValidateModule
}

export async function importCommandMetadata(): Promise<CommandMetadataModule> {
  const commandModuleUrl = pathToFileURL(
    path.join(root, "packages", "ahtml", "src", "cli", "command-contract.mjs"),
  ).href

  return (await import(commandModuleUrl)) as CommandMetadataModule
}

export async function importRenderCapabilitiesModule(): Promise<RenderCapabilitiesModule> {
  const renderCapabilitiesUrl = pathToFileURL(
    path.join(
      root,
      "packages",
      "ahtml",
      "src",
      "config",
      "render-capabilities.mjs",
    ),
  ).href

  return (await import(renderCapabilitiesUrl)) as RenderCapabilitiesModule
}

export async function importRuntimeSetupModule(): Promise<RuntimeSetupModule> {
  const runtimeSetupModuleUrl = pathToFileURL(
    path.join(root, "packages", "ahtml", "src", "cli", "runtime-setup.mjs"),
  ).href

  return (await import(runtimeSetupModuleUrl)) as RuntimeSetupModule
}

export async function importShadcnApiModule(): Promise<ShadcnApiModule> {
  const shadcnApiModuleUrl = pathToFileURL(
    path.join(root, "packages", "ahtml", "src", "cli", "shadcn-api.mjs"),
  ).href

  return (await import(shadcnApiModuleUrl)) as ShadcnApiModule
}

export async function startShadcnTestServer(): Promise<ShadcnTestServer> {
  const { startShadcnTestServer: startServer } = (await import(
    pathToFileURL(path.join(root, "scripts", "shadcn-test-server.mjs")).href
  )) as ShadcnTestServerModule

  return startServer()
}

export function useShadcnCliHarness() {
  let shadcnTestServer: ShadcnTestServer | undefined

  beforeAll(async () => {
    shadcnTestServer = await startShadcnTestServer()
  })

  afterAll(async () => {
    await shadcnTestServer?.close()
  })

  return {
    runCliWithServer: (
      args: readonly string[],
      env: NodeJS.ProcessEnv = {},
      cwd = root,
    ) => {
      return runCli(args, env, cwd, shadcnTestServer?.registryUrl)
    },
    getRegistryUrl: () => {
      return shadcnTestServer?.registryUrl
    },
  }
}

export function useTemporaryDirectories() {
  const temporaryDirectories: string[] = []

  afterEach(async () => {
    await Promise.all(
      temporaryDirectories
        .splice(0)
        .map((directory) => removeTempDir(directory)),
    )
  })

  return {
    track: (directory: string) => {
      temporaryDirectories.push(directory)
      return directory
    },
    create: async (prefix: string) => {
      const directory = await mkdtemp(path.join(tmpdir(), prefix))
      temporaryDirectories.push(directory)
      return directory
    },
  }
}

export async function startPackageVersionServer(
  version: string,
  statusCode = 200,
) {
  let requests = 0
  const server = createServer((_request, response) => {
    requests += 1
    response.writeHead(statusCode, { "content-type": "application/json" })
    response.end(JSON.stringify({ version }))
  })

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", resolve)
  })

  const address = server.address()
  const port = typeof address === "object" && address ? address.port : 0

  return {
    url: `http://127.0.0.1:${port}/@agent-html%2Fahtml/latest`,
    requests: () => requests,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((error) => {
          if (error) {
            reject(error)
            return
          }

          resolve()
        })
      }),
  }
}

export async function assertNoProjectScaffold(directory: string) {
  await expectPathMissing(path.join(directory, "src"))
  await expectPathMissing(path.join(directory, "vite.config.ts"))
  await expectPathMissing(path.join(directory, "components.json"))
  await expectPathMissing(path.join(directory, "agent-html.project.json"))
}

export async function expectFile(filePath: string, expected: string) {
  const source = await readFile(filePath, "utf8")

  expect(source).toContain(expected)
}

export async function expectFileMissingText(
  filePath: string,
  expected: string,
) {
  const source = await readFile(filePath, "utf8")

  expect(source).not.toContain(expected)
}

export async function expectPathMissing(filePath: string) {
  await expect(stat(filePath)).rejects.toMatchObject({ code: "ENOENT" })
}

export async function removeTempDir(directory: string) {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    try {
      await rm(directory, { force: true, recursive: true })
      return
    } catch (error) {
      if (
        error &&
        typeof error === "object" &&
        "code" in error &&
        (error.code === "EBUSY" || error.code === "ENOTEMPTY")
      ) {
        await delay(250 * (attempt + 1))
        continue
      }

      throw error
    }
  }
}

export async function writeCustomStyleProfile(runtimeHome: string) {
  const profileDir = path.join(
    runtimeHome,
    "config",
    "style-profiles",
    "user",
  )
  const profilePath = path.join(profileDir, "team-ops.json")

  await mkdir(profileDir, { recursive: true })
  await writeFile(
    profilePath,
    `${JSON.stringify(createCustomStyleProfile(), null, 2)}\n`,
  )
}

export async function writeCurrentStyleProfileState(
  runtimeHome: string,
  currentStyleProfileId: string,
) {
  const statePath = path.join(
    runtimeHome,
    "config",
    "style-profile-state.json",
  )

  await mkdir(path.dirname(statePath), { recursive: true })
  await writeFile(
    statePath,
    `${JSON.stringify(
      {
        kind: "ahtml-style-profile-state",
        version: 1,
        currentStyleProfileId,
      },
      null,
      2,
    )}\n`,
  )
}

export async function expectCliFailure(
  promise: Promise<unknown>,
  expectedOutput: string,
) {
  try {
    await promise
  } catch (error) {
    expect(getErrorOutput(error)).toContain(expectedOutput)
    return
  }

  throw new Error("Expected CLI command to fail.")
}

type PreviewProcess = ChildProcessByStdio<null, Readable, Readable>

export async function waitForPreviewUrl(
  child: PreviewProcess,
  timeoutMs = 120000,
) {
  return new Promise<string>((resolve, reject) => {
    if (!child.stdout || !child.stderr) {
      reject(new Error("Preview process was started without stdout/stderr."))
      return
    }

    let stdout = ""
    let stderr = ""
    const timeout = setTimeout(() => {
      reject(new Error(`Timed out waiting for preview URL. ${stderr}`))
    }, timeoutMs)

    child.stdout.setEncoding("utf8")
    child.stderr.setEncoding("utf8")
    child.stdout.on("data", (chunk: string) => {
      stdout += chunk
      const match = stdout.match(/Preview: (http:\/\/127\.0\.0\.1:\d+)/)

      if (match) {
        clearTimeout(timeout)
        resolve(match[1])
      }
    })
    child.stderr.on("data", (chunk: string) => {
      stderr += chunk
    })
    child.on("error", (error) => {
      clearTimeout(timeout)
      reject(error)
    })
    child.on("exit", (code) => {
      if (!stdout.includes("Preview:")) {
        clearTimeout(timeout)
        reject(new Error(stderr || `Preview exited with code ${code}`))
      }
    })
  })
}

export async function waitForProcessExit(child: PreviewProcess) {
  if (child.exitCode !== null) {
    return
  }

  await new Promise<void>((resolve) => {
    child.on("exit", () => resolve())
  })
}

export function parseJson<T>(source: string): T {
  return JSON.parse(source) as T
}

export function normalizeNewlines(value: string) {
  return value.replaceAll("\r\n", "\n")
}

function getErrorOutput(error: unknown): string {
  if (
    error &&
    typeof error === "object" &&
    "stderr" in error &&
    typeof error.stderr === "string" &&
    "stdout" in error &&
    typeof error.stdout === "string"
  ) {
    return `${error.stdout}\n${error.stderr}`
  }

  return ""
}

function createCustomStyleProfile() {
  return {
    id: "team-ops",
    globalStyle: {
      tokenSets: {
        light: {
          background: "#fcfbf8",
          foreground: "#1f2933",
          card: "#ffffff",
          cardForeground: "#1f2933",
          popover: "#ffffff",
          popoverForeground: "#1f2933",
          primary: "#0f766e",
          primaryForeground: "#f8fafc",
          secondary: "#f2f7f6",
          secondaryForeground: "#1f2933",
          muted: "#eef4f3",
          mutedForeground: "#52606d",
          accent: "#dff5f2",
          accentForeground: "#134e4a",
          destructive: "#be123c",
          border: "#d9e2ec",
          input: "#bcccdc",
          ring: "#0f766e",
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
          border: "oklch(1 0 0 / 12%)",
          input: "oklch(1 0 0 / 18%)",
          ring: "oklch(0.74 0.11 190)",
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
        border: "--border",
        input: "--input",
        ring: "--ring",
        radius: "--radius",
        fontSans: "--font-sans",
        fontHeading: "--font-heading",
      },
    },
    componentStyle: {
      treatments: {
        alert: "ops-alert",
        badge: "ops-badge",
        card: "review-card",
        input: "ops-field",
        table: "ops-table",
        tabs: "ops-tabs",
        textarea: "ops-field",
      },
    },
  }
}
