export type WorkspaceProject = {
  id: string
  name: string
  slug: string
}

export type WorkspaceProjectView = WorkspaceProject & {
  sections: WorkspaceSection[]
}

export type WorkspaceSection = {
  groupTitle: string
  id: string
  projectId: string
  sortOrder: number
  title: string
}

export type ProjectSectionDocument = {
  filePath: string
  projectId: string
  sectionId: string
  source: string
  updatedAt: string
}

export type ProjectCodexThreadLink = {
  createdAt: string
  lastBlockPath?: string | null
  lastDocumentPath?: string | null
  lastSectionId?: string | null
  lastUsedAt: string
  origin: "agent-html" | string
  projectId: string
  threadId: string
}
