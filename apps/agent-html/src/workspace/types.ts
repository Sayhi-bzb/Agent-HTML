export type WorkspaceProject = {
  id: string
  name: string
  slug: string
}

export type ProjectManifest = {
  createdAt: string
  name: string
  slug: string
  updatedAt: string
  version: 1
}

export type AgentHtmlProjectDocument = {
  project: WorkspaceProject
  source: string
}

export type WorkspaceState =
  | {
      kind: "idle"
      projects: WorkspaceProject[]
      workspaceName: null
    }
  | {
      kind: "ready"
      projects: WorkspaceProject[]
      workspaceName: string
    }
  | {
      kind: "unsupported"
      projects: WorkspaceProject[]
      workspaceName: null
    }

