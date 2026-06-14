export function titleizeBlockId(id) {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

function findMatchingClose(source, openIndex, openChar, closeChar) {
  let depth = 0
  let quote = null
  let escaped = false

  for (let index = openIndex; index < source.length; index += 1) {
    const char = source[index]

    if (quote) {
      if (escaped) {
        escaped = false
        continue
      }
      if (char === "\\") {
        escaped = true
        continue
      }
      if (char === quote) {
        quote = null
      }
      continue
    }

    if (char === '"' || char === "'") {
      quote = char
      continue
    }

    if (char === openChar) {
      depth += 1
      continue
    }

    if (char === closeChar) {
      depth -= 1
      if (depth === 0) {
        return index
      }
    }
  }

  return -1
}

function extractDefineArtifactObject(source) {
  const callIndex = source.indexOf("defineArtifact")
  if (callIndex === -1) {
    return null
  }

  const parenIndex = source.indexOf("(", callIndex)
  if (parenIndex === -1) {
    return null
  }

  const objectStart = source.indexOf("{", parenIndex)
  if (objectStart === -1) {
    return null
  }

  const objectEnd = findMatchingClose(source, objectStart, "{", "}")
  if (objectEnd === -1) {
    return null
  }

  return {
    index: callIndex,
    object: source.slice(objectStart, objectEnd + 1),
  }
}

function readStringProperty(objectSource, name) {
  const pattern = new RegExp(`\\b${name}\\s*:\\s*(["'])((?:\\\\.|(?!\\1).)*)\\1`)
  const match = pattern.exec(objectSource)

  return match ? match[2] : null
}

function extractBlocksArray(objectSource) {
  const keyMatch = /\bblocks\s*:/.exec(objectSource)
  if (!keyMatch) {
    return null
  }

  const arrayStart = objectSource.indexOf("[", keyMatch.index)
  if (arrayStart === -1) {
    return null
  }

  const arrayEnd = findMatchingClose(objectSource, arrayStart, "[", "]")
  if (arrayEnd === -1) {
    return null
  }

  return {
    array: objectSource.slice(arrayStart + 1, arrayEnd),
    index: arrayStart,
  }
}

function collectBlockEntries(arraySource, arrayIndex = 0) {
  const blocks = []
  const entryPattern =
    /(["'])((?:\\.|(?!\1).)*)\1|\{[^{}]*\bid\s*:\s*(["'])((?:\\.|(?!\3).)*)\3[^{}]*\}/g
  let match

  while ((match = entryPattern.exec(arraySource)) !== null) {
    const id = match[2] ?? match[4] ?? null
    const title = match[0].startsWith("{")
      ? readStringProperty(match[0], "title")
      : null

    blocks.push({
      id,
      index: arrayIndex + match.index,
      title,
    })
  }

  return blocks
}

export function collectArtifactDefinition(source) {
  const definition = extractDefineArtifactObject(source)
  if (!definition) {
    return {
      blocks: [],
      index: -1,
      title: null,
    }
  }

  const blocksArray = extractBlocksArray(definition.object)

  return {
    blocks: blocksArray
      ? collectBlockEntries(blocksArray.array, definition.index + blocksArray.index)
      : [],
    index: definition.index,
    title: readStringProperty(definition.object, "title"),
  }
}

export function collectBlockIds(source) {
  return collectArtifactDefinition(source).blocks
}

export function collectStaticBlockMetadata(source) {
  return collectBlockIds(source).map((block) => ({
    id: block.id,
    title: block.title ?? titleizeBlockId(block.id),
  }))
}
