import fs from "node:fs/promises"
import path from "node:path"

export function readBlockOpenTags(source) {
  const blocks = []
  const pattern = /<Block\b([^>]*)>/g
  let match

  while ((match = pattern.exec(source)) !== null) {
    blocks.push({
      attrs: match[1],
      index: match.index,
      openTag: match[0],
    })
  }

  return blocks
}

export function readAttr(attrs, name) {
  const patterns = [
    new RegExp(`${name}\\s*=\\s*"([^"]*)"`),
    new RegExp(`${name}\\s*=\\s*'([^']*)'`),
    new RegExp(`${name}\\s*=\\s*\\{\\s*"([^"]*)"\\s*\\}`),
    new RegExp(`${name}\\s*=\\s*\\{\\s*'([^']*)'\\s*\\}`),
  ]

  for (const pattern of patterns) {
    const match = pattern.exec(attrs)
    if (match) {
      return match[1]
    }
  }

  return null
}

export function collectBlockIds(source) {
  return readBlockOpenTags(source).map((block) => ({
    hasIdAttribute: /\bid\s*=/.test(block.attrs),
    id: readAttr(block.attrs, "id"),
    index: block.index,
    title: readAttr(block.attrs, "title"),
  }))
}

export function extractBlockSource(source, blockId) {
  const blocks = readBlockOpenTags(source)
  const target = blocks.find((block) => readAttr(block.attrs, "id") === blockId)

  if (!target) {
    return null
  }

  const tagPattern = /<\/?Block\b[^>]*>/g
  tagPattern.lastIndex = target.index
  let depth = 0
  let match

  while ((match = tagPattern.exec(source)) !== null) {
    const tag = match[0]
    if (tag.startsWith("</")) {
      depth -= 1
      if (depth === 0) {
        return source.slice(target.index, match.index + tag.length)
      }
      continue
    }

    if (tag.endsWith("/>")) {
      if (match.index === target.index) {
        return tag
      }
      continue
    }

    depth += 1
  }

  return null
}

function isKebabCase(value) {
  return /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/.test(value)
}

function isReactCanvasSourceRoot(relativePath) {
  return (
    relativePath.startsWith(".agent-html/artifacts/") ||
    relativePath.startsWith(".agent-html/examples/")
  )
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
  if (!entryName.endsWith(".agent.tsx")) {
    return null
  }

  const artifactName = entryName.slice(0, -".agent.tsx".length)
  const candidateRelativePath = path.join(
    path.dirname(filePath),
    artifactName,
    `${blockId}.block.tsx`
  )
  const candidatePath = path.resolve(root, candidateRelativePath)
  const agentHtmlRoot = path.resolve(root, ".agent-html")

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

export async function readTextFile(filePath) {
  return fs.readFile(filePath, "utf8")
}
