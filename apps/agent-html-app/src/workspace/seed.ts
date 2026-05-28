import introduceAgentHtmlSource from "@/app/workspace/fixtures/introduce-agent-html.ahtml?raw"
import introduceAgentHtmlZhSource from "@/app/workspace/fixtures/introduce-agent-html-cn.ahtml?raw"
import runtimeAlignmentSource from "@/app/workspace/fixtures/runtime-alignment.ahtml?raw"
import type {
  ProjectSectionDocument,
  WorkspaceProject,
  WorkspaceSection,
} from "@/app/workspace/types"

const exampleProjectId = "agent-html-example"

export const workspaceSeedProjects: WorkspaceProject[] = [
  {
    id: exampleProjectId,
    name: "Agent-HTML Example",
    slug: "agent-html-example",
  },
]

export const workspaceSeedSections: WorkspaceSection[] = [
  {
    groupTitle: "Example Cases",
    id: "introduce-agent-html",
    projectId: exampleProjectId,
    sortOrder: 0,
    title: "Introducing agent-html",
  },
  {
    groupTitle: "Example Cases",
    id: "introduce-agent-html-zh",
    projectId: exampleProjectId,
    sortOrder: 1,
    title: "介绍 agent-html",
  },
  {
    groupTitle: "Example Cases",
    id: "runtime-alignment",
    projectId: exampleProjectId,
    sortOrder: 2,
    title: "Runtime alignment",
  },
]

export const defaultWorkspaceSectionId = workspaceSeedSections[0].id

export const workspaceSeedDocuments: ProjectSectionDocument[] = [
  {
    ahtmlSource: introduceAgentHtmlSource,
    filePath: "fixture://agent-html-example/introduce-agent-html.agent-html",
    projectId: exampleProjectId,
    sectionId: "introduce-agent-html",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    ahtmlSource: introduceAgentHtmlZhSource,
    filePath: "fixture://agent-html-example/introduce-agent-html-zh.agent-html",
    projectId: exampleProjectId,
    sectionId: "introduce-agent-html-zh",
    updatedAt: "2026-05-25T00:00:00.000Z",
  },
  {
    ahtmlSource: runtimeAlignmentSource,
    filePath: "fixture://agent-html-example/runtime-alignment.agent-html",
    projectId: exampleProjectId,
    sectionId: "runtime-alignment",
    updatedAt: "2026-05-27T00:00:00.000Z",
  },
]

export function getSeedSections(projectId: string) {
  return workspaceSeedSections.filter((section) => section.projectId === projectId)
}

export function getSeedDocument(projectId: string, sectionId: string) {
  return (
    workspaceSeedDocuments.find(
      (document) =>
        document.projectId === projectId && document.sectionId === sectionId
    ) ?? null
  )
}
