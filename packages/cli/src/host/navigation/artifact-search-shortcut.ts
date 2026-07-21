export type ArtifactSearchShortcutInput = {
  altKey: boolean
  ctrlKey: boolean
  isComposing: boolean
  key: string
  metaKey: boolean
  shiftKey: boolean
}

export function isArtifactSearchShortcut({
  altKey,
  ctrlKey,
  isComposing,
  key,
  metaKey,
  shiftKey,
}: ArtifactSearchShortcutInput) {
  return (
    !altKey &&
    !isComposing &&
    !shiftKey &&
    (ctrlKey || metaKey) &&
    key.toLowerCase() === "k"
  )
}
