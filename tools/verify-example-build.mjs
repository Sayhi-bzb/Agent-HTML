import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { gzipSync } from "node:zlib"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist-agent-html")
const indexPath = path.join(dist, "index.html")
const maxEntryBundleGzipBytes = 380 * 1024
const maxEntryBundleRawBytes = 1.25 * 1024 * 1024

function fail(message) {
  console.error(`verify:example-build failed: ${message}`)
  process.exit(1)
}

function formatBytes(bytes) {
  if (bytes < 1024) {
    return `${bytes} B`
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KiB`
  }

  return `${(bytes / (1024 * 1024)).toFixed(2)} MiB`
}

if (!fs.existsSync(indexPath)) {
  fail("dist-agent-html/index.html does not exist")
}

const html = fs.readFileSync(indexPath, "utf8")
const scriptMatch = html.match(/<script[^>]+src="([^"]+\.js)"/)

if (!scriptMatch) {
  fail("index.html does not reference a JavaScript bundle")
}

const scriptPath = path.join(dist, scriptMatch[1].replace(/^\//, ""))

if (!fs.existsSync(scriptPath)) {
  fail(`referenced bundle does not exist: ${scriptMatch[1]}`)
}

const bundle = fs.readFileSync(scriptPath, "utf8")
const bundleGzipBytes = gzipSync(bundle).byteLength
const appOnlyMarkers = ["Design Engineering", "Primary content area"]
const exampleMarkers = ["Open preview", "Markdown", "Agent-HTML"]

const appMarker = appOnlyMarkers.find((marker) => bundle.includes(marker))

if (appMarker) {
  fail(`bundle contains app-only marker: ${appMarker}`)
}

if (!exampleMarkers.some((marker) => bundle.includes(marker))) {
  fail("bundle does not contain expected example markers")
}

if (bundle.length > maxEntryBundleRawBytes) {
  fail(
    `entry bundle raw size ${formatBytes(bundle.length)} exceeds ${formatBytes(
      maxEntryBundleRawBytes
    )}`
  )
}

if (bundleGzipBytes > maxEntryBundleGzipBytes) {
  fail(
    `entry bundle gzip size ${formatBytes(bundleGzipBytes)} exceeds ${formatBytes(
      maxEntryBundleGzipBytes
    )}`
  )
}

console.log(
  `verify:example-build passed (${scriptMatch[1]}; entry ${formatBytes(
    bundle.length
  )} raw / ${formatBytes(bundleGzipBytes)} gzip)`
)
