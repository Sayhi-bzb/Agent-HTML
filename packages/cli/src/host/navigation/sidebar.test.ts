import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sidebarPath = fileURLToPath(new URL("./sidebar.tsx", import.meta.url))
const sidebarSource = readFileSync(sidebarPath, "utf8")

describe("ReactCanvasSidebar artifact rows", () => {
  it("does not attach tooltip or native title props to artifact rows", () => {
    const artifactRowSource = sidebarSource.slice(
      sidebarSource.indexOf("function ArtifactSidebarItem"),
      sidebarSource.indexOf("function shortCodexThreadId")
    )

    expect(artifactRowSource).toContain("const label = artifactLabel(artifact.filePath)")
    expect(artifactRowSource).toContain("label={label}")
    expect(artifactRowSource).toContain("onClick={() => onSelectArtifact(artifact.filePath)}")
    expect(artifactRowSource).not.toContain("tooltip=")
    expect(artifactRowSource).not.toContain("title=")
  })

  it("uses a dropdown command menu with dialog-backed management actions", () => {
    const artifactRowSource = sidebarSource.slice(
      sidebarSource.indexOf("function ArtifactSidebarItem"),
      sidebarSource.indexOf("function shortCodexThreadId")
    )

    expect(artifactRowSource).toContain("<DropdownMenu>")
    expect(artifactRowSource).toContain("Artifact actions")
    expect(artifactRowSource).toContain('label="Rename"')
    expect(artifactRowSource).toContain('label="Delete"')
    expect(artifactRowSource).toContain("<Dialog ")
    expect(artifactRowSource).toContain("<AlertDialog ")
  })
})

describe("ReactCanvasSidebar thread selector", () => {
  it("uses middle ellipsis for thread ids shown as trigger labels", () => {
    const shortThreadIdSource = sidebarSource.slice(
      sidebarSource.indexOf("function shortCodexThreadId"),
      sidebarSource.indexOf("function codexThreadLabel")
    )

    expect(shortThreadIdSource).toContain("threadId.length > 18")
    expect(shortThreadIdSource).toContain("threadId.slice(0, 10)")
    expect(shortThreadIdSource).toContain("threadId.slice(-6)")
  })

  it("shows thread ids in the trigger and chat history labels in the options", () => {
    const threadSelectSource = sidebarSource.slice(
      sidebarSource.indexOf("function ReactCanvasCodexThreadSelect"),
      sidebarSource.indexOf("function ReactCanvasSettingsOptionPopover")
    )

    expect(threadSelectSource).toContain("label: codexThreadLabel(thread)")
    expect(threadSelectSource).toContain("triggerLabel: shortCodexThreadId(thread.id)")
  })
})
