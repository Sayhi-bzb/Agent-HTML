import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import ts from "typescript"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const workspaceRoot = path.join(root, "agent-html")
const tmpRoot = path.join(root, ".tmp", "cache", "canvas-index-dts")
const dtsWorkspaceRoot = path.join(tmpRoot, "agent-html")
const shouldCheck = process.argv.includes("--check")
const ignoredWorkspaceDirectories = new Set([
  ".layout",
  ".vite",
  "build",
  "dist",
  "node_modules",
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
const styleUsageRoots = [
  "agent-html/artifacts",
  "apps/docs/content",
]
const obsoleteGeneratedPaths = [
  "index/exports.md",
  "index/imports.md",
  "index/api/ui.d.ts",
  "index/dependency-summary.md",
  "index/large-files.md",
  "index/reuse-surface.md",
  "index/style-token-surface.md",
  "index/style-scale-surface.md",
  "index/style-tier-surface.md",
  "index/style-usage-surface.md",
  "index/style-variant-surface.md",
  "styles/diagnostics/convergence-surface.md",
  "styles/diagnostics/naming-surface.md",
  "styles/diagnostics/scale-surface.md",
  "styles/diagnostics/tier-surface.md",
  "styles/diagnostics/token-surface.md",
  "styles/diagnostics/usage-surface.md",
  "styles/diagnostics/variant-surface.md",
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

function buildStyleSurfaceMarkdown() {
  const rows = styleUsageRows()
  const unusedClasses = rows.filter(({ tier }) => tier === "unused")
  if (unusedClasses.length > 0) {
    throw new Error(
      `Unused public Canvas style classes: ${unusedClasses
        .map(({ className }) => className)
        .join(", ")}`
    )
  }
  const defaultClasses = rows.filter(({ tier }) => tier === "default")
  const rareClasses = rows.filter(({ tier }) => tier === "rare")
  return [
    "<!-- generated: do not edit -->",
    "",
    "# React Canvas Style Surface",
    "",
    "Generated default CSS class surface for Canvas artifact authoring.",
    "Use default classes first. Rare classes are valid but should stay situational; open CSS source only when changing class behavior.",
    "",
    "## Default Classes",
    "",
    buildStyleSurfaceFamilyList(defaultClasses),
    "",
    "## Rare Classes",
    "",
    buildStyleSurfaceFamilyList(rareClasses),
  ].join("\n")
}

function readWorkspaceText(relativePath) {
  const filePath = path.join(workspaceRoot, relativePath)

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

function buildStyleSurfaceFamilyList(rows) {
  if (rows.length === 0) {
    return "_None found._"
  }

  return [...Map.groupBy(rows, ({ family }) => family).entries()]
    .sort(([a], [b]) => styleClassFamilyRank(a) - styleClassFamilyRank(b))
    .map(([family, familyRows]) => [
      `### ${styleClassFamilyLabel(family)}`,
      "",
      markdownList([formatStyleClassFamily(family, familyRows)]),
    ].join("\n"))
    .join("\n\n")
}

function formatStyleClassFamily(family, rows) {
  const rootClassName = `canvas-${family}`
  const variants = []
  let hasRoot = false

  for (const row of rows) {
    if (row.className === rootClassName) {
      hasRoot = true
      continue
    }

    variants.push(row.className.replace(`${rootClassName}-`, ""))
  }

  variants.sort((a, b) =>
    styleClassVariantRank(family, a) - styleClassVariantRank(family, b) ||
    a.localeCompare(b)
  )

  if (variants.length === 0) {
    return rootClassName
  }

  if (!hasRoot) {
    return `${rootClassName}-${variants.join("/")}`
  }

  return `${rootClassName}, ${rootClassName}-${variants.join("/")}`
}

function styleClassFamilyRank(family) {
  const familyOrder = [
    "text",
    "stack",
    "wrap",
    "cluster",
    "content",
    "icon",
    "grid",
    "frame",
    "frame-media",
    "other",
  ]
  const rank = familyOrder.indexOf(family)

  return rank === -1 ? familyOrder.length : rank
}

function styleClassVariantRank(family, variant) {
  const variantOrders = {
    text: ["caption", "body", "heading", "title"],
    stack: ["xs", "sm", "md", "lg", "xl"],
    wrap: ["sm", "md", "lg"],
    cluster: ["sm", "md", "lg"],
    content: ["panel"],
    icon: ["box-sm", "box-md", "box-lg"],
    grid: [
      "2",
      "2-sm",
      "2-lg",
      "4",
      "gap",
      "gap-md",
      "main-aside",
      "main-aside-lg",
      "main-aside-xl",
      "main-aside-xl-wide",
      "aside-main",
      "aside-main-lg",
      "cards",
    ],
    frame: ["table", "wide"],
    "frame-media": [
      "16-9",
      "portrait",
    ],
  }
  const rank = variantOrders[family]?.indexOf(variant) ?? -1

  return rank === -1 ? Number.MAX_SAFE_INTEGER : rank
}

function styleClassFamilyLabel(family) {
  return family
    .split("-")
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function styleClassTier(uses) {
  if (uses === 0) {
    return "unused"
  }

  if (uses <= 2) {
    return "rare"
  }

  return "default"
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
    "1. Read `api-surface.md` when checking component, hook, helper, or schema exports.",
    "2. Read `style-surface.md` when choosing default Canvas artifact CSS classes.",
    "3. Open source only after the index identifies the relevant file.",
    "",
    "## Files",
    "",
    "- `api-surface.md` maps compact exported API surfaces.",
    "- `style-surface.md` maps generated artifact CSS class names.",
    "",
    "Full declarations are temporary machine inputs under `.tmp/cache`, not committed agent context. Regenerate with `npm run canvas:index`.",
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

writeOrCheck("index/README.md", buildReadme(), writtenFiles)
writeOrCheck("index/api-surface.md", buildApiSurfaceMarkdown(), writtenFiles)
writeOrCheck("index/style-surface.md", buildStyleSurfaceMarkdown(), writtenFiles)
cleanupObsoleteGeneratedFiles()

if (shouldCheck) {
  console.log("canvas:index check passed")
} else {
  console.log(`canvas:index wrote ${writtenFiles.size} files`)
}
