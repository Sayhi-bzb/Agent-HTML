import { describe, expect, it } from "vitest"

import type { GuardIssue } from "./host-contracts"
import {
  countHumanVisibleGuardIssues,
  getGuardFixIssues,
  getHumanVisibleGuardIssues,
} from "./guard-visibility"

const warningIssue: GuardIssue = {
  filePath: "agent-html/artifacts/demo.artifact.tsx",
  guardScope: "artifact-entry-protocol",
  line: 3,
  message: "Block id is not readable kebab-case.",
  severity: "warning",
}

const errorIssue: GuardIssue = {
  filePath: "agent-html/artifacts/demo.artifact.tsx",
  guardScope: "workspace-boundary",
  line: 7,
  message: "Import crosses the React Canvas boundary.",
  severity: "error",
}

describe("guard visibility", () => {
  it("shows only guard errors to humans", () => {
    expect(getHumanVisibleGuardIssues([warningIssue, errorIssue])).toEqual([
      errorIssue,
    ])
    expect(countHumanVisibleGuardIssues([warningIssue, errorIssue])).toBe(1)
  })

  it("uses only errors for default guard fix requests", () => {
    expect(getGuardFixIssues([warningIssue, errorIssue])).toEqual([errorIssue])
  })
})
