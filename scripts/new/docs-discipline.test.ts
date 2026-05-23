/// <reference types="node" />
// @vitest-environment node

import { describe, expect, it } from "vitest"

import { collectDocsDisciplineViolations } from "./docs-discipline.mjs"

describe("docs discipline", () => {
  it("rejects phase summary wording everywhere", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "roadmap.md",
          content: "`Phase 5` 已完成。",
        },
        {
          relativePath: "todo.md",
          content: "`Phase 5A/5B` 的主线已完成。",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "roadmap.md",
        label: "phase summary label",
        match: "Phase 5",
      },
      {
        relativePath: "todo.md",
        label: "phase summary label",
        match: "Phase 5A",
      },
    ])
  })

  it("rejects post-phase cleanup wording everywhere", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "index.md",
          content: "还剩哪些 post-phase cleanup 欠账",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "index.md",
        label: "post-phase cleanup label",
        match: "post-phase cleanup",
      },
    ])
  })

  it("rejects legacy stage headings everywhere", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "roadmap.md",
          content: "阶段含义：",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "roadmap.md",
        label: "legacy stage heading",
        match: "阶段含义",
      },
    ])
  })

  it("checks every file without leaking regex state across iterations", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "details/current-contract-audit.md",
          content: "第一处 `Phase 5`",
        },
        {
          relativePath: "details/high-risk-runtime-bridges.md",
          content: "第二处 `Phase 5`",
        },
      ]),
    ).toHaveLength(2)
  })

  it("rejects unexpected docs paths", () => {
    expect(
      collectDocsDisciplineViolations([
        {
          relativePath: "phase-5-checklist.md",
          content: "# stray\n",
        },
      ]),
    ).toMatchObject([
      {
        relativePath: "phase-5-checklist.md",
        label: "unexpected docs path",
        match: "phase-5-checklist.md",
      },
    ])
  })
})
