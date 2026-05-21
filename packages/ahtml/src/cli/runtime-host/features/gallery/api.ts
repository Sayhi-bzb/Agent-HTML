import type { ArtifactProfile, GalleryMutationResponse, GalleryStateResponse } from "./types"

type GalleryMutationSuccess = {
  availableArtifactProfileReferences?: string[]
  builtinArtifactProfileReferences?: string[]
  artifactProfileReference: string
  artifactProfile: ArtifactProfile
}

async function readGalleryMutationResponse(
  response: Response,
  fallbackMessage: string,
) {
  const result = (await response.json()) as GalleryMutationResponse

  if (
    !response.ok ||
    !result.ok ||
    !result.artifactProfile ||
    !result.artifactProfileReference
  ) {
    throw new Error(result.error ?? fallbackMessage)
  }

  return result as GalleryMutationSuccess
}

export function fetchGalleryState() {
  return fetch("/__ahtml/gallery/state", {
    headers: {
      accept: "application/json",
    },
  })
    .then(async (response) => {
      if (!response.ok) {
        return null
      }

      return (await response.json()) as GalleryStateResponse
    })
    .catch(() => null)
}

export async function saveGalleryArtifactProfile(artifactProfile: ArtifactProfile) {
  const response = await fetch("/__ahtml/gallery/save", {
    body: JSON.stringify({
      artifactProfile,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })

  return readGalleryMutationResponse(
    response,
    "Unable to save gallery artifact profile.",
  )
}

export async function selectGalleryArtifactProfile(
  artifactProfileReference: string,
) {
  const response = await fetch("/__ahtml/gallery/select", {
    body: JSON.stringify({
      artifactProfileReference,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })

  return readGalleryMutationResponse(
    response,
    "Unable to switch artifact profile.",
  )
}

export async function createGalleryArtifactProfile(
  artifactProfileReference: string,
) {
  const response = await fetch("/__ahtml/gallery/create", {
    body: JSON.stringify({
      artifactProfileReference,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })

  return readGalleryMutationResponse(
    response,
    "Unable to create artifact profile.",
  )
}

export async function deleteGalleryArtifactProfile(
  artifactProfileReference: string,
) {
  const response = await fetch("/__ahtml/gallery/delete", {
    body: JSON.stringify({
      artifactProfileReference,
    }),
    headers: {
      "content-type": "application/json",
    },
    method: "POST",
  })

  return readGalleryMutationResponse(
    response,
    "Unable to delete artifact profile.",
  )
}
