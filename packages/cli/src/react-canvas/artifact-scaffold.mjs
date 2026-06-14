import path from "node:path"

function artifactNameFromEntryPath(entryPath) {
  return path.basename(entryPath).slice(0, -".artifact.tsx".length)
}

export function createArtifactScaffold({ entryPath, request }) {
  const title = artifactNameFromEntryPath(entryPath)
  const runtimeImport = "@agent-html" + "/react"

  return [
    `import { defineArtifact } from "${runtimeImport}"`,
    "",
    "export default defineArtifact({",
    `  title: ${JSON.stringify(title)},`,
    "  blocks: [",
    '    "overview",',
    "  ],",
    "})",
    "",
    `// Request: ${request.trim()}`,
    "",
  ].join("\n")
}
