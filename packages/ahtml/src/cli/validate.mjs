import { sanitizeAgentHtml } from "@agent-html/core"
import {
  createArtifactProfileResolver,
  readCurrentArtifactProfileReference,
  resolveArtifactProfileByReference,
} from "./artifact-profile-storage.mjs"

export async function validateAgentHtmlSource(source, runtimeContext) {
  const renderConfigResolvers = await loadArtifactProfileResolvers(
    runtimeContext,
  )
  const result = sanitizeAgentHtml(source, renderConfigResolvers)

  return { diagnostics: result.diagnostics, document: result.document }
}

export function validateRenderConfig(config, values) {
  if (!config || typeof config !== "object" || Array.isArray(config)) {
    return false
  }

  return (
    Object.keys(config).every((key) => key in values) &&
    Object.entries(values).every(
      ([key, allowedValues]) =>
        typeof config[key] === "string" && allowedValues.includes(config[key]),
    )
  )
}

async function loadArtifactProfileResolvers(runtimeContext) {
  if (!isRuntimePaths(runtimeContext)) {
    return undefined
  }

  const resolveArtifactProfileReference = await createArtifactProfileResolver(
    runtimeContext,
  )
  const currentArtifactProfileReference =
    await readCurrentArtifactProfileReference(runtimeContext)
  const defaultArtifactProfile = await resolveArtifactProfileByReference(
    runtimeContext,
    currentArtifactProfileReference,
  )

  return {
    resolveArtifactProfileReference,
    resolveDefaultArtifactProfileReference: () => defaultArtifactProfile,
  }
}

function isRuntimePaths(value) {
  return (
    Boolean(value) &&
    typeof value === "object" &&
    typeof value.userArtifactProfilesDir === "string"
  )
}
