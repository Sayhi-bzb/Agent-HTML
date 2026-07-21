import fs from "node:fs"
import fsPromises from "node:fs/promises"
import os from "node:os"
import path from "node:path"

import { afterEach } from "vitest"

const testTempRoot = path.join(os.tmpdir(), "agent-html-tests")
const trackedDirectories = new Set()

function prefixPath(prefix) {
  if (!/^[a-z0-9][a-z0-9-]*$/i.test(prefix)) {
    throw new Error(`Invalid test temp prefix: ${prefix}`)
  }
  return path.join(testTempRoot, `${prefix}-`)
}

export async function createTestTempDir(prefix) {
  await fsPromises.mkdir(testTempRoot, { recursive: true })
  const directory = await fsPromises.mkdtemp(prefixPath(prefix))
  trackedDirectories.add(directory)
  return directory
}

export function createTestTempDirSync(prefix) {
  fs.mkdirSync(testTempRoot, { recursive: true })
  const directory = fs.mkdtempSync(prefixPath(prefix))
  trackedDirectories.add(directory)
  return directory
}

export async function cleanupTestTempDirs() {
  const directories = [...trackedDirectories]
  trackedDirectories.clear()
  await Promise.all(
    directories.map((directory) =>
      fsPromises.rm(directory, { force: true, recursive: true })
    )
  )
}

afterEach(cleanupTestTempDirs)
