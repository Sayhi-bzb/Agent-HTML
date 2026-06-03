import fs from "node:fs/promises"

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

export async function readTextFile(filePath) {
  return fs.readFile(filePath, "utf8")
}
