import { readFileSync } from "node:fs"
import { fileURLToPath } from "node:url"
import { describe, expect, it } from "vitest"

const scrollAreaPath = fileURLToPath(
  new URL("./scroll-area.tsx", import.meta.url)
)

const scrollAreaSource = readFileSync(scrollAreaPath, "utf8")

describe("shared scroll area", () => {
  it("keeps intrinsic width containment behind an explicit prop", () => {
    expect(scrollAreaSource).toContain("containIntrinsicWidth?: boolean")
    expect(scrollAreaSource).toContain("containIntrinsicWidth = false")
    expect(scrollAreaSource).toContain("containIntrinsicWidth &&")
    expect(scrollAreaSource).toContain(
      "[&>div]:!block [&>div]:!min-w-0 [&>div]:!w-full [&>div]:!max-w-full"
    )
  })
})
