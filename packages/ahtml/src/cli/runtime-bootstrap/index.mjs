import { existsSync } from "node:fs"
import { createRequire } from "node:module"
import {
  cp,
  copyFile,
  mkdir,
  readFile,
  rm,
  symlink,
  writeFile,
} from "node:fs/promises"
import path from "node:path"
import { fileURLToPath, pathToFileURL } from "node:url"

import {
  normalizeManagedRuntimeComponents,
  supportedRuntimeBase,
} from "../../config/render-capabilities.mjs"
import {
  createManagedRuntimeCapability,
  createRuntimeContractFromSchema,
  createRuntimeVerificationState,
} from "../../config/runtime-contract.mjs"
import {
  createShadcnRuntimeSurface,
  managedRuntimeShellSource,
  recordAhtmlGlueProof,
} from "../runtime-surface.mjs"
import { provisionManagedRuntimeUiBundle } from "../runtime-managed-ui.mjs"
import {
  DEFAULT_PRESET_CONFIG,
  decodePreset,
  isPresetCode,
} from "shadcn/preset"

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

export async function writeRuntimeHost({ packageRoot, paths, schema, setup }) {
  const normalizedSetup = {
    ...setup,
    components: normalizeManagedRuntimeComponents(setup?.components ?? []),
  }
  const dependencies = resolveRuntimeDependencies(packageRoot)
  const runtimeContract = createRuntimeContractFromSchema(schema)

  await rm(paths.runtimeDir, { force: true, recursive: true })
  await provisionRuntimeShell({
    dependencies,
    packageRoot,
    paths,
    setup: normalizedSetup,
  })

  const runtimeSurface = await createShadcnRuntimeSurface({
    paths,
    shellSource: managedRuntimeShellSource,
    setup: normalizedSetup,
    runtimeBase: supportedRuntimeBase,
  })

  await provisionManagedRuntimeUiBundle({
    components: normalizedSetup.components,
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
    setup: normalizedSetup,
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
    workspaceNodeModulesRoot: path.dirname(reactRoot),
    reactJsxRuntime: packageRequire.resolve("react/jsx-runtime"),
    reactJsxDevRuntime: packageRequire.resolve("react/jsx-dev-runtime"),
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

async function provisionRuntimeShell({ dependencies, packageRoot, paths, setup }) {
  const runtimePackageJson = await createRuntimePackageJson({ packageRoot })
  const tsconfig = createRuntimeTsconfigSource()
  const viteConfig = createManagedRuntimeTemplateViteConfigSource()
  const indexHtml = createRuntimeIndexHtmlSource()
  const styleConfig = resolveRuntimeShellStyleConfig(setup)
  const componentsJson = createRuntimeComponentsJson(styleConfig)
  const cssSource = createRuntimeCssSource(styleConfig)

  await mkdir(paths.runtimeDir, { recursive: true })
  await mkdir(paths.runtimeSrcDir, { recursive: true })
  await mkdir(path.join(paths.runtimeSrcDir, "lib"), { recursive: true })
  await ensureRuntimeNodeModulesLink({
    nodeModulesRoot: dependencies.workspaceNodeModulesRoot,
    paths,
  })

  await writeFile(
    path.join(paths.runtimeDir, "package.json"),
    `${JSON.stringify(runtimePackageJson, null, 2)}\n`,
  )
  await writeFile(path.join(paths.runtimeDir, "tsconfig.json"), `${tsconfig}\n`)
  await writeFile(
    path.join(paths.runtimeDir, "vite.config.ts"),
    `${viteConfig}\n`,
  )
  await writeFile(path.join(paths.runtimeDir, "index.html"), `${indexHtml}\n`)
  await copyFile(
    path.join(packageRoot, "assets", "ghost.svg"),
    path.join(paths.runtimeDir, "ghost.svg"),
  )
  await writeFile(
    path.join(paths.runtimeDir, "components.json"),
    `${JSON.stringify(componentsJson, null, 2)}\n`,
  )
  await writeFile(
    path.join(paths.runtimeSrcDir, "styles.css"),
    `${cssSource}\n`,
  )
  await cp(
    path.join(runtimeHostSourceDir, "lib", "utils.ts"),
    path.join(paths.runtimeSrcDir, "lib", "utils.ts"),
  )
  await writeFile(path.join(paths.runtimeSrcDir, "main.tsx"), "export {}\n")
  await writeFile(
    path.join(paths.runtimeSrcDir, "app.tsx"),
    "export function App() { return null }\n",
  )
}

async function ensureRuntimeNodeModulesLink({ nodeModulesRoot, paths }) {
  await symlink(
    nodeModulesRoot,
    path.join(paths.runtimeDir, "node_modules"),
    process.platform === "win32" ? "junction" : "dir",
  )
}

function readPackageVersionFromManifest(packageManifest, packageName) {
  const version =
    packageManifest?.dependencies?.[packageName] ??
    packageManifest?.devDependencies?.[packageName]

  if (typeof version !== "string" || version.trim() === "") {
    throw new Error(
      `Unable to resolve package version for ${packageName} from managed runtime package root.`,
    )
  }

  return version
}

async function injectRuntimeHostFiles({
  paths,
  runtimeContract,
  runtimeSurface,
}) {
  await mkdir(paths.runtimeSrcDir, { recursive: true })
  await cp(
    path.join(runtimeHostSourceDir, "features"),
    path.join(paths.runtimeSrcDir, "features"),
    { recursive: true },
  )
  await cp(
    path.join(runtimeHostSourceDir, "renderer"),
    path.join(paths.runtimeSrcDir, "renderer"),
    { recursive: true },
  )
  await cp(
    path.join(runtimeHostSourceDir, "ssr.tsx"),
    path.join(paths.runtimeSrcDir, "ssr.tsx"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "render-ssr.tsx"),
    path.join(paths.runtimeSrcDir, "render-ssr.tsx"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "artifact-shell.tsx"),
    path.join(paths.runtimeSrcDir, "artifact-shell.tsx"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "host-styles.tsx"),
    path.join(paths.runtimeSrcDir, "host-styles.tsx"),
  )
  await cp(
    path.join(runtimeHostSourceDir, "profile-theme.ts"),
    path.join(paths.runtimeSrcDir, "profile-theme.ts"),
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

async function createRuntimePackageJson({ packageRoot }) {
  const packageManifest = JSON.parse(
    await readFile(path.join(packageRoot, "package.json"), "utf8"),
  )

  return {
    name: "ahtml-runtime",
    private: true,
    version: "0.0.0",
    type: "module",
    scripts: {
      dev: "vite",
      build: "vite build",
      preview: "vite preview",
    },
    dependencies: {
      react: readPackageVersionFromManifest(packageManifest, "react"),
      "react-dom": readPackageVersionFromManifest(packageManifest, "react-dom"),
    },
    devDependencies: {
      "@tailwindcss/vite": readPackageVersionFromManifest(
        packageManifest,
        "@tailwindcss/vite",
      ),
      "@vitejs/plugin-react": readPackageVersionFromManifest(
        packageManifest,
        "@vitejs/plugin-react",
      ),
      tailwindcss: readPackageVersionFromManifest(
        packageManifest,
        "tailwindcss",
      ),
      typescript: readPackageVersionFromManifest(packageManifest, "typescript"),
      vite: readPackageVersionFromManifest(packageManifest, "vite"),
    },
  }
}

function createRuntimeTsconfigSource() {
  return [
    "{",
    '  "compilerOptions": {',
    '    "target": "ES2022",',
    '    "useDefineForClassFields": true,',
    '    "lib": ["ES2022", "DOM", "DOM.Iterable"],',
    '    "allowJs": false,',
    '    "skipLibCheck": true,',
    '    "esModuleInterop": true,',
    '    "allowSyntheticDefaultImports": true,',
    '    "strict": true,',
    '    "forceConsistentCasingInFileNames": true,',
    '    "module": "ESNext",',
    '    "moduleResolution": "Bundler",',
    '    "resolveJsonModule": true,',
    '    "isolatedModules": true,',
    '    "noEmit": true,',
    '    "jsx": "react-jsx",',
    '    "baseUrl": ".",',
    '    "paths": {',
    '      "@/*": ["./src/*"]',
    "    }",
    "  },",
    '  "include": ["src"]',
    "}",
  ].join("\n")
}

function createRuntimeIndexHtmlSource() {
  return [
    "<!doctype html>",
    '<html lang="en">',
    "  <head>",
    '    <meta charset="UTF-8" />',
    '    <meta name="viewport" content="width=device-width, initial-scale=1.0" />',
    "    <title>agent-html runtime</title>",
    '    <link rel="icon" type="image/svg+xml" href="./ghost.svg" />',
    "  </head>",
    "  <body>",
    '    <div id="root"></div>',
    '    <script type="module" src="/src/main.tsx"></script>',
    "  </body>",
    "</html>",
  ].join("\n")
}

function resolveRuntimeShellStyleConfig(setup) {
  const fallbackStyle = {
    style: DEFAULT_PRESET_CONFIG.style,
    baseColor: DEFAULT_PRESET_CONFIG.baseColor,
    iconLibrary: "radix",
    menuColor: DEFAULT_PRESET_CONFIG.menuColor,
    menuAccent: DEFAULT_PRESET_CONFIG.menuAccent,
  }

  if (!setup?.preset || setup.preset === "custom") {
    return fallbackStyle
  }

  if (isPresetCode(setup.preset)) {
    const decoded = decodePreset(setup.preset)

    if (decoded) {
      return {
        style: decoded.style,
        baseColor: decoded.baseColor,
        iconLibrary: "radix",
        menuColor: decoded.menuColor,
        menuAccent: decoded.menuAccent,
      }
    }
  }

  return {
    style: setup.preset,
    baseColor: DEFAULT_PRESET_CONFIG.baseColor,
    iconLibrary: "radix",
    menuColor: DEFAULT_PRESET_CONFIG.menuColor,
    menuAccent: DEFAULT_PRESET_CONFIG.menuAccent,
  }
}

function createRuntimeComponentsJson(styleConfig) {
  return {
    $schema: "https://ui.shadcn.com/schema.json",
    style: styleConfig.style,
    rsc: false,
    tsx: true,
    tailwind: {
      config: "",
      css: "src/styles.css",
      baseColor: styleConfig.baseColor,
      cssVariables: true,
      prefix: "",
    },
    aliases: {
      components: "@/components",
      ui: "@/components/ui",
      lib: "@/lib",
      hooks: "@/hooks",
      utils: "@/lib/utils",
    },
    iconLibrary: styleConfig.iconLibrary,
    rtl: false,
    menuColor: styleConfig.menuColor,
    menuAccent: styleConfig.menuAccent,
    registries: {},
  }
}

function createRuntimeCssSource(_styleConfig) {
  return [
    '@import "tailwindcss";',
    '@import "tw-animate-css";',
    '@import "shadcn/tailwind.css";',
    "",
    '@source "./**/*.{ts,tsx}";',
    "",
    "@custom-variant dark (&:is(.dark *));",
    "",
    "@theme inline {",
    "  --color-background: var(--background);",
    "  --color-foreground: var(--foreground);",
    "  --color-card: var(--card);",
    "  --color-card-foreground: var(--card-foreground);",
    "  --color-popover: var(--popover);",
    "  --color-popover-foreground: var(--popover-foreground);",
    "  --color-primary: var(--primary);",
    "  --color-primary-foreground: var(--primary-foreground);",
    "  --color-secondary: var(--secondary);",
    "  --color-secondary-foreground: var(--secondary-foreground);",
    "  --color-muted: var(--muted);",
    "  --color-muted-foreground: var(--muted-foreground);",
    "  --color-accent: var(--accent);",
    "  --color-accent-foreground: var(--accent-foreground);",
    "  --color-destructive: var(--destructive);",
    "  --color-border: var(--border);",
    "  --color-input: var(--input);",
    "  --color-ring: var(--ring);",
    "}",
    "",
    ":root {",
    "  color-scheme: light;",
    '  font-family: Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;',
    "  background: oklch(1 0 0);",
    "  color: oklch(0.145 0 0);",
    "  --background: oklch(1 0 0);",
    "  --foreground: oklch(0.145 0 0);",
    "  --card: oklch(1 0 0);",
    "  --card-foreground: oklch(0.145 0 0);",
    "  --popover: oklch(1 0 0);",
    "  --popover-foreground: oklch(0.145 0 0);",
    "  --primary: oklch(0.205 0 0);",
    "  --primary-foreground: oklch(0.985 0 0);",
    "  --secondary: oklch(0.97 0 0);",
    "  --secondary-foreground: oklch(0.205 0 0);",
    "  --muted: oklch(0.97 0 0);",
    "  --muted-foreground: oklch(0.556 0 0);",
    "  --accent: oklch(0.97 0 0);",
    "  --accent-foreground: oklch(0.205 0 0);",
    "  --destructive: oklch(0.577 0.245 27.325);",
    "  --border: oklch(0.922 0 0);",
    "  --input: oklch(0.922 0 0);",
    "  --ring: oklch(0.708 0 0);",
    "}",
    "",
    "* {",
    "  box-sizing: border-box;",
    "  border-color: var(--border);",
    "}",
    "",
    "body {",
    "  margin: 0;",
    "  min-height: 100vh;",
    "  background: var(--background);",
    "  color: var(--foreground);",
    "}",
    "",
    ".bg-card {",
    "  background-color: var(--card);",
    "}",
    "",
    ".text-card-foreground {",
    "  color: var(--card-foreground);",
    "}",
  ].join("\n")
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
  const hostAppPath = path.join(runtimeHostSourceDir, "app.tsx")
  const source = await readFile(hostAppPath, "utf8")
  const runtimeSource = source
    .replace(
      'from "./document.generated.json"',
      'from "../document.generated.json"',
    )
    .replace(
      'from "./runtime-state.generated.json"',
      'from "../runtime-state.generated.json"',
    )
    .replace(
      'from "./render-verification.generated.json"',
      'from "../render-verification.generated.json"',
    )

  await writeFile(path.join(paths.runtimeSrcDir, "app.tsx"), runtimeSource)
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

function normalizeCssImportPath({ from, to }) {
  const relative = path.relative(path.dirname(from), to).replaceAll("\\", "/")
  return relative.startsWith(".") ? relative : `./${relative}`
}
