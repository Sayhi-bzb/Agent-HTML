import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sidebarPath = fileURLToPath(new URL("./sidebar.tsx", import.meta.url))
const sidebarSource = readFileSync(sidebarPath, "utf8").replace(/\r\n/g, "\n")
const sidebarStateProviderSource = sidebarSource.slice(
  sidebarSource.indexOf("function SidebarStateProvider"),
  sidebarSource.indexOf("function SidebarProvider")
)
const sidebarProviderSource = sidebarSource.slice(
  sidebarSource.indexOf("function SidebarProvider"),
  sidebarSource.indexOf("function Sidebar(")
)

describe("SidebarProvider persistence", () => {
  it("keeps sidebar state context reusable without app shell persistence", () => {
    expect(sidebarSource).toContain("function SidebarStateProvider")
    expect(sidebarSource).toContain("SidebarStateProvider,")
    expect(sidebarStateProviderSource).toContain("toggleSidebar")
    expect(sidebarStateProviderSource).not.toContain("document.cookie")
    expect(sidebarStateProviderSource).not.toContain("addEventListener")
    expect(sidebarStateProviderSource).not.toContain("getStoredSidebarOpen")
  })

  it("restores the desktop sidebar state from the sidebar cookie", () => {
    expect(sidebarSource).toContain("getStoredSidebarOpen")
    expect(sidebarSource).toContain("SIDEBAR_COOKIE_NAME")
    expect(sidebarSource).toContain('storedValue === "true"')
    expect(sidebarSource).toContain('storedValue === "false"')
    expect(sidebarProviderSource).toContain("React.useState(() =>")
    expect(sidebarProviderSource).toContain("getStoredSidebarOpen(defaultOpen)")
  })

  it("continues writing sidebar state changes to the same cookie", () => {
    expect(sidebarProviderSource).toContain("persistOpenChange")
    expect(sidebarProviderSource).toContain("addEventListener")
    expect(sidebarProviderSource).toContain(
      "document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`"
    )
  })
})
