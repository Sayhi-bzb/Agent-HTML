import { VALIDATED_STANDARD_COMPONENT_SCHEMAS } from "@agent-html/core"

import {
  createRendererMapping,
  createRuntimeElementRegistrySpec,
  createRuntimeRendererKindSpec,
  createRuntimeVerificationData,
} from "./render-capabilities.mjs"

export function createRuntimeContract(components) {
  const normalizedComponents = normalizeRuntimeContractComponents(components)
  const verificationData = createRuntimeVerificationData(normalizedComponents)
  const rendererMapping = createRendererMapping(normalizedComponents)

  return {
    version: 1,
    components: normalizedComponents,
    renderableAgentComponents: normalizedComponents.map(
      (component) => component.name,
    ),
    verificationData,
    rendererMapping,
    elementRegistrySpec: createRuntimeElementRegistrySpec(rendererMapping),
    rendererKindSpec: createRuntimeRendererKindSpec(),
  }
}

export function createRuntimeContractFromSchema(schema) {
  const normalizedComponents = normalizeRuntimeContractComponents(
    schema?.components,
  )
  const verificationData = hasRuntimeVerificationDataSnapshot(schema)
    ? schema.verificationData
    : createRuntimeVerificationData(normalizedComponents)
  const rendererMapping = hasRendererMappingSnapshot(schema)
    ? schema.rendererMapping
    : createRendererMapping(normalizedComponents)

  return {
    version: 1,
    components: normalizedComponents,
    renderableAgentComponents: normalizedComponents.map(
      (component) => component.name,
    ),
    verificationData,
    rendererMapping,
    elementRegistrySpec: createRuntimeElementRegistrySpec(rendererMapping),
    rendererKindSpec: createRuntimeRendererKindSpec(),
  }
}

export function createManagedRuntimeCapability({
  runtimeContract,
  version = 1,
}) {
  if (!runtimeContract) {
    throw new Error("Runtime capability requires a runtime contract.")
  }

  return {
    version,
    renderableAgentComponents: runtimeContract.renderableAgentComponents,
    verificationData: runtimeContract.verificationData,
    rendererMapping: runtimeContract.rendererMapping,
  }
}

export function readManagedRuntimeCapability(manifest) {
  const runtimeCapability = manifest?.runtimeCapability

  if (!runtimeCapability || typeof runtimeCapability !== "object") {
    throw new Error("Runtime manifest does not record runtime capability.")
  }

  return {
    version: runtimeCapability.version ?? 1,
    renderableAgentComponents:
      runtimeCapability.renderableAgentComponents ??
      manifest?.renderableAgentComponents ??
      [],
    verificationData: runtimeCapability.verificationData,
    rendererMapping: runtimeCapability.rendererMapping,
  }
}

export function createManagedRuntimeManifest({
  componentSource,
  packageVersion = "0.0.0",
  paths,
  preset,
  renderer,
  runtimeBase,
  runtimeContract,
  runtimeSurface,
  uiLibrary,
  version,
  components = [],
  installMode,
}) {
  const runtimeCapability = createManagedRuntimeCapability({ runtimeContract })

  return {
    kind: "ahtml-managed-runtime",
    version,
    renderer,
    packageVersion,
    uiLibrary,
    componentSource,
    runtimeBase,
    runtimeCapability,
    shadcnRuntimeSurface: runtimeSurface,
    installMode,
    preset,
    components,
    installedUiComponents: components,
    renderableAgentComponents: runtimeCapability.renderableAgentComponents,
    paths: {
      runtime: paths.runtimeDir,
      cache: paths.cacheDir,
      logs: paths.logsDir,
      config: paths.configDir,
      styleProfiles: paths.styleProfilesDir,
      builtinStyleProfiles: paths.builtinStyleProfilesDir,
      userStyleProfiles: paths.userStyleProfilesDir,
      styleProfileManifest: paths.styleProfileManifestPath,
    },
  }
}

export function createRuntimeVerificationState({
  components = [],
  runtimeBase,
  runtimeContract,
  runtimeCapability = runtimeContract
    ? createManagedRuntimeCapability({ runtimeContract })
    : undefined,
  runtimeSurface,
  version = 1,
}) {
  if (!runtimeCapability) {
    throw new Error("Runtime verification state requires a runtime contract.")
  }

  return {
    kind: "ahtml-runtime-render-verification",
    version,
    runtimeBase,
    shadcnRuntimeSurface: runtimeSurface,
    installedUiComponents: components,
    renderableAgentComponents: runtimeCapability.renderableAgentComponents,
    verificationData: runtimeCapability.verificationData,
    rendererMapping: runtimeCapability.rendererMapping,
  }
}

function normalizeRuntimeContractComponents(components) {
  if (Array.isArray(components) && components.length > 0) {
    return components
  }

  return VALIDATED_STANDARD_COMPONENT_SCHEMAS
}

function hasRuntimeVerificationDataSnapshot(schema) {
  return Array.isArray(schema?.verificationData?.components)
}

function hasRendererMappingSnapshot(schema) {
  return Array.isArray(schema?.rendererMapping?.components)
}
