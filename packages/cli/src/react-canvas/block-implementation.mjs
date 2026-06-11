import fs from "node:fs/promises"
import path from "node:path"

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)
}

function isReactCanvasSourceRoot(relativePath) {
  return relativePath.startsWith("agent-html/artifacts/")
}

function toPosixPath(value) {
  return value.split(path.sep).join("/")
}

export async function resolveBlockImplementationPath({
  blockId,
  filePath,
  root,
}) {
  if (!isKebabCase(blockId) || !isReactCanvasSourceRoot(filePath)) {
    return null
  }

  const entryName = path.basename(filePath)
  if (!entryName.endsWith(".artifact.tsx")) {
    return null
  }

  const artifactName = entryName.slice(0, -".artifact.tsx".length)
  const candidateRelativePath = path.join(
    path.dirname(filePath),
    artifactName,
    `${blockId}.block.tsx`
  )
  const candidatePath = path.resolve(root, candidateRelativePath)
  const agentHtmlRoot = path.resolve(root, "agent-html")

  if (
    candidatePath !== agentHtmlRoot &&
    !candidatePath.startsWith(`${agentHtmlRoot}${path.sep}`)
  ) {
    return null
  }

  try {
    const stats = await fs.stat(candidatePath)
    return stats.isFile() ? toPosixPath(candidateRelativePath) : null
  } catch {
    return null
  }
}
