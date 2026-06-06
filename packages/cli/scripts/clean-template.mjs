import fs from "node:fs/promises"
import path from "node:path"
import { fileURLToPath } from "node:url"

const cliRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  ".."
)

await fs.rm(path.join(cliRoot, "template"), {
  force: true,
  recursive: true,
})
