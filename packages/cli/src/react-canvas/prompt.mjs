import { encode } from "@toon-format/toon"

const toonEncodeOptions = {
  delimiter: ",",
  flattenDepth: Infinity,
  indent: 2,
  keyFolding: "off",
}

export function compactInteractionSnapshot(snapshot) {
  const changesByControl = new Map()

  for (const change of snapshot.recentChanges ?? []) {
    const previous = changesByControl.get(change.controlId)

    changesByControl.set(change.controlId, {
      controlId: change.controlId,
      from: previous ? previous.from : change.before,
      semantic: change.semantic,
      to: change.after,
    })
  }

  return {
    finalState: snapshot.currentState ?? {},
    diff: Array.from(changesByControl.values()).filter(
      (change) => !Object.is(change.from, change.to)
    ),
  }
}

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

  if (payload.interactionSnapshot) {
    lines.push(
      "Interaction Context:",
      "```toon",
      encode(
        { interaction: compactInteractionSnapshot(payload.interactionSnapshot) },
        toonEncodeOptions
      ),
      "```",
      ""
    )
  }

  lines.push("Request:", payload.request)
  return lines.join("\n")
}
