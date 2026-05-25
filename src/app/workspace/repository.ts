import { invoke, isTauri } from "@tauri-apps/api/core"

import {
  getSeedDocument,
  getSeedSections,
  workspaceSeedProjects,
} from "@/app/workspace/seed"
import type {
  ProjectSectionDocument,
  WorkspaceProject,
  WorkspaceSection,
} from "@/app/workspace/types"

export type WorkspaceRepository = {
  getProjectSectionDocument: (
    projectId: string,
    sectionId: string
  ) => Promise<ProjectSectionDocument>
  listProjectSections: (projectId: string) => Promise<WorkspaceSection[]>
  listProjects: () => Promise<WorkspaceProject[]>
}

const fixtureWorkspaceRepository: WorkspaceRepository = {
  async getProjectSectionDocument(projectId, sectionId) {
    const document = getSeedDocument(projectId, sectionId)
    if (!document) {
      throw new Error(`No document found for ${projectId}/${sectionId}`)
    }

    return document
  },
  async listProjectSections(projectId) {
    return getSeedSections(projectId)
  },
  async listProjects() {
    return workspaceSeedProjects
  },
}

const tauriWorkspaceRepository: WorkspaceRepository = {
  getProjectSectionDocument(projectId, sectionId) {
    return invoke("get_project_section_document", {
      projectId,
      sectionId,
    })
  },
  listProjectSections(projectId) {
    return invoke("list_project_sections", { projectId })
  },
  listProjects() {
    return invoke("list_projects")
  },
}

export function createWorkspaceRepository(): WorkspaceRepository {
  return isTauri() ? tauriWorkspaceRepository : fixtureWorkspaceRepository
}
