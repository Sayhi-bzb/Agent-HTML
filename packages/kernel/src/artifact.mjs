export function titleizeBlockId(id) {
  return id
    .split("-")
    .filter(Boolean)
    .map((part) => `${part[0].toUpperCase()}${part.slice(1)}`)
    .join(" ")
}

export function normalizeArtifactDefinition(definition) {
  return {
    title: definition.title,
    blocks: definition.blocks.map((block) => {
      if (typeof block === "string") {
        return { id: block, title: titleizeBlockId(block) }
      }

      return {
        id: block.id,
        title: block.title ?? titleizeBlockId(block.id)
      }
    })
  }
}
