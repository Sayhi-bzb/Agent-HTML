import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

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
const maxEntryBundleGzipBytes = 365 * 1024
const maxEntryBundleRawBytes = 1.25 * 1024 * 1024

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

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

    const content = fs.readFileSync(scriptPath)

    return {
      name: match[1],
      content,
      raw: content.byteLength,
    }
  })
}

const bundles = readBundleFiles()
const combinedBundle = bundles
  .map((bundle) => bundle.content.toString("utf8"))
  .join("\n")
const forbidden = forbiddenMarkers.find(({ marker }) =>
  combinedBundle.includes(marker),
)
const largestEntryBundle = bundles.reduce((largest, bundle) =>
  bundle.raw > largest.raw ? bundle : largest
)
const largestEntryBundleGzip = gzipSync(largestEntryBundle.content).byteLength

if (forbidden) {
  fail(`bundle contains ${forbidden.reason} marker: ${forbidden.marker}`)
}

if (!expectedMarkers.some((marker) => combinedBundle.includes(marker))) {
  fail("bundle does not contain expected app markers")
}

if (largestEntryBundle.raw > maxEntryBundleRawBytes) {
  fail(
    `entry bundle raw size ${formatBytes(largestEntryBundle.raw)} exceeds ${formatBytes(
      maxEntryBundleRawBytes,
    )}: ${largestEntryBundle.name}`,
  )
}

if (largestEntryBundleGzip > maxEntryBundleGzipBytes) {
  fail(
    `entry bundle gzip size ${formatBytes(largestEntryBundleGzip)} exceeds ${formatBytes(
      maxEntryBundleGzipBytes,
    )}: ${largestEntryBundle.name}`,
  )
}

console.log(
  `verify:app-bundle passed (${bundles
    .map((bundle) => bundle.name)
    .join(", ")}; largest entry ${formatBytes(
    largestEntryBundle.raw,
  )} raw / ${formatBytes(largestEntryBundleGzip)} gzip)`,
)
