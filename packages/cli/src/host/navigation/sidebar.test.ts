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
    expect(artifactRowSource).toContain('t("sidebar.artifactActions"')
    expect(artifactRowSource).toContain('label={t("sidebar.rename")}')
    expect(artifactRowSource).toContain('label={t("sidebar.delete")}')
    expect(artifactRowSource).toContain("<Dialog ")
    expect(artifactRowSource).toContain("<AlertDialog ")
  })

  it("counts only human-visible guard issues in artifact row badges", () => {
    expect(sidebarSource).toContain("countHumanVisibleGuardIssues")
  })

  it("shows pending create artifact work on the New artifact action", () => {
    expect(sidebarSource).toContain("createArtifactPending")
    expect(sidebarSource).toContain("LoaderCircleIcon")
    expect(sidebarSource).toContain('className="canvas-sidebar-spinner"')
    expect(sidebarSource).not.toContain('caption={createArtifactPending')
  })

  it("keeps the language popover to a title and selectable items", () => {
    expect(sidebarSource).toContain("<HostDropdownLabel>{t(\"sidebar.language\")}</HostDropdownLabel>")
    expect(sidebarSource).toContain("canvasHostLanguageOptions.map")
    expect(sidebarSource).not.toContain("canvas-host-dropdown-meta")
    expect(sidebarSource).not.toContain("languageDisplayLabel")
    expect(sidebarSource).not.toContain("sidebar.languageSystemResolved")
  })

  it("uses the shared icon button component for footer links", () => {
    expect(sidebarSource).toContain('href="https://agent-html.org/docs"')
    expect(sidebarSource).toContain('href="https://github.com/Sayhi-bzb/Agent-HTML"')
    expect(sidebarSource).not.toContain("canvas-sidebar-footer-icon-link")
    expect(sidebarSource).not.toContain('className="canvas-sidebar-footer-icon"')
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
