import { describe, expect, it } from "vitest"

import {
  validateArtifactEntry,
  validateBlockImplementation
} from "./validate.mjs"

describe("Canvas Kernel validation", () => {
  it("returns stable, positioned protocol diagnostics", () => {
    const [issue] = validateArtifactEntry({
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      source: "export default function Demo() { return null }"
    })

    expect(issue).toMatchObject({
      code: "canvas/protocol/define-artifact",
      column: 1,
      filePath: "agent-html/artifacts/demo.artifact.tsx",
      line: 1,
      policyVersion: 1
    })
  })

  it("reports every machine rule as an error through the CLI adapter contract", () => {
    const issues = validateBlockImplementation({
      filePath: "agent-html/artifacts/demo/summary.block.tsx",
      source: `
        import logo from "../public/logo.svg"
        export default function Summary() {
          return <button className="bg-purple-900" style={{ color: "red" }}>{logo}</button>
        }
      `
    })

    expect(issues.map((issue) => issue.code)).toEqual(
      expect.arrayContaining([
        "canvas/workspace/public-import",
        "canvas/workspace/native-control",
        "canvas/style/unsafe-class",
        "canvas/style/inline-style"
      ])
    )
    expect(issues.every((issue) => issue.policyVersion === 1)).toBe(true)
  })
})
