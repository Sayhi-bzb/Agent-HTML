import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")
const indexPath = path.join(dist, "index.html")

const forbiddenMarkers = [
  {
    marker: "dist-agent-html",
    reason: "example build output",
  },
  {
    marker: "verify:example-build",
    reason: "build verification script",
  },
]

const expectedMarkers = ["AgentHTML", "root"]

function fail(message) {
  console.error(`verify:app-bundle failed: ${message}`)
  process.exit(1)
}

function readBundleFiles() {
  if (!fs.existsSync(indexPath)) {
    fail("dist/index.html does not exist. Run npm run build first.")
  }

  const html = fs.readFileSync(indexPath, "utf8")
  const scriptMatches = [...html.matchAll(/<script[^>]+src="([^"]+\.js)"/g)]

  if (scriptMatches.length === 0) {
    fail("index.html does not reference a JavaScript bundle")
  }

  return scriptMatches.map((match) => {
    const scriptPath = path.join(dist, match[1].replace(/^\//, ""))

    if (!fs.existsSync(scriptPath)) {
      fail(`referenced bundle does not exist: ${match[1]}`)
    }

    return {
      name: match[1],
      content: fs.readFileSync(scriptPath, "utf8"),
    }
  })
}

const bundles = readBundleFiles()
const combinedBundle = bundles.map((bundle) => bundle.content).join("\n")
const forbidden = forbiddenMarkers.find(({ marker }) =>
  combinedBundle.includes(marker),
)

if (forbidden) {
  fail(`bundle contains ${forbidden.reason} marker: ${forbidden.marker}`)
}

if (!expectedMarkers.some((marker) => combinedBundle.includes(marker))) {
  fail("bundle does not contain expected app markers")
}

console.log(
  `verify:app-bundle passed (${bundles.map((bundle) => bundle.name).join(", ")})`,
)
