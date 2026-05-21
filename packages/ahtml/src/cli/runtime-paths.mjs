import os from "node:os"
import path from "node:path"
import { fileURLToPath } from "node:url"

export const runtimeManifestName = "runtime.json"
export const artifactProfileManifestName = "artifact-profiles.manifest.json"
export const artifactProfileStateName = "artifact-profile-state.json"
export const runtimeRenderer = "shadcn-runtime"
export const runtimeVersion = 2
export const runtimePackageRoot = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
  "..",
)

export function getRuntimePaths(env = process.env) {
  const runtimeRoot = path.resolve(
    env.AHTML_HOME || path.join(os.homedir(), ".ahtml"),
  )

  return {
    runtimeRoot,
    runtimeDir: path.join(runtimeRoot, "runtime"),
    cacheDir: path.join(runtimeRoot, "cache"),
    logsDir: path.join(runtimeRoot, "logs"),
    configDir: path.join(runtimeRoot, "config"),
    artifactProfilesDir: path.join(runtimeRoot, "config", "artifact-profiles"),
    builtinArtifactProfilesDir: path.join(
      runtimeRoot,
      "config",
      "artifact-profiles",
      "builtin",
    ),
    userArtifactProfilesDir: path.join(
      runtimeRoot,
      "config",
      "artifact-profiles",
      "user",
    ),
    manifestPath: path.join(runtimeRoot, "config", runtimeManifestName),
    artifactProfileManifestPath: path.join(
      runtimeRoot,
      "config",
      artifactProfileManifestName,
    ),
    artifactProfileStatePath: path.join(
      runtimeRoot,
      "config",
      artifactProfileStateName,
    ),
    promptUiManifestPath: path.join(
      runtimeRoot,
      "config",
      "prompt-ui.manifest.json",
    ),
    runtimePackageJsonPath: path.join(runtimeRoot, "runtime", "package.json"),
    runtimeVerificationPath: path.join(
      runtimeRoot,
      "runtime",
      "render-verification.generated.json",
    ),
    runtimeViteConfigPath: path.join(
      runtimeRoot,
      "runtime",
      "vite.ahtml.config.mjs",
    ),
    runtimeSsrDir: path.join(runtimeRoot, "runtime", ".ahtml-ssr"),
    runtimeSrcDir: path.join(runtimeRoot, "runtime", "src"),
    runtimeComponentsDir: path.join(
      runtimeRoot,
      "runtime",
      "src",
      "components",
      "ui",
    ),
    generatedDocumentPath: path.join(
      runtimeRoot,
      "runtime",
      "document.generated.json",
    ),
    generatedRuntimeStatePath: path.join(
      runtimeRoot,
      "runtime",
      "runtime-state.generated.json",
    ),
  }
}
