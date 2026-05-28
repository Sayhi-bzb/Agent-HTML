import { invoke, isTauri } from "@tauri-apps/api/core"

import {
  getSeedDocument,
  getSeedSections,
  workspaceSeedProjects,
} from "@/app/workspace/seed"
import type {
  ProjectCodexThreadLink,
  ProjectSectionDocument,
  WorkspaceProject,
  WorkspaceSection,
} from "@/app/workspace/types"

export type WorkspaceRepository = {
  canWrite: boolean
  createProject: (input: {
    name: string
  }) => Promise<WorkspaceProject & { sections: WorkspaceSection[] }>
  createProjectSection: (input: {
    projectId: string
    title: string
  }) => Promise<WorkspaceSection>
  deleteProject: (input: { projectId: string }) => Promise<string>
  deleteProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<string>
  duplicateProjectSection: (input: {
    projectId: string
    sectionId: string
  }) => Promise<WorkspaceSection>
  getProjectSectionDocument: (
    projectId: string,
    sectionId: string
  ) => Promise<ProjectSectionDocument>
  listProjectCodexThreads: (projectId: string) => Promise<ProjectCodexThreadLink[]>
  listProjectSections: (projectId: string) => Promise<WorkspaceSection[]>
  listProjects: () => Promise<WorkspaceProject[]>
  renameProject: (input: {
    name: string
    projectId: string
  }) => Promise<WorkspaceProject & { sections: WorkspaceSection[] }>
  renameProjectSection: (input: {
    projectId: string
    sectionId: string
    title: string
  }) => Promise<WorkspaceSection>
  updateProjectSectionDocument: (input: {
    ahtmlSource: string
    projectId: string
    sectionId: string
  }) => Promise<ProjectSectionDocument>
  touchProjectCodexThreadLink: (input: {
    ahtmlPath?: string | null
    documentPath?: string | null
    projectId: string
    sectionId?: string | null
    threadId: string
  }) => Promise<ProjectCodexThreadLink>
  upsertProjectCodexThreadLink: (input: {
    ahtmlPath?: string | null
    documentPath?: string | null
    projectId: string
    sectionId?: string | null
    threadId: string
  }) => Promise<ProjectCodexThreadLink>
}

const fixtureWorkspaceRepository: WorkspaceRepository = {
  canWrite: false,
  async createProject() {
    throw new Error("Desktop runtime required to create projects.")
  },
  async createProjectSection() {
    throw new Error("Desktop runtime required to create sections.")
  },
  async deleteProject() {
    throw new Error("Desktop runtime required to delete projects.")
  },
  async deleteProjectSection() {
    throw new Error("Desktop runtime required to delete sections.")
  },
  async duplicateProjectSection() {
    throw new Error("Desktop runtime required to duplicate sections.")
  },
  async getProjectSectionDocument(projectId, sectionId) {
    const document = getSeedDocument(projectId, sectionId)
    if (!document) {
      throw new Error(`No document found for ${projectId}/${sectionId}`)
    }

    return document
  },
  async listProjectCodexThreads() {
    return []
  },
  async listProjectSections(projectId) {
    return getSeedSections(projectId)
  },
  async listProjects() {
    return workspaceSeedProjects
  },
  async renameProject() {
    throw new Error("Desktop runtime required to rename projects.")
  },
  async renameProjectSection() {
    throw new Error("Desktop runtime required to rename sections.")
  },
  async updateProjectSectionDocument() {
    throw new Error("Desktop runtime required to save workspace documents.")
  },
  async touchProjectCodexThreadLink() {
    throw new Error("Desktop runtime required to update Codex thread links.")
  },
  async upsertProjectCodexThreadLink() {
    throw new Error("Desktop runtime required to link Codex threads.")
  },
}

const tauriWorkspaceRepository: WorkspaceRepository = {
  canWrite: true,
  createProject(input) {
    return invoke("create_project", input)
  },
  createProjectSection(input) {
    return invoke("create_project_section", input)
  },
  deleteProject(input) {
    return invoke("delete_project", input)
  },
  deleteProjectSection(input) {
    return invoke("delete_project_section", input)
  },
  duplicateProjectSection(input) {
    return invoke("duplicate_project_section", input)
  },
  getProjectSectionDocument(projectId, sectionId) {
    return invoke("get_project_section_document", {
      projectId,
      sectionId,
    })
  },
  listProjectCodexThreads(projectId) {
    return invoke("list_project_codex_threads", { projectId })
  },
  listProjectSections(projectId) {
    return invoke("list_project_sections", { projectId })
  },
  listProjects() {
    return invoke("list_projects")
  },
  renameProject(input) {
    return invoke("rename_project", input)
  },
  renameProjectSection(input) {
    return invoke("rename_project_section", input)
  },
  updateProjectSectionDocument(input) {
    return invoke("update_project_section_document", input)
  },
  touchProjectCodexThreadLink(input) {
    return invoke("touch_project_codex_thread_link", input)
  },
  upsertProjectCodexThreadLink(input) {
    return invoke("upsert_project_codex_thread_link", input)
  },
}

export function createWorkspaceRepository(): WorkspaceRepository {
  return isTauri() ? tauriWorkspaceRepository : fixtureWorkspaceRepository
}
