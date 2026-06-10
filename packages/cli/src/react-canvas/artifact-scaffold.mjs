import path from "node:path"

function artifactNameFromEntryPath(entryPath) {
  return path.basename(entryPath).slice(0, -".artifact.tsx".length)
}

function createArtifactComponentName(title) {
  const name = title
    .split(/[^a-zA-Z0-9]+/)
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join("")

  if (!name) {
    return "GeneratedArtifact"
  }

  return /^[A-Z]/.test(name) ? `${name}Artifact` : `Generated${name}Artifact`
}

export function createArtifactScaffold({ entryPath, request }) {
  const title = artifactNameFromEntryPath(entryPath)
  const componentName = createArtifactComponentName(title)
  const runtimeImport = "@agent-html" + "/react"

  return [
    `import { Artifact, Block } from "${runtimeImport}"`,
    "",
    `export default function ${componentName}() {`,
    "  return (",
    `    <Artifact title={${JSON.stringify(title)}}>`,
    '      <Block id="overview" title="Overview">',
    '        <main className="min-h-screen bg-background text-foreground">',
    '          <section className="mx-auto flex min-h-screen max-w-3xl flex-col justify-center gap-4 px-6 py-16">',
    '            <p className="text-sm font-medium uppercase tracking-wide text-muted-foreground">',
    "              Request",
    "            </p>",
    '            <h1 className="text-3xl font-semibold">',
    `              ${title}`,
    "            </h1>",
    '            <p className="text-muted-foreground">',
    `              {${JSON.stringify(request.trim())}}`,
    "            </p>",
    "          </section>",
    "        </main>",
    "      </Block>",
    "    </Artifact>",
    "  )",
    "}",
    "",
  ].join("\n")
}
