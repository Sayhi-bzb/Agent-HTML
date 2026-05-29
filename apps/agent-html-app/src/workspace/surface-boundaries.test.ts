import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const surfacePath = fileURLToPath(new URL("./surface.tsx", import.meta.url))
const surfaceFramePath = fileURLToPath(
  new URL("./surface-frame.tsx", import.meta.url)
)
const threadControllerPath = fileURLToPath(
  new URL("./thread-controller.ts", import.meta.url)
)
const documentControllerPath = fileURLToPath(
  new URL("./document-controller.tsx", import.meta.url)
)
const navProjectsPath = fileURLToPath(
  new URL("../shell/nav-projects.tsx", import.meta.url)
)
const surfaceSource = readFileSync(surfacePath, "utf8")
const surfaceFrameSource = readFileSync(surfaceFramePath, "utf8")
const threadControllerSource = readFileSync(threadControllerPath, "utf8")
const documentControllerSource = readFileSync(documentControllerPath, "utf8")
const navProjectsSource = readFileSync(navProjectsPath, "utf8")

describe("workspace surface boundaries", () => {
  it("keeps document persistence out of the surface composition layer", () => {
    expect(surfaceSource).not.toContain("getProjectSectionDocument")
    expect(surfaceSource).not.toContain("updateProjectSectionDocument")
    expect(surfaceSource).not.toContain("renderWorkspaceDocument")
  })

  it("keeps thread repository ownership out of the surface composition layer", () => {
    expect(surfaceSource).not.toContain("listProjectCodexThreads")
    expect(surfaceSource).not.toContain("upsertProjectCodexThreadLink")
    expect(surfaceSource).not.toContain("touchProjectCodexThreadLink")
    expect(surfaceSource).not.toContain("deleteProjectCodexThreadLink")
  })

  it("keeps agent delivery details and large picker UI out of surface", () => {
    expect(surfaceSource).not.toContain("deliverAgentHtmlIntent")
    expect(surfaceSource).not.toContain("function ProjectThreadPickerContent")
    expect(surfaceSource).not.toContain("function SaveStatus")
  })

  it("keeps document dirty messaging out of the workspace status pill", () => {
    expect(surfaceFrameSource).not.toContain("Unsaved changes")
    expect(surfaceFrameSource).not.toContain("onSaveDocument")
  })

  it("keeps empty-state rendering and section creation state out of surface", () => {
    expect(surfaceSource).not.toContain("function WorkspaceStatus")
    expect(surfaceSource).not.toContain("function RuntimeValidationErrors")
    expect(surfaceSource).not.toContain("createSectionError")
    expect(surfaceSource).not.toContain("setCreateSectionError")
    expect(surfaceSource).not.toContain("isCreatingSection")
    expect(surfaceSource).not.toContain("setIsCreatingSection")
  })

  it("keeps thread preview loading out of the main thread controller", () => {
    expect(threadControllerSource).not.toContain("thread/turns/list")
    expect(threadControllerSource).not.toContain("readFirstThreadRequestText")
  })

  it("keeps document unsaved-state messaging out of sidebar navigation", () => {
    expect(navProjectsSource).not.toContain("Save current section")
    expect(navProjectsSource).not.toContain("hasUnsavedChanges")
  })

  it("keys workspace document drafts by the loaded document identity", () => {
    expect(documentControllerSource).not.toContain(
      "onDraftChange(activeTabId,"
    )
    expect(documentControllerSource).toContain("documentState.document.sectionId")
  })
})
