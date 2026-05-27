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
  canWrite: boolean
  createProject: (input: {
    name: string
  }) => Promise<WorkspaceProject & { sections: WorkspaceSection[] }>
  getProjectSectionDocument: (
    projectId: string,
    sectionId: string
  ) => Promise<ProjectSectionDocument>
  listProjectSections: (projectId: string) => Promise<WorkspaceSection[]>
  listProjects: () => Promise<WorkspaceProject[]>
  updateProjectSectionDocument: (input: {
    ahtmlSource: string
    projectId: string
    sectionId: string
  }) => Promise<ProjectSectionDocument>
}

const fixtureWorkspaceRepository: WorkspaceRepository = {
  canWrite: false,
  async createProject() {
    throw new Error("Desktop runtime required to create projects.")
  },
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
  async updateProjectSectionDocument() {
    throw new Error("Desktop runtime required to save workspace documents.")
  },
}

const tauriWorkspaceRepository: WorkspaceRepository = {
  canWrite: true,
  createProject(input) {
    return invoke("create_project", input)
  },
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
  updateProjectSectionDocument(input) {
    return invoke("update_project_section_document", input)
  },
}

export function createWorkspaceRepository(): WorkspaceRepository {
  return isTauri() ? tauriWorkspaceRepository : fixtureWorkspaceRepository
}
