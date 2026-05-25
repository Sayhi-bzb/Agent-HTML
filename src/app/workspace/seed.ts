import type {
  ProjectSectionDocument,
  WorkspaceProject,
  WorkspaceSection,
} from "@/app/workspace/types"

export const workspaceSeedProjects: WorkspaceProject[] = [
  {
    id: "design-engineering",
    name: "Design Engineering",
    slug: "design-engineering",
  },
  {
    id: "sales-marketing",
    name: "Sales & Marketing",
    slug: "sales-marketing",
  },
  {
    id: "travel",
    name: "Travel",
    slug: "travel",
  },
]

const sectionTemplates = [
  {
    groupTitle: "Getting Started",
    id: "installation",
    title: "Installation",
  },
  {
    groupTitle: "Getting Started",
    id: "project-structure",
    title: "Project Structure",
  },
  {
    groupTitle: "Build Your Application",
    id: "routing",
    title: "Routing",
  },
  {
    groupTitle: "Build Your Application",
    id: "data-fetching",
    title: "Data Fetching",
  },
  {
    groupTitle: "Build Your Application",
    id: "rendering",
    title: "Rendering",
  },
  {
    groupTitle: "Build Your Application",
    id: "caching",
    title: "Caching",
  },
]

export const defaultWorkspaceSectionId = sectionTemplates[0].id

export const workspaceSeedSections: WorkspaceSection[] =
  workspaceSeedProjects.flatMap((project) =>
    sectionTemplates.map((section, index) => ({
      ...section,
      projectId: project.id,
      sortOrder: index,
    }))
  )

function createSeedAhtmlSource(project: WorkspaceProject, section: WorkspaceSection) {
  return `<Page title="${project.name} - ${section.title}">
  <Section width="content">
    <Stack>
      <Stack>
        <Text variant="h1">${section.title}</Text>
        <Text variant="lead">${project.name} workspace content rendered through the agent-html runtime.</Text>
      </Stack>
      <Alert>
        <Icon name="database" />
        <AlertTitle>Local-first document</AlertTitle>
        <AlertDescription>This section is loaded from the desktop workspace repository and rendered from AHTML source.</AlertDescription>
      </Alert>
      <Grid columns="3">
        <Card>
          <CardHeader>
            <CardTitle>Project</CardTitle>
            <CardDescription>${project.name}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Section</CardTitle>
            <CardDescription>${section.groupTitle}</CardDescription>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Runtime</CardTitle>
            <CardDescription>parse -> validate -> render</CardDescription>
          </CardHeader>
        </Card>
      </Grid>
    </Stack>
  </Section>
</Page>`
}

export const workspaceSeedDocuments: ProjectSectionDocument[] =
  workspaceSeedSections.map((section) => {
    const project = workspaceSeedProjects.find(
      (item) => item.id === section.projectId
    )

    if (!project) {
      throw new Error(`Missing seed project for section ${section.id}`)
    }

    return {
      ahtmlSource: createSeedAhtmlSource(project, section),
      projectId: project.id,
      sectionId: section.id,
      updatedAt: "2026-05-25T00:00:00.000Z",
    }
  })

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
