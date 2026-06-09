import fs from "node:fs/promises"
import path from "node:path"

import { collectStaticBlockMetadata } from "./react-canvas/block-tags.mjs"
import {
  discoverReactArtifacts,
  parseRootArg,
  workspaceRelativePath,
} from "./react-canvas/paths.mjs"
import { loadHostStyles } from "./dev-server/styles.mjs"

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

      return {
        blocks: collectStaticBlockMetadata(source),
        filePath: workspaceRelativePath(root, filePath),
      }
    })
  )
}

function createDemoIndexHtml() {
  const config = JSON.stringify({
    contentSource: "artifacts",
    pipeline: "example",
  })

  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Agent-HTML Demo</title>
    <link rel="stylesheet" href="./styles.css" />
  </head>
  <body>
    <main id="root" class="agent-html-demo" data-agent-html-demo-root>
      <header class="agent-html-demo-header">
        <p class="agent-html-demo-kicker">AgentHTML Example Pipeline</p>
        <h1>Artifacts</h1>
      </header>
      <section id="artifact-list" class="agent-html-demo-list" aria-live="polite"></section>
    </main>
    <script>
      globalThis.__AGENT_HTML_HOST_CONFIG__ = ${config};
      async function renderArtifacts() {
        const list = document.getElementById("artifact-list");
        try {
          const response = await fetch("./artifacts.json");
          const data = await response.json();
          list.replaceChildren(...data.artifacts.map((artifact) => {
            const article = document.createElement("article");
            article.className = "agent-html-demo-artifact";
            const title = document.createElement("h2");
            title.textContent = artifact.filePath
              .split("/")
              .pop()
              .replace(".artifact.tsx", "");
            const path = document.createElement("p");
            path.className = "agent-html-demo-path";
            path.textContent = artifact.filePath;
            const blocks = document.createElement("ul");
            blocks.className = "agent-html-demo-blocks";
            for (const block of artifact.blocks) {
              const item = document.createElement("li");
              item.textContent = block.title || block.id;
              blocks.append(item);
            }
            article.append(title, path, blocks);
            return article;
          }));
        } catch (error) {
          list.textContent = error instanceof Error ? error.message : String(error);
        }
      }
      void renderArtifacts();
    </script>
    <script type="application/json" id="agent-html-artifacts">
      {"artifactsPath":"./artifacts.json"}
    </script>
  </body>
</html>
`
}

function createDemoStyles(hostStyles) {
  return `${hostStyles}

.agent-html-demo {
  width: min(100% - 2rem, 72rem);
  margin-inline: auto;
  padding-block: 3rem;
}

.agent-html-demo-header {
  margin-block-end: 2rem;
}

.agent-html-demo-kicker,
.agent-html-demo-path {
  color: var(--muted-foreground, #64748b);
  font-size: 0.875rem;
}

.agent-html-demo-list {
  display: grid;
  gap: 1rem;
}

.agent-html-demo-artifact {
  border: 1px solid color-mix(in oklab, var(--foreground, #0f172a) 14%, transparent);
  border-radius: 0.5rem;
  padding: 1rem;
}

.agent-html-demo-artifact h2 {
  margin: 0;
  font-size: 1rem;
}

.agent-html-demo-blocks {
  margin-block-end: 0;
}
`
}

export async function buildDemoHost({ args, cwd }) {
  const root = parseRootArg({ args, cwd })
  const outDir = parseOutDirArg({ args, cwd })
  const artifacts = await readArtifactManifest(root)

  await fs.mkdir(outDir, { recursive: true })
  await fs.writeFile(path.join(outDir, "index.html"), createDemoIndexHtml())
  await fs.writeFile(
    path.join(outDir, "artifacts.json"),
    `${JSON.stringify({
      artifacts,
      contentSource: "artifacts",
      pipeline: "example",
    }, null, 2)}\n`
  )
  await fs.writeFile(
    path.join(outDir, "styles.css"),
    createDemoStyles(await loadHostStyles(root))
  )

  console.log(`Built AgentHTML example demo at ${outDir}`)
  console.log(`Artifacts: ${artifacts.length}`)

  return {
    artifactCount: artifacts.length,
    outDir,
    root,
  }
}
