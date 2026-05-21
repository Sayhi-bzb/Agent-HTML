import {
  ARTIFACT_PROFILE_STORAGE_VERSION,
  ArtifactProfileSchema,
  BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE,
  DEFAULT_ARTIFACT_PROFILE_REFERENCE,
  normalizeArtifactProfile,
  DEFAULT_STYLE_PROFILE_REFERENCE,
} from "@agent-html/core"
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

export const artifactProfileManifestKind = "ahtml-artifact-profile-manifest"
export const artifactProfileGeneratorKind = "ahtml-artifact-profile-registry"
export const artifactProfileStateKind = "ahtml-artifact-profile-state"
export const styleProfileManifestKind = artifactProfileManifestKind
export const styleProfileGeneratorKind = artifactProfileGeneratorKind
export const styleProfileStateKind = artifactProfileStateKind
const styleProfileIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export class BuiltinStyleProfileMutationError extends Error {
  constructor(action, styleReference) {
    super(
      `Cannot ${action} built-in style profile "${styleReference}". Built-in style profiles are read-only.`,
    )
    this.name = "BuiltinStyleProfileMutationError"
    this.action = action
    this.styleReference = styleReference
  }
}

export function createStyleProfileStorageManifest(paths) {
  return {
    kind: artifactProfileManifestKind,
    version: ARTIFACT_PROFILE_STORAGE_VERSION,
    defaultArtifactProfileId: DEFAULT_ARTIFACT_PROFILE_REFERENCE,
    directories: {
      root: paths.artifactProfilesDir,
      builtin: paths.builtinArtifactProfilesDir,
      user: paths.userArtifactProfilesDir,
    },
    generator: {
      kind: artifactProfileGeneratorKind,
      profileFormat: "json",
      inheritance: "none",
      readDirectories: [
        paths.builtinArtifactProfilesDir,
        paths.userArtifactProfilesDir,
      ],
      writeDirectory: paths.userArtifactProfilesDir,
    },
    profiles: Object.entries(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE).map(
      ([id, profile]) => ({
        id,
        source: "builtin",
        path: path.join(paths.builtinArtifactProfilesDir, `${id}.json`),
        profile,
      }),
    ),
    defaultStyleProfileId: DEFAULT_STYLE_PROFILE_REFERENCE,
  }
}

export async function writeStyleProfileStorage(paths) {
  const manifest = createStyleProfileStorageManifest(paths)

  await mkdir(paths.artifactProfilesDir, { recursive: true })
  await mkdir(paths.builtinArtifactProfilesDir, { recursive: true })
  await mkdir(paths.userArtifactProfilesDir, { recursive: true })

  for (const profileEntry of manifest.profiles) {
    await writeJsonFile(profileEntry.path, profileEntry.profile)
  }

  await writeJsonFile(paths.artifactProfileManifestPath, manifest)
  await writeCurrentStyleProfileReference(paths, DEFAULT_STYLE_PROFILE_REFERENCE)
  return manifest
}

export async function readStyleProfileManifest(paths) {
  const source = await readFile(paths.artifactProfileManifestPath, "utf8")
  const manifest = JSON.parse(source)

  if (
    manifest?.kind !== artifactProfileManifestKind ||
    manifest?.version !== ARTIFACT_PROFILE_STORAGE_VERSION
  ) {
    throw new Error("artifact profile manifest was not written by ahtml.")
  }

  return manifest
}

export async function assertStyleProfileStorage(paths) {
  const manifest = await readStyleProfileManifest(paths)

  await stat(paths.artifactProfilesDir)
  await stat(paths.builtinArtifactProfilesDir)
  await stat(paths.userArtifactProfilesDir)

  for (const profileEntry of manifest.profiles ?? []) {
    await stat(profileEntry.path)
  }

  return `${manifest.profiles.length} builtin profiles -> ${paths.userArtifactProfilesDir}`
}

export async function createStyleProfileResolver(paths) {
  const userProfilesById = await loadUserStyleProfilesById(paths)
  const currentStyleReference = await readCurrentStyleProfileReference(paths)

  return (documentStyleConfigReference) =>
    documentStyleConfigReference
      ? resolveStoredStyleProfileReference(
          documentStyleConfigReference,
          userProfilesById,
        )
      : resolveStoredStyleProfileReference(currentStyleReference, userProfilesById)
}

export async function resolveStyleProfileByReference(paths, styleReference) {
  if (BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference]) {
    return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference]
  }

  const userProfilesById = await loadUserStyleProfilesById(paths)
  return userProfilesById.get(styleReference)
}

export function getStyleProfileSource(styleReference) {
  return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference]
    ? "builtin"
    : "user"
}

export function isBuiltinStyleProfileReference(styleReference) {
  return Boolean(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference])
}

export async function listStyleProfileReferences(paths) {
  const userProfilesById = await loadUserStyleProfilesById(paths)

  return [
    ...Object.keys(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE),
    ...userProfilesById.keys(),
  ].sort((left, right) => left.localeCompare(right))
}

export async function loadUserStyleProfilesById(paths) {
  if (!(await pathExists(paths.userArtifactProfilesDir))) {
    return new Map()
  }

  const entries = await readdir(paths.userArtifactProfilesDir, {
    withFileTypes: true,
  })
  const userProfilesById = new Map()

  for (const entry of entries) {
    if (!entry.isFile() || path.extname(entry.name) !== ".json") {
      continue
    }

    const profilePath = path.join(paths.userArtifactProfilesDir, entry.name)
    const profileId = path.basename(entry.name, ".json")

    try {
      const source = await readFile(profilePath, "utf8")
      const parsedProfile = ArtifactProfileSchema.safeParse(
        normalizeArtifactProfile(JSON.parse(source)),
      )

      if (!parsedProfile.success || parsedProfile.data.id !== profileId) {
        continue
      }

      userProfilesById.set(profileId, parsedProfile.data)
    } catch {
      continue
    }
  }

  return userProfilesById
}

export async function saveUserStyleProfile(paths, profile, options = {}) {
  const profileId = profile?.id

  if (!styleProfileIdPattern.test(profileId ?? "")) {
    throw new Error(
      "style profile ids must use lowercase kebab-case, for example team-ops.",
    )
  }

  if (isBuiltinStyleProfileReference(profileId)) {
    throw new BuiltinStyleProfileMutationError("save", profileId)
  }

  const parsedProfile = ArtifactProfileSchema.parse(
    normalizeArtifactProfile(profile),
  )
  const existingProfile = (await loadUserStyleProfilesById(paths)).get(profileId)
  const exists = Boolean(existingProfile)
  const targetPath = path.join(paths.userArtifactProfilesDir, `${profileId}.json`)

  if (exists && options.overwrite !== true) {
    throw new Error(
      `Style profile "${profileId}" already exists. Pass overwrite to replace it.`,
    )
  }

  await writeJsonFile(targetPath, parsedProfile)

  return {
    id: profileId,
    path: targetPath,
    source: getStyleProfileSource(profileId),
    overwritten: exists,
    profile: parsedProfile,
  }
}

export async function readCurrentStyleProfileReference(paths) {
  try {
    const source = await readFile(paths.artifactProfileStatePath, "utf8")
    const state = JSON.parse(source)
    const styleReference =
      state?.currentArtifactProfileId ?? state?.currentStyleProfileId

    if (!styleProfileIdPattern.test(styleReference ?? "")) {
      return DEFAULT_ARTIFACT_PROFILE_REFERENCE
    }

    const profile = await resolveStyleProfileByReference(paths, styleReference)
    return profile ? styleReference : DEFAULT_ARTIFACT_PROFILE_REFERENCE
  } catch (error) {
    if (error?.code === "ENOENT") {
      return DEFAULT_ARTIFACT_PROFILE_REFERENCE
    }

    throw error
  }
}

export async function writeCurrentStyleProfileReference(paths, styleReference) {
  const nextStyleReference = (await resolveStyleProfileByReference(paths, styleReference))
    ? styleReference
    : DEFAULT_ARTIFACT_PROFILE_REFERENCE

  await writeJsonFile(paths.artifactProfileStatePath, {
    kind: artifactProfileStateKind,
    version: ARTIFACT_PROFILE_STORAGE_VERSION,
    currentArtifactProfileId: nextStyleReference,
    currentStyleProfileId: nextStyleReference,
  })

  return nextStyleReference
}

export async function deleteStyleProfile(paths, styleReference) {
  if (isBuiltinStyleProfileReference(styleReference)) {
    throw new BuiltinStyleProfileMutationError("delete", styleReference)
  }

  const targetPath = path.join(paths.userArtifactProfilesDir, `${styleReference}.json`)

  try {
    const { unlink } = await import("node:fs/promises")
    await unlink(targetPath)
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        deleted: false,
        currentStyleProfileId: await readCurrentStyleProfileReference(paths),
      }
    }

    throw error
  }

  const currentStyleProfileId = await readCurrentStyleProfileReference(paths)
  const nextCurrentStyleProfileId =
    currentStyleProfileId === styleReference
      ? await writeCurrentStyleProfileReference(
          paths,
          DEFAULT_ARTIFACT_PROFILE_REFERENCE,
        )
      : currentStyleProfileId

  return {
    deleted: true,
    currentStyleProfileId: nextCurrentStyleProfileId,
  }
}

async function pathExists(filePath) {
  try {
    await stat(filePath)
    return true
  } catch (error) {
    if (error?.code === "ENOENT") {
      return false
    }

    throw error
  }
}

async function writeJsonFile(filePath, value) {
  await mkdir(path.dirname(filePath), { recursive: true })
  await writeFile(filePath, `${JSON.stringify(value, null, 2)}\n`)
}

function resolveStoredStyleProfileReference(styleReference, userProfilesById) {
  if (!styleReference) {
    return undefined
  }

  if (BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference]) {
    return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[styleReference]
  }

  return userProfilesById.get(styleReference)
}
