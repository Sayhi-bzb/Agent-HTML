import { spawn } from "node:child_process"
import { mkdtemp, readFile, rm, stat } from "node:fs/promises"
import { tmpdir } from "node:os"
import path from "node:path"
import { pathToFileURL } from "node:url"
import * as parse5 from "parse5"

const repoRoot = process.cwd()
const defaultInput = path.join(
  repoRoot,
  "examples",
  "release-control-room.agent.html",
)
const cliPath = path.join(repoRoot, "packages", "ahtml", "bin", "ahtml.mjs")

async function main() {
  const options = parseArgs(process.argv.slice(2))
  const inputPath = path.resolve(repoRoot, options.input ?? defaultInput)
  const runtimeHome = await mkdtemp(path.join(tmpdir(), "ahtml-debug-"))
  const processTempRoot = path.join(runtimeHome, "process-tmp")
  let preview
  let previewUrl = ""
  let previewPhaseError = null

  try {
    await ensureDir(processTempRoot)
    process.env.TMPDIR = processTempRoot
    process.env.TEMP = processTempRoot
    process.env.TMP = processTempRoot

    const {
      getCliSchemaOutput,
    } = await importModule("packages/ahtml/src/cli/schema.mjs")
    const {
      bootstrapManagedRuntime,
      getRuntimeStatus,
      readRuntimeManifest,
    } = await importModule("packages/ahtml/src/cli/runtime-status.mjs")
    const {
      nativeRuntimeSetup,
      resolveRuntimeSetup,
    } = await importModule("packages/ahtml/src/cli/runtime-setup.mjs")
    const {
      getRuntimePaths,
    } = await importModule("packages/ahtml/src/cli/runtime-paths.mjs")
    const {
      readRuntimeVerificationState,
    } = await importModule("packages/ahtml/src/cli/runtime-renderability.mjs")
    const {
      isRuntimeVerificationCurrent,
    } = await importModule("packages/ahtml/src/cli/artifact-workflow.mjs")
    const {
      readPackageVersion,
    } = await importModule("packages/ahtml/src/cli/cli-io.mjs").catch(() => ({
      readPackageVersion: async () => "0.0.0",
    }))

    const schema = await getCliSchemaOutput()
    const runtimePaths = getRuntimePaths({
      ...process.env,
      AHTML_HOME: runtimeHome,
    })
    const setup = await resolveRuntimeSetup({
      options: {
        ui: nativeRuntimeSetup.uiLibrary,
        "component-source": nativeRuntimeSetup.componentSource,
        preset: nativeRuntimeSetup.preset,
        components: nativeRuntimeSetup.components,
        yes: true,
      },
      interactive: false,
    })
    const packageVersion =
      typeof readPackageVersion === "function"
        ? await readPackageVersion().catch(() => "0.0.0")
        : "0.0.0"

    printSection("Debug Context")
    printLine("input", inputPath)
    printLine("runtimeHome", runtimeHome)
    printLine(
      "defaultRuntimeHome",
      options.runtimeHomeOverride
        ? path.resolve(repoRoot, options.runtimeHomeOverride)
        : getRuntimePaths(process.env).runtimeRoot,
    )

    printSection("Phase A: Schema Renderer Mapping")
    const schemaCard = findRendererComponent(schema.rendererMapping, "card")
    const schemaAlert = findRendererComponent(schema.rendererMapping, "alert")
    const schemaPage = findRendererComponent(schema.rendererMapping, "page")
    printRendererSummary("schema.card", schemaCard)
    printRendererSummary("schema.alert", schemaAlert)
    printRendererSummary("schema.page", schemaPage)

    printSection("Phase B: Fresh Managed Runtime")
    await bootstrapManagedRuntime({
      packageRoot: path.join(repoRoot, "packages", "ahtml"),
      packageVersion,
      paths: runtimePaths,
      schema,
      setup,
    })
    const runtimeManifest = await readRuntimeManifest(runtimePaths)
    const runtimeVerificationState =
      await readRuntimeVerificationState(runtimePaths)
    const runtimeCard = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "card",
    )
    const runtimeAlert = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "alert",
    )
    const runtimePage = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "page",
    )
    printRendererSummary("runtime.card", runtimeCard)
    printRendererSummary("runtime.alert", runtimeAlert)
    printRendererSummary("runtime.page", runtimePage)
    printLine(
      "runtime.manifest",
      runtimePaths.manifestPath,
    )
    printLine(
      "runtime.verification",
      runtimePaths.runtimeVerificationPath,
    )
    printLine(
      "user.runtimeHint",
      "Compare this fresh temp runtime with your real AHTML_HOME runtime verification file if your browser still shows legacy classes.",
    )
    printLine(
      "runtime.surface",
      runtimeManifest.shadcnRuntimeSurface?.source ?? "unknown",
    )

    printSection("Phase C: Runtime File Evidence")
    const runtimeRenderNode = await readRuntimeFile(
      path.join(runtimePaths.runtimeSrcDir, "renderer", "render-node.tsx"),
    )
    const runtimeVerificationSource = await readRuntimeFile(
      runtimePaths.runtimeVerificationPath,
    )
    const runtimeDocumentApp = await readRuntimeFile(
      path.join(
        runtimePaths.runtimeSrcDir,
        "features",
        "document",
        "app.tsx",
      ),
    )
    const runtimeBasicRenderer = await readRuntimeFile(
      path.join(
        runtimePaths.runtimeSrcDir,
        "renderer",
        "ui-renderers",
        "basic.tsx",
      ),
    )

    printCheck(
      "runtime render verification mentions contentLayout",
      runtimeVerificationSource.includes('"contentLayout"'),
    )
    printCheck(
      "runtime verification card uses default contentLayout",
      runtimeVerificationSource.includes('"name": "card"') &&
        runtimeVerificationSource.includes('"contentLayout": "default"'),
    )
    printCheck(
      "runtime basic renderer references contentLayout",
      runtimeBasicRenderer.includes("contentLayout"),
    )
    printCheck(
      "runtime document app builds renderer from verification mapping",
      runtimeDocumentApp.includes(
        "rendererVerificationState.rendererMapping.components.map",
      ),
    )
    printCheck(
      "runtime render-node source exists",
      runtimeRenderNode.length > 0,
    )

    printSection("Phase D: Real Preview HTML")
    let cardContentClass = null

    try {
      preview = spawn(
        process.execPath,
        [cliPath, "preview", inputPath, "--port", "0"],
        {
          cwd: repoRoot,
          env: {
            ...process.env,
            AHTML_HOME: runtimeHome,
            AHTML_NO_UPDATE_CHECK: "1",
          },
          stdio: ["ignore", "pipe", "pipe"],
        },
      )

      previewUrl = await waitForPreviewUrl(preview)
      printLine("previewUrl", previewUrl)
      const html = await waitForPreviewBodyContains(previewUrl, "本次发布摘要")
      const cardSnippet = extractCardSnippet(html, "本次发布摘要")
      cardContentClass = extractCardContentClass(cardSnippet)

      printLine("preview.cardContentClass", cardContentClass ?? "not-found")
      printCardLayoutReport("preview.cardLayout", cardSnippet)
      printCheck(
        "preview card content still has legacy stack/prose classes",
        Boolean(
          cardContentClass?.includes("ahtml-section-stack") &&
            cardContentClass.includes("ahtml-prose-block"),
        ),
      )
    } catch (error) {
      previewPhaseError = error
      printLine(
        "preview.phaseError",
        error instanceof Error ? error.message : String(error),
      )
      printCheck(
        "preview subprocess execution available in this environment",
        false,
      )
    }

    printSection("Phase E: Real Runtime Home Inspection")
    const defaultRuntimePaths = getRuntimePaths({
      ...process.env,
      ...(options.runtimeHomeOverride
        ? { AHTML_HOME: path.resolve(repoRoot, options.runtimeHomeOverride) }
        : {}),
    })
    await inspectRuntimeHome({
      label: "defaultRuntime",
      paths: defaultRuntimePaths,
      schema,
      getRuntimeStatus,
      isRuntimeVerificationCurrent,
    })

    printSection("ROOT CAUSE")
    const schemaLayout = schemaCard?.contentLayout
    const runtimeLayout = runtimeCard?.contentLayout
    const previewHasLegacyClasses = Boolean(
      cardContentClass?.includes("ahtml-section-stack") &&
        cardContentClass.includes("ahtml-prose-block"),
    )

    if (schemaLayout !== "default") {
      printLine(
        "cause",
        `Schema still emits card.contentLayout=${String(schemaLayout)}; renderer contract is not actually updated at schema source.`,
      )
    } else if (runtimeLayout !== "default") {
      printLine(
        "cause",
        `Managed runtime verification drifted from schema. runtime.card.contentLayout=${String(runtimeLayout)} schema.card.contentLayout=${String(schemaLayout)}.`,
      )
    } else if (previewHasLegacyClasses) {
      printLine(
        "cause",
        "Preview HTML still receives legacy card-content classes even though schema and runtime verification both say card.contentLayout=default. Root bug is in the live rendering chain after verification mapping selection.",
      )
    } else {
      const defaultRuntimePaths = getRuntimePaths({
        ...process.env,
        ...(options.runtimeHomeOverride
          ? { AHTML_HOME: path.resolve(repoRoot, options.runtimeHomeOverride) }
          : {}),
      })
      const defaultRuntimeEvidence = await collectRuntimeEvidence({
        label: "defaultRuntime",
        paths: defaultRuntimePaths,
        schema,
        getRuntimeStatus,
        isRuntimeVerificationCurrent,
      })

      if (!defaultRuntimeEvidence.exists) {
        printLine(
          "cause",
          `Default runtime home does not exist at ${defaultRuntimePaths.runtimeRoot}. If your preview still shows old DOM, you are likely inspecting a different session or another machine/user profile runtime.`,
        )
      } else if (!defaultRuntimeEvidence.verificationExists) {
        printLine(
          "cause",
          `Default runtime home exists at ${defaultRuntimePaths.runtimeRoot} but is missing render verification. Any preview using it would need a rebuild before it can match the current schema.`,
        )
      } else if (!defaultRuntimeEvidence.verificationCurrent) {
        printLine(
          "cause",
          `Default runtime home at ${defaultRuntimePaths.runtimeRoot} is stale against current schema. The preview you inspected is likely using outdated runtime verification or generated runtime files from that home.`,
        )
      } else if (!defaultRuntimeEvidence.basicRendererReferencesContentLayout) {
        printLine(
          "cause",
          `Default runtime verification is current, but ${path.join(defaultRuntimePaths.runtimeSrcDir, "renderer", "ui-renderers", "basic.tsx")} does not reference contentLayout. The runtime source on disk is stale even though the manifest contract is current.`,
        )
      } else if (previewPhaseError) {
        printLine(
          "cause",
          "Schema, fresh managed runtime, and the inspected default runtime home all agree on card.contentLayout=default. This environment cannot execute the preview subprocess here, so the remaining suspect is the exact preview session/browser target you opened rather than the runtime contract on disk.",
        )
      } else {
        printLine(
          "cause",
          "Fresh temporary runtime preview no longer reproduces the legacy card-content classes. The stale behavior is likely isolated to another runtime home or a different inspected page/session.",
        )
      }
    }
  } finally {
    if (preview && !preview.killed) {
      preview.kill("SIGTERM")
      await waitForProcessExit(preview).catch(() => {})
    }

    if (!options.keepRuntime) {
      await rm(runtimeHome, { recursive: true, force: true }).catch(() => {})
    }
  }
}

function parseArgs(args) {
  const options = {
    input: undefined,
    keepRuntime: false,
    runtimeHomeOverride: undefined,
  }

  for (let index = 0; index < args.length; index += 1) {
    const value = args[index]

    if (value === "--input") {
      options.input = args[index + 1]
      index += 1
      continue
    }

    if (value === "--keep-runtime") {
      options.keepRuntime = true
      continue
    }

    if (value === "--runtime-home") {
      options.runtimeHomeOverride = args[index + 1]
      index += 1
      continue
    }
  }

  return options
}

async function inspectRuntimeHome({
  label,
  paths,
  schema,
  getRuntimeStatus,
  isRuntimeVerificationCurrent,
}) {
  const evidence = await collectRuntimeEvidence({
    label,
    paths,
    schema,
    getRuntimeStatus,
    isRuntimeVerificationCurrent,
  })

  printLine(`${label}.runtimeRoot`, paths.runtimeRoot)
  printLine(`${label}.manifestPath`, paths.manifestPath)
  printLine(`${label}.runtimeVerificationPath`, paths.runtimeVerificationPath)
  printLine(`${label}.exists`, evidence.exists)

  if (!evidence.exists) {
    return
  }

  printLine(`${label}.status.ready`, evidence.ready)
  printLine(`${label}.verificationExists`, evidence.verificationExists)

  if (evidence.manifestError) {
    printLine(`${label}.manifestError`, evidence.manifestError)
  }

  if (evidence.verificationError) {
    printLine(`${label}.verificationError`, evidence.verificationError)
  }

  if (evidence.runtimeSurfaceSource) {
    printLine(`${label}.runtimeSurface`, evidence.runtimeSurfaceSource)
  }

  if (evidence.runtimeCard) {
    printRendererSummary(`${label}.card`, evidence.runtimeCard)
  }

  if (evidence.runtimeAlert) {
    printRendererSummary(`${label}.alert`, evidence.runtimeAlert)
  }

  if (evidence.runtimePage) {
    printRendererSummary(`${label}.page`, evidence.runtimePage)
  }

  if (typeof evidence.verificationCurrent === "boolean") {
    printLine(`${label}.verificationCurrent`, evidence.verificationCurrent)
  }

  if (typeof evidence.runtimeVerificationMentionsContentLayout === "boolean") {
    printCheck(
      `${label} verification mentions contentLayout`,
      evidence.runtimeVerificationMentionsContentLayout,
    )
  }

  if (typeof evidence.runtimeVerificationCardDefault === "boolean") {
    printCheck(
      `${label} verification card uses default contentLayout`,
      evidence.runtimeVerificationCardDefault,
    )
  }

  if (typeof evidence.basicRendererReferencesContentLayout === "boolean") {
    printCheck(
      `${label} basic renderer references contentLayout`,
      evidence.basicRendererReferencesContentLayout,
    )
  }

  if (typeof evidence.defaultCardContentHasLegacyClasses === "boolean") {
    printCheck(
      `${label} runtime host source still hard-codes legacy card content classes`,
      evidence.defaultCardContentHasLegacyClasses,
    )
  }
}

async function collectRuntimeEvidence({
  label,
  paths,
  schema,
  getRuntimeStatus,
  isRuntimeVerificationCurrent,
}) {
  const evidence = {
    label,
    exists: await pathExists(paths.runtimeRoot),
    ready: false,
    verificationExists: false,
    verificationCurrent: undefined,
    manifestError: "",
    verificationError: "",
    runtimeSurfaceSource: "",
    runtimeCard: null,
    runtimeAlert: null,
    runtimePage: null,
    runtimeVerificationMentionsContentLayout: undefined,
    runtimeVerificationCardDefault: undefined,
    basicRendererReferencesContentLayout: undefined,
    defaultCardContentHasLegacyClasses: undefined,
  }

  if (!evidence.exists) {
    return evidence
  }

  try {
    const status = await getRuntimeStatus({ paths })
    evidence.ready = status.ready
  } catch (error) {
    evidence.manifestError =
      error instanceof Error ? error.message : String(error)
  }

  evidence.verificationExists = await pathExists(paths.runtimeVerificationPath)

  try {
    const runtimeManifest = await readJson(paths.manifestPath)
    evidence.runtimeSurfaceSource =
      runtimeManifest.shadcnRuntimeSurface?.source ?? "unknown"
  } catch (error) {
    evidence.manifestError =
      error instanceof Error ? error.message : String(error)
  }

  try {
    const runtimeVerificationState = await readJson(paths.runtimeVerificationPath)
    evidence.runtimeCard = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "card",
    )
    evidence.runtimeAlert = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "alert",
    )
    evidence.runtimePage = findRendererComponent(
      runtimeVerificationState.rendererMapping,
      "page",
    )
    evidence.verificationCurrent = isRuntimeVerificationCurrent({
      runtimeVerificationState,
      schema,
    })
    const verificationSource = await readRuntimeFile(paths.runtimeVerificationPath)
    evidence.runtimeVerificationMentionsContentLayout =
      verificationSource.includes('"contentLayout"')
    evidence.runtimeVerificationCardDefault =
      verificationSource.includes('"name": "card"') &&
      verificationSource.includes('"contentLayout": "default"')
  } catch (error) {
    evidence.verificationError =
      error instanceof Error ? error.message : String(error)
  }

  try {
    const basicRendererSource = await readRuntimeFile(
      path.join(paths.runtimeSrcDir, "renderer", "ui-renderers", "basic.tsx"),
    )
    evidence.basicRendererReferencesContentLayout =
      basicRendererSource.includes("contentLayout")
    evidence.defaultCardContentHasLegacyClasses =
      basicRendererSource.includes("ahtml-section-stack") &&
      basicRendererSource.includes("ahtml-prose-block") &&
      basicRendererSource.includes("rendererSpec.contentLayout")
        ? false
        : basicRendererSource.includes("ahtml-section-stack") &&
            basicRendererSource.includes("ahtml-prose-block")
  } catch {
    evidence.basicRendererReferencesContentLayout = false
    evidence.defaultCardContentHasLegacyClasses = false
  }

  return evidence
}

function findRendererComponent(rendererMapping, name) {
  return rendererMapping?.components?.find((component) => component.name === name)
}

function printRendererSummary(label, component) {
  if (!component) {
    printLine(label, "missing")
    return
  }

  printLine(
    label,
    JSON.stringify(
      {
        kind: component.kind,
        renderKind: component.renderKind,
        contentLayout: component.contentLayout,
        childMode: component.childMode,
        textMode: component.textMode,
      },
      null,
      2,
    ),
  )
}

function printSection(title) {
  process.stdout.write(`\n## ${title}\n`)
}

function printLine(label, value) {
  process.stdout.write(`${label}: ${String(value)}\n`)
}

function printCheck(label, ok) {
  process.stdout.write(`${ok ? "[ok]" : "[!!]"} ${label}\n`)
}

async function importModule(relativePath) {
  return import(pathToFileURL(path.join(repoRoot, relativePath)).href)
}

async function readRuntimeFile(filePath) {
  return readFile(filePath, "utf8")
}

async function readJson(filePath) {
  return JSON.parse(await readFile(filePath, "utf8"))
}

async function ensureDir(directory) {
  const { mkdir } = await import("node:fs/promises")
  await mkdir(directory, { recursive: true })
}

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false
    }

    throw error
  }
}

async function waitForPreviewUrl(childProcess, timeoutMs = 30000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for preview URL."))
    }, timeoutMs)
    const stdout = []
    const stderr = []

    childProcess.stdout.on("data", (chunk) => {
      const text = chunk.toString("utf8")
      stdout.push(text)
      const match = text.match(/Preview:\s+(http:\/\/127\.0\.0\.1:\d+)/)

      if (match) {
        clearTimeout(timer)
        resolve(match[1])
      }
    })

    childProcess.stderr.on("data", (chunk) => {
      stderr.push(chunk.toString("utf8"))
    })

    childProcess.once("exit", (code) => {
      clearTimeout(timer)
      reject(
        new Error(
          `Preview process exited before URL was ready. code=${String(code)} stdout=${stdout.join("")} stderr=${stderr.join("")}`,
        ),
      )
    })
  })
}

async function waitForPreviewBodyContains(
  url,
  text,
  { timeoutMs = 30000, intervalMs = 500 } = {},
) {
  const startedAt = Date.now()

  while (Date.now() - startedAt < timeoutMs) {
    try {
      const response = await fetch(url)
      const body = await response.text()

      if (body.includes(text)) {
        return body
      }
    } catch {}

    await new Promise((resolve) => setTimeout(resolve, intervalMs))
  }

  throw new Error(`Timed out waiting for preview body to contain: ${text}`)
}

function extractCardSnippet(html, title) {
  const titleIndex = html.indexOf(title)

  if (titleIndex === -1) {
    return ""
  }

  const cardIndex = html.lastIndexOf('data-slot="card"', titleIndex)

  if (cardIndex === -1) {
    return ""
  }

  return html.slice(cardIndex, Math.min(html.length, titleIndex + 2000))
}

function extractCardContentClass(snippet) {
  const match = snippet.match(
    /data-slot="card-content"\s+class="([^"]+)"/,
  )

  return match?.[1]
}

function printCardLayoutReport(label, snippet) {
  const report = createCardLayoutReport(snippet)

  if (!report) {
    printLine(label, "not-found")
    return
  }

  printLine(label, JSON.stringify(report, null, 2))
}

function createCardLayoutReport(snippet) {
  if (!snippet) {
    return null
  }

  const fragment = parse5.parseFragment(snippet)
  const cardNode = findFirstElement(fragment, (node) => getAttr(node, "data-slot") === "card")

  if (!cardNode) {
    return null
  }

  const headerNode = findFirstElement(
    cardNode,
    (node) => getAttr(node, "data-slot") === "card-header",
  )
  const titleNode = findFirstElement(
    cardNode,
    (node) => getAttr(node, "data-slot") === "card-title",
  )
  const contentNode = findFirstElement(
    cardNode,
    (node) => getAttr(node, "data-slot") === "card-content",
  )

  return {
    root: summarizeElement(cardNode),
    header: summarizeElement(headerNode),
    title: {
      ...summarizeElement(titleNode),
      text: getNodeText(titleNode),
    },
    content: summarizeElement(contentNode),
    contentChildren: getElementChildren(contentNode).map((node) => ({
      ...summarizeElement(node),
      text: summarizeText(getNodeText(node)),
    })),
  }
}

function summarizeElement(node) {
  if (!node) {
    return null
  }

  return {
    tag: node.tagName ?? null,
    slot: getAttr(node, "data-slot"),
    component: getAttr(node, "data-agent-html-component"),
    className: getAttr(node, "class"),
  }
}

function getElementChildren(node) {
  if (!node?.childNodes) {
    return []
  }

  return node.childNodes.filter((child) => child?.nodeName && child.nodeName !== "#text")
}

function getAttr(node, name) {
  return node?.attrs?.find((attr) => attr.name === name)?.value ?? null
}

function findFirstElement(node, predicate) {
  if (!node) {
    return null
  }

  if (node.nodeName !== "#text" && predicate(node)) {
    return node
  }

  for (const child of node.childNodes ?? []) {
    const result = findFirstElement(child, predicate)

    if (result) {
      return result
    }
  }

  return null
}

function getNodeText(node) {
  if (!node) {
    return ""
  }

  if (node.nodeName === "#text") {
    return node.value ?? ""
  }

  return (node.childNodes ?? []).map((child) => getNodeText(child)).join("")
}

function summarizeText(value, maxLength = 80) {
  const normalized = value.replace(/\s+/g, " ").trim()

  if (normalized.length <= maxLength) {
    return normalized
  }

  return `${normalized.slice(0, maxLength)}...`
}

async function waitForProcessExit(childProcess, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for child process exit."))
    }, timeoutMs)

    childProcess.once("exit", () => {
      clearTimeout(timer)
      resolve(undefined)
    })
  })
}

main().catch((error) => {
  process.stderr.write(`${error instanceof Error ? error.stack ?? error.message : String(error)}\n`)
  process.exitCode = 1
})
