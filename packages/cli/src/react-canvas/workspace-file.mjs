import fs from "node:fs/promises"

export async function readTextFile(filePath) {
  return fs.readFile(filePath, "utf8")
}
