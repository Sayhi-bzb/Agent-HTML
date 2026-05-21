import { execFile, spawn } from "node:child_process"
import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import {
  access,
  cp,
  mkdir,
  readFile,
  rename,
  rm,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import { supportedRuntimeBase } from "../../config/render-capabilities.mjs"
import {
  createManagedRuntimeCapability,
  createRuntimeContractFromSchema,
  createRuntimeVerificationState,
} from "../../config/runtime-contract.mjs"
import {
  createShadcnRuntimeSurface,
  recordAhtmlGlueProof,
} from "../runtime-surface.mjs"
import { applyManagedRuntimeUiOverrides } from "../runtime-managed-ui.mjs"
import { getDefaultShadcnPreset } from "../shadcn-api.mjs"

const shadcnCliTimeoutMs = 90000
const bootstrapDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "runtime-bootstrap",
)
const runtimeHostSourceDir = path.join(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "runtime-host",
)

export async function writeRuntimeHost({
  packageRoot,
  paths,
  schema,
  setup,
}) {
  const shadcnTemplateDir = resolveShadcnTemplateDir()
  const shellSource = shadcnTemplateDir
    ? "shadcn-template-override"
    : "shadcn-official-template"
  const dependencies = resolveRuntimeDependencies(packageRoot)
  const runtimeContract = createRuntimeContractFromSchema(schema)

  await rm(paths.runtimeDir, { force: true, recursive: true })
  await initShadcnRuntime({
    packageRoot,
    paths,
    setup,
    shadcnTemplateDir,
  })

  const runtimeSurface = await createShadcnRuntimeSurface({
    paths,
    shellSource,
    setup,
    runtimeBase: supportedRuntimeBase,
  })

  await installShadcnComponents({
    packageRoot,
    components: setup.components,
    paths,
    shadcnTemplateDir,
  })
  await applyManagedRuntimeUiOverrides({
    components: setup.components,
    paths,
  })
  await injectRuntimeHostFiles({
    paths,
    runtimeContract,
    runtimeSurface,
  })
  await ensureRuntimeBuildConfig({ packageRoot, paths, dependencies })
  const provenRuntimeSurface = await recordAhtmlGlueProof({
    paths,
    surface: runtimeSurface,
  })
  await writeRuntimeVerificationState({
    paths,
    runtimeContract,
    runtimeSurface: provenRuntimeSurface,
    setup,
  })

  return provenRuntimeSurface
}

export function resolveRuntimeDependencies(packageRoot) {
  const packageRequire = createRequire(path.join(packageRoot, "package.json"))
  const viteRoot = resolvePackageRoot("vite", packageRequire)
  const reactRoot = resolvePackageRoot("react", packageRequire)
  const reactDomRoot = resolvePackageRoot("react-dom", packageRequire)
  const baseUiReactRoot = resolvePackageRoot("@base-ui/react", packageRequire)
  const shadcnRoot = resolvePackageRoot("shadcn", packageRequire)
  const tailwindcssRoot = resolvePackageRoot("tailwindcss", packageRequire)

  return {
    viteBin: path.join(viteRoot, "bin", "vite.js"),
    viteModule: packageRequire.resolve("vite"),
    viteReactPlugin: packageRequire.resolve("@vitejs/plugin-react"),
    agentHtmlCoreEntry: packageRequire.resolve("@agent-html/core"),
    reactRoot,
    reactJsxRuntime: packageRequire.resolve("react/jsx-runtime"),
    reactDomRoot,
    reactDomClient: packageRequire.resolve("react-dom/client"),
    reactDomServer: packageRequire.resolve("react-dom/server"),
    reactResizablePanelsRoot: packageRequire.resolve("react-resizable-panels"),
    baseUiReactRoot,
    classVarianceAuthorityRoot: packageRequire.resolve(
      "class-variance-authority",
    ),
    clsxRoot: packageRequire.resolve("clsx"),
    lucideReactRoot: packageRequire.resolve("lucide-react"),
    radixUiRoot: packageRequire.resolve("radix-ui"),
    shadcnTailwindStylesheet: path.join(shadcnRoot, "dist", "tailwind.css"),
    tailwindMergeRoot: packageRequire.resolve("tailwind-merge"),
    tailwindcssStylesheet: path.join(tailwindcssRoot, "index.css"),
    tailwindcssVitePlugin: packageRequire.resolve("@tailwindcss/vite"),
    twAnimateCssStylesheet: resolvePackageSearchPathAsset({
      assetPath: path.join("dist", "tw-animate.css"),
      packageName: "tw-animate-css",
      packageRequire,
    }),
  }
}

function resolvePackageRoot(packageName, packageRequire) {
  try {
    return path.dirname(packageRequire.resolve(`${packageName}/package.json`))
  } catch {
    return findPackageRootFromResolvedPath(
      packageRequire.resolve(packageName),
      packageName,
    )
  }
}

function findPackageRootFromResolvedPath(resolvedPath, packageName) {
  let current = path.dirname(resolvedPath)

  while (true) {
    const packageJsonPath = path.join(current, "package.json")

    if (existsSync(packageJsonPath)) {
      return current
    }

    const parent = path.dirname(current)

    if (parent === current) {
      throw new Error(
        `Unable to locate package root for ${packageName} from ${resolvedPath}.`,
      )
    }

    current = parent
  }
}

function resolvePackageSearchPathAsset({
  assetPath,
  packageName,
  packageRequire,
}) {
  const searchPaths = packageRequire.resolve.paths(packageName) ?? []

  for (const searchPath of searchPaths) {
    const candidate = path.join(searchPath, packageName, assetPath)

    if (existsSync(candidate)) {
      return candidate
    }
  }

  throw new Error(
    `Unable to resolve ${packageName}/${assetPath.replaceAll("\\", "/")} from Node search paths for managed runtime bootstrap.`,
  )
}

async function initShadcnRuntime({
  packageRoot,
  paths,
  setup,
  shadcnTemplateDir,
}) {
  const preset =
    setup.preset && setup.preset !== "custom"
      ? setup.preset
      : getDefaultShadcnPreset()
  const runtimeParentDir = path.dirname(paths.runtimeDir)
  const generatedRuntimeDir = path.join(runtimeParentDir, "vite-app")

  await mkdir(runtimeParentDir, { recursive: true })
  await rm(generatedRuntimeDir, { force: true, recursive: true })
  const args = [
    "init",
    "--template",
    "vite",
    "--base",
    supportedRuntimeBase,
    "--yes",
    "--force",
    "--no-reinstall",
    "--no-monorepo",
    "--cwd",
    runtimeParentDir,
    "--silent",
    "--preset",
    preset,
  ]

  try {
    await runShadcnCli(args, {
      cwd: runtimeParentDir,
      packageRoot,
      paths,
      shadcnTemplateDir,
    })
  } catch (error) {
    if (
      !(await canContinueAfterInitInstallFailure(error, generatedRuntimeDir))
    ) {
      throw error
    }
  }

  await rm(paths.runtimeDir, { force: true, recursive: true })
  await moveGeneratedRuntimeDir({
    from: generatedRuntimeDir,
    to: paths.runtimeDir,
  })
  await normalizeRuntimeTemplateViteConfig(paths)
}

async function injectRuntimeHostFiles({ paths, runtimeContract, runtimeSurface }) {
  await mkdir(paths.runtimeSrcDir, { recursive: true })
  await cp(
    path.join(runtimeHostSourceDir, "renderer"),
    path.join(paths.runtimeSrcDir, "renderer"),
    { recursive: true },
  )
  await cp(
    path.join(runtimeHostSourceDir, "features"),
    path.join(paths.runtimeDir, "runtime-host", "features"),
    { recursive: true },
  )
  await cp(
    path.join(runtimeHostSourceDir, "renderer"),
    path.join(paths.runtimeDir, "runtime-host", "renderer"),
    { recursive: true },
  )
  await cp(
    path.join(runtimeHostSourceDir, "features", "gallery", "preview-document.mjs"),
    path.join(paths.runtimeSrcDir, "gallery-preview-document.mjs"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "ssr.tsx"),
    path.join(paths.runtimeSrcDir, "ssr.tsx"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "lib"),
    path.join(paths.runtimeSrcDir, "lib"),
    { recursive: true },
  )
  await writeRuntimeHostApp(paths)
  await writeRuntimeRendererKindSource({ paths, runtimeContract })
  await writeRuntimeElementRegistrySource({ paths, runtimeContract })
  await writeRendererMain({ paths, cssPath: runtimeSurface.cssPath })
}

async function writeRendererMain({ paths, cssPath }) {
  const cssImport = normalizeCssImportPath({
    from: path.join(paths.runtimeSrcDir, "main.tsx"),
    to: path.join(paths.runtimeDir, cssPath),
  })
  const source = [
    'import React from "react"',
    'import { createRoot } from "react-dom/client"',
    'import { App } from "./app"',
    `import "${cssImport}"`,
    "",
    'createRoot(window.document.getElementById("root")!).render(',
    "  <React.StrictMode>",
    "    <App />",
    "  </React.StrictMode>,",
    ")",
    "",
  ].join("\n")

  await writeFile(path.join(paths.runtimeSrcDir, "main.tsx"), source)
}

async function writeRuntimeHostApp(paths) {
  const source = [
    'import React from "react"',
    "",
    'import generatedDocument from "../document.generated.json"',
    'import runtimeStateSource from "../runtime-state.generated.json"',
    'import runtimeVerificationState from "../render-verification.generated.json"',
    'import { createRendererNode } from "./renderer/render-node"',
    'import { GalleryApp } from "../runtime-host/features/gallery/app"',
    'import type { AgentDocument, RuntimeVerificationState } from "./renderer/types"',
    "",
    'type StyleProfile = AgentDocument["meta"]["styleProfile"]',
    "",
    "type RuntimeState = {",
    "  kind?: string",
    "  version?: number",
    '  mode?: "document" | "gallery"',
    "  gallery?: {",
    "    availableStyleReferences: string[]",
    "    styleReference: string",
    "    styleProfile: StyleProfile",
    "  }",
    "}",
    "",
    "const agentDocument = generatedDocument as AgentDocument",
    "const runtimeState = runtimeStateSource as RuntimeState",
    "const runtimeRendererVerification =",
    "  runtimeVerificationState as RuntimeVerificationState",
    "",
    "export function App() {",
    "  const title = getDocumentTitle(agentDocument)",
    "",
    "  React.useEffect(() => {",
    '    if (title && typeof document !== "undefined") {',
    "      document.title = title",
    "    }",
    "  }, [title])",
    "",
    '  if (runtimeState.mode === "gallery" && runtimeState.gallery) {',
    "    return (",
    "      <GalleryApp",
    "        availableStyleReferences={runtimeState.gallery.availableStyleReferences}",
    "        initialProfile={runtimeState.gallery.styleProfile}",
    "        runtimeRendererVerification={runtimeRendererVerification}",
    "        styleReference={runtimeState.gallery.styleReference}",
    "      />",
    "    )",
    "  }",
    "",
    "  const documentStyleCss = createDocumentStyleCss(agentDocument.meta.styleProfile)",
    "  const rendererSpecByName = new Map(",
    "    runtimeRendererVerification.rendererMapping.components.map((component) => [",
    "      component.name,",
    "      component,",
    "    ]),",
    "  )",
    "  const RendererNode = createRendererNode(",
    "    rendererSpecByName,",
    "    agentDocument.meta.styleProfile.componentStyle.treatments,",
    "  )",
    "",
    "  return (",
    "    <>",
    "      <RuntimeStyleElements documentStyleCss={documentStyleCss} />",
    '      <main className="ahtml-runtime-host ahtml-runtime-document" data-style-profile={agentDocument.meta.styleProfile.id}>',
    '        <DocumentArtifactShell layoutPolicy="document">',
    "          {agentDocument.components.map((node, index) => (",
    "            <RendererNode key={index} node={node} path={[index]} />",
    "          ))}",
    "        </DocumentArtifactShell>",
    "      </main>",
    "    </>",
    "  )",
    "}",
    "",
    "export function RuntimeStyleElements({",
    "  documentStyleCss,",
    "  galleryPreviewThemeCss,",
    "  includeGalleryShell = false,",
    "}: {",
    "  documentStyleCss: string",
    "  galleryPreviewThemeCss?: string",
    "  includeGalleryShell?: boolean",
    "}) {",
    "  return (",
    "    <>",
    "      <style>{createRuntimeHostCss()}</style>",
    "      <style>{createArtifactShellCss()}</style>",
    "      <style>{createDocumentLayoutPolicyCss()}</style>",
    "      <style>{createGalleryLayoutPolicyCss()}</style>",
    "      {includeGalleryShell ? <style>{createGalleryShellCss()}</style> : null}",
    "      {galleryPreviewThemeCss ? <style>{galleryPreviewThemeCss}</style> : null}",
    "      <style>{documentStyleCss}</style>",
    "    </>",
    "  )",
    "}",
    "",
    "export function DocumentArtifactShell({",
    "  children,",
    "  className,",
    '  layoutPolicy = "document",',
    "}: React.PropsWithChildren<{",
    "  className?: string",
    '  layoutPolicy?: "document" | "gallery"',
    "}>) {",
    "  const classes = [",
    '    "ahtml-artifact-root",',
    '    layoutPolicy === "document"',
    '      ? "ahtml-layout-policy-document"',
    '      : "ahtml-layout-policy-gallery",',
    "    className,",
    "  ]",
    "    .filter(Boolean)",
    '    .join(" ")',
    "",
    "  return <div className={classes}>{children}</div>",
    "}",
    "",
    "function getDocumentTitle(document: AgentDocument) {",
    "  const page = document.components.find(",
    '    (node): node is Extract<AgentDocument["components"][number], { type: "component" }> =>',
    '      node.type === "component" && node.name === "page",',
    "  )",
    "",
    "  return page?.props.title",
    "}",
    "",
    "export function createDocumentStyleCss(styleProfile: StyleProfile) {",
    "  const { cssVariableMap, radiusScale, tokenSets, typography } =",
    "    styleProfile.globalStyle",
    "  const lightThemeVars = Object.entries(tokenSets.light)",
    "    .map(",
    "      ([tokenName, value]) =>",
    '        `  ${cssVariableMap[tokenName as keyof typeof cssVariableMap]}: ${value};`,',
    "    )",
    '    .join("\\n")',
    "  const darkThemeVars = Object.entries(tokenSets.dark)",
    "    .map(",
    "      ([tokenName, value]) =>",
    '        `  ${cssVariableMap[tokenName as keyof typeof cssVariableMap]}: ${value};`,',
    "    )",
    '    .join("\\n")',
    "",
    "  return `",
    "    :root {",
    "${lightThemeVars}",
    "      ${cssVariableMap.radius}: ${radiusScale.base};",
    "      ${cssVariableMap.fontSans}: ${typography.fontSans};",
    "      ${cssVariableMap.fontHeading}: ${typography.fontHeading};",
    "      ${cssVariableMap.fontSerif}: ${typography.fontSerif};",
    "      ${cssVariableMap.fontMono}: ${typography.fontMono};",
    "      ${cssVariableMap.letterSpacing}: ${typography.letterSpacing};",
    "      ${cssVariableMap.spacing}: ${typography.spacing};",
    "      ${cssVariableMap.shadowColor}: ${typography.shadowColor};",
    "      ${cssVariableMap.shadowOpacity}: ${typography.shadowOpacity};",
    "      ${cssVariableMap.shadowBlur}: ${typography.shadowBlur};",
    "      ${cssVariableMap.shadowSpread}: ${typography.shadowSpread};",
    "      ${cssVariableMap.shadowOffsetX}: ${typography.shadowOffsetX};",
    "      ${cssVariableMap.shadowOffsetY}: ${typography.shadowOffsetY};",
    "      --radius-sm: ${radiusScale.sm};",
    "      --radius-md: ${radiusScale.md};",
    "      --radius-lg: ${radiusScale.lg};",
    '      --radius-xl: ${radiusScale.xl};',
    '      --radius-2xl: ${radiusScale["2xl"]};',
    '      --radius-3xl: ${radiusScale["3xl"]};',
    '      --radius-4xl: ${radiusScale["4xl"]};',
    "      --font-heading: ${typography.fontHeading};",
    "      --font-serif: ${typography.fontSerif};",
    "      --font-mono: ${typography.fontMono};",
    "      --letter-spacing-tight: ${typography.letterSpacing};",
    "      --surface-shadow:",
    "        ${typography.shadowOffsetX}",
    "        ${typography.shadowOffsetY}",
    "        ${typography.shadowBlur}",
    "        ${typography.shadowSpread}",
    "        color-mix(in srgb, ${typography.shadowColor} calc(${typography.shadowOpacity} * 100%), transparent);",
    "    }",
    '    [data-theme-mode="dark"] {',
    "${darkThemeVars}",
    "    }",
    "  `",
    "}",
    "",
    "function createRuntimeHostCss() {",
    "  return `",
    "    .ahtml-runtime-host {",
    "      min-height: 100vh;",
    "      background: var(--background);",
    "      color: var(--foreground);",
    "      font-family: var(--font-sans);",
    "    }",
    "  `",
    "}",
    "",
    "function createArtifactShellCss() {",
    "  return `",
    "    .ahtml-artifact-root {",
    "      display: grid;",
    "      gap: calc(var(--spacing) * 4);",
    "    }",
    "  `",
    "}",
    "",
    "function createDocumentLayoutPolicyCss() {",
    "  return `",
    "    .ahtml-layout-policy-document {",
    "      width: min(72rem, calc(100vw - 2rem));",
    "      margin: 0 auto;",
    "      padding: 1.5rem 1rem 3rem;",
    "    }",
    "  `",
    "}",
    "",
    "function createGalleryLayoutPolicyCss() {",
    "  return `",
    "    .ahtml-layout-policy-gallery {",
    "      display: grid;",
    "      gap: 1rem;",
    "    }",
    "  `",
    "}",
    "",
    "function createGalleryShellCss() {",
    "  return `",
    "    .ahtml-gallery-shell {",
    "      display: grid;",
    "      min-height: 100vh;",
    "      grid-template-rows: auto auto 1fr;",
    "      background:",
    '        radial-gradient(circle at top, color-mix(in srgb, var(--primary) 10%, transparent), transparent 42%),',
    '        linear-gradient(180deg, color-mix(in srgb, var(--muted) 36%, transparent), transparent 28%);',
    "    }",
    "  `",
    "}",
    "",
  ].join("\n")

  await writeFile(path.join(paths.runtimeSrcDir, "app.tsx"), source)
}

async function renderViteConfig({ dependencies, paths }) {
  const templatePath = path.join(bootstrapDir, "vite.config.mjs.template")
  const source = await readFile(templatePath, "utf8")
  const normalizedDependencies = normalizeDependencyPaths(dependencies)
  const rendered = source
    .replace(
      "__AHTML_RUNTIME_DEPENDENCIES__",
      JSON.stringify(normalizedDependencies, null, 2),
    )
    .replace("__AHTML_VITE_MODULE__", normalizedDependencies.viteModule)

  await mkdir(path.dirname(paths.runtimeViteConfigPath), { recursive: true })
  await writeFile(paths.runtimeViteConfigPath, rendered)
}

export async function ensureRuntimeBuildConfig({
  packageRoot,
  paths,
  dependencies = resolveRuntimeDependencies(packageRoot),
}) {
  await normalizeRuntimeTemplateViteConfig(paths)
  await renderViteConfig({ dependencies, paths })
}

async function normalizeRuntimeTemplateViteConfig(paths) {
  await writeFile(
    path.join(paths.runtimeDir, "vite.config.ts"),
    createManagedRuntimeTemplateViteConfigSource(),
  )
}

function createManagedRuntimeTemplateViteConfigSource() {
  return [
    'import path from "node:path"',
    'import { fileURLToPath } from "node:url"',
    "",
    'import react from "@vitejs/plugin-react"',
    'import tailwindcss from "@tailwindcss/vite"',
    'import { defineConfig } from "vite"',
    "",
    "const rootDir = path.dirname(fileURLToPath(import.meta.url))",
    "",
    "export default defineConfig({",
    "  plugins: [react(), tailwindcss()],",
    "  resolve: {",
    "    alias: {",
    '      "@": path.resolve(rootDir, "./src"),',
    "    },",
    "  },",
    "})",
    "",
  ].join("\n")
}

function withLocalNoProxy(value) {
  const entries = (value ?? "")
    .split(",")
    .map((entry) => entry.trim())
    .filter(Boolean)

  for (const localHost of ["127.0.0.1", "localhost"]) {
    if (!entries.includes(localHost)) {
      entries.push(localHost)
    }
  }

  return entries.join(",")
}

function isLocalRegistryUrl(value) {
  if (!value) {
    return false
  }

  try {
    const url = new URL(value)
    return url.hostname === "127.0.0.1" || url.hostname === "localhost"
  } catch {
    return false
  }
}

async function writeRuntimeVerificationState({
  paths,
  runtimeContract,
  setup,
  runtimeSurface,
}) {
  const runtimeCapability = createManagedRuntimeCapability({ runtimeContract })
  const runtimeVerificationState = createRuntimeVerificationState({
    components: setup.components,
    runtimeBase: supportedRuntimeBase,
    runtimeCapability,
    runtimeContract,
    runtimeSurface,
    version: 1,
  })

  await writeFile(
    paths.runtimeVerificationPath,
    `${JSON.stringify(runtimeVerificationState, null, 2)}\n`,
  )
}

async function writeRuntimeElementRegistrySource({ paths, runtimeContract }) {
  const registrySpec = runtimeContract.elementRegistrySpec
  const source = createRuntimeElementRegistrySource(registrySpec)

  await writeFile(
    path.join(paths.runtimeSrcDir, "renderer", "elements.tsx"),
    source,
  )
}

async function writeRuntimeRendererKindSource({ paths, runtimeContract }) {
  const kindSpec = runtimeContract.rendererKindSpec
  const source = createRuntimeRendererKindSource(kindSpec)

  await writeFile(
    path.join(paths.runtimeSrcDir, "renderer", "kinds.ts"),
    source,
  )
}

export function createRuntimeElementRegistrySource(registrySpec) {
  const imports = registrySpec.modules.map(({ registryItem, exports }) =>
    formatRuntimeElementImport({ registryItem, exports }),
  )
  const registryEntries = [
    ...registrySpec.nativeElements.map((name) => `  ${name}: "${name}",`),
    ...registrySpec.modules.flatMap(({ exports }) =>
      exports.map((name) => `  ${name},`),
    ),
  ]

  return [
    "/* eslint-disable @typescript-eslint/no-unsafe-assignment */",
    'import React from "react"',
    ...imports,
    "",
    "const runtimeElementRegistry: Record<string, React.ElementType> = {",
    ...registryEntries,
    "}",
    "",
    "export function resolveElement(name: string | undefined): React.ElementType {",
    "  if (!name) {",
    "    return React.Fragment",
    "  }",
    "",
    "  return runtimeElementRegistry[name] ?? (name as React.ElementType)",
    "}",
    "",
  ].join("\n")
}

export function createRuntimeRendererKindSource(kindSpec) {
  return [
    `export const runtimeRendererKinds = ${JSON.stringify(kindSpec.kinds)} as const`,
    "",
    "export type RendererKind = (typeof runtimeRendererKinds)[number]",
    "",
  ].join("\n")
}

function formatRuntimeElementImport({ registryItem, exports }) {
  const specifier = `@/components/ui/${registryItem}`

  if (exports.length === 1) {
    return `import { ${exports[0]} } from "${specifier}"`
  }

  return [
    "import {",
    ...exports.map((name) => `  ${name},`),
    `} from "${specifier}"`,
  ].join("\n")
}

function normalizeDependencyPaths(dependencies) {
  return Object.fromEntries(
    Object.entries(dependencies).map(([key, value]) => [
      key,
      key === "tailwindcssVitePlugin" ||
      key === "viteModule" ||
      key === "viteReactPlugin"
        ? pathToFileURL(value).href
        : value.replaceAll("\\", "/"),
    ]),
  )
}

async function installShadcnComponents({
  packageRoot,
  components,
  paths,
  shadcnTemplateDir,
}) {
  const selectedComponents = components.length > 0 ? components : ["card"]

  await runShadcnCli(
    [
      "add",
      ...selectedComponents,
      "--yes",
      "--overwrite",
      "--cwd",
      paths.runtimeDir,
      "--silent",
    ],
    { packageRoot, paths, shadcnTemplateDir },
  )
}

function normalizeCssImportPath({ from, to }) {
  const relative = path.relative(path.dirname(from), to).replaceAll("\\", "/")
  return relative.startsWith(".") ? relative : `./${relative}`
}

async function moveGeneratedRuntimeDir({
  from,
  to,
  attempts = 6,
  retryDelayMs = 200,
}) {
  for (let attempt = 1; attempt <= attempts; attempt += 1) {
    try {
      await rename(from, to)
      return
    } catch (error) {
      if (!isRetryableRuntimeRenameError(error) || attempt === attempts) {
        throw error
      }

      await wait(retryDelayMs * attempt)
    }
  }
}

function isRetryableRuntimeRenameError(error) {
  return (
    Boolean(error) &&
    typeof error === "object" &&
    ["EACCES", "EBUSY", "EPERM"].includes(String(error.code))
  )
}

function wait(ms) {
  return new Promise((resolve) => {
    setTimeout(resolve, ms)
  })
}

async function runShadcnCli(
  args,
  { cwd, env, packageRoot, paths, shadcnTemplateDir },
) {
  const command = await resolveShadcnCommand(packageRoot)
  const commandCwd = cwd ?? paths.runtimeDir
  const localRegistryEnv = isLocalRegistryUrl(process.env.REGISTRY_URL)
    ? {
        ALL_PROXY: "",
        HTTPS_PROXY: "",
        HTTP_PROXY: "",
        NO_PROXY: withLocalNoProxy(process.env.NO_PROXY),
        all_proxy: "",
        http_proxy: "",
        https_proxy: "",
        no_proxy: withLocalNoProxy(process.env.no_proxy),
      }
    : {}

  try {
    await execFileWithProcessTreeCleanup(command.file, [...command.args, ...args], {
      cwd: commandCwd,
      env: {
        ...process.env,
        AHTML_SHADCN_RUNTIME: "1",
        ...(shadcnTemplateDir
          ? { SHADCN_TEMPLATE_DIR: shadcnTemplateDir }
          : {}),
        ...localRegistryEnv,
        ...env,
      },
      timeout: resolveChildProcessTimeout(shadcnCliTimeoutMs),
    })
  } catch (error) {
    const detail =
      error instanceof Error && typeof error.message === "string"
        ? error.message
        : String(error)
    const stdout =
      typeof error?.stdout === "string" && error.stdout.trim().length > 0
        ? ` stdout: ${error.stdout.trim()}`
        : ""
    const stderr =
      typeof error?.stderr === "string" && error.stderr.trim().length > 0
        ? ` stderr: ${error.stderr.trim()}`
        : ""

    throw new Error(
      `shadcn CLI failed during runtime setup. ${detail}${stdout}${stderr}`,
    )
  }
}

function resolveChildProcessTimeout(defaultTimeoutMs) {
  const override = Number(process.env.AHTML_CHILD_PROCESS_TIMEOUT_MS)

  if (Number.isInteger(override) && override > 0) {
    return override
  }

  return defaultTimeoutMs
}

function execFileWithProcessTreeCleanup(file, args, options) {
  return new Promise((resolve, reject) => {
    let stdout = ""
    let stderr = ""
    let settled = false
    const child = spawn(
      file,
      args,
      {
        cwd: options.cwd,
        env: options.env,
        stdio: ["ignore", "pipe", "pipe"],
        windowsHide: true,
      },
    )
    const timeout = setTimeout(() => {
      if (settled) {
        return
      }

      settled = true
      void terminateProcessTree(child).finally(() => {
        reject(
          Object.assign(
            new Error(`Command timed out after ${options.timeout}ms.`),
            {
              stdout,
              stderr,
            },
          ),
        )
      })
    }, options.timeout)

    child.stdout.setEncoding("utf8")
    child.stderr.setEncoding("utf8")
    child.stdout.on("data", (chunk) => {
      stdout += chunk
    })
    child.stderr.on("data", (chunk) => {
      stderr += chunk
    })
    child.on("error", (error) => {
      if (settled) {
        return
      }

      clearTimeout(timeout)
      settled = true
      reject(
        Object.assign(error, {
          stdout,
          stderr,
        }),
      )
    })
    child.on("exit", (code, signal) => {
        if (settled) {
          return
        }

        clearTimeout(timeout)
        settled = true

        if (code !== 0) {
          reject(
            Object.assign(
              new Error(
                `Command exited with code ${String(code)} signal ${String(signal)}.`,
              ),
              {
                code,
                signal,
              stdout,
              stderr,
              },
            ),
          )
          return
        }

        resolve({ stdout, stderr })
      },
    )
  })
}

async function terminateProcessTree(child) {
  if (child.exitCode !== null) {
    return
  }

  if (process.platform !== "win32" || child.pid === undefined) {
    child.kill("SIGTERM")
    return
  }

  await new Promise((resolve) => {
    execFile(
      "taskkill",
      ["/pid", String(child.pid), "/t", "/f"],
      { windowsHide: true },
      () => resolve(),
    )
  })
}

export function resolveShadcnTemplateDir() {
  const templateDir = process.env.AHTML_SHADCN_TEMPLATE_DIR?.trim()
  const allowTemplateOverride =
    process.env.AHTML_ALLOW_SHADCN_TEMPLATE_OVERRIDE === "1"
  const localRegistryUrl = isLocalRegistryUrl(process.env.REGISTRY_URL)

  if (!templateDir || !allowTemplateOverride || !localRegistryUrl) {
    return undefined
  }

  return path.resolve(templateDir)
}

async function resolveShadcnCommand(packageRoot) {
  const packageRequire = createRequire(path.join(packageRoot, "package.json"))
  const shadcnBin = packageRequire.resolve("shadcn")

  try {
    await access(shadcnBin)
  } catch {
    throw new Error(`Unable to find shadcn CLI at ${shadcnBin}.`)
  }

  return { file: process.execPath, args: [shadcnBin] }
}

async function canContinueAfterInitInstallFailure(error, generatedRuntimeDir) {
  try {
    await access(path.join(generatedRuntimeDir, "components.json"))
    return true
  } catch {
    return false
  }
}
