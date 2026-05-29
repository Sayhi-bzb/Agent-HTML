const workspaceRelativePrefixes = ["projects/", ".agent-world/", ".agents/"]

function normalizePortablePath(value: string) {
  return value.replace(/\\/g, "/").replace(/\/+$/, "")
}

export function formatCodexWorkspacePath(
  filePath: string,
  workspaceRootPath: string
) {
  const normalized = filePath.replace(/\\/g, "/")

  if (
    workspaceRelativePrefixes.some((prefix) => normalized.startsWith(prefix))
  ) {
    return normalized
  }

  const normalizedRoot = normalizePortablePath(workspaceRootPath.trim())
  const normalizedFilePath = normalizePortablePath(filePath)
  if (
    normalizedRoot &&
    normalizedFilePath
      .toLocaleLowerCase()
      .startsWith(`${normalizedRoot.toLocaleLowerCase()}/`)
  ) {
    return normalizedFilePath.slice(normalizedRoot.length + 1)
  }

  throw new Error(
    `Workspace file path is outside the Codex workspace root: ${filePath}`
  )
}
