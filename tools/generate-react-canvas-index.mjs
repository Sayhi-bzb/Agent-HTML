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
const ignoredWorkspaceDirectories = new Set([
  ".vite",
  "build",
  "dist",
  "node_modules",
])
const ignoredLargeFileExtensions = new Set([
  ".avif",
  ".gif",
  ".ico",
  ".jpeg",
  ".jpg",
  ".map",
  ".mov",
  ".mp3",
  ".mp4",
  ".otf",
  ".png",
  ".svg",
  ".ttf",
  ".wasm",
  ".wav",
  ".webm",
  ".webp",
  ".woff",
  ".woff2",
])

const apiSections = [
  {
    label: "components/chart",
    sourceDir: "components/chart",
    include: ["types.d.ts", "*-chart.d.ts"],
  },
  { label: "components/ui", sourceDir: "components/ui" },
  { label: "components", sourceDir: "components", directOnly: true },
  { label: "hooks", sourceDir: "hooks" },
  { label: "lib", sourceDir: "lib" },
  { label: "schema", sourceDir: "schema" },
]
const styleClassSections = [
  { label: "layouts/composition.css", sourceFile: "styles/layouts/composition.css" },
  { label: "layouts/layout.css", sourceFile: "styles/layouts/layout.css" },
]
const styleTokenSections = [
  { label: "materials/foundation.css", sourceFile: "styles/materials/foundation.css" },
  { label: "materials/tailwind.css", sourceFile: "styles/materials/tailwind.css" },
  { label: "kits/artifact.css", sourceFile: "styles/kits/artifact.css" },
  { label: "kits/content.css", sourceFile: "styles/kits/content.css" },
  { label: "kits/code-block.css", sourceFile: "styles/kits/code-block.css" },
]
const styleScaleSections = [
  { label: "agent-html/styles/kits/artifact.css", rootDir: workspaceRoot, sourceFile: "styles/kits/artifact.css" },
  { label: "agent-html/styles/kits/content.css", rootDir: workspaceRoot, sourceFile: "styles/kits/content.css" },
  { label: "agent-html/styles/materials/foundation.css", rootDir: workspaceRoot, sourceFile: "styles/materials/foundation.css" },
  { label: "agent-html/styles/materials/tailwind.css", rootDir: workspaceRoot, sourceFile: "styles/materials/tailwind.css" },
  { label: "packages/cli/src/host/styles/tokens/host.css", rootDir: root, sourceFile: "packages/cli/src/host/styles/tokens/host.css" },
  { label: "packages/cli/src/host/styles/tokens/theme-editor.css", rootDir: root, sourceFile: "packages/cli/src/host/styles/tokens/theme-editor.css" },
]
const styleUsageRoots = [
  "agent-html/artifacts",
  "apps/docs/content",
]
const styleUsageSampleLimit = 5
const obsoleteGeneratedPaths = [
  "index/exports.md",
  "index/imports.md",
  "index/api/ui.d.ts",
  "index/style-token-surface.md",
  "index/style-scale-surface.md",
  "index/style-tier-surface.md",
  "index/style-usage-surface.md",
  "index/style-variant-surface.md",
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
      if (ignoredWorkspaceDirectories.has(entry.name)) {
        continue
      }

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

    sections.push("")
    sections.push(`## agent-html/${section.sourceDir}/`)
    sections.push("")

    if (section.sourceDir === "components/chart") {
      sections.push(
        "Chart exports are grouped by public role to distinguish components, props, and artifact-authored data types.",
      )
      sections.push("")
      sections.push(buildChartApiSurfaceTable(section, files))
      continue
    }

    sections.push(buildDefaultApiSurfaceTable(section, files))
  }

  return sections.join("\n")
}

function buildDefaultApiSurfaceTable(section, files) {
  const rows = files
    .map((file) => {
      const content = fs.readFileSync(file, "utf8")
      const exports = extractExportedNames(content)

      return [
        `\`${relativeSourcePathForDeclaration(section.sourceDir, file)}\``,
        exports.map((name) => `\`${name}\``).join(", "),
      ]
    })
    .filter((row) => row[1])

  return markdownTable(["File", "Exports"], rows)
}

function buildChartApiSurfaceTable(section, files) {
  const rows = files
    .map((file) => {
      const content = fs.readFileSync(file, "utf8")
      const exports = extractExportedNames(content)
      const grouped = groupChartExports(exports)

      return [
        `\`${relativeSourcePathForDeclaration(section.sourceDir, file)}\``,
        formatExportGroup(grouped.components),
        formatExportGroup(grouped.props),
        formatExportGroup(grouped.dataTypes),
        formatExportGroup(grouped.other),
      ]
    })
    .filter((row) => row.slice(1).some((cell) => cell !== ""))

  return markdownTable(
    ["File", "Component Exports", "Props Exports", "Data Type Exports", "Other Exports"],
    rows,
  )
}

function groupChartExports(exports) {
  const groups = {
    components: [],
    dataTypes: [],
    other: [],
    props: [],
  }

  for (const name of exports) {
    if (/Chart$/.test(name)) {
      groups.components.push(name)
      continue
    }

    if (/Props$/.test(name)) {
      groups.props.push(name)
      continue
    }

    if (/(Data|Datum|Node|LinkDatum|NodeDatum)$/.test(name)) {
      groups.dataTypes.push(name)
      continue
    }

    groups.other.push(name)
  }

  return groups
}

function formatExportGroup(exports) {
  return exports.map((name) => `\`${name}\``).join(", ")
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
    .filter((file) => matchesApiSectionInclude(dir, file))
    .sort((a, b) => toRepoPath(a).localeCompare(toRepoPath(b)))
}

function matchesApiSectionInclude(sectionDir, file) {
  const section = apiSections.find(
    ({ sourceDir }) =>
      path.join(dtsWorkspaceRoot, sourceDir) === sectionDir
  )

  if (!section?.include) {
    return true
  }

  const relative = path
    .relative(sectionDir, file)
    .replaceAll(path.sep, "/")

  return section.include.some((pattern) => {
    if (!pattern.includes("*")) {
      return relative === pattern
    }

    const regex = new RegExp(
      `^${pattern
        .split("*")
        .map((part) => part.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"))
        .join(".*")}$`
    )
    return regex.test(relative)
  })
}

function relativeSourcePathForDeclaration(sourceDir, declarationPath) {
  const relative = path
    .relative(path.join(dtsWorkspaceRoot, sourceDir), declarationPath)
    .replaceAll(path.sep, "/")
  const basePath = relative.replace(/\.d\.ts$/, "")
  const sourceExt = fs.existsSync(
    path.join(workspaceRoot, sourceDir, `${basePath}.tsx`),
  )
    ? ".tsx"
    : ".ts"

  return `${basePath}${sourceExt}`
}

function extractExportedNames(content) {
  const names = new Set()
  const exportBlockPattern = /export\s+(?:type\s+)?\{([^}]+)\}(?:\s+from\s+["'][^"']+["'])?;/g
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
  const workspacePath = filePath.replaceAll(path.sep, "/")

  return (
    workspacePath.startsWith("agent-html/") &&
    !workspacePath
      .split("/")
      .some((segment) => ignoredWorkspaceDirectories.has(segment))
  )
}

function isLargeFileIndexCandidate(file) {
  const extension = path.extname(file).toLowerCase()

  return !ignoredLargeFileExtensions.has(extension)
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
    .filter(isLargeFileIndexCandidate)
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
    "Decision surface for reusable `agent-html` hooks and helpers.",
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
      ],
    ),
    "",
    "## Boundary",
    "",
    "This file answers when to reuse an owner. `api-surface.md` answers exact exports. Open source only after these maps identify the likely owner.",
  ].join("\n")
}

function buildStyleSurfaceMarkdown() {
  const rows = styleUsageRows()
  const defaultClasses = rows.filter(({ tier }) => tier === "default")
  const rareClasses = rows.filter(({ tier }) => tier === "rare")
  const legacyClasses = rows.filter(({ tier }) => tier === "legacy")
  const sections = [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Surface",
    "",
    "Generated default CSS class surface for Canvas artifact authoring.",
    "Use default classes first. Rare classes are valid but should stay situational; open `styles/diagnostics/tier-surface.md` or CSS source only when changing class behavior.",
    "",
    "## Default Classes",
    "",
    markdownList(defaultClasses.map(({ className }) => className)),
    "",
    "## Rare Classes",
    "",
    markdownList(rareClasses.map(({ className }) => className)),
  ]

  if (legacyClasses.length > 0) {
    sections.push("")
    sections.push("## Legacy Classes")
    sections.push("")
    sections.push(markdownList(legacyClasses.map(({ className }) => className)))
  }

  return sections.join("\n")
}

function buildStyleTokenSurfaceMarkdown() {
  const sections = [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Token Surface",
    "",
    "Generated CSS token surface for Canvas style maintenance and diagnostics.",
    "Names are grouped by source owner; artifact authoring should usually start with `style-surface.md`.",
    "",
    "## Tokens",
  ]

  for (const section of styleTokenSections) {
    sections.push("")
    sections.push(`### agent-html/${section.sourceFile}`)
    sections.push("")
    sections.push(markdownList(extractCssCustomProperties(section.sourceFile)))
  }

  return sections.join("\n")
}

function buildStyleScaleSurfaceMarkdown() {
  const scaleEntries = styleScaleSections.flatMap(extractCssRemScaleEntries)
  const sections = [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Scale Surface",
    "",
    "Generated CSS scale map for Canvas style maintenance and diagnostics.",
    "Values group directly-defined `rem` token definitions by token category.",
    "Same value across different categories is not a merge signal by itself; runtime class authoring should usually start with `style-surface.md`.",
    "",
  ]

  for (const category of styleScaleCategories) {
    const entries = scaleEntries.filter((entry) => entry.category === category.id)

    if (entries.length === 0) {
      continue
    }

    sections.push(`## ${category.label}`)
    sections.push("")
    sections.push(buildStyleScaleTable(entries))
    sections.push("")
  }

  return sections.join("\n")
}

function buildStyleUsageSurfaceMarkdown() {
  const usageRows = styleUsageRows()

  const familyRows = [...Map.groupBy(usageRows, ({ family }) => family).entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([family, rows]) => [
      `\`${family}\``,
      String(rows.length),
      String(rows.filter(({ uses }) => uses > 0).length),
      String(rows.reduce((sum, { uses }) => sum + uses, 0)),
    ])
  const lowUseRows = usageRows
    .filter(({ uses }) => uses <= 2)
    .sort((a, b) => a.uses - b.uses || a.className.localeCompare(b.className))
    .map(styleUsageTableRow)

  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Usage Surface",
    "",
    "Generated usage map for public Canvas artifact CSS classes.",
    "Counts scan artifact and docs authoring sources only; CSS definitions, generated indexes, build output, and host chrome are not counted.",
    "",
    "## Summary",
    "",
    markdownTable(
      ["Metric", "Count"],
      [
        ["Public classes", String(usageRows.length)],
        ["Used classes", String(usageRows.filter(({ uses }) => uses > 0).length)],
        ["Unused classes", String(usageRows.filter(({ uses }) => uses === 0).length)],
        ["Usage hits", String(usageRows.reduce((sum, { uses }) => sum + uses, 0))],
      ],
    ),
    "",
    "## Families",
    "",
    markdownTable(["Family", "Classes", "Used", "Hits"], familyRows),
    "",
    "## Low Use Classes",
    "",
    markdownTable(["Class", "Family", "Uses", "Files", "Sample Locations"], lowUseRows),
    "",
    "## All Classes",
    "",
    markdownTable(
      ["Class", "Family", "Uses", "Files", "Sample Locations"],
      usageRows.map(styleUsageTableRow),
    ),
  ].join("\n")
}

function buildStyleVariantSurfaceMarkdown() {
  const usageRows = styleClassSections
    .flatMap(({ sourceFile }) => extractCssClasses(sourceFile))
    .map((className) => styleUsageForClass(className))
  const frameMediaRows = usageRows
    .filter(({ family }) => family === "frame-media")
    .sort((a, b) => b.uses - a.uses || a.className.localeCompare(b.className))
    .map((row) => styleVariantTableRow(row, frameMediaVariant(row.className)))
  const gridRows = usageRows
    .filter(({ family }) => family === "grid")
    .sort((a, b) => b.uses - a.uses || a.className.localeCompare(b.className))
    .map((row) => styleVariantTableRow(row, gridVariant(row.className)))

  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Variant Surface",
    "",
    "Generated variant matrix for high-branch Canvas CSS class families.",
    "Use this with `style-usage-surface.md` before deciding whether a class should be default, rare, or legacy.",
    "",
    "## Frame Media Variants",
    "",
    markdownTable(
      ["Class", "Variant", "Uses", "Files", "Sample Locations"],
      frameMediaRows,
    ),
    "",
    "## Grid Variants",
    "",
    markdownTable(
      ["Class", "Variant", "Uses", "Files", "Sample Locations"],
      gridRows,
    ),
  ].join("\n")
}

function buildStyleTierSurfaceMarkdown() {
  const usageRows = styleUsageRows()
  const tierRows = [...Map.groupBy(usageRows, ({ tier }) => tier).entries()]
    .sort(([a], [b]) => styleTierRank(a) - styleTierRank(b))
    .map(([tier, rows]) => [
      `\`${tier}\``,
      String(rows.length),
      String(rows.reduce((sum, { uses }) => sum + uses, 0)),
      [...new Set(rows.map(({ family }) => family))]
        .sort()
        .map((family) => `\`${family}\``)
        .join(", "),
    ])

  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Tier Surface",
    "",
    "Generated convergence map for public Canvas artifact CSS classes.",
    "`default` is the normal authoring surface, `rare` is valid but should stay situational, and `legacy` has no scanned artifact/docs usage.",
    "",
    "## Summary",
    "",
    markdownTable(["Tier", "Classes", "Hits", "Families"], tierRows),
    "",
    "## Default Classes",
    "",
    markdownTable(
      ["Class", "Family", "Uses", "Files", "Sample Locations"],
      usageRows.filter(({ tier }) => tier === "default").map(styleUsageTableRow),
    ),
    "",
    "## Rare Classes",
    "",
    markdownTable(
      ["Class", "Family", "Uses", "Files", "Sample Locations"],
      usageRows.filter(({ tier }) => tier === "rare").map(styleUsageTableRow),
    ),
    "",
    "## Legacy Classes",
    "",
    markdownTable(
      ["Class", "Family", "Uses", "Files", "Sample Locations"],
      usageRows.filter(({ tier }) => tier === "legacy").map(styleUsageTableRow),
    ),
  ].join("\n")
}

function readWorkspaceText(relativePath) {
  const filePath = path.join(workspaceRoot, relativePath)

  if (!fs.existsSync(filePath)) {
    return ""
  }

  return fs.readFileSync(filePath, "utf8")
}

function readText(rootDir, relativePath) {
  const filePath = path.join(rootDir, relativePath)

  if (!fs.existsSync(filePath)) {
    return ""
  }

  return fs.readFileSync(filePath, "utf8")
}

function extractCssClasses(relativePath) {
  const content = readWorkspaceText(relativePath)
  const classNames = new Set()
  const classPattern = /\.((?:canvas)-[A-Za-z0-9_-]+)\b/g
  let match

  while ((match = classPattern.exec(content))) {
    classNames.add(match[1])
  }

  return [...classNames].sort()
}

function styleUsageForClass(className) {
  const locations = []

  for (const file of styleUsageFiles()) {
    const content = fs.readFileSync(file, "utf8")

    if (!content.includes(className)) {
      continue
    }

    const lines = content.split(/\r?\n/)

    lines.forEach((line, index) => {
      if (line.includes(className)) {
        locations.push(`${toRepoPath(file)}:${index + 1}`)
      }
    })
  }

  return {
    className,
    family: styleClassFamily(className),
    files: new Set(locations.map((location) => location.split(":")[0])).size,
    locations,
    uses: locations.length,
  }
}

function styleUsageRows() {
  return styleClassSections
    .flatMap(({ sourceFile }) => extractCssClasses(sourceFile))
    .map((className) => {
      const usage = styleUsageForClass(className)

      return {
        ...usage,
        tier: styleClassTier(usage.uses),
      }
    })
    .sort((a, b) => b.uses - a.uses || a.className.localeCompare(b.className))
}

function styleClassTier(uses) {
  if (uses === 0) {
    return "legacy"
  }

  if (uses <= 2) {
    return "rare"
  }

  return "default"
}

function styleTierRank(tier) {
  return {
    default: 0,
    rare: 1,
    legacy: 2,
  }[tier]
}

function styleUsageFiles() {
  return styleUsageRoots
    .flatMap((relativePath) => readAllFiles(path.join(root, relativePath)))
    .filter((file) =>
      [".js", ".jsx", ".md", ".mdx", ".ts", ".tsx"].includes(
        path.extname(file),
      )
    )
}

function styleClassFamily(className) {
  if (className.startsWith("canvas-frame-media")) {
    return "frame-media"
  }

  if (className.startsWith("canvas-frame")) {
    return "frame"
  }

  if (className.startsWith("canvas-grid")) {
    return "grid"
  }

  if (className.startsWith("canvas-stack")) {
    return "stack"
  }

  if (className.startsWith("canvas-text")) {
    return "text"
  }

  if (className.startsWith("canvas-cluster")) {
    return "cluster"
  }

  if (className.startsWith("canvas-wrap")) {
    return "wrap"
  }

  if (className.startsWith("canvas-content")) {
    return "content"
  }

  if (className.startsWith("canvas-icon")) {
    return "icon"
  }

  return "other"
}

function styleUsageTableRow(row) {
  return [
    `\`${row.className}\``,
    `\`${row.family}\``,
    String(row.uses),
    String(row.files),
    row.locations
      .slice(0, styleUsageSampleLimit)
      .map((location) => `\`${location}\``)
      .join(", "),
  ]
}

function styleVariantTableRow(row, variant) {
  return [
    `\`${row.className}\``,
    `\`${variant}\``,
    String(row.uses),
    String(row.files),
    row.locations
      .slice(0, styleUsageSampleLimit)
      .map((location) => `\`${location}\``)
      .join(", "),
  ]
}

function frameMediaVariant(className) {
  if (className === "canvas-frame-media") {
    return "base"
  }

  const suffix = className.replace("canvas-frame-media-", "")

  if (["16-9", "16-10", "portrait"].includes(suffix)) {
    return `aspect:${suffix}`
  }

  if (["fill", "min-sm", "min-lg", "md", "lg", "xl", "screen"].includes(suffix)) {
    return `height:${suffix}`
  }

  return "other"
}

function gridVariant(className) {
  if (["canvas-grid-gap", "canvas-grid-gap-md"].includes(className)) {
    return `base:${className.replace("canvas-grid-", "")}`
  }

  if (/^canvas-grid-2(?:-(sm|lg))?$/.test(className)) {
    const breakpoint = className.match(/-(sm|lg)$/)?.[1]

    return breakpoint ? `columns:2; breakpoint:${breakpoint}` : "columns:2"
  }

  if (className === "canvas-grid-4") {
    return "columns:4"
  }

  if (className === "canvas-grid-cards") {
    return "layout:cards"
  }

  const layoutMatch = className.match(
    /^canvas-grid-(main-aside|aside-main)(?:-(lg|xl))?(?:-(wide))?$/,
  )

  if (layoutMatch) {
    return [
      `layout:${layoutMatch[1]}`,
      layoutMatch[2] ? `breakpoint:${layoutMatch[2]}` : "",
      layoutMatch[3] ? `ratio:${layoutMatch[3]}` : "",
    ].filter(Boolean).join("; ")
  }

  return "other"
}

function extractCssCustomProperties(relativePath) {
  const content = readWorkspaceText(relativePath)
  const properties = new Set()
  const propertyPattern = /^\s*(--[A-Za-z0-9_-]+)\s*:/gm
  let match

  while ((match = propertyPattern.exec(content))) {
    properties.add(match[1])
  }

  return [...properties].sort()
}

function extractCssRemScaleEntries(section) {
  const content = readText(section.rootDir, section.sourceFile)
  const entries = []
  const propertyPattern = /^\s*(--[A-Za-z0-9_-]+)\s*:\s*(-?\d*\.?\d+rem)\s*;/gm
  let match

  while ((match = propertyPattern.exec(content))) {
    entries.push({
      category: styleScaleCategoryForToken(match[1]),
      name: match[1],
      source: section.label,
      value: match[2],
    })
  }

  return entries
}

const styleScaleCategories = [
  { id: "spacing", label: "Spacing" },
  { id: "font-size", label: "Font Size" },
  { id: "line-height", label: "Line Height" },
  { id: "width", label: "Width" },
  { id: "height", label: "Height" },
  { id: "size", label: "Size" },
  { id: "radius", label: "Radius" },
  { id: "shadow", label: "Shadow" },
  { id: "other", label: "Other" },
]

function styleScaleCategoryForToken(tokenName) {
  if (tokenName.includes("font-size")) {
    return "font-size"
  }

  if (tokenName.includes("line-height")) {
    return "line-height"
  }

  if (/(gap|padding|inset|offset|spacing)/.test(tokenName)) {
    return "spacing"
  }

  if (tokenName.includes("width")) {
    return "width"
  }

  if (tokenName.includes("height")) {
    return "height"
  }

  if (tokenName.includes("size")) {
    return "size"
  }

  if (tokenName.includes("radius")) {
    return "radius"
  }

  if (tokenName.includes("shadow")) {
    return "shadow"
  }

  return "other"
}

function buildStyleScaleTable(entries) {
  const scaleGroups = Map.groupBy(entries, ({ value }) => value)
  const rows = [...scaleGroups.entries()]
    .sort(([a], [b]) => Number.parseFloat(a) - Number.parseFloat(b))
    .map(([value, groupEntries]) => [
      `\`${value}\``,
      groupEntries
        .sort((a, b) => a.name.localeCompare(b.name))
        .map(({ name }) => `\`${name}\``)
        .join(", "),
      groupEntries
        .map(({ source }) => `\`${source}\``)
        .filter((source, index, sources) => sources.indexOf(source) === index)
        .join(", "),
    ])

  return markdownTable(["Value", "Tokens", "Sources"], rows)
}

function estimateTokens(byteLength) {
  return Math.ceil(byteLength / 4)
}

function suggestedRoute(file) {
  if (file.includes("/artifacts/")) {
    return "`artifacts/README.md`"
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
    "3. Read `reuse-surface.md` when choosing reusable hooks or helpers.",
    "4. Read `api-surface.md` when checking component, hook, helper, or schema exports.",
    "5. Read `style-surface.md` when choosing default Canvas artifact CSS classes.",
    "6. Open source only after the index identifies the relevant file.",
    "",
    "## Files",
    "",
    "- `large-files.md` flags files that should be read by route, not by default.",
    "- `dependency-summary.md` maps dependency-cruiser graph health and high-gravity modules.",
    "- `reuse-surface.md` maps reusable source owners to use cases and minimal signatures.",
    "- `api-surface.md` maps compact exported API surfaces.",
    "- `style-surface.md` maps generated artifact CSS class names.",
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

function markdownList(values) {
  if (values.length === 0) {
    return "_None found._"
  }

  return values.map((value) => `- \`${value}\``).join("\n")
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
writeOrCheck("index/style-surface.md", buildStyleSurfaceMarkdown(), writtenFiles)
writeOrCheck(
  "styles/diagnostics/token-surface.md",
  buildStyleTokenSurfaceMarkdown(),
  writtenFiles,
)
writeOrCheck(
  "styles/diagnostics/scale-surface.md",
  buildStyleScaleSurfaceMarkdown(),
  writtenFiles,
)
writeOrCheck(
  "styles/diagnostics/tier-surface.md",
  buildStyleTierSurfaceMarkdown(),
  writtenFiles,
)
writeOrCheck(
  "styles/diagnostics/usage-surface.md",
  buildStyleUsageSurfaceMarkdown(),
  writtenFiles,
)
writeOrCheck(
  "styles/diagnostics/variant-surface.md",
  buildStyleVariantSurfaceMarkdown(),
  writtenFiles,
)
cleanupObsoleteGeneratedFiles()

if (shouldCheck) {
  console.log("canvas:index check passed")
} else {
  console.log(`canvas:index wrote ${writtenFiles.size} files`)
}
