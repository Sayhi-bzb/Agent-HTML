import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist-agent-html")
const indexPath = path.join(dist, "index.html")

function fail(message) {
  console.error(`verify:example-build failed: ${message}`)
  process.exit(1)
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
const appOnlyMarkers = ["Design Engineering", "Primary content area", "Gallery"]
const exampleMarkers = ["Open preview", "Markdown", "Agent-HTML"]

const appMarker = appOnlyMarkers.find((marker) => bundle.includes(marker))

if (appMarker) {
  fail(`bundle contains app-only marker: ${appMarker}`)
}

if (!exampleMarkers.some((marker) => bundle.includes(marker))) {
  fail("bundle does not contain expected example markers")
}

console.log("verify:example-build passed")
