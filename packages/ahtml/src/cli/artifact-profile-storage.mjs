import {
  ARTIFACT_PROFILE_STORAGE_VERSION,
  ArtifactProfileSchema,
  BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE,
  DEFAULT_ARTIFACT_PROFILE_REFERENCE,
  normalizeArtifactProfile,
} from "@agent-html/core"
import { mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises"
import path from "node:path"

export const artifactProfileManifestKind = "ahtml-artifact-profile-manifest"
export const artifactProfileGeneratorKind = "ahtml-artifact-profile-registry"
export const artifactProfileStateKind = "ahtml-artifact-profile-state"
const artifactProfileIdPattern = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

export class BuiltinArtifactProfileMutationError extends Error {
  constructor(action, artifactProfileReference) {
    super(
      `Cannot ${action} built-in artifact profile "${artifactProfileReference}". Built-in artifact profiles are read-only.`,
    )
    this.name = "BuiltinArtifactProfileMutationError"
    this.action = action
    this.artifactProfileReference = artifactProfileReference
  }
}

export function createArtifactProfileStorageManifest(paths) {
  return {
    kind: artifactProfileManifestKind,
    version: ARTIFACT_PROFILE_STORAGE_VERSION,
    defaultArtifactProfileReference: DEFAULT_ARTIFACT_PROFILE_REFERENCE,
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
  }
}

export async function writeArtifactProfileStorage(paths) {
  const manifest = createArtifactProfileStorageManifest(paths)

  await mkdir(paths.artifactProfilesDir, { recursive: true })
  await mkdir(paths.builtinArtifactProfilesDir, { recursive: true })
  await mkdir(paths.userArtifactProfilesDir, { recursive: true })

  for (const profileEntry of manifest.profiles) {
    await writeJsonFile(profileEntry.path, profileEntry.profile)
  }

  await writeJsonFile(paths.artifactProfileManifestPath, manifest)
  await writeCurrentArtifactProfileReference(
    paths,
    DEFAULT_ARTIFACT_PROFILE_REFERENCE,
  )
  return manifest
}
export async function readArtifactProfileManifest(paths) {
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

export async function assertArtifactProfileStorage(paths) {
  const manifest = await readArtifactProfileManifest(paths)

  await stat(paths.artifactProfilesDir)
  await stat(paths.builtinArtifactProfilesDir)
  await stat(paths.userArtifactProfilesDir)

  for (const profileEntry of manifest.profiles ?? []) {
    await stat(profileEntry.path)
  }

  return `${manifest.profiles.length} builtin profiles -> ${paths.userArtifactProfilesDir}`
}

export async function createArtifactProfileResolver(paths) {
  const userProfilesById = await loadUserArtifactProfilesById(paths)
  const currentArtifactProfileReference =
    await readCurrentArtifactProfileReference(paths)

  return (artifactProfileReference) =>
    artifactProfileReference
      ? resolveStoredArtifactProfileReference(
          artifactProfileReference,
          userProfilesById,
        )
      : resolveStoredArtifactProfileReference(
          currentArtifactProfileReference,
          userProfilesById,
        )
}

export async function resolveArtifactProfileByReference(
  paths,
  artifactProfileReference,
) {
  if (BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference]) {
    return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference]
  }

  const userProfilesById = await loadUserArtifactProfilesById(paths)
  return userProfilesById.get(artifactProfileReference)
}

export function getArtifactProfileSource(artifactProfileReference) {
  return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference]
    ? "builtin"
    : "user"
}

export function isBuiltinArtifactProfileReference(artifactProfileReference) {
  return Boolean(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference])
}

export function listBuiltinArtifactProfileReferences() {
  return [...Object.keys(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE)]
}

export async function listArtifactProfileReferences(paths) {
  const userProfilesById = await loadUserArtifactProfilesById(paths)

  return [
    ...Object.keys(BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE),
    ...userProfilesById.keys(),
  ].sort((left, right) => left.localeCompare(right))
}

export async function loadUserArtifactProfilesById(paths) {
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

export async function saveUserArtifactProfile(paths, profile, options = {}) {
  const profileId = profile?.id

  if (!artifactProfileIdPattern.test(profileId ?? "")) {
    throw new Error(
      "artifact profile ids must use lowercase kebab-case, for example team-ops.",
    )
  }

  if (isBuiltinArtifactProfileReference(profileId)) {
    throw new BuiltinArtifactProfileMutationError("save", profileId)
  }

  const parsedProfile = ArtifactProfileSchema.parse(
    normalizeArtifactProfile(profile),
  )
  const existingProfile = (await loadUserArtifactProfilesById(paths)).get(
    profileId,
  )
  const exists = Boolean(existingProfile)
  const targetPath = path.join(paths.userArtifactProfilesDir, `${profileId}.json`)

  if (exists && options.overwrite !== true) {
    throw new Error(
      `Artifact profile "${profileId}" already exists. Pass overwrite to replace it.`,
    )
  }

  await writeJsonFile(targetPath, parsedProfile)

  return {
    id: profileId,
    path: targetPath,
    source: getArtifactProfileSource(profileId),
    overwritten: exists,
    profile: parsedProfile,
  }
}

export async function readCurrentArtifactProfileReference(paths) {
  try {
    const source = await readFile(paths.artifactProfileStatePath, "utf8")
    const state = JSON.parse(source)
    const artifactProfileReference =
      state?.currentArtifactProfileReference ?? state?.currentArtifactProfileId

    if (!artifactProfileIdPattern.test(artifactProfileReference ?? "")) {
      return DEFAULT_ARTIFACT_PROFILE_REFERENCE
    }

    const profile = await resolveArtifactProfileByReference(
      paths,
      artifactProfileReference,
    )
    return profile
      ? artifactProfileReference
      : DEFAULT_ARTIFACT_PROFILE_REFERENCE
  } catch (error) {
    if (error?.code === "ENOENT") {
      return DEFAULT_ARTIFACT_PROFILE_REFERENCE
    }

    throw error
  }
}

export async function writeCurrentArtifactProfileReference(
  paths,
  artifactProfileReference,
) {
  const nextArtifactProfileReference = (
    await resolveArtifactProfileByReference(paths, artifactProfileReference)
  )
    ? artifactProfileReference
    : DEFAULT_ARTIFACT_PROFILE_REFERENCE

  await writeJsonFile(paths.artifactProfileStatePath, {
    kind: artifactProfileStateKind,
    version: ARTIFACT_PROFILE_STORAGE_VERSION,
    currentArtifactProfileReference: nextArtifactProfileReference,
  })

  return nextArtifactProfileReference
}

export async function deleteArtifactProfile(paths, artifactProfileReference) {
  if (isBuiltinArtifactProfileReference(artifactProfileReference)) {
    throw new BuiltinArtifactProfileMutationError(
      "delete",
      artifactProfileReference,
    )
  }

  const targetPath = path.join(
    paths.userArtifactProfilesDir,
    `${artifactProfileReference}.json`,
  )

  try {
    const { unlink } = await import("node:fs/promises")
    await unlink(targetPath)
  } catch (error) {
    if (error?.code === "ENOENT") {
      return {
        deleted: false,
        currentArtifactProfileReference:
          await readCurrentArtifactProfileReference(paths),
      }
    }

    throw error
  }

  const currentArtifactProfileReference =
    await readCurrentArtifactProfileReference(paths)
  const nextCurrentArtifactProfileReference =
    currentArtifactProfileReference === artifactProfileReference
      ? await writeCurrentArtifactProfileReference(
          paths,
          DEFAULT_ARTIFACT_PROFILE_REFERENCE,
        )
      : currentArtifactProfileReference

  return {
    deleted: true,
    currentArtifactProfileReference: nextCurrentArtifactProfileReference,
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

function resolveStoredArtifactProfileReference(
  artifactProfileReference,
  userProfilesById,
) {
  if (!artifactProfileReference) {
    return undefined
  }

  if (BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference]) {
    return BUILTIN_ARTIFACT_PROFILES_BY_REFERENCE[artifactProfileReference]
  }

  return userProfilesById.get(artifactProfileReference)
}
