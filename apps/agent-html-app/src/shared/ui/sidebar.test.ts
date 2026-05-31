import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const sidebarPath = fileURLToPath(new URL("./sidebar.tsx", import.meta.url))
const sidebarSource = readFileSync(sidebarPath, "utf8")

describe("SidebarProvider persistence", () => {
  it("restores the desktop sidebar state from the sidebar cookie", () => {
    expect(sidebarSource).toContain("getStoredSidebarOpen")
    expect(sidebarSource).toContain("SIDEBAR_COOKIE_NAME")
    expect(sidebarSource).toContain('storedValue === "true"')
    expect(sidebarSource).toContain('storedValue === "false"')
    expect(sidebarSource).toContain(
      "React.useState(() =>\n    getStoredSidebarOpen(defaultOpen)\n  )"
    )
  })

  it("continues writing sidebar state changes to the same cookie", () => {
    expect(sidebarSource).toContain(
      "document.cookie = `${SIDEBAR_COOKIE_NAME}=${openState}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`"
    )
  })
})
