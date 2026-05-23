import type {
  AgentHtmlProjectDocument,
  ProjectManifest,
  WorkspaceProject,
} from "@/workspace/types"

const projectsDirectoryName = "projects"
const manifestFileName = "project.json"
const entryFileName = "index.agent-html"
const assetsDirectoryName = "assets"

const starterAgentHtmlSource = `<Page title="Untitled project">
  <Stack gap="md">
    <Card>
      <CardHeader>
        <CardTitle>Untitled project</CardTitle>
        <CardDescription>Edit index.agent-html to change this surface.</CardDescription>
      </CardHeader>
      <CardContent>
        <Alert>
          <AlertTitle>Project ready</AlertTitle>
          <AlertDescription>This folder is connected to the app workspace.</AlertDescription>
        </Alert>
      </CardContent>
    </Card>
  </Stack>
</Page>
`

type FileSystemWritableFileStream = WritableStream<Uint8Array> & {
  write(data: string): Promise<void>
  close(): Promise<void>
}

type FileSystemFileHandle = {
  createWritable(): Promise<FileSystemWritableFileStream>
  getFile(): Promise<File>
  kind: "file"
  name: string
}

type FileSystemDirectoryHandle = {
  entries(): AsyncIterableIterator<
    [string, FileSystemDirectoryHandle | FileSystemFileHandle]
  >
  getDirectoryHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemDirectoryHandle>
  getFileHandle(
    name: string,
    options?: { create?: boolean }
  ): Promise<FileSystemFileHandle>
  kind: "directory"
  name: string
  removeEntry(name: string, options?: { recursive?: boolean }): Promise<void>
}

declare global {
  interface Window {
    showDirectoryPicker?: () => Promise<FileSystemDirectoryHandle>
  }
}

let currentWorkspaceHandle: FileSystemDirectoryHandle | null = null

export function isFileSystemAccessSupported() {
  return typeof window.showDirectoryPicker === "function"
}

export function getCurrentWorkspaceName() {
  return currentWorkspaceHandle?.name ?? null
}

export async function openWorkspaceDirectory() {
  if (!window.showDirectoryPicker) {
    throw new Error("File System Access API is not available in this browser.")
  }

  currentWorkspaceHandle = await window.showDirectoryPicker()
  await getProjectsDirectory(currentWorkspaceHandle, true)
  return loadWorkspaceProjects()
}

export async function loadWorkspaceProjects(): Promise<WorkspaceProject[]> {
  if (!currentWorkspaceHandle) {
    return []
  }

  const projectsDirectory = await getProjectsDirectory(
    currentWorkspaceHandle,
    true
  )
  const projects: WorkspaceProject[] = []

  for await (const [, entry] of projectsDirectory.entries()) {
    if (entry.kind !== "directory") {
      continue
    }

    const manifest = await readProjectManifest(entry)
    if (!manifest) {
      continue
    }

    projects.push({
      id: manifest.slug,
      name: manifest.name,
      slug: manifest.slug,
    })
  }

  return projects.sort((a, b) => a.name.localeCompare(b.name))
}

export async function createWorkspaceProject(name: string) {
  const workspace = requireWorkspace()
  const projectsDirectory = await getProjectsDirectory(workspace, true)
  const projects = await loadWorkspaceProjects()
  const slug = createUniqueSlug(name, projects)
  const projectDirectory = await projectsDirectory.getDirectoryHandle(slug, {
    create: true,
  })
  const now = new Date().toISOString()

  await writeProjectManifest(projectDirectory, {
    createdAt: now,
    name: name.trim() || "Untitled project",
    slug,
    updatedAt: now,
    version: 1,
  })
  await writeFile(projectDirectory, entryFileName, starterAgentHtmlSource)
  await projectDirectory.getDirectoryHandle(assetsDirectoryName, {
    create: true,
  })

  return {
    id: slug,
    name: name.trim() || "Untitled project",
    slug,
  }
}

export async function renameWorkspaceProject(projectId: string, name: string) {
  const projectDirectory = await getProjectDirectory(projectId)
  const manifest = await readRequiredProjectManifest(projectDirectory)
  const now = new Date().toISOString()

  await writeProjectManifest(projectDirectory, {
    ...manifest,
    name: name.trim(),
    updatedAt: now,
  })

  return {
    id: manifest.slug,
    name: name.trim(),
    slug: manifest.slug,
  }
}

export async function duplicateWorkspaceProject(projectId: string) {
  const workspace = requireWorkspace()
  const projectsDirectory = await getProjectsDirectory(workspace, true)
  const sourceDirectory = await getProjectDirectory(projectId)
  const sourceManifest = await readRequiredProjectManifest(sourceDirectory)
  const projects = await loadWorkspaceProjects()
  const nextName = `${sourceManifest.name} Copy`
  const nextSlug = createUniqueSlug(nextName, projects)
  const targetDirectory = await projectsDirectory.getDirectoryHandle(nextSlug, {
    create: true,
  })
  const now = new Date().toISOString()

  await copyDirectory(sourceDirectory, targetDirectory)
  await writeProjectManifest(targetDirectory, {
    createdAt: now,
    name: nextName,
    slug: nextSlug,
    updatedAt: now,
    version: 1,
  })

  return {
    id: nextSlug,
    name: nextName,
    slug: nextSlug,
  }
}

export async function deleteWorkspaceProject(projectId: string) {
  const workspace = requireWorkspace()
  const projectsDirectory = await getProjectsDirectory(workspace, true)
  await projectsDirectory.removeEntry(projectId, { recursive: true })
}

export async function readWorkspaceProjectDocument(
  project: WorkspaceProject
): Promise<AgentHtmlProjectDocument> {
  const projectDirectory = await getProjectDirectory(project.slug)
  const source = await readFile(projectDirectory, entryFileName)

  return {
    project,
    source,
  }
}

function requireWorkspace() {
  if (!currentWorkspaceHandle) {
    throw new Error("Open a workspace directory before using projects.")
  }

  return currentWorkspaceHandle
}

async function getProjectsDirectory(
  workspace: FileSystemDirectoryHandle,
  create: boolean
) {
  return workspace.getDirectoryHandle(projectsDirectoryName, { create })
}

async function getProjectDirectory(projectId: string) {
  const workspace = requireWorkspace()
  const projectsDirectory = await getProjectsDirectory(workspace, true)
  return projectsDirectory.getDirectoryHandle(projectId)
}

async function readProjectManifest(
  directory: FileSystemDirectoryHandle
): Promise<ProjectManifest | null> {
  try {
    const source = await readFile(directory, manifestFileName)
    const manifest = JSON.parse(source) as Partial<ProjectManifest>

    if (
      manifest.version !== 1 ||
      typeof manifest.name !== "string" ||
      typeof manifest.slug !== "string"
    ) {
      return null
    }

    return {
      createdAt:
        typeof manifest.createdAt === "string"
          ? manifest.createdAt
          : new Date().toISOString(),
      name: manifest.name,
      slug: manifest.slug,
      updatedAt:
        typeof manifest.updatedAt === "string"
          ? manifest.updatedAt
          : new Date().toISOString(),
      version: 1,
    }
  } catch {
    return null
  }
}

async function readRequiredProjectManifest(
  directory: FileSystemDirectoryHandle
) {
  const manifest = await readProjectManifest(directory)

  if (!manifest) {
    throw new Error("Project manifest is missing or invalid.")
  }

  return manifest
}

async function writeProjectManifest(
  directory: FileSystemDirectoryHandle,
  manifest: ProjectManifest
) {
  await writeFile(directory, manifestFileName, `${JSON.stringify(manifest, null, 2)}\n`)
}

async function readFile(directory: FileSystemDirectoryHandle, name: string) {
  const fileHandle = await directory.getFileHandle(name)
  const file = await fileHandle.getFile()
  return file.text()
}

async function writeFile(
  directory: FileSystemDirectoryHandle,
  name: string,
  content: string
) {
  const fileHandle = await directory.getFileHandle(name, { create: true })
  const writable = await fileHandle.createWritable()
  await writable.write(content)
  await writable.close()
}

async function copyDirectory(
  source: FileSystemDirectoryHandle,
  target: FileSystemDirectoryHandle
) {
  for await (const [name, entry] of source.entries()) {
    if (entry.kind === "file") {
      const file = await entry.getFile()
      await writeFile(target, name, await file.text())
      continue
    }

    const childTarget = await target.getDirectoryHandle(name, { create: true })
    await copyDirectory(entry, childTarget)
  }
}

function createUniqueSlug(name: string, projects: WorkspaceProject[]) {
  const baseSlug = slugify(name) || "untitled-project"
  let nextSlug = baseSlug
  let suffix = 2

  while (projects.some((project) => project.slug === nextSlug)) {
    nextSlug = `${baseSlug}-${suffix}`
    suffix += 1
  }

  return nextSlug
}

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
}

