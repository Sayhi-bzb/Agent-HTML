import type { AgentDocument } from "../../renderer/types"
import type { ArtifactProfile, GalleryPreviewSection } from "./types"

export function createGalleryPreviewDocument(
  artifactProfile: ArtifactProfile,
): AgentDocument

export function createGalleryPreviewSections(
  artifactProfile: ArtifactProfile,
): GalleryPreviewSection[]
