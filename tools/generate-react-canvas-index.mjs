import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { cruise } from "dependency-cruiser"
import ts from "typescript"
import dependencyCruiserConfig from "../.dependency-cruiser.mjs"
import dependencyCruiserResolveConfig from "../config/dependency-cruiser.react-canvas-resolve.mjs"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const workspaceRoot = path.join(root, "agent-html")
const tmpRoot = path.join(root, "node_modules", ".tmp", "agent-html-index-dts")
const dtsWorkspaceRoot = path.join(tmpRoot, "agent-html")
const depsJsonPath = path.join(root, "node_modules", ".tmp", "agent-html-deps.json")
const shouldCheck = process.argv.includes("--check")
const largeFileTokenThreshold = 2000

const apiSections = [
  { label: "components/ui", sourceDir: "components/ui" },
  { label: "components", sourceDir: "components", directOnly: true },
  { label: "hooks", sourceDir: "hooks" },
  { label: "lib", sourceDir: "lib" },
  { label: "schema", sourceDir: "schema" },
  { label: "theme", sourceDir: "theme" },
]
const obsoleteGeneratedPaths = [
  "index/exports.md",
  "index/imports.md",
  "index/api/ui.d.ts",
  ...apiSections.map(({ sourceDir }) => `index/api/${sourceDir}.d.ts`),
]

function fail(message) {
  console.error(`canvas:index failed: ${message}`)
  process.exit(1)
}

function toRepoPath(filePath) {
  return path.relative(root, filePath).replaceAll(path.sep, "/")
}

function toWorkspacePath(filePath) {
  return path.relative(workspaceRoot, filePath).replaceAll(path.sep, "/")
}

function normalizeOutput(content) {
  return `${content.trimEnd().replace(/\r\n/g, "\n")}\n`
}

function writeOrCheck(relativePath, content, writtenFiles) {
  const outputPath = path.join(workspaceRoot, relativePath)
  const normalized = normalizeOutput(content)

  writtenFiles.set(outputPath, normalized)

  if (shouldCheck) {
    if (!fs.existsSync(outputPath)) {
      fail(`${toRepoPath(outputPath)} is missing; run npm run canvas:index`)
    }

    const current = fs.readFileSync(outputPath, "utf8").replace(/\r\n/g, "\n")

    if (current !== normalized) {
      fail(`${toRepoPath(outputPath)} is stale; run npm run canvas:index`)
    }

    return
  }

  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, normalized, "utf8")
}

function cleanupObsoleteGeneratedFiles() {
  for (const relativePath of obsoleteGeneratedPaths) {
    const outputPath = path.join(workspaceRoot, relativePath)

    if (!fs.existsSync(outputPath)) {
      continue
    }

    if (shouldCheck) {
      fail(`${toRepoPath(outputPath)} is obsolete; run npm run canvas:index`)
    }

    fs.rmSync(outputPath, { force: true })
  }

  const apiDir = path.join(workspaceRoot, "index", "api")

  if (
    !shouldCheck &&
    fs.existsSync(apiDir) &&
    fs.readdirSync(apiDir).length === 0
  ) {
    fs.rmSync(apiDir, { recursive: true, force: true })
  }
}

function readAllFiles(dir) {
  if (!fs.existsSync(dir)) {
    return []
  }

  const files = []

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const entryPath = path.join(dir, entry.name)

    if (entry.isDirectory()) {
      files.push(...readAllFiles(entryPath))
      continue
    }

    files.push(entryPath)
  }

  return files.sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)))
}

function emitDeclarations() {
  fs.rmSync(tmpRoot, { recursive: true, force: true })
  fs.mkdirSync(tmpRoot, { recursive: true })

  const configPath = path.join(
    root,
    "config",
    "tsconfig",
    "tsconfig.react-canvas.json",
  )
  const configFile = ts.readConfigFile(configPath, ts.sys.readFile)

  if (configFile.error) {
    fail(formatDiagnostics([configFile.error]))
  }

  const parsedConfig = ts.parseJsonConfigFileContent(
    configFile.config,
    ts.sys,
    path.dirname(configPath),
    {
      noEmit: false,
      declaration: true,
      emitDeclarationOnly: true,
      declarationMap: false,
      outDir: tmpRoot,
      tsBuildInfoFile: path.join(tmpRoot, "tsconfig.tsbuildinfo"),
    },
    configPath,
  )

  if (parsedConfig.errors.length > 0) {
    fail(formatDiagnostics(parsedConfig.errors))
  }

  const program = ts.createProgram({
    rootNames: parsedConfig.fileNames,
    options: parsedConfig.options,
    projectReferences: parsedConfig.projectReferences,
  })
  const emitResult = program.emit()
  const diagnostics = ts
    .getPreEmitDiagnostics(program)
    .concat(emitResult.diagnostics)

  if (emitResult.emitSkipped || diagnostics.length > 0) {
    fail(formatDiagnostics(diagnostics))
  }
}

function formatDiagnostics(diagnostics) {
  return ts.formatDiagnosticsWithColorAndContext(diagnostics, {
    getCanonicalFileName: (fileName) => fileName,
    getCurrentDirectory: () => root,
    getNewLine: () => "\n",
  })
}

function buildApiSurfaceMarkdown() {
  const sections = [
    "<!-- generated: do not edit -->",
    "# React Canvas API Surface",
    "",
    "Compact exported API surface for `agent-html` source directories.",
    "Full TypeScript declarations are generated only as temporary build input.",
  ]

  for (const section of apiSections) {
    const dir = path.join(dtsWorkspaceRoot, section.sourceDir)
    const files = readApiSectionFiles(dir, section.directOnly)
    const rows = files
      .map((file) => {
        const content = fs.readFileSync(file, "utf8")
        const exports = extractExportedNames(content)

        return [
          `\`${sourcePathForDeclaration(section.sourceDir, file)}\``,
          exports.map((name) => `\`${name}\``).join(", "),
        ]
      })
      .filter((row) => row[1])

    sections.push("")
    sections.push(`## ${section.label}`)
    sections.push("")
    sections.push(markdownTable(["File", "Exports"], rows))
  }

  return sections.join("\n")
}

function readApiSectionFiles(dir, directOnly = false) {
  const files = directOnly
    ? fs.existsSync(dir)
      ? fs
          .readdirSync(dir, { withFileTypes: true })
          .filter((entry) => entry.isFile())
          .map((entry) => path.join(dir, entry.name))
      : []
    : readAllFiles(dir)

  return files
    .filter((file) => file.endsWith(".d.ts"))
    .sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)))
}

function sourcePathForDeclaration(sourceDir, declarationPath) {
  const relative = path
    .relative(path.join(dtsWorkspaceRoot, sourceDir), declarationPath)
    .replaceAll(path.sep, "/")
  const basePath = relative.replace(/\.d\.ts$/, "")
  const sourceExt = fs.existsSync(
    path.join(workspaceRoot, sourceDir, `${basePath}.tsx`),
  )
    ? ".tsx"
    : ".ts"

  return `agent-html/${sourceDir}/${basePath}${sourceExt}`
}

function extractExportedNames(content) {
  const names = new Set()
  const exportBlockPattern = /export\s*\{([^}]+)\};/g
  let exportBlockMatch

  while ((exportBlockMatch = exportBlockPattern.exec(content))) {
    for (const rawExport of exportBlockMatch[1].split(",")) {
      const exportName = rawExport
        .trim()
        .replace(/^type\s+/, "")
        .split(/\s+as\s+/)
        .pop()
        ?.trim()

      if (exportName) {
        names.add(exportName)
      }
    }
  }

  const exportedDeclarationPattern =
    /^export\s+(?:declare\s+)?(?:function|const|class|interface|type|enum)\s+([A-Za-z_$][\w$]*)/gm
  let declarationMatch

  while ((declarationMatch = exportedDeclarationPattern.exec(content))) {
    names.add(declarationMatch[1])
  }

  return [...names].sort()
}

async function cruiseDependencies() {
  const result = await cruise(
    ["agent-html"],
    {
      ruleSet: dependencyCruiserConfig,
      outputType: "json",
    },
    dependencyCruiserResolveConfig.resolve,
  )

  if (result.exitCode !== 0) {
    fail(String(result.output).trim())
  }

  const dependencyGraph =
    typeof result.output === "string" ? JSON.parse(result.output) : result.output

  fs.mkdirSync(path.dirname(depsJsonPath), { recursive: true })
  fs.writeFileSync(
    depsJsonPath,
    `${JSON.stringify(dependencyGraph, null, 2)}\n`,
    "utf8",
  )

  return dependencyGraph
}

function isWorkspaceModule(filePath) {
  return filePath.startsWith("agent-html/")
}

function dependencyKind(dependency) {
  if (dependency.couldNotResolve) {
    return "unresolved"
  }

  if (dependency.resolved && isWorkspaceModule(dependency.resolved)) {
    return "local"
  }

  if (dependency.coreModule) {
    return "core"
  }

  return "external"
}

function buildDependencySummaryMarkdown(dependencyGraph) {
  const modules = dependencyGraph.modules.filter((module) =>
    isWorkspaceModule(module.source),
  )
  const edges = modules.flatMap((module) =>
    module.dependencies.map((dependency) => ({
      from: module.source,
      to: dependency.resolved || dependency.module,
      kind: dependencyKind(dependency),
      circular: dependency.circular,
      unresolved: dependency.couldNotResolve,
      rules: dependency.rules ?? [],
    })),
  )
  const localEdges = edges.filter((edge) => edge.kind === "local")
  const externalEdges = edges.filter((edge) => edge.kind === "external")
  const unresolvedEdges = edges.filter((edge) => edge.unresolved)
  const circularEdges = edges.filter((edge) => edge.circular)
  const violatingEdges = edges.filter((edge) => edge.rules.length > 0)

  const inboundCounts = countBy(localEdges.map((edge) => edge.to))
  const outboundCounts = countBy(localEdges.map((edge) => edge.from))
  const externalCounts = countBy(externalEdges.map((edge) => edge.to))

  return [
    "<!-- generated: do not edit -->",
    "# React Canvas Dependency Summary",
    "",
    "Dependency-cruiser summary for `agent-html` source files.",
    "",
    "## Counts",
    "",
    markdownTable(
      ["Metric", "Count"],
      [
        ["Modules", String(modules.length)],
        ["Dependencies", String(edges.length)],
        ["Local edges", String(localEdges.length)],
        ["External edges", String(externalEdges.length)],
        ["Unresolved edges", String(unresolvedEdges.length)],
        ["Circular edges", String(circularEdges.length)],
        ["Rule violations", String(violatingEdges.length)],
      ],
    ),
    "",
    "## Top Local Dependents",
    "",
    markdownTable(["Module", "Inbound Local Edges"], topCounts(inboundCounts, 12)),
    "",
    "## Highest Local Fanout",
    "",
    markdownTable(["Module", "Outbound Local Edges"], topCounts(outboundCounts, 12)),
    "",
    "## Top External Dependencies",
    "",
    markdownTable(["Module", "Edges"], topCounts(externalCounts, 12)),
  ].join("\n")
}

function countBy(values) {
  const counts = new Map()

  for (const value of values) {
    counts.set(value, (counts.get(value) ?? 0) + 1)
  }

  return counts
}

function topCounts(counts, limit) {
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => [`\`${name}\``, String(count)])
}

function buildLargeFilesMarkdown() {
  const rows = readAllFiles(workspaceRoot)
    .filter((file) => !toWorkspacePath(file).startsWith("index/"))
    .map((file) => ({
      file: toRepoPath(file),
      estimatedTokens: estimateTokens(fs.statSync(file).size),
    }))
    .filter((entry) => entry.estimatedTokens >= largeFileTokenThreshold)
    .sort(
      (a, b) =>
        b.estimatedTokens - a.estimatedTokens || a.file.localeCompare(b.file),
    )
    .map((entry) => [
      `\`${entry.file}\``,
      String(entry.estimatedTokens),
      suggestedRoute(entry.file),
    ])

  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Large Files",
    "",
    `Files at or above about ${largeFileTokenThreshold} estimated tokens. Token counts are lightweight reading-cost estimates, not tokenizer-exact values. Read generated API or route docs before opening these wholesale.`,
    "",
    markdownTable(["File", "Est. Tokens", "Read First"], rows),
  ].join("\n")
}

function buildReuseSurfaceMarkdown() {
  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Reuse Surface",
    "",
    "Decision surface for reusable `agent-html` hooks, helpers, schemas, and data.",
    "Use this file to decide whether an existing owner fits before opening source.",
    "",
    "## Hooks",
    "",
    markdownTable(
      ["Need", "Use", "Import", "Minimal Signature", "Read Next"],
      [
        [
          "Filter a local list by text query",
          "`useFilter`",
          "`agent-html/hooks/use-filter.ts`",
          "`useFilter<T>(items, getSearchText) -> { filteredItems, query, setQuery }`",
          "`hooks/use-filter.ts`",
        ],
        [
          "Track one selected item or clear selection",
          "`useSelection`",
          "`agent-html/hooks/use-selection.ts`",
          "`useSelection<T>(initialValue?) -> { selected, setSelected, clearSelection }`",
          "`hooks/use-selection.ts`",
        ],
        [
          "Branch behavior for mobile layout",
          "`useIsMobile`",
          "`agent-html/hooks/use-mobile.ts`",
          "`useIsMobile() -> boolean`",
          "`hooks/use-mobile.ts`",
        ],
      ],
    ),
    "",
    "## Lib",
    "",
    markdownTable(
      ["Need", "Use", "Import", "Minimal Signature", "Read Next"],
      [
        [
          "Merge conditional class names",
          "`cn`",
          "`agent-html/lib/cn.ts`",
          "`cn(...inputs) -> string`",
          "`lib/cn.ts`",
        ],
        [
          "Compose React refs",
          "`composeRefs`, `useComposedRefs`",
          "`agent-html/lib/compose-refs.ts`",
          "`composeRefs(...refs) -> ref callback`",
          "`lib/compose-refs.ts`",
        ],
        [
          "Format dates for display",
          "`formatDate`",
          "`agent-html/lib/format-date.ts`",
          "`formatDate(value) -> string`",
          "`lib/format-date.ts`",
        ],
        [
          "Parse usage dashboard CSV",
          "`parseUsageDashboardCsv`, `latestUsageRows`",
          "`agent-html/lib/usage-dashboard.ts`",
          "`parseUsageDashboardCsv(csv) -> UsageDashboardRow[]`",
          "`data/README.md`, then `lib/usage-dashboard.ts`",
        ],
      ],
    ),
    "",
    "## Schema And Data",
    "",
    markdownTable(
      ["Need", "Use", "Import", "Minimal Signature", "Read Next"],
      [
        [
          "Validate research-style artifact items",
          "`researchItemSchema`, `researchItemsSchema`",
          "`agent-html/schema/artifact-data.ts`",
          "`researchItemsSchema.parse(value) -> ResearchItem[]`",
          "`schema/artifact-data.ts`, `data/example-items.json`",
        ],
        [
          "Use sample research items",
          "`example-items.json`",
          "`agent-html/data/example-items.json`",
          "`ResearchItem[]` fixture",
          "`data/README.md`",
        ],
        [
          "Use usage dashboard rows",
          "`public.usage_dashboard_hourly.csv`",
          "`agent-html/data/public.usage_dashboard_hourly.csv`",
          "Raw CSV for `parseUsageDashboardCsv`",
          "`data/README.md`, then `lib/usage-dashboard.ts`",
        ],
      ],
    ),
    "",
    "## Boundary",
    "",
    "This file answers when to reuse an owner. `api-surface.md` answers exact exports. Open source only after these maps identify the likely owner.",
  ].join("\n")
}

function estimateTokens(byteLength) {
  return Math.ceil(byteLength / 4)
}

function suggestedRoute(file) {
  if (file.includes("/artifacts/")) {
    return "`artifacts/README.md`"
  }

  if (file.includes("/data/")) {
    return "`data/README.md`"
  }

  if (file.includes("/components/")) {
    return "`components/README.md`"
  }

  if (file.includes("/ui/")) {
    return "`index/api-surface.md`"
  }

  if (
    file.includes("/hooks/") ||
    file.includes("/lib/") ||
    file.includes("/schema/") ||
    file.includes("/theme/")
  ) {
    return "`index/api-surface.md`"
  }

  if (file.endsWith(".artifact.tsx")) {
    return "`index/dependency-summary.md`"
  }

  return "nearest README or source-specific notes"
}

function buildReadme() {
  return [
    "# React Canvas Index",
    "",
    "Generated decision layer for `agent-html`.",
    "",
    "Use this directory to choose the next file to open. It is an agent-facing index layer, not a source layer and not a full dependency dump.",
    "",
    "## Read Order",
    "",
    "1. Read `large-files.md` before opening broad coverage artifacts or large primitives.",
    "2. Read `dependency-summary.md` before broad dependency or boundary work.",
    "3. Read `reuse-surface.md` when choosing reusable hooks, helpers, schemas, or data.",
    "4. Read `api-surface.md` when checking component, hook, helper, schema, or theme exports.",
    "5. Open source only after the index identifies the relevant file.",
    "",
    "## Files",
    "",
    "- `large-files.md` flags files that should be read by route, not by default.",
    "- `dependency-summary.md` maps dependency-cruiser graph health and high-gravity modules.",
    "- `reuse-surface.md` maps reusable source owners to use cases and minimal signatures.",
    "- `api-surface.md` maps compact exported API surfaces.",
    "",
    "Full declarations and dependency graphs are temporary machine inputs under `node_modules/.tmp`, not committed agent context. Regenerate with `npm run canvas:index`.",
  ].join("\n")
}

function markdownTable(headers, rows) {
  const headerLine = `| ${headers.join(" | ")} |`
  const divider = `| ${headers.map(() => "---").join(" | ")} |`
  const body = rows.map((row) => `| ${row.map(markdownCell).join(" | ")} |`)

  return [headerLine, divider, ...body].join("\n")
}

function markdownCell(value) {
  return String(value).replaceAll("\n", " ").replaceAll("|", "\\|")
}

emitDeclarations()

const writtenFiles = new Map()
const dependencyGraph = await cruiseDependencies()

writeOrCheck("index/README.md", buildReadme(), writtenFiles)
writeOrCheck("index/large-files.md", buildLargeFilesMarkdown(), writtenFiles)
writeOrCheck(
  "index/dependency-summary.md",
  buildDependencySummaryMarkdown(dependencyGraph),
  writtenFiles,
)
writeOrCheck("index/reuse-surface.md", buildReuseSurfaceMarkdown(), writtenFiles)
writeOrCheck("index/api-surface.md", buildApiSurfaceMarkdown(), writtenFiles)
cleanupObsoleteGeneratedFiles()

if (shouldCheck) {
  console.log("canvas:index check passed")
} else {
  console.log(`canvas:index wrote ${writtenFiles.size} files`)
}
