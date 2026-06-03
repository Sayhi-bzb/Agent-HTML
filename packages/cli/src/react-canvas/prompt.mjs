export function formatBlockPrompt(payload) {
  const lines = [
    "---",
    `filePath: ${payload.filePath}`,
    `blockPath: ${payload.blockPath}`,
    `targetStatus: ${payload.targetStatus}`,
    "---",
    "",
  ]

  if (payload.selectedSource) {
    lines.push("```tsx", payload.selectedSource, "```", "")
  }

  lines.push("Request:", payload.request)
  return lines.join("\n")
}
