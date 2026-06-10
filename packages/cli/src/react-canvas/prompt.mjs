import { encode } from "@toon-format/toon"

const toonEncodeOptions = {
  delimiter: ",",
  flattenDepth: Infinity,
  indent: 2,
  keyFolding: "off",
}

const viewStateKinds = new Set(["open", "snapshot"])
const viewStateComponents = new Set([
  "accordion",
  "alert-dialog",
  "collapsible",
  "dialog",
  "drawer",
  "popover",
  "sheet",
  "tabs",
])

function isViewStateChange(change) {
  return (
    viewStateKinds.has(change.kind) || viewStateComponents.has(change.component)
  )
}

export function compactInteractionSnapshot(snapshot) {
  const compactedChanges = snapshot.compactedChanges ?? null

  if (compactedChanges) {
    return {
      actions: snapshot.compactedActions ?? [],
      finalState: snapshot.currentState ?? {},
      diff: compactedChanges
        .filter((change) => !isViewStateChange(change))
        .filter((change) => !Object.is(change.from, change.to))
        .map(({ controlId, from, semantic, to }) => ({
          controlId,
          from,
          semantic,
          to,
        })),
    }
  }

  const changesByControl = new Map()
  const actions = []

  for (const change of snapshot.recentChanges ?? []) {
    if (change.kind === "action") {
      actions.push({
        controlId: change.controlId,
        semantic: change.semantic,
        value: change.after,
      })
      continue
    }

    const previous = changesByControl.get(change.controlId)

    changesByControl.set(change.controlId, {
      component: change.component,
      controlId: change.controlId,
      from: previous ? previous.from : change.before,
      kind: change.kind,
      semantic: change.semantic,
      to: change.after,
    })
  }

  return {
    actions,
    finalState: snapshot.currentState ?? {},
    diff: Array.from(changesByControl.values())
      .filter((change) => !isViewStateChange(change))
      .filter((change) => !Object.is(change.from, change.to))
      .map(({ controlId, from, semantic, to }) => ({
        controlId,
        from,
        semantic,
        to,
      })),
  }
}

export function formatBlockPrompt(payload) {
  const lines = [
    "---",
    `filePath: ${payload.filePath}`,
    `blockId: ${payload.blockId}`,
    payload.implementationPath
      ? `implementationPath: ${payload.implementationPath}`
      : null,
    "---",
    "",
  ].filter((line) => line !== null)

  if (payload.interactionSnapshot) {
    lines.push(
      "```interaction",
      encode(
        compactInteractionSnapshot(payload.interactionSnapshot),
        toonEncodeOptions
      ),
      "```",
      ""
    )
  }

  lines.push("Request:", payload.request)
  return lines.join("\n")
}

export function createArtifactSlug(request, existingFilePaths = []) {
  const words = String(request ?? "")
    .toLowerCase()
    .replace(/['"]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .split("-")
    .filter(Boolean)
    .slice(0, 5)

  const baseSlug = words.length > 0
    ? words.join("-")
    : `artifact-${Date.now()}`
  const existing = new Set(existingFilePaths)
  let slug = baseSlug
  let suffix = 2

  while (existing.has(`agent-html/artifacts/${slug}.artifact.tsx`)) {
    slug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return slug
}

export function createArtifactFilePath({
  existingFilePaths = [],
  request,
}) {
  return `agent-html/artifacts/${createArtifactSlug(
    request,
    existingFilePaths
  )}.artifact.tsx`
}
