import fs from "node:fs"
import path from "node:path"
import { fileURLToPath } from "node:url"
import { brotliCompressSync, gzipSync } from "node:zlib"

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const dist = path.join(root, "dist")
const assets = path.join(dist, "assets")
const trackedExtensions = new Set([".js", ".css"])

function formatBytes(bytes) {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KiB`
  return `${(bytes / 1024 / 1024).toFixed(2)} MiB`
}

function fail(message) {
  console.error(`bundle:size failed: ${message}`)
  process.exit(1)
}

if (!fs.existsSync(assets)) {
  fail("dist/assets does not exist. Run npm run build first.")
}

const rows = fs
  .readdirSync(assets)
  .filter((fileName) => trackedExtensions.has(path.extname(fileName)))
  .map((fileName) => {
    const filePath = path.join(assets, fileName)
    const source = fs.readFileSync(filePath)

    return {
      fileName,
      raw: source.byteLength,
      gzip: gzipSync(source).byteLength,
      brotli: brotliCompressSync(source).byteLength,
    }
  })
  .sort((a, b) => b.raw - a.raw)
const displayedRows = rows.slice(0, 25)

if (rows.length === 0) {
  fail("no JavaScript or CSS assets found in dist/assets")
}

const totals = rows.reduce(
  (sum, row) => ({
    raw: sum.raw + row.raw,
    gzip: sum.gzip + row.gzip,
    brotli: sum.brotli + row.brotli,
  }),
  { raw: 0, gzip: 0, brotli: 0 },
)

const table = displayedRows.map((row) => ({
  asset: row.fileName,
  raw: formatBytes(row.raw),
  gzip: formatBytes(row.gzip),
  brotli: formatBytes(row.brotli),
}))

console.table(table)
if (rows.length > displayedRows.length) {
  console.log(`Showing largest ${displayedRows.length} of ${rows.length} assets.`)
}
console.log(
  `Total: raw ${formatBytes(totals.raw)}, gzip ${formatBytes(
    totals.gzip,
  )}, brotli ${formatBytes(totals.brotli)}`,
)
