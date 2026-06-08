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

export function collectStaticBlockMetadata(source) {
  return collectBlockIds(source)
    .filter((block) => block.id)
    .map((block) => ({
      id: block.id,
      title: block.title ?? block.id,
    }))
}
