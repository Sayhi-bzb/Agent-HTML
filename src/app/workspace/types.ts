export type WorkspaceProject = {
  id: string
  name: string
  slug: string
}

export type WorkspaceSection = {
  groupTitle: string
  id: string
  projectId: string
  sortOrder: number
  title: string
}

export type ProjectSectionDocument = {
  ahtmlSource: string
  projectId: string
  sectionId: string
  updatedAt: string
}
