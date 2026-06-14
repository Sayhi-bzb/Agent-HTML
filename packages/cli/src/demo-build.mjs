import fs from "node:fs/promises"
import path from "node:path"

import react from "@vitejs/plugin-react"
import { build as viteBuild } from "vite"

import { collectStaticBlockMetadata } from "./react-canvas/block-tags.mjs"
import { resolveBlockImplementationPath } from "./react-canvas/block-implementation.mjs"
import {
  discoverReactArtifacts,
  parseRootArg,
  workspaceRelativePath,
} from "./react-canvas/paths.mjs"
import {
  hostRoot,
  resolvePackageModule,
} from "./dev-server/context.mjs"
import { loadHostStyles } from "./dev-server/styles.mjs"
import { createViteFsAllowList } from "./dev-server/vite.mjs"

const defaultSiteDescription =
  "A canvas with AI for building, previewing, and refining React artifacts."
const defaultSiteThumbnailUrl = "/__agent-html/public/assets/blocks.png"
const defaultSiteTitle = "Agent-HTML"

function parseOutDirArg({ args, cwd }) {
  const outDirIndex = args.indexOf("--out-dir")
  const outDir = outDirIndex === -1 ? "dist-agent-html" : args[outDirIndex + 1]

  if (!outDir) {
    throw new Error("--out-dir requires a path")
  }

  return path.resolve(cwd, outDir)
}

async function readArtifactManifest(root) {
  const artifacts = await discoverReactArtifacts(root)

  return Promise.all(
    artifacts.map(async (filePath) => {
      const source = await fs.readFile(filePath, "utf8")
      const relativeFilePath = workspaceRelativePath(root, filePath)
      const blocks = collectStaticBlockMetadata(source)
      const blockImplementations = Object.fromEntries(
        await Promise.all(
          blocks.map(async (block) => [
            block.id,
            await resolveBlockImplementationPath({
              blockId: block.id,
              filePath: relativeFilePath,
              root,
            }),
          ])
        )
      )

      return {
        blocks,
        blockImplementations,
        filePath: relativeFilePath,
      }
    })
  )
}

function jsString(value) {
  return JSON.stringify(value)
}

function createStaticApiModule({ artifacts }) {
  const artifactManifest = artifacts.map(
    ({ blockImplementations: _unused, ...artifact }) => ({
      ...artifact,
      thumbnailUrl: defaultSiteThumbnailUrl,
    })
  )
  const manifest = {
    artifacts: artifactManifest,
    contentSource: "artifacts",
    description: defaultSiteDescription,
    guardIssues: [],
    pipeline: "example",
    status: "ready",
    thumbnailUrl: defaultSiteThumbnailUrl,
    title: defaultSiteTitle,
    version: 1,
  }
  const implementationEntries = artifacts.flatMap((artifact) =>
    Object.entries(artifact.blockImplementations).map(
      ([blockId, implementationPath]) => [
        `${artifact.filePath}::${blockId}`,
        implementationPath,
      ]
    )
  )

  return [
    `const manifest = ${JSON.stringify(manifest)};`,
    `const blockImplementations = new Map(${JSON.stringify(implementationEntries)});`,
    "",
    "function jsonResponse(data, init = {}) {",
    "  return new Response(JSON.stringify(data), {",
    "    ...init,",
    "    headers: {",
    '      "Content-Type": "application/json",',
    "      ...(init.headers ?? {}),",
    "    },",
    "  });",
    "}",
    "",
    "function errorResponse(message, status = 400) {",
    "  return jsonResponse({ error: message }, { status });",
    "}",
    "",
    "function installStaticFetch() {",
    "  const originalFetch = globalThis.fetch.bind(globalThis);",
    "  globalThis.fetch = async (input, init) => {",
    "    const url = new URL(typeof input === 'string' ? input : input.url, globalThis.location.href);",
    "    if (url.pathname === '/__agent-html/artifacts') {",
    "      return jsonResponse(manifest);",
    "    }",
    "    if (url.pathname === '/__agent-html/block-implementation') {",
    "      const key = `${url.searchParams.get('filePath') ?? ''}::${url.searchParams.get('blockId') ?? ''}`;",
    "      return jsonResponse({ implementationPath: blockImplementations.get(key) ?? null });",
    "    }",
    "    if (url.pathname === '/__agent-html/artifact/create' || url.pathname === '/__agent-html/artifact/rename' || url.pathname === '/__agent-html/artifact/delete') {",
    "      return errorResponse('The example demo is read-only.', 405);",
    "    }",
    "    if (url.pathname === '/__agent-html/codex/turn') {",
    "      return errorResponse('Codex turns are disabled in the example pipeline.', 405);",
    "    }",
    "    if (url.pathname === '/__agent-html/codex/threads') {",
    "      return jsonResponse({ cwd: 'agent-html example', threads: [] });",
    "    }",
    "    return originalFetch(input, init);",
    "  };",
    "}",
    "",
    "installStaticFetch();",
    "",
  ].join("\n")
}

function createArtifactModules({ artifacts, root }) {
  return artifacts.map((artifact, index) => {
    const absolutePath = path.resolve(root, artifact.filePath)
    const componentEntries = Object.entries(artifact.blockImplementations).map(
      ([blockId, implementationPath], componentIndex) => ({
        blockId,
        importName: `BlockComponent${componentIndex}`,
        path: path.resolve(root, implementationPath),
      })
    )
    const componentImports = componentEntries
      .map(
        (entry) =>
          `import ${entry.importName} from ${jsString(entry.path)};`
      )
      .join("\n")
    const componentMapEntries = componentEntries
      .map((entry) => `${jsString(entry.blockId)}: ${entry.importName}`)
      .join(",\n  ")

    return [
      `import React from "react";`,
      `import { createRoot } from "react-dom/client";`,
      `import Component from ${jsString(absolutePath)};`,
      componentImports,
      "",
      `const components = {`,
      `  ${componentMapEntries}`,
      `};`,
      "",
      `export const filePath = ${jsString(artifact.filePath)};`,
      "export function mount(element) {",
      "  const root = createRoot(element);",
      "  root.render(React.createElement(Component, { components }));",
      "  requestAnimationFrame(() => {",
      "    window.dispatchEvent(new CustomEvent('agent-html:artifact-rendered'));",
      "  });",
      "  return () => root.unmount();",
      "}",
      "",
    ].join("\n")
  })
}

function createArtifactRegistryModule({ artifacts }) {
  const imports = artifacts
    .map(
      (artifact, index) =>
        `import * as artifact${index} from "./artifact-${index}.tsx";`
    )
    .join("\n")
  const entries = artifacts
    .map((artifact, index) => `${jsString(artifact.filePath)}: artifact${index}`)
    .join(",\n  ")

  return [
    imports,
    "",
    `const artifacts = {`,
    `  ${entries}`,
    `};`,
    "",
    "export function installStaticArtifactRegistry() {",
    "  globalThis.__AGENT_HTML_STATIC_ARTIFACTS__ = artifacts;",
    "}",
    "",
  ].join("\n")
}

function createEntryModule() {
  const hostMainPath = path.join(hostRoot, "main.tsx")

  return [
    "import './styles.css';",
    "import { installStaticArtifactRegistry } from './artifact-registry.js';",
    "import './static-api.js';",
    "",
    "globalThis.__AGENT_HTML_HOST_CONFIG__ = {",
    '  contentSource: "artifacts",',
    '  pipeline: "example",',
    "};",
    "installStaticArtifactRegistry();",
    `await import(${jsString(hostMainPath)});`,
    "",
  ].join("\n")
}

function createIndexHtml() {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent-HTML</title>
    <link rel="icon" href="./__agent-html/public/ghost.svg" type="image/svg+xml" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="./entry.js"></script>
  </body>
</html>
`
}

async function createBuildWorkspace({ artifacts, root }) {
  const tempParent = path.join(root, ".tmp")

  await fs.mkdir(tempParent, { recursive: true })
  const tempRoot = await fs.mkdtemp(
    path.join(tempParent, "agent-html-demo-build-")
  )
  const artifactModules = createArtifactModules({ artifacts, root })

  await fs.writeFile(path.join(tempRoot, "index.html"), createIndexHtml())
  await fs.writeFile(path.join(tempRoot, "entry.js"), createEntryModule())
  await fs.writeFile(
    path.join(tempRoot, "static-api.js"),
    createStaticApiModule({ artifacts })
  )
  await fs.writeFile(
    path.join(tempRoot, "artifact-registry.js"),
    createArtifactRegistryModule({ artifacts })
  )
  await fs.writeFile(path.join(tempRoot, "styles.css"), await loadHostStyles(root))

  await Promise.all(
    artifactModules.map((source, index) =>
      fs.writeFile(path.join(tempRoot, `artifact-${index}.tsx`), source)
    )
  )

  return tempRoot
}

async function copyPublicAssets({ outDir, root }) {
  const publicRoot = path.join(root, "agent-html", "public")
  const publicOutDir = path.join(outDir, "__agent-html", "public")

  await fs.mkdir(publicOutDir, { recursive: true })
  try {
    await fs.cp(publicRoot, publicOutDir, { recursive: true })
  } catch (error) {
    if (error?.code !== "ENOENT") {
      throw error
    }
  }
}

export async function buildDemoHost({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const outDir = parseOutDirArg({ args, cwd })
  const artifacts = await readArtifactManifest(root)
  const buildRoot = await createBuildWorkspace({ artifacts, root })
  const reactProtocolEntry = resolvePackageModule("@agent-html/react")
  const reactEntry = resolvePackageModule("react")
  const reactDomClientEntry = resolvePackageModule("react-dom/client")
  const reactJsxRuntimeEntry = resolvePackageModule("react/jsx-runtime")
  const reactJsxDevRuntimeEntry = resolvePackageModule("react/jsx-dev-runtime")

  await fs.rm(outDir, { force: true, recursive: true })
  await viteBuild({
    base: "./",
    build: {
      emptyOutDir: true,
      outDir,
      rollupOptions: {
        input: path.join(buildRoot, "index.html"),
      },
    },
    configFile: false,
    publicDir: false,
    root,
    plugins: [react()],
    resolve: {
      alias: [
        { find: "@", replacement: path.join(root, "agent-html") },
        {
          find: "#agent-html-playground",
          replacement: path.join(root, "agent-html"),
        },
        { find: "@agent-html/react", replacement: reactProtocolEntry },
        { find: "react-dom/client", replacement: reactDomClientEntry },
        { find: "react/jsx-runtime", replacement: reactJsxRuntimeEntry },
        { find: "react/jsx-dev-runtime", replacement: reactJsxDevRuntimeEntry },
        { find: /^react$/, replacement: reactEntry },
      ],
    },
    server: {
      fs: {
        allow: createViteFsAllowList({ reactProtocolEntry, root }),
      },
    },
  })
  const buildRootOutDir = path.join(outDir, path.relative(root, buildRoot))
  const builtIndexPath = path.join(buildRootOutDir, "index.html")
  const builtIndexHtml = await fs.readFile(builtIndexPath, "utf8")
  await fs.writeFile(
    path.join(outDir, "index.html"),
    builtIndexHtml.replace(
      /\b(src|href)="(?:\.\.\/)+(?:\.\/)?assets\//g,
      '$1="./assets/'
    )
  )
  await fs.rm(buildRootOutDir, {
    force: true,
    recursive: true,
  })
  await fs.writeFile(
    path.join(outDir, "artifacts.json"),
    `${JSON.stringify({
      artifacts: artifacts.map(({ blockImplementations: _unused, ...artifact }) => ({
        ...artifact,
        thumbnailUrl: defaultSiteThumbnailUrl,
      })),
      contentSource: "artifacts",
      description: defaultSiteDescription,
      pipeline: "example",
      thumbnailUrl: defaultSiteThumbnailUrl,
      title: defaultSiteTitle,
    }, null, 2)}\n`
  )
  await copyPublicAssets({ outDir, root })
  await fs.rm(buildRoot, { force: true, recursive: true })

  console.log(`Built AgentHTML example demo at ${outDir}`)
  console.log(`Artifacts: ${artifacts.length}`)

  return {
    artifactCount: artifacts.length,
    outDir,
    root,
  }
}
